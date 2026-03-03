export type Database = {
    public: {
        Tables: {
            ingredients: {
                Row: {
                    id: string;
                    name: string;
                    base_unit: string;
                    default_price: number;
                    category: string;
                    allergens: string[];
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    base_unit: string;
                    category: string;
                    allergens?: string[];
                    default_price?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    base_unit?: string;
                    category?: string;
                    allergens?: string[];
                    default_price?: number;
                    created_at?: string;
                };
            };
            ingredient_aliases: {
                Row: {
                    id: string;
                    ingredient_id: string;
                    alias: string;
                };
                Insert: {
                    id?: string;
                    ingredient_id: string;
                    alias: string;
                };
                Update: {
                    id?: string;
                    ingredient_id?: string;
                    alias?: string;
                };
            };
            ingredient_lots: {
                Row: {
                    id: string;
                    ingredient_id: string;
                    quantity_available: number;
                    unit: string;
                    expiry_date: string;
                    price_override: number | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    ingredient_id: string;
                    quantity_available: number;
                    unit: string;
                    expiry_date: string;
                    price_override?: number | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    ingredient_id?: string;
                    quantity_available?: number;
                    unit?: string;
                    expiry_date?: string;
                    price_override?: number | null;
                    notes?: string | null;
                    created_at?: string;
                };
            };
            equipment_items: {
                Row: {
                    id: string;
                    name: string;
                    category: string;
                    is_consumable: boolean;
                    quantity_available: number;
                    unit_price: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    category: string;
                    is_consumable?: boolean;
                    quantity_available: number;
                    unit_price?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    category?: string;
                    is_consumable?: boolean;
                    quantity_available?: number;
                    unit_price?: number;
                    created_at?: string;
                };
            };
            kits: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    created_at?: string;
                };
            };
            per_person_kit_rules: {
                Row: {
                    id: string;
                    kit_id: string;
                    equipment_item_id: string;
                    qty_per_person: number;
                };
                Insert: {
                    id?: string;
                    kit_id: string;
                    equipment_item_id: string;
                    qty_per_person?: number;
                };
                Update: {
                    id?: string;
                    kit_id?: string;
                    equipment_item_id?: string;
                    qty_per_person?: number;
                };
            };
            recipes: {
                Row: {
                    id: string;
                    name: string;
                    description: string | null;
                    prep_time_minutes: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    description?: string | null;
                    prep_time_minutes?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    description?: string | null;
                    prep_time_minutes?: number;
                    created_at?: string;
                };
            };
            recipe_ingredients: {
                Row: {
                    id: string;
                    recipe_id: string;
                    ingredient_id: string;
                    qty_per_portion: number;
                    unit: string;
                };
                Insert: {
                    id?: string;
                    recipe_id: string;
                    ingredient_id: string;
                    qty_per_portion: number;
                    unit: string;
                };
                Update: {
                    id?: string;
                    recipe_id?: string;
                    ingredient_id?: string;
                    qty_per_portion?: number;
                    unit?: string;
                };
            };
            recipe_equipment: {
                Row: {
                    id: string;
                    recipe_id: string;
                    equipment_item_id: string;
                    qty_required: number;
                };
                Insert: {
                    id?: string;
                    recipe_id: string;
                    equipment_item_id: string;
                    qty_required?: number;
                };
                Update: {
                    id?: string;
                    recipe_id?: string;
                    equipment_item_id?: string;
                    qty_required?: number;
                };
            };
            events: {
                Row: {
                    id: string;
                    title: string;
                    datetime: string;
                    type: 'domicilio' | 'asporto';
                    people_count: number;
                    address: string | null;
                    notes: string | null;
                    status: 'pianificato' | 'chiuso';
                    guest_allergies: string | null;
                    total_cost_estimate: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    datetime: string;
                    type: 'domicilio' | 'asporto';
                    people_count?: number;
                    address?: string | null;
                    notes?: string | null;
                    status?: 'pianificato' | 'chiuso';
                    total_cost_estimate?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    datetime?: string;
                    type?: 'domicilio' | 'asporto';
                    people_count?: number;
                    address?: string | null;
                    notes?: string | null;
                    status?: 'pianificato' | 'chiuso';
                    total_cost_estimate?: number;
                    created_at?: string;
                };
            };
            event_menu_items: {
                Row: {
                    id: string;
                    event_id: string;
                    recipe_id: string;
                    portions: number;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    recipe_id: string;
                    portions: number;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    recipe_id?: string;
                    portions?: number;
                };
            };
            event_kits: {
                Row: {
                    id: string;
                    event_id: string;
                    kit_id: string;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    kit_id: string;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    kit_id?: string;
                };
            };
            event_missing_items: {
                Row: {
                    id: string;
                    event_id: string;
                    item_type: 'ingredient' | 'equipment';
                    ref_id: string;
                    qty_missing: number;
                    unit: string | null;
                    resolved: boolean;
                };
                Insert: {
                    id?: string;
                    event_id: string;
                    item_type: 'ingredient' | 'equipment';
                    ref_id: string;
                    qty_missing: number;
                    unit?: string | null;
                    resolved?: boolean;
                };
                Update: {
                    id?: string;
                    event_id?: string;
                    item_type?: 'ingredient' | 'equipment';
                    ref_id?: string;
                    qty_missing?: number;
                    unit?: string | null;
                    resolved?: boolean;
                };
            };
        };
    };
};

export type UnitConversion = {
    ingredient_id: string;
    unit: string;
    ratio: number; // 1 unit = ratio * base_unit
};

export type Ingredient = Database['public']['Tables']['ingredients']['Row'];
export type IngredientAlias = Database['public']['Tables']['ingredient_aliases']['Row'];
export type IngredientLot = Database['public']['Tables']['ingredient_lots']['Row'];

export type EquipmentItem = Database['public']['Tables']['equipment_items']['Row'];
export type Kit = Database['public']['Tables']['kits']['Row'];
export type KitRule = Database['public']['Tables']['per_person_kit_rules']['Row'];

export type KitWithRules = Kit & {
    rules: (KitRule & { equipment_item: EquipmentItem })[];
};

export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type RecipeIngredient = Database['public']['Tables']['recipe_ingredients']['Row'];
export type RecipeEquipment = Database['public']['Tables']['recipe_equipment']['Row'];

export type Event = Database['public']['Tables']['events']['Row'];
export type EventMenuItem = Database['public']['Tables']['event_menu_items']['Row'];
export type EventMissingItem = Database['public']['Tables']['event_missing_items']['Row'];

export type RecipeWithDetails = Recipe & {
    ingredients: (RecipeIngredient & { ingredient: Ingredient })[];
    equipment: (RecipeEquipment & { equipment_item: EquipmentItem })[];
};

export type IngredientWithDetails = Ingredient & {
    aliases: IngredientAlias[];
    lots: IngredientLot[];
    conversions: UnitConversion[];
    total_quantity: number;
};

export type EquipmentWithKit = EquipmentItem & {
    kit_rule?: KitRule;
};

export type EventWithDetails = Event & {
    menu_items: (EventMenuItem & { recipe: RecipeWithDetails })[];
    kits: KitWithRules[];
    missing_items: EventMissingItem[];
};
