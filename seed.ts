import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { useMockDataStore } from './src/store/useMockDataStore';

// Try to parse .env file directly
const envPath = '.env';
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
    console.log('Fetching mock data...');
    const state = useMockDataStore.getState();
    const { ingredients, equipment, recipes, kits } = state;

    console.log(`Found ${ingredients.length} ingredients, ${equipment.length} equipment, ${recipes.length} recipes, ${kits.length} kits.`);

    // 1. Ingredients
    console.log('Seeding ingredients...');
    const ingredientMap = new Map();
    for (const ing of ingredients) {
        const { data, error } = await supabase.from('ingredients').insert({
            name: ing.name,
            base_unit: ing.base_unit,
            default_price: ing.default_price,
            category: ing.category,
            allergens: ing.allergens
        }).select().single();
        if (error) { console.error('Error inserting ingredient', error); continue; }
        ingredientMap.set(ing.id, data.id); // Map old ID to new UUID

        // Lots
        if (ing.lots && ing.lots.length > 0) {
            for (const lot of ing.lots) {
                await supabase.from('ingredient_lots').insert({
                    ingredient_id: data.id,
                    quantity_available: lot.quantity_available,
                    unit: lot.unit,
                    expiry_date: lot.expiry_date,
                    price_override: lot.price_override,
                    notes: lot.notes
                });
            }
        }

        // Conversions
        if (ing.conversions && ing.conversions.length > 0) {
            for (const conv of ing.conversions) {
                await supabase.from('ingredient_conversions').insert({
                    ingredient_id: data.id,
                    unit: conv.unit,
                    ratio: conv.ratio
                });
            }
        }
    }

    // 2. Equipment
    console.log('Seeding equipment...');
    const equipmentMap = new Map();
    for (const eq of equipment) {
        const { data, error } = await supabase.from('equipment_items').insert({
            name: eq.name,
            category: eq.category,
            is_consumable: eq.is_consumable,
            quantity_available: eq.quantity_available,
            unit_price: eq.unit_price
        }).select().single();
        if (error) { console.error('Error inserting equipment', error); continue; }
        equipmentMap.set(eq.id, data.id);
    }

    // 3. Kits an Rules
    console.log('Seeding kits...');
    const kitMap = new Map();
    for (const kit of kits) {
        const { data, error } = await supabase.from('kits').insert({
            name: kit.name,
            description: kit.description
        }).select().single();
        if (error) { console.error('Error inserting kit', error); continue; }
        kitMap.set(kit.id, data.id);

        if (kit.rules && kit.rules.length > 0) {
            for (const rule of kit.rules) {
                if (!equipmentMap.get(rule.equipment_item_id)) {
                    console.log(`Skipping rule for eq ${rule.equipment_item_id} (not mapped)`);
                    continue;
                }
                await supabase.from('per_person_kit_rules').insert({
                    kit_id: data.id,
                    equipment_item_id: equipmentMap.get(rule.equipment_item_id),
                    qty_per_person: rule.qty_per_person,
                    applies_to: rule.applies_to || 'entrambi'
                });
            }
        }
    }

    // 4. Recipes
    console.log('Seeding recipes...');
    for (const recipe of recipes) {
        const { data, error } = await supabase.from('recipes').insert({
            name: recipe.name,
            description: recipe.description,
            prep_time_minutes: recipe.prep_time_minutes
        }).select().single();
        if (error) { console.error('Error inserting recipe', error); continue; }

        if (recipe.ingredients && recipe.ingredients.length > 0) {
            for (const ri of recipe.ingredients) {
                if (!ingredientMap.get(ri.ingredient_id)) continue;
                await supabase.from('recipe_ingredients').insert({
                    recipe_id: data.id,
                    ingredient_id: ingredientMap.get(ri.ingredient_id),
                    qty_per_portion: ri.qty_per_portion,
                    unit: ri.unit
                });
            }
        }

        if (recipe.equipment && recipe.equipment.length > 0) {
            for (const re of recipe.equipment) {
                if (!equipmentMap.get(re.equipment_item_id)) continue;
                await supabase.from('recipe_equipment').insert({
                    recipe_id: data.id,
                    equipment_item_id: equipmentMap.get(re.equipment_item_id),
                    qty_required: re.qty_required
                });
            }
        }
    }

    console.log('Seeding completed successfully!');
}

seed().catch(console.error);
