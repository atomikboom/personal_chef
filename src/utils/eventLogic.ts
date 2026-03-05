import { isMockMode, supabase } from '../services/supabase';
import { useMockDataStore } from '../store/useMockDataStore';
import { EventWithDetails, KitWithRules, RecipeWithDetails } from '../types/database';

export const calculateEventRequirements = (
    menuItems: { recipe: RecipeWithDetails; portions: number }[],
    peopleCount: number,
    eventType: 'domicilio' | 'asporto',
    kits: KitWithRules[]
) => {
    const ingredientReqs: Record<string, { id: string; name: string; qty: number; unit: string; breakdown: { recipeName: string; qty: number }[] }> = {};
    const equipmentReqs: Record<string, { id: string; name: string; qty: number; isConsumable: boolean; breakdown: { reason: string; qty: number }[] }> = {};

    menuItems.forEach(({ recipe, portions }) => {
        recipe.ingredients.forEach(ri => {
            const id = ri.ingredient_id;
            const ingredient = ri.ingredient as any;
            let itemQty = Number(ri.qty_per_portion) * portions;

            // Apply conversion if unit is different from base_unit
            if (ri.unit !== ingredient.base_unit) {
                const conversion = ingredient.conversions?.find((c: any) => c.unit === ri.unit);
                if (conversion) {
                    itemQty = itemQty * conversion.ratio;
                }
            }

            if (!ingredientReqs[id]) {
                ingredientReqs[id] = { id, name: ingredient.name, qty: 0, unit: ingredient.base_unit, breakdown: [] };
            }
            ingredientReqs[id].qty += itemQty;
            ingredientReqs[id].breakdown.push({ recipeName: recipe.name, qty: itemQty });
        });

        recipe.equipment.forEach(re => {
            const id = re.equipment_item_id;
            const itemQty = re.qty_required;
            if (!equipmentReqs[id]) {
                equipmentReqs[id] = { id, name: re.equipment_item.name, qty: 0, isConsumable: re.equipment_item.is_consumable, breakdown: [] };
            }
            equipmentReqs[id].qty += itemQty;
            equipmentReqs[id].breakdown.push({ reason: `Ricetta: ${recipe.name}`, qty: itemQty });
        });
    });

    kits.forEach(kit => {
        if (!kit || !kit.rules) return; // Robust check
        kit.rules.forEach((rule: any) => {
            const id = rule.equipment_item_id;
            const itemQty = rule.qty_per_person * peopleCount;
            if (!equipmentReqs[id]) {
                equipmentReqs[id] = {
                    id,
                    name: rule.equipment_item.name,
                    qty: 0,
                    isConsumable: rule.equipment_item.is_consumable,
                    breakdown: []
                };
            }
            equipmentReqs[id].qty += itemQty;
            equipmentReqs[id].breakdown.push({ reason: `Kit: ${kit.name}`, qty: itemQty });
        });
    });

    return { ingredientReqs, equipmentReqs };
};

