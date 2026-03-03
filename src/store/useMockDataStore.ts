import { addDays } from 'date-fns';
import { create } from 'zustand';
import { EquipmentItem, EquipmentWithKit, Event, EventWithDetails, Ingredient, IngredientLot, IngredientWithDetails, Kit, KitWithRules, Recipe, RecipeWithDetails } from '../types/database';

interface MockDataState {
    ingredients: IngredientWithDetails[];
    equipment: EquipmentWithKit[];
    recipes: RecipeWithDetails[];
    events: EventWithDetails[];
    kits: KitWithRules[];

    // Actions
    addEvent: (event: Omit<Event, 'id' | 'created_at'>, menuItems: { recipe_id: string; portions: number }[], kitIds: string[]) => Promise<EventWithDetails>;
    updateLotQuantity: (lotId: string, quantity: number) => void;
    updateEquipmentQuantity: (itemId: string, quantity: number) => void;
    addMovement: (movement: any) => void;
    addMissingItem: (item: any) => void;
    addIngredient: (ingredient: Omit<Ingredient, 'id' | 'created_at'>, initialLot?: Omit<IngredientLot, 'id' | 'created_at' | 'ingredient_id'>, conversions?: { unit: string; ratio: number }[]) => IngredientWithDetails;
    addLot: (lot: Omit<IngredientLot, 'id' | 'created_at'>) => void;
    addEquipmentItem: (item: Omit<EquipmentItem, 'id' | 'created_at'>) => EquipmentWithKit;
    addRecipe: (recipe: Omit<Recipe, 'id' | 'created_at'>) => RecipeWithDetails;
    updateIngredient: (ingredient: Ingredient, conversions?: { unit: string; ratio: number }[], expiry_date?: string) => void;
    deleteIngredient: (id: string) => void;
    updateEquipmentItem: (item: EquipmentItem) => void;
    deleteEquipmentItem: (id: string) => void;
    updateRecipe: (recipe: Recipe) => void;
    updateEvent: (event: Event) => void;
    deleteRecipe: (id: string) => void;
    // Kit Actions
    addKit: (name: string, description?: string) => KitWithRules;
    updateKit: (kit: Kit) => void;
    deleteKit: (id: string) => void;
    addKitRule: (kitId: string, equipmentId: string, qty: number) => void;
    removeKitRule: (kitId: string, ruleId: string) => void;
    // Internal
    addRecipeIngredient: (recipeId: string, ingredientId: string, qty: number, unit: string) => void;
    removeRecipeIngredient: (recipeId: string, riId: string) => void;
    addRecipeEquipment: (recipeId: string, equipmentId: string, qty: number) => void;
    removeRecipeEquipment: (recipeId: string, reId: string) => void;
}

const INITIAL_INGREDIENTS: IngredientWithDetails[] = [
    {
        "id": "ing-48a230cd",
        "name": "Tartare di gamberoni argentini / gamberi rossi",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-fc4182fb",
        "name": "Pallina di riso avvolta da alga nori",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-18828307",
        "name": "gamberi argentini cotti",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1648079a",
        "name": "Philadelphia",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1c3decc7",
        "name": "Pallina di riso avvolta da zucchina",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-9a088752",
        "name": "tartare di salmone",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-80df88a5",
        "name": "tartare di ricciola",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-9a003e3d",
        "name": "erba cipollina",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ff5b63a9",
        "name": "Pane giapponese scottato",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-6c20c8f4",
        "name": "tonno",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-84b9e300",
        "name": "finocchi al limone",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-c3dbdd09",
        "name": "germogli",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-10d9869e",
        "name": "sale nero al tartufo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7c881299",
        "name": "Trito di gamberoni argentini",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ec8fb8f5",
        "name": "marinatura di lime e olio",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-0aa7581a",
        "name": "frittura a palla",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7b743fcd",
        "name": "Gambero rosso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ac8b38ce",
        "name": "Base di guacamole",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-fd833140",
        "name": "sale dell\u2019Himalaya",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-55f78233",
        "name": "peperoncino",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d5441fa4",
        "name": "salmone crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1e95d295",
        "name": "Tonno rosso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-bf4a4bfb",
        "name": "ricciola",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-2ef20465",
        "name": "salsa piccante",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-a408c3aa",
        "name": "Mela a scaglie",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-829d2a42",
        "name": "canditi freschi d\u2019arancio",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-80aedb20",
        "name": "brunoise di finocchio",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-5950132b",
        "name": "ricciola cruda",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b903a600",
        "name": "Salmone (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-01ef09ab",
        "name": "Tonno semigrasso (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-88a7e26d",
        "name": "Tonno grasso (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-3801399d",
        "name": "Sarda (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-142e6b71",
        "name": "Gambero rosso (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-88c83981",
        "name": "lime (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-a7ace3ca",
        "name": "caviale (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-9305e3d5",
        "name": "Gambero argentino (cotto)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7ae4bfeb",
        "name": "Branzino (crudo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-f3c6858a",
        "name": "Salmone cotto",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-f5b235bd",
        "name": "avocado",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-5cfadc35",
        "name": "scorza di limone",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-80e94529",
        "name": "Philadelphia al nero di seppia",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-5e76d490",
        "name": "kumquat",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-0b39a959",
        "name": "Gamberoni argentini in tempura",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-93c037ba",
        "name": "Philadelphia al limone",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-02bf458f",
        "name": "tartare di gambero rosso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-62cc886d",
        "name": "sale nero di Cipro",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-e803ba87",
        "name": "Gambero argentino al burro salato",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-75f950a7",
        "name": "capasanta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-35e8fe3b",
        "name": "uova di salmone",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-c5b85fad",
        "name": "polvere di corallo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-c9286086",
        "name": "cacao",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-aee7c499",
        "name": "Tonno crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-93630df2",
        "name": "tataki di tonno",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7e8a654b",
        "name": "maionese di avocado (in chiusura)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-73229417",
        "name": "finocchio",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ac2e4a84",
        "name": "cannella",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1461cadd",
        "name": "arancia",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-3db519f9",
        "name": "Gambero in tempura",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-3f6358dc",
        "name": "scampo prima scelta (in chiusura)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-0c28c2b0",
        "name": "Tonno cotto",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-19275d61",
        "name": "pesto",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d38ecfbf",
        "name": "cetriolo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-12b5ba82",
        "name": "granella di nocciola",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-60a79295",
        "name": "mela",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-429433df",
        "name": "(in chiusura) salmone crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-a3eacb0a",
        "name": "fragole",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b4b09985",
        "name": "Roll fritto: salmone crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-69bef0eb",
        "name": "(in chiusura) Philadelphia",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7bd0b92e",
        "name": "scampo prima scelta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-c1b86c73",
        "name": "(in chiusura) zucca in agrodolce alla menta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d1c23b8a",
        "name": "scampi",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-14aaa530",
        "name": "(in chiusura) pasta di tonno leggermente piccante",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7b136f1d",
        "name": "insalata",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-83de6908",
        "name": "(in chiusura) avocado",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-6a08546f",
        "name": "rag\u00f9 di tonno",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-8dd362a6",
        "name": "salmone",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-6305ec6d",
        "name": "spuma di wasabi e zenzero (a base panna)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b4d46c7a",
        "name": "(in chiusura) ricciola cruda",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-bb09184d",
        "name": "peperoncino rosso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ef2e0b6d",
        "name": "salsa teriyaki",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-265470bb",
        "name": "panko",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b556e906",
        "name": "(in chiusura) scampi prima scelta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ab505a51",
        "name": "caviale croccante",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1c34fd57",
        "name": "chips al nero di seppia",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-e4f04e98",
        "name": "Roll con alga esterna: tonno o salmone (a scelta)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-fade787e",
        "name": "sarda marinata e cotta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-714c0930",
        "name": "tartare di guacamole piccante",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-44935fb3",
        "name": "Roll fritto: ripieno a scelta di salmone/tonno/gamberi",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-13e41767",
        "name": "Ventresca scottata",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-611fde26",
        "name": "teriyaki",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-5a856272",
        "name": "Zucchina in umido",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-3b7eb3e2",
        "name": "salsa al curry (a base di Philadelphia)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-91907e6d",
        "name": "zucchina fritta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-a2ace960",
        "name": "Ripieno di riso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-98f237f5",
        "name": "miele",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b89285c0",
        "name": "affettato S. Ilario crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-9652797e",
        "name": "Ripieno di carne",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-c46e02b0",
        "name": "pancetta croccante",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-de622351",
        "name": "salvia fritta",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-5f6eb8a8",
        "name": "burro fuso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-8781d4b2",
        "name": "zola",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-42b05454",
        "name": "affettato bovino Cecina crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-2684e589",
        "name": "Palline di riso con frutti o verdure (zucchina",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1be991c4",
        "name": "zucca",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-284cf059",
        "name": "carote)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-8e53d8fd",
        "name": "Shokupan (pane integrale giapponese)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-c36f6c59",
        "name": "affettato di maialino nero dei Nebrodi crudo",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-0a6dad56",
        "name": "Brunoise di carote",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-6efa9e1c",
        "name": "zucchine",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-765939ea",
        "name": "finocchi",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-22deb061",
        "name": "germogli di soia saltati in soia dolce",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-5e9d513d",
        "name": "Pallina di riso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b308b9a2",
        "name": "marmellata di fichi",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d32ee126",
        "name": "alga",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d592e35e",
        "name": "zucca in umido",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-330047d7",
        "name": "cipolla caramellata",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-e36ea1e6",
        "name": "carota al forno",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d89d676d",
        "name": "Roll di riso",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-7ea525af",
        "name": "salsa alla barbabietola (a base soia)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-1e4c03ad",
        "name": "Riso alla soia",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-2f49daca",
        "name": "zucchine/trombette al vapore",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-b65e95f7",
        "name": "zucchine fritte",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-9540fa30",
        "name": "salsa al curry (a base soia)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-4e92ddc9",
        "name": "Sfoglie di zucchina",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-ec7c0edb",
        "name": "verdure al forno",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-48e2cbf3",
        "name": "guacamole",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-3a5144e7",
        "name": "Risotto allo zafferano",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-4ded10d4",
        "name": "gamberi rossi (Mazara del Vallo)",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-59e4e8fe",
        "name": "flavedo di lime",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-a75284fd",
        "name": "Risotto allo sgombro",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-bdbff078",
        "name": "bisque di alici",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-101ae3fa",
        "name": "crema di zucca",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-6584e73a",
        "name": "Tagliatelle",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-522bcb84",
        "name": "rag\u00f9 di vongole",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-185ba94a",
        "name": "finocchietto fresco",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-8b7c68f5",
        "name": "Alga decorata",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    },
    {
        "id": "ing-d555d4fe",
        "name": "peperoncino a parte",
        "base_unit": "g",
        "default_price": 0,
        "category": "Altro",
        "allergens": [],
        "created_at": "2026-03-03T00:00:00.000Z",
        "aliases": [],
        "lots": [],
        "conversions": [],
        "total_quantity": 0
    }
];

const INITIAL_EQUIPMENT: EquipmentWithKit[] = [
    { id: 'eq-1', name: 'Piatto Piano Bianco', category: 'Piatti', is_consumable: false, quantity_available: 30, unit_price: 5.0, created_at: new Date().toISOString() },
    { id: 'eq-2', name: 'Forchetta Acciaio', category: 'Posate', is_consumable: false, quantity_available: 30, unit_price: 2.0, created_at: new Date().toISOString() },
    { id: 'eq-3', name: 'Bicchiere Vetro', category: 'Bicchieri', is_consumable: false, quantity_available: 30, unit_price: 3.0, created_at: new Date().toISOString() },
    { id: 'eq-4', name: 'Coltello Acciaio', category: 'Posate', is_consumable: false, quantity_available: 30, unit_price: 2.5, created_at: new Date().toISOString() },
    { id: 'eq-5', name: 'Cucchiaio Acciaio', category: 'Posate', is_consumable: false, quantity_available: 30, unit_price: 2.0, created_at: new Date().toISOString() },
    { id: 'eq-6', name: 'Tovagliolo Carta', category: 'Altro', is_consumable: true, quantity_available: 200, unit_price: 0.05, created_at: new Date().toISOString() },
    { id: 'eq-7', name: 'Piatto Fondo', category: 'Piatti', is_consumable: false, quantity_available: 20, unit_price: 5.5, created_at: new Date().toISOString() },
    { id: 'eq-8', name: 'Calice Vino', category: 'Bicchieri', is_consumable: false, quantity_available: 24, unit_price: 4.5, created_at: new Date().toISOString() },
];

const INITIAL_KITS: KitWithRules[] = [
    {
        id: 'kit-1',
        name: 'Kit Standard Domicilio',
        description: 'Servizio base per eventi a domicilio',
        created_at: new Date().toISOString(),
        rules: [
            { id: 'kr-1', kit_id: 'kit-1', equipment_item_id: 'eq-1', qty_per_person: 1, equipment_item: INITIAL_EQUIPMENT[0] },
            { id: 'kr-2', kit_id: 'kit-1', equipment_item_id: 'eq-2', qty_per_person: 1, equipment_item: INITIAL_EQUIPMENT[1] },
            { id: 'kr-3', kit_id: 'kit-1', equipment_item_id: 'eq-3', qty_per_person: 1, equipment_item: INITIAL_EQUIPMENT[2] },
            { id: 'kr-4', kit_id: 'kit-1', equipment_item_id: 'eq-4', qty_per_person: 1, equipment_item: INITIAL_EQUIPMENT[3] },
        ]
    },
    {
        id: 'kit-2',
        name: 'Kit Asporto Eco',
        description: 'Materiale monouso biodegradabile',
        created_at: new Date().toISOString(),
        rules: [
            { id: 'kr-5', kit_id: 'kit-2', equipment_item_id: 'eq-6', qty_per_person: 2, equipment_item: INITIAL_EQUIPMENT[5] },
        ]
    }
];