export const deductStockFEFO = async (eventId: string, ingredients: any[], equipment: any[]) => {
    if (isMockMode) {
        console.log('Deducting mock stock for event:', eventId);
        const mockStore = useMockDataStore.getState();

        for (const item of ingredients) {
            console.log(`Checking ingredient: ${item.name} (${item.qty})`);
            const ingredient = mockStore.ingredients.find(i => i.id === item.id);
            if (!ingredient) continue;

            let remainingToDeduct = item.qty;
            const sortedLots = [...ingredient.lots].sort((a, b) => a.expiry_date.localeCompare(b.expiry_date));

            for (const lot of sortedLots) {
                if (remainingToDeduct <= 0) break;
                if (lot.quantity_available <= 0) continue;
                if (new Date(lot.expiry_date) < new Date()) continue; // Skip expired lots

                const deduction = Math.min(lot.quantity_available, remainingToDeduct);
                mockStore.updateLotQuantity(lot.id, lot.quantity_available - deduction);
                mockStore.addMovement({ type: 'ingredient', ref_id: item.id, lot_id: lot.id, delta_qty: -deduction, reason: 'Consumo evento', event_id: eventId });
                remainingToDeduct -= deduction;
            }

            if (remainingToDeduct > 0) {
                mockStore.addMissingItem({ event_id: eventId, item_type: 'ingredient', ref_id: item.id, qty_missing: remainingToDeduct, unit: item.unit });
            }
        }

        for (const item of equipment) {
            const equip = mockStore.equipment.find(e => e.id === item.id);
            if (!equip) continue;

            const available = equip.quantity_available;
            const deduction = Math.min(available, item.qty);

            if (deduction > 0) {
                mockStore.updateEquipmentQuantity(item.id, available - deduction);
                mockStore.addMovement({ type: 'equipment', ref_id: item.id, delta_qty: -deduction, reason: 'Uso evento', event_id: eventId });
            }

            if (item.qty > available) {
                mockStore.addMissingItem({ event_id: eventId, item_type: 'equipment', ref_id: item.id, qty_missing: item.qty - available });
            }
        }
        return;
    }

    // Supabase implementation
    for (const item of ingredients) {
        const { data: lots, error } = await supabase
            .from('ingredient_lots')
            .select('*')
            .eq('ingredient_id', item.id)
            .gt('quantity_available', 0)
            .gte('expiry_date', new Date().toISOString().split('T')[0])
            .order('expiry_date', { ascending: true });

        if (error) continue;

        let remainingToDeduct = item.qty;
        for (const lot of lots) {
            if (remainingToDeduct <= 0) break;
            const deduction = Math.min(lot.quantity_available, remainingToDeduct);
            await supabase.from('ingredient_lots').update({ quantity_available: lot.quantity_available - deduction }).eq('id', lot.id);
            await supabase.from('stock_movements').insert({ type: 'ingredient', ref_id: item.id, lot_id: lot.id, delta_qty: -deduction, reason: 'Consumo evento', event_id: eventId });
            remainingToDeduct -= deduction;
        }

        if (remainingToDeduct > 0) {
            await supabase.from('event_missing_items').insert({ event_id: eventId, item_type: 'ingredient', ref_id: item.id, qty_missing: remainingToDeduct, unit: item.unit });
        }
    }

    for (const item of equipment) {
        const { data: equip, error } = await supabase.from('equipment_items').select('quantity_available').eq('id', item.id).single();
        if (error) continue;
        const available = equip.quantity_available;
        const deduction = Math.min(available, item.qty);
        if (deduction > 0) {
            await supabase.from('equipment_items').update({ quantity_available: available - deduction }).eq('id', item.id);
            await supabase.from('stock_movements').insert({ type: 'equipment', ref_id: item.id, delta_qty: -deduction, reason: 'Uso evento', event_id: eventId });
        }
        if (item.qty > available) {
            await supabase.from('event_missing_items').insert({ event_id: eventId, item_type: 'equipment', ref_id: item.id, qty_missing: item.qty - available });
        }
    }
};

export const calculateRecipeCost = (recipe: RecipeWithDetails) => {
    let totalCost = 0;

    // Ingredient costs
    recipe.ingredients.forEach(ri => {
        const ingredient = ri.ingredient as any;
        // Search for the most recent lot price or fallback to default_price
        const latestLot = ingredient.lots?.length > 0
            ? [...ingredient.lots].sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
            : null;

        const pricePerBaseUnit = latestLot?.price_override ?? ingredient.default_price ?? 0;
        let qtyInBaseUnit = Number(ri.qty_per_portion);

        // Apply conversion if needed
        if (ri.unit !== ingredient.base_unit) {
            const conversion = ingredient.conversions?.find((c: any) => c.unit === ri.unit);
            if (conversion) {
                qtyInBaseUnit = qtyInBaseUnit * conversion.ratio;
            }
        }

        totalCost += qtyInBaseUnit * pricePerBaseUnit;
    });

    // Equipment costs (only if we want to include consumable items in recipe cost, 
    // but usually they are at event level. However, some might be recipe-specific)
    recipe.equipment.forEach(re => {
        if (re.equipment_item.is_consumable) {
            totalCost += (re.qty_required * (re.equipment_item.unit_price || 0)) / 1; // unit_price is per item
        }
    });

    return totalCost;
};

export const calculateEventCost = (
    event: EventWithDetails,
    kits: KitWithRules[]
) => {
    let foodCost = 0;
    let equipmentCost = 0;

    // 1. Calculate cost from menu items
    event.menu_items.forEach((mi: any) => {
        const recipeCostPerPortion = calculateRecipeCost(mi.recipe);
        foodCost += recipeCostPerPortion * mi.portions;
    });

    // 2. Calculate cost from selected kits
    kits.forEach(kit => {
        kit.rules.forEach((rule: any) => {
            if (rule.equipment_item.is_consumable) {
                const qty = rule.qty_per_person * event.people_count;
                equipmentCost += qty * (rule.equipment_item.unit_price || 0);
            }
        });
    });

    return {
        foodCost,
        equipmentCost,
        totalCost: foodCost + equipmentCost
    };
};