const INITIAL_RECIPES: RecipeWithDetails[] = [
    {
        "id": "rec-beaef527",
        "name": "CRUDO DI CROSTACEI",
        "description": "Entr\u00e9e Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-230cd",
                "recipe_id": "rec-beaef527",
                "ingredient_id": "ing-48a230cd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-48a230cd",
                    "name": "Tartare di gamberoni argentini / gamberi rossi",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-83166b42",
        "name": "GUNKAN NIDO DI GAMBERI",
        "description": "Entr\u00e9e Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-182fb",
                "recipe_id": "rec-83166b42",
                "ingredient_id": "ing-fc4182fb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-fc4182fb",
                    "name": "Pallina di riso avvolta da alga nori",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-28307",
                "recipe_id": "rec-83166b42",
                "ingredient_id": "ing-18828307",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-18828307",
                    "name": "gamberi argentini cotti",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8079a",
                "recipe_id": "rec-83166b42",
                "ingredient_id": "ing-1648079a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1648079a",
                    "name": "Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-6fe04322",
        "name": "GUNKAN ORIGINALMEF",
        "description": "Entr\u00e9e Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-decc7",
                "recipe_id": "rec-6fe04322",
                "ingredient_id": "ing-1c3decc7",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1c3decc7",
                    "name": "Pallina di riso avvolta da zucchina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-88752",
                "recipe_id": "rec-6fe04322",
                "ingredient_id": "ing-9a088752",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a088752",
                    "name": "tartare di salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-f88a5",
                "recipe_id": "rec-6fe04322",
                "ingredient_id": "ing-80df88a5",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-80df88a5",
                    "name": "tartare di ricciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-03e3d",
                "recipe_id": "rec-6fe04322",
                "ingredient_id": "ing-9a003e3d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a003e3d",
                    "name": "erba cipollina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-85325158",
        "name": "SHOKUPAN TONNO",
        "description": "Entr\u00e9e Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-b63a9",
                "recipe_id": "rec-85325158",
                "ingredient_id": "ing-ff5b63a9",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ff5b63a9",
                    "name": "Pane giapponese scottato",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-0c8f4",
                "recipe_id": "rec-85325158",
                "ingredient_id": "ing-6c20c8f4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6c20c8f4",
                    "name": "tonno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-9e300",
                "recipe_id": "rec-85325158",
                "ingredient_id": "ing-84b9e300",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-84b9e300",
                    "name": "finocchi al limone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-bdd09",
                "recipe_id": "rec-85325158",
                "ingredient_id": "ing-c3dbdd09",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-c3dbdd09",
                    "name": "germogli",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-9869e",
                "recipe_id": "rec-85325158",
                "ingredient_id": "ing-10d9869e",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-10d9869e",
                    "name": "sale nero al tartufo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-13780716",
        "name": "PRAWN BALL",
        "description": "Entr\u00e9e Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-81299",
                "recipe_id": "rec-13780716",
                "ingredient_id": "ing-7c881299",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7c881299",
                    "name": "Trito di gamberoni argentini",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-fb8f5",
                "recipe_id": "rec-13780716",
                "ingredient_id": "ing-ec8fb8f5",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ec8fb8f5",
                    "name": "marinatura di lime e olio",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-7581a",
                "recipe_id": "rec-13780716",
                "ingredient_id": "ing-0aa7581a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-0aa7581a",
                    "name": "frittura a palla",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-bcbb3aa3",
        "name": "GAMBERO ROSSO",
        "description": "Entr\u00e9e Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-43fcd",
                "recipe_id": "rec-bcbb3aa3",
                "ingredient_id": "ing-7b743fcd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7b743fcd",
                    "name": "Gambero rosso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-998a7be4",
        "name": "SALMONE E GUACAMOLE",
        "description": "Tartare",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-b38ce",
                "recipe_id": "rec-998a7be4",
                "ingredient_id": "ing-ac8b38ce",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ac8b38ce",
                    "name": "Base di guacamole",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-33140",
                "recipe_id": "rec-998a7be4",
                "ingredient_id": "ing-fd833140",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-fd833140",
                    "name": "sale dell\u2019Himalaya",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-78233",
                "recipe_id": "rec-998a7be4",
                "ingredient_id": "ing-55f78233",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-55f78233",
                    "name": "peperoncino",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-41fa4",
                "recipe_id": "rec-998a7be4",
                "ingredient_id": "ing-d5441fa4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d5441fa4",
                    "name": "salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-dd3c7ec6",
        "name": "TONNO E RICCIOLA",
        "description": "Tartare",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-5d295",
                "recipe_id": "rec-dd3c7ec6",
                "ingredient_id": "ing-1e95d295",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1e95d295",
                    "name": "Tonno rosso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-a4bfb",
                "recipe_id": "rec-dd3c7ec6",
                "ingredient_id": "ing-bf4a4bfb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-bf4a4bfb",
                    "name": "ricciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-03e3d",
                "recipe_id": "rec-dd3c7ec6",
                "ingredient_id": "ing-9a003e3d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a003e3d",
                    "name": "erba cipollina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-20465",
                "recipe_id": "rec-dd3c7ec6",
                "ingredient_id": "ing-2ef20465",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-2ef20465",
                    "name": "salsa piccante",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c3f88a2c",
        "name": "RICCIOLA E MELA",
        "description": "Tartare",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-8c3aa",
                "recipe_id": "rec-c3f88a2c",
                "ingredient_id": "ing-a408c3aa",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-a408c3aa",
                    "name": "Mela a scaglie",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-d2a42",
                "recipe_id": "rec-c3f88a2c",
                "ingredient_id": "ing-829d2a42",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-829d2a42",
                    "name": "canditi freschi d\u2019arancio",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-edb20",
                "recipe_id": "rec-c3f88a2c",
                "ingredient_id": "ing-80aedb20",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-80aedb20",
                    "name": "brunoise di finocchio",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-0132b",
                "recipe_id": "rec-c3f88a2c",
                "ingredient_id": "ing-5950132b",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5950132b",
                    "name": "ricciola cruda",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-7b542a9c",
        "name": "SALMONE",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-3a600",
                "recipe_id": "rec-7b542a9c",
                "ingredient_id": "ing-b903a600",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b903a600",
                    "name": "Salmone (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-a5881eb9",
        "name": "TONNO SEMIGRASSO",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-f09ab",
                "recipe_id": "rec-a5881eb9",
                "ingredient_id": "ing-01ef09ab",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-01ef09ab",
                    "name": "Tonno semigrasso (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-5c725fbe",
        "name": "TONNO GRASSO",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-7e26d",
                "recipe_id": "rec-5c725fbe",
                "ingredient_id": "ing-88a7e26d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-88a7e26d",
                    "name": "Tonno grasso (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-ab888ecd",
        "name": "SARDA",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-1399d",
                "recipe_id": "rec-ab888ecd",
                "ingredient_id": "ing-3801399d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-3801399d",
                    "name": "Sarda (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-a4c0a333",
        "name": "GAMBERO ROSSO",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-e6b71",
                "recipe_id": "rec-a4c0a333",
                "ingredient_id": "ing-142e6b71",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-142e6b71",
                    "name": "Gambero rosso (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c24a5d20",
        "name": "RICCIOLA E LIME",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-a4bfb",
                "recipe_id": "rec-c24a5d20",
                "ingredient_id": "ing-bf4a4bfb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-bf4a4bfb",
                    "name": "ricciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-83981",
                "recipe_id": "rec-c24a5d20",
                "ingredient_id": "ing-88c83981",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-88c83981",
                    "name": "lime (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-2b6493e4",
        "name": "TONNO E CAVIALE",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-0c8f4",
                "recipe_id": "rec-2b6493e4",
                "ingredient_id": "ing-6c20c8f4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6c20c8f4",
                    "name": "tonno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ce3ca",
                "recipe_id": "rec-2b6493e4",
                "ingredient_id": "ing-a7ace3ca",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-a7ace3ca",
                    "name": "caviale (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-004a9855",
        "name": "GAMBERO ARGENTINO",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-5e3d5",
                "recipe_id": "rec-004a9855",
                "ingredient_id": "ing-9305e3d5",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9305e3d5",
                    "name": "Gambero argentino (cotto)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-2fe918c5",
        "name": "BRANZINO",
        "description": "Nigiri Superior",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-4bfeb",
                "recipe_id": "rec-2fe918c5",
                "ingredient_id": "ing-7ae4bfeb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7ae4bfeb",
                    "name": "Branzino (crudo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-d2c8205b",
        "name": "URAMAKI ST. ROMAIN",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-6858a",
                "recipe_id": "rec-d2c8205b",
                "ingredient_id": "ing-f3c6858a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f3c6858a",
                    "name": "Salmone cotto",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-d2c8205b",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-adc35",
                "recipe_id": "rec-d2c8205b",
                "ingredient_id": "ing-5cfadc35",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5cfadc35",
                    "name": "scorza di limone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-94529",
                "recipe_id": "rec-d2c8205b",
                "ingredient_id": "ing-80e94529",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-80e94529",
                    "name": "Philadelphia al nero di seppia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-6d490",
                "recipe_id": "rec-d2c8205b",
                "ingredient_id": "ing-5e76d490",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5e76d490",
                    "name": "kumquat",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-663c036b",
        "name": "URAMAKI UMAMI",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-9a959",
                "recipe_id": "rec-663c036b",
                "ingredient_id": "ing-0b39a959",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-0b39a959",
                    "name": "Gamberoni argentini in tempura",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-037ba",
                "recipe_id": "rec-663c036b",
                "ingredient_id": "ing-93c037ba",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-93c037ba",
                    "name": "Philadelphia al limone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-f458f",
                "recipe_id": "rec-663c036b",
                "ingredient_id": "ing-02bf458f",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-02bf458f",
                    "name": "tartare di gambero rosso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-c886d",
                "recipe_id": "rec-663c036b",
                "ingredient_id": "ing-62cc886d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-62cc886d",
                    "name": "sale nero di Cipro",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-3ebe0a3e",
        "name": "URAMAKI 24K",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-3ba87",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-e803ba87",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-e803ba87",
                    "name": "Gambero argentino al burro salato",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-950a7",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-75f950a7",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-75f950a7",
                    "name": "capasanta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-43fcd",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-7b743fcd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7b743fcd",
                    "name": "Gambero rosso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8fe3b",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-35e8fe3b",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-35e8fe3b",
                    "name": "uova di salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-85fad",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-c5b85fad",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-c5b85fad",
                    "name": "polvere di corallo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-86086",
                "recipe_id": "rec-3ebe0a3e",
                "ingredient_id": "ing-c9286086",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-c9286086",
                    "name": "cacao",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-127c0400",
        "name": "URAMAKI CUPIDO",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-7c499",
                "recipe_id": "rec-127c0400",
                "ingredient_id": "ing-aee7c499",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-aee7c499",
                    "name": "Tonno crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-30df2",
                "recipe_id": "rec-127c0400",
                "ingredient_id": "ing-93630df2",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-93630df2",
                    "name": "tataki di tonno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-a654b",
                "recipe_id": "rec-127c0400",
                "ingredient_id": "ing-7e8a654b",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7e8a654b",
                    "name": "maionese di avocado (in chiusura)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c9301c38",
        "name": "URAMAKI WINTERMEF",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-41fa4",
                "recipe_id": "rec-c9301c38",
                "ingredient_id": "ing-d5441fa4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d5441fa4",
                    "name": "salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-c9301c38",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8079a",
                "recipe_id": "rec-c9301c38",
                "ingredient_id": "ing-1648079a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1648079a",
                    "name": "Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-29417",
                "recipe_id": "rec-c9301c38",
                "ingredient_id": "ing-73229417",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-73229417",
                    "name": "finocchio",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-e4a84",
                "recipe_id": "rec-c9301c38",
                "ingredient_id": "ing-ac2e4a84",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ac2e4a84",
                    "name": "cannella",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-1cadd",
                "recipe_id": "rec-c9301c38",
                "ingredient_id": "ing-1461cadd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1461cadd",
                    "name": "arancia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-ba56e4eb",
        "name": "URAMAKI HIROSHIMA",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-519f9",
                "recipe_id": "rec-ba56e4eb",
                "ingredient_id": "ing-3db519f9",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-3db519f9",
                    "name": "Gambero in tempura",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-ba56e4eb",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-358dc",
                "recipe_id": "rec-ba56e4eb",
                "ingredient_id": "ing-3f6358dc",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-3f6358dc",
                    "name": "scampo prima scelta (in chiusura)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-8dced477",
        "name": "URAMAKI PESTUNA",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-8c2b0",
                "recipe_id": "rec-8dced477",
                "ingredient_id": "ing-0c28c2b0",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-0c28c2b0",
                    "name": "Tonno cotto",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-75d61",
                "recipe_id": "rec-8dced477",
                "ingredient_id": "ing-19275d61",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-19275d61",
                    "name": "pesto",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-8dced477",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ecfbf",
                "recipe_id": "rec-8dced477",
                "ingredient_id": "ing-d38ecfbf",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d38ecfbf",
                    "name": "cetriolo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-5ba82",
                "recipe_id": "rec-8dced477",
                "ingredient_id": "ing-12b5ba82",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-12b5ba82",
                    "name": "granella di nocciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c37e2f79",
        "name": "URAMAKI SUNSET",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-6858a",
                "recipe_id": "rec-c37e2f79",
                "ingredient_id": "ing-f3c6858a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f3c6858a",
                    "name": "Salmone cotto",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-79295",
                "recipe_id": "rec-c37e2f79",
                "ingredient_id": "ing-60a79295",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-60a79295",
                    "name": "mela",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-433df",
                "recipe_id": "rec-c37e2f79",
                "ingredient_id": "ing-429433df",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-429433df",
                    "name": "(in chiusura) salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-acb0a",
                "recipe_id": "rec-c37e2f79",
                "ingredient_id": "ing-a3eacb0a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-a3eacb0a",
                    "name": "fragole",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-79295",
                "recipe_id": "rec-c37e2f79",
                "ingredient_id": "ing-60a79295",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-60a79295",
                    "name": "mela",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8079a",
                "recipe_id": "rec-c37e2f79",
                "ingredient_id": "ing-1648079a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1648079a",
                    "name": "Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-800f7a64",
        "name": "FUTOMAKI NETTUNO",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-09985",
                "recipe_id": "rec-800f7a64",
                "ingredient_id": "ing-b4b09985",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b4b09985",
                    "name": "Roll fritto: salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-800f7a64",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ef0eb",
                "recipe_id": "rec-800f7a64",
                "ingredient_id": "ing-69bef0eb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-69bef0eb",
                    "name": "(in chiusura) Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-0b92e",
                "recipe_id": "rec-800f7a64",
                "ingredient_id": "ing-7bd0b92e",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7bd0b92e",
                    "name": "scampo prima scelta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-5fb1fbe9",
        "name": "URAMAKI ZUCCAMAKI",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-41fa4",
                "recipe_id": "rec-5fb1fbe9",
                "ingredient_id": "ing-d5441fa4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d5441fa4",
                    "name": "salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-5fb1fbe9",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-86c73",
                "recipe_id": "rec-5fb1fbe9",
                "ingredient_id": "ing-c1b86c73",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-c1b86c73",
                    "name": "(in chiusura) zucca in agrodolce alla menta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-23b8a",
                "recipe_id": "rec-5fb1fbe9",
                "ingredient_id": "ing-d1c23b8a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d1c23b8a",
                    "name": "scampi",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-479b9709",
        "name": "URAMAKI VESTA",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-7c499",
                "recipe_id": "rec-479b9709",
                "ingredient_id": "ing-aee7c499",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-aee7c499",
                    "name": "Tonno crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-479b9709",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-03e3d",
                "recipe_id": "rec-479b9709",
                "ingredient_id": "ing-9a003e3d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a003e3d",
                    "name": "erba cipollina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-aa530",
                "recipe_id": "rec-479b9709",
                "ingredient_id": "ing-14aaa530",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-14aaa530",
                    "name": "(in chiusura) pasta di tonno leggermente piccante",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c4441e9d",
        "name": "URAMAKI MAR&TERRA",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-41fa4",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-d5441fa4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d5441fa4",
                    "name": "salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-36f1d",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-7b136f1d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7b136f1d",
                    "name": "insalata",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-e6908",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-83de6908",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-83de6908",
                    "name": "(in chiusura) avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8546f",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-6a08546f",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6a08546f",
                    "name": "rag\u00f9 di tonno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8079a",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-1648079a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1648079a",
                    "name": "Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-03e3d",
                "recipe_id": "rec-c4441e9d",
                "ingredient_id": "ing-9a003e3d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a003e3d",
                    "name": "erba cipollina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-4f268b1f",
        "name": "URAMAKI FLOWERY",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-519f9",
                "recipe_id": "rec-4f268b1f",
                "ingredient_id": "ing-3db519f9",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-3db519f9",
                    "name": "Gambero in tempura",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-4f268b1f",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-362a6",
                "recipe_id": "rec-4f268b1f",
                "ingredient_id": "ing-8dd362a6",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8dd362a6",
                    "name": "salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-5ec6d",
                "recipe_id": "rec-4f268b1f",
                "ingredient_id": "ing-6305ec6d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6305ec6d",
                    "name": "spuma di wasabi e zenzero (a base panna)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-f458f",
                "recipe_id": "rec-4f268b1f",
                "ingredient_id": "ing-02bf458f",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-02bf458f",
                    "name": "tartare di gambero rosso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8fe3b",
                "recipe_id": "rec-4f268b1f",
                "ingredient_id": "ing-35e8fe3b",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-35e8fe3b",
                    "name": "uova di salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-72fc10d5",
        "name": "URAMAKI AFRODITE",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-7c499",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-aee7c499",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-aee7c499",
                    "name": "Tonno crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-46c7a",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-b4d46c7a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b4d46c7a",
                    "name": "(in chiusura) ricciola cruda",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-03e3d",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-9a003e3d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a003e3d",
                    "name": "erba cipollina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-9184d",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-bb09184d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-bb09184d",
                    "name": "peperoncino rosso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-e0b6d",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-ef2e0b6d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ef2e0b6d",
                    "name": "salsa teriyaki",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-470bb",
                "recipe_id": "rec-72fc10d5",
                "ingredient_id": "ing-265470bb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-265470bb",
                    "name": "panko",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-7c088064",
        "name": "URAMAKI PUROSANGUE",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-235bd",
                "recipe_id": "rec-7c088064",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-6e906",
                "recipe_id": "rec-7c088064",
                "ingredient_id": "ing-b556e906",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b556e906",
                    "name": "(in chiusura) scampi prima scelta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-05a51",
                "recipe_id": "rec-7c088064",
                "ingredient_id": "ing-ab505a51",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ab505a51",
                    "name": "caviale croccante",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-4fd57",
                "recipe_id": "rec-7c088064",
                "ingredient_id": "ing-1c34fd57",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1c34fd57",
                    "name": "chips al nero di seppia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-433608eb",
        "name": "FUTOMAKI CLASSIC",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-04e98",
                "recipe_id": "rec-433608eb",
                "ingredient_id": "ing-e4f04e98",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-e4f04e98",
                    "name": "Roll con alga esterna: tonno o salmone (a scelta)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-433608eb",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-42424448",
        "name": "URAMAKI OCEAN",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-362a6",
                "recipe_id": "rec-42424448",
                "ingredient_id": "ing-8dd362a6",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8dd362a6",
                    "name": "salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-42424448",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8079a",
                "recipe_id": "rec-42424448",
                "ingredient_id": "ing-1648079a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1648079a",
                    "name": "Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-e787e",
                "recipe_id": "rec-42424448",
                "ingredient_id": "ing-fade787e",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-fade787e",
                    "name": "sarda marinata e cotta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c140cb80",
        "name": "URAMAKI MEXICO",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-362a6",
                "recipe_id": "rec-c140cb80",
                "ingredient_id": "ing-8dd362a6",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8dd362a6",
                    "name": "salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-a4bfb",
                "recipe_id": "rec-c140cb80",
                "ingredient_id": "ing-bf4a4bfb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-bf4a4bfb",
                    "name": "ricciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-c0930",
                "recipe_id": "rec-c140cb80",
                "ingredient_id": "ing-714c0930",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-714c0930",
                    "name": "tartare di guacamole piccante",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-362a6",
                "recipe_id": "rec-c140cb80",
                "ingredient_id": "ing-8dd362a6",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8dd362a6",
                    "name": "salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-d2aa74f0",
        "name": "FUTOMAKI FRITTO",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-35fb3",
                "recipe_id": "rec-d2aa74f0",
                "ingredient_id": "ing-44935fb3",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-44935fb3",
                    "name": "Roll fritto: ripieno a scelta di salmone/tonno/gamberi",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-d2aa74f0",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8079a",
                "recipe_id": "rec-d2aa74f0",
                "ingredient_id": "ing-1648079a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1648079a",
                    "name": "Philadelphia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-a67ed113",
        "name": "TEMAKI (VENTRESCA)",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-41767",
                "recipe_id": "rec-a67ed113",
                "ingredient_id": "ing-13e41767",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-13e41767",
                    "name": "Ventresca scottata",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-a67ed113",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-fde26",
                "recipe_id": "rec-a67ed113",
                "ingredient_id": "ing-611fde26",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-611fde26",
                    "name": "teriyaki",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c0af22e1",
        "name": "TEMAKI (TONNO)",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-7c499",
                "recipe_id": "rec-c0af22e1",
                "ingredient_id": "ing-aee7c499",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-aee7c499",
                    "name": "Tonno crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-c0af22e1",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-36f1d",
                "recipe_id": "rec-c0af22e1",
                "ingredient_id": "ing-7b136f1d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7b136f1d",
                    "name": "insalata",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-0b7d821f",
        "name": "TEMAKI (SALMONE)",
        "description": "Special Rolls",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-41fa4",
                "recipe_id": "rec-0b7d821f",
                "ingredient_id": "ing-d5441fa4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d5441fa4",
                    "name": "salmone crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-0b7d821f",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-36f1d",
                "recipe_id": "rec-0b7d821f",
                "ingredient_id": "ing-7b136f1d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7b136f1d",
                    "name": "insalata",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-c2be5fa0",
        "name": "SPECIAL KALIMAKI",
        "description": "Proposte senza pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-56272",
                "recipe_id": "rec-c2be5fa0",
                "ingredient_id": "ing-5a856272",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5a856272",
                    "name": "Zucchina in umido",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-eb3e2",
                "recipe_id": "rec-c2be5fa0",
                "ingredient_id": "ing-3b7eb3e2",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-3b7eb3e2",
                    "name": "salsa al curry (a base di Philadelphia)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-07e6d",
                "recipe_id": "rec-c2be5fa0",
                "ingredient_id": "ing-91907e6d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-91907e6d",
                    "name": "zucchina fritta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-b1c96cab",
        "name": "URAMAKI S.ILARIO",
        "description": "Proposte senza pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-ce960",
                "recipe_id": "rec-b1c96cab",
                "ingredient_id": "ing-a2ace960",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-a2ace960",
                    "name": "Ripieno di riso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-237f5",
                "recipe_id": "rec-b1c96cab",
                "ingredient_id": "ing-98f237f5",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-98f237f5",
                    "name": "miele",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-285c0",
                "recipe_id": "rec-b1c96cab",
                "ingredient_id": "ing-b89285c0",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b89285c0",
                    "name": "affettato S. Ilario crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-8cef7cac",
        "name": "URAMAKI L\u2019ODIOSO",
        "description": "Proposte senza pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-2797e",
                "recipe_id": "rec-8cef7cac",
                "ingredient_id": "ing-9652797e",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9652797e",
                    "name": "Ripieno di carne",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-e02b0",
                "recipe_id": "rec-8cef7cac",
                "ingredient_id": "ing-c46e02b0",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-c46e02b0",
                    "name": "pancetta croccante",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-22351",
                "recipe_id": "rec-8cef7cac",
                "ingredient_id": "ing-de622351",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-de622351",
                    "name": "salvia fritta",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-eb8a8",
                "recipe_id": "rec-8cef7cac",
                "ingredient_id": "ing-5f6eb8a8",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5f6eb8a8",
                    "name": "burro fuso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-23274afc",
        "name": "HOSOMAKI LEON",
        "description": "Proposte senza pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-ce960",
                "recipe_id": "rec-23274afc",
                "ingredient_id": "ing-a2ace960",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-a2ace960",
                    "name": "Ripieno di riso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-1d4b2",
                "recipe_id": "rec-23274afc",
                "ingredient_id": "ing-8781d4b2",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8781d4b2",
                    "name": "zola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-05454",
                "recipe_id": "rec-23274afc",
                "ingredient_id": "ing-42b05454",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-42b05454",
                    "name": "affettato bovino Cecina crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-7972b8d5",
        "name": "NIGIRI DI VERDURE",
        "description": "Proposte senza pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-4e589",
                "recipe_id": "rec-7972b8d5",
                "ingredient_id": "ing-2684e589",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-2684e589",
                    "name": "Palline di riso con frutti o verdure (zucchina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-991c4",
                "recipe_id": "rec-7972b8d5",
                "ingredient_id": "ing-1be991c4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1be991c4",
                    "name": "zucca",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-7972b8d5",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-cf059",
                "recipe_id": "rec-7972b8d5",
                "ingredient_id": "ing-284cf059",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-284cf059",
                    "name": "carote)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-d9923208",
        "name": "SHOKU NERO",
        "description": "Proposte senza pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-3d8fd",
                "recipe_id": "rec-d9923208",
                "ingredient_id": "ing-8e53d8fd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8e53d8fd",
                    "name": "Shokupan (pane integrale giapponese)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-1d4b2",
                "recipe_id": "rec-d9923208",
                "ingredient_id": "ing-8781d4b2",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8781d4b2",
                    "name": "zola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-f6c59",
                "recipe_id": "rec-d9923208",
                "ingredient_id": "ing-c36f6c59",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-c36f6c59",
                    "name": "affettato di maialino nero dei Nebrodi crudo",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-4fe45196",
        "name": "TARTARE DI VERDURE AL FORNO",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-dad56",
                "recipe_id": "rec-4fe45196",
                "ingredient_id": "ing-0a6dad56",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-0a6dad56",
                    "name": "Brunoise di carote",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-a9e1c",
                "recipe_id": "rec-4fe45196",
                "ingredient_id": "ing-6efa9e1c",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6efa9e1c",
                    "name": "zucchine",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-939ea",
                "recipe_id": "rec-4fe45196",
                "ingredient_id": "ing-765939ea",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-765939ea",
                    "name": "finocchi",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-eb061",
                "recipe_id": "rec-4fe45196",
                "ingredient_id": "ing-22deb061",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-22deb061",
                    "name": "germogli di soia saltati in soia dolce",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-61106023",
        "name": "VEG-IRI AVOCADO",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-d513d",
                "recipe_id": "rec-61106023",
                "ingredient_id": "ing-5e9d513d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5e9d513d",
                    "name": "Pallina di riso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-61106023",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-8b9a2",
                "recipe_id": "rec-61106023",
                "ingredient_id": "ing-b308b9a2",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b308b9a2",
                    "name": "marmellata di fichi",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ee126",
                "recipe_id": "rec-61106023",
                "ingredient_id": "ing-d32ee126",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d32ee126",
                    "name": "alga",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-01bb7bc8",
        "name": "VEG-IRI ZUCCA",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-d513d",
                "recipe_id": "rec-01bb7bc8",
                "ingredient_id": "ing-5e9d513d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5e9d513d",
                    "name": "Pallina di riso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-2e35e",
                "recipe_id": "rec-01bb7bc8",
                "ingredient_id": "ing-d592e35e",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d592e35e",
                    "name": "zucca in umido",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-047d7",
                "recipe_id": "rec-01bb7bc8",
                "ingredient_id": "ing-330047d7",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-330047d7",
                    "name": "cipolla caramellata",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ee126",
                "recipe_id": "rec-01bb7bc8",
                "ingredient_id": "ing-d32ee126",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d32ee126",
                    "name": "alga",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-a1a76db7",
        "name": "VEG-IRI CAROTA",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-d513d",
                "recipe_id": "rec-a1a76db7",
                "ingredient_id": "ing-5e9d513d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-5e9d513d",
                    "name": "Pallina di riso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ea1e6",
                "recipe_id": "rec-a1a76db7",
                "ingredient_id": "ing-e36ea1e6",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-e36ea1e6",
                    "name": "carota al forno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ee126",
                "recipe_id": "rec-a1a76db7",
                "ingredient_id": "ing-d32ee126",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d32ee126",
                    "name": "alga",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-43aec000",
        "name": "MAKISO ROLL",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-d676d",
                "recipe_id": "rec-43aec000",
                "ingredient_id": "ing-d89d676d",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d89d676d",
                    "name": "Roll di riso",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-2e35e",
                "recipe_id": "rec-43aec000",
                "ingredient_id": "ing-d592e35e",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d592e35e",
                    "name": "zucca in umido",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-525af",
                "recipe_id": "rec-43aec000",
                "ingredient_id": "ing-7ea525af",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-7ea525af",
                    "name": "salsa alla barbabietola (a base soia)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-0417760f",
        "name": "KALIMAKI",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-c03ad",
                "recipe_id": "rec-0417760f",
                "ingredient_id": "ing-1e4c03ad",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-1e4c03ad",
                    "name": "Riso alla soia",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-9daca",
                "recipe_id": "rec-0417760f",
                "ingredient_id": "ing-2f49daca",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-2f49daca",
                    "name": "zucchine/trombette al vapore",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-e95f7",
                "recipe_id": "rec-0417760f",
                "ingredient_id": "ing-b65e95f7",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-b65e95f7",
                    "name": "zucchine fritte",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-0fa30",
                "recipe_id": "rec-0417760f",
                "ingredient_id": "ing-9540fa30",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9540fa30",
                    "name": "salsa al curry (a base soia)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-08b85409",
        "name": "VEGAN ROLL",
        "description": "Vegan men\u00f9",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-2ddc9",
                "recipe_id": "rec-08b85409",
                "ingredient_id": "ing-4e92ddc9",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-4e92ddc9",
                    "name": "Sfoglie di zucchina",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-c0edb",
                "recipe_id": "rec-08b85409",
                "ingredient_id": "ing-ec7c0edb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-ec7c0edb",
                    "name": "verdure al forno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-235bd",
                "recipe_id": "rec-08b85409",
                "ingredient_id": "ing-f5b235bd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-f5b235bd",
                    "name": "avocado",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-2cbf3",
                "recipe_id": "rec-08b85409",
                "ingredient_id": "ing-48e2cbf3",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-48e2cbf3",
                    "name": "guacamole",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-34f3fdd6",
        "name": "RISOTTO DI PRIMAVERA",
        "description": "I primi di pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-144e7",
                "recipe_id": "rec-34f3fdd6",
                "ingredient_id": "ing-3a5144e7",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-3a5144e7",
                    "name": "Risotto allo zafferano",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-d10d4",
                "recipe_id": "rec-34f3fdd6",
                "ingredient_id": "ing-4ded10d4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-4ded10d4",
                    "name": "gamberi rossi (Mazara del Vallo)",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-4e8fe",
                "recipe_id": "rec-34f3fdd6",
                "ingredient_id": "ing-59e4e8fe",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-59e4e8fe",
                    "name": "flavedo di lime",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-4bf803a6",
        "name": "RISOTTO ALLO SGOMBRO IN CROSTA",
        "description": "I primi di pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-284fd",
                "recipe_id": "rec-4bf803a6",
                "ingredient_id": "ing-a75284fd",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-a75284fd",
                    "name": "Risotto allo sgombro",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ff078",
                "recipe_id": "rec-4bf803a6",
                "ingredient_id": "ing-bdbff078",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-bdbff078",
                    "name": "bisque di alici",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ae3fa",
                "recipe_id": "rec-4bf803a6",
                "ingredient_id": "ing-101ae3fa",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-101ae3fa",
                    "name": "crema di zucca",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-52fe0078",
        "name": "TAGLIATELLE AL RAGU\u2019 DI VONGOLE",
        "description": "I primi di pesce",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-4e73a",
                "recipe_id": "rec-52fe0078",
                "ingredient_id": "ing-6584e73a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6584e73a",
                    "name": "Tagliatelle",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-bcb84",
                "recipe_id": "rec-52fe0078",
                "ingredient_id": "ing-522bcb84",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-522bcb84",
                    "name": "rag\u00f9 di vongole",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-ba94a",
                "recipe_id": "rec-52fe0078",
                "ingredient_id": "ing-185ba94a",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-185ba94a",
                    "name": "finocchietto fresco",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-78859f01",
        "name": "GUNKAN LOVE",
        "description": "Proposta del mese",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-c68f5",
                "recipe_id": "rec-78859f01",
                "ingredient_id": "ing-8b7c68f5",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-8b7c68f5",
                    "name": "Alga decorata",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-88752",
                "recipe_id": "rec-78859f01",
                "ingredient_id": "ing-9a088752",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-9a088752",
                    "name": "tartare di salmone",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-f88a5",
                "recipe_id": "rec-78859f01",
                "ingredient_id": "ing-80df88a5",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-80df88a5",
                    "name": "tartare di ricciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-5d4fe",
                "recipe_id": "rec-78859f01",
                "ingredient_id": "ing-d555d4fe",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-d555d4fe",
                    "name": "peperoncino a parte",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    },
    {
        "id": "rec-17aea2d6",
        "name": "NIGIRI (TONNO E RICCIOLA)",
        "description": "Proposta del mese",
        "prep_time_minutes": 15,
        "created_at": "2026-03-03T00:00:00.000Z",
        "ingredients": [
            {
                "id": "ri-0c8f4",
                "recipe_id": "rec-17aea2d6",
                "ingredient_id": "ing-6c20c8f4",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-6c20c8f4",
                    "name": "tonno",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            },
            {
                "id": "ri-a4bfb",
                "recipe_id": "rec-17aea2d6",
                "ingredient_id": "ing-bf4a4bfb",
                "qty_per_portion": 100,
                "unit": "g",
                "ingredient": {
                    "id": "ing-bf4a4bfb",
                    "name": "ricciola",
                    "base_unit": "g",
                    "default_price": 0,
                    "category": "Altro",
                    "allergens": [],
                    "created_at": "2026-03-03T00:00:00.000Z",
                    "aliases": [],
                    "lots": [],
                    "conversions": [],
                    "total_quantity": 0
                }
            }
        ],
        "equipment": []
    }
];

export const useMockDataStore = create<MockDataState>((set, get) => ({
    ingredients: INITIAL_INGREDIENTS,
    equipment: INITIAL_EQUIPMENT,
    recipes: INITIAL_RECIPES,
    events: [],
    kits: INITIAL_KITS,

    addEvent: async (eventData, menuItems, kitIds) => {
        const fullMenuItems = menuItems.map(mi => {
            const recipe = get().recipes.find(r => r.id === mi.recipe_id);
            return {
                id: Math.random().toString(36).substring(7),
                event_id: 'temp',
                recipe_id: mi.recipe_id,
                portions: mi.portions,
                recipe: recipe!,
            };
        });

        const selectedKits = kitIds.map(id => get().kits.find(k => k.id === id)).filter(Boolean) as KitWithRules[];

        const newEvent: EventWithDetails = {
            ...eventData,
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            menu_items: fullMenuItems,
            kits: selectedKits,
            missing_items: [],
        };

        // Update menu items with actual event id
        newEvent.menu_items.forEach(mi => mi.event_id = newEvent.id);

        set((state) => ({ events: [...state.events, newEvent] }));
        return newEvent;
    },

    updateLotQuantity: (lotId, quantity) => {
        set((state) => ({
            ingredients: state.ingredients.map(ing => {
                const hasLot = ing.lots.some(l => l.id === lotId);
                if (!hasLot) return ing;
                const updatedLots = ing.lots.map(lot => lot.id === lotId ? { ...lot, quantity_available: quantity } : lot);
                return {
                    ...ing,
                    lots: updatedLots,
                    total_quantity: updatedLots.reduce((acc, lot) => acc + lot.quantity_available, 0)
                };
            })
        }));
    },

    updateEquipmentQuantity: (itemId, quantity) => {
        set((state) => ({
            equipment: state.equipment.map(eq => eq.id === itemId ? { ...eq, quantity_available: quantity } : eq)
        }));
    },

    addMovement: (movement) => {
        console.log('Mock Movement recorded:', movement);
    },

    addMissingItem: (missingItem) => {
        set((state) => ({
            events: state.events.map(ev => ev.id === missingItem.event_id ? {
                ...ev,
                missing_items: [...ev.missing_items, { ...missingItem, id: Math.random().toString(36).substring(7), resolved: false }]
            } : ev)
        }));
    },

    addIngredient: (ingData, initialLot, conversions) => {
        const newIngId = 'ing-' + Math.random().toString(36).substring(7);
        const newLots = initialLot ? [{
            ...initialLot,
            id: 'lot-' + Math.random().toString(36).substring(7),
            ingredient_id: newIngId,
            created_at: new Date().toISOString()
        } as IngredientLot] : [];

        const newIngredient: IngredientWithDetails = {
            ...ingData,
            id: newIngId,
            category: (ingData as any).category || 'Altro',
            created_at: new Date().toISOString(),
            allergens: (ingData as any).allergens || [],
            aliases: [],
            lots: newLots,
            conversions: (conversions || []).map(c => ({ ...c, ingredient_id: newIngId })),
            total_quantity: initialLot?.quantity_available || 0
        } as IngredientWithDetails;

        set((state) => ({
            ingredients: [
                ...state.ingredients,
                newIngredient
            ]
        }));
        return newIngredient;
    },

    addLot: (lotData) => {
        const lotId = 'lot-' + Math.random().toString(36).substring(7);
        const newLot = {
            ...lotData,
            id: lotId,
            created_at: new Date().toISOString()
        } as IngredientLot;

        set((state) => ({
            ingredients: state.ingredients.map(ing => {
                if (ing.id !== lotData.ingredient_id) return ing;
                const updatedLots = [...ing.lots, newLot];
                return {
                    ...ing,
                    lots: updatedLots,
                    total_quantity: updatedLots.reduce((acc, l) => acc + Number(l.quantity_available), 0)
                };
            })
        }));
    },

    addEquipmentItem: (eqData) => {
        const newEq: EquipmentWithKit = {
            ...eqData,
            id: 'eq-' + Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            kit_rule: undefined
        } as EquipmentWithKit;

        set((state) => ({
            equipment: [
                ...state.equipment,
                newEq
            ]
        }));
        return newEq;
    },

    addRecipe: (recipeData) => {
        const newRecipe: RecipeWithDetails = {
            ...recipeData,
            id: 'rec-' + Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            ingredients: [],
            equipment: []
        } as RecipeWithDetails;

        set((state) => ({
            recipes: [
                ...state.recipes,
                newRecipe
            ]
        }));
        return newRecipe;
    },

    updateIngredient: (updatedIng, conversions, expiry_date) => {
        set((state) => ({
            ingredients: state.ingredients.map(ing => {
                if (ing.id !== updatedIng.id) return ing;

                let updatedLots = ing.lots;
                if (expiry_date && updatedLots.length > 0) {
                    updatedLots = [
                        { ...updatedLots[0], expiry_date },
                        ...updatedLots.slice(1)
                    ];
                }

                return {
                    ...ing,
                    ...updatedIng,
                    lots: updatedLots,
                    allergens: (updatedIng as any).allergens || ing.allergens,
                    conversions: conversions ? conversions.map(c => ({ ...c, ingredient_id: ing.id })) : ing.conversions
                };
            })
        }));
    },

    deleteIngredient: (id) => {
        set((state) => ({
            ingredients: state.ingredients.filter(ing => ing.id !== id)
        }));
    },

    updateEquipmentItem: (updatedEq) => {
        set((state) => ({
            equipment: state.equipment.map(eq => eq.id === updatedEq.id ? { ...eq, ...updatedEq } : eq)
        }));
    },

    deleteEquipmentItem: (id) => {
        set((state) => ({
            equipment: state.equipment.filter(eq => eq.id !== id)
        }));
    },

    updateRecipe: (updatedRec) => {
        set((state) => ({
            recipes: state.recipes.map(rec => rec.id === updatedRec.id ? { ...rec, ...updatedRec } : rec)
        }));
    },

    updateEvent: (updatedEv) => {
        set((state) => ({
            events: state.events.map(ev => ev.id === updatedEv.id ? { ...ev, ...updatedEv } : ev)
        }));
    },

    deleteRecipe: (id) => {
        set((state) => ({
            recipes: state.recipes.filter(rec => rec.id !== id)
        }));
    },

    addRecipeIngredient: (recipeId, ingredientId, qty, unit) => {
        set((state) => ({
            recipes: state.recipes.map(rec => {
                if (rec.id !== recipeId) return rec;
                const ingredient = state.ingredients.find(i => i.id === ingredientId);
                const newRI = {
                    id: 'ri-' + Math.random().toString(36).substring(7),
                    recipe_id: recipeId,
                    ingredient_id: ingredientId,
                    qty_per_portion: qty,
                    unit: unit,
                    ingredient: ingredient!
                };
                return {
                    ...rec,
                    ingredients: [...(rec.ingredients || []), newRI]
                };
            })
        }));
    },

    removeRecipeIngredient: (recipeId, riId) => {
        set((state) => ({
            recipes: state.recipes.map(rec => {
                if (rec.id !== recipeId) return rec;
                return {
                    ...rec,
                    ingredients: rec.ingredients.filter(ri => ri.id !== riId)
                };
            })
        }));
    },

    addRecipeEquipment: (recipeId, equipmentId, qty) => {
        set((state) => ({
            recipes: state.recipes.map(rec => {
                if (rec.id !== recipeId) return rec;
                const equipmentItem = state.equipment.find(e => e.id === equipmentId);
                const newRE = {
                    id: 're-' + Math.random().toString(36).substring(7),
                    recipe_id: recipeId,
                    equipment_item_id: equipmentId,
                    qty_required: qty,
                    equipment_item: equipmentItem!
                };
                return {
                    ...rec,
                    equipment: [...(rec.equipment || []), newRE]
                };
            })
        }));
    },

    removeRecipeEquipment: (recipeId, reId) => {
        set((state) => ({
            recipes: state.recipes.map(rec => {
                if (rec.id !== recipeId) return rec;
                return {
                    ...rec,
                    equipment: rec.equipment.filter(re => re.id !== reId)
                };
            })
        }));
    },

    addKit: (name, description) => {
        const newKit: KitWithRules = {
            id: 'kit-' + Math.random().toString(36).substring(7),
            name,
            description: description || null,
            created_at: new Date().toISOString(),
            rules: []
        };
        set(state => ({ kits: [...state.kits, newKit] }));
        return newKit;
    },

    updateKit: (updatedKit) => {
        set(state => ({
            kits: state.kits.map(k => k.id === updatedKit.id ? { ...k, ...updatedKit } : k)
        }));
    },

    deleteKit: (id) => {
        set(state => ({ kits: state.kits.filter(k => k.id !== id) }));
    },

    addKitRule: (kitId, equipmentId, qty) => {
        set(state => ({
            kits: state.kits.map(kit => {
                if (kit.id !== kitId) return kit;
                const equipmentItem = state.equipment.find(e => e.id === equipmentId);
                const newRule = {
                    id: 'kr-' + Math.random().toString(36).substring(7),
                    kit_id: kitId,
                    equipment_item_id: equipmentId,
                    qty_per_person: qty,
                    equipment_item: equipmentItem!
                };
                return {
                    ...kit,
                    rules: [...kit.rules, newRule]
                };
            })
        }));
    },

    removeKitRule: (kitId, ruleId) => {
        set(state => ({
            kits: state.kits.map(kit => {
                if (kit.id !== kitId) return kit;
                return {
                    ...kit,
                    rules: kit.rules.filter((r: any) => r.id !== ruleId)
                };
            })
        }));
    },
}));
