-- Personal Chef App - Database Schema

-- 1. Food Inventory
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    base_unit TEXT NOT NULL, -- g, ml, pezzi, etc.
    default_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ingredient_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    alias TEXT NOT NULL
);

CREATE TABLE ingredient_lots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity_available DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,
    expiry_date DATE NOT NULL,
    price_override DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ingredient_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    unit TEXT NOT NULL,
    ratio DECIMAL(10, 4) NOT NULL, -- 1 unit = ratio * base_unit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Non-food Inventory
CREATE TABLE equipment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- piatti, posate, etc.
    is_consumable BOOLEAN NOT NULL DEFAULT FALSE,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Kit Settings
CREATE TYPE kit_applies_to AS ENUM ('domicilio', 'asporto', 'entrambi');

CREATE TABLE per_person_kit_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_item_id UUID REFERENCES equipment_items(id) ON DELETE CASCADE,
    qty_per_person INTEGER NOT NULL DEFAULT 1,
    applies_to kit_applies_to NOT NULL DEFAULT 'entrambi'
);

-- 4. Recipes
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    prep_time_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    qty_per_portion DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL
);

CREATE TABLE recipe_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    equipment_item_id UUID REFERENCES equipment_items(id) ON DELETE CASCADE,
    qty_required INTEGER NOT NULL DEFAULT 1
);

-- 5. Events
CREATE TYPE event_type AS ENUM ('domicilio', 'asporto');
CREATE TYPE event_status AS ENUM ('pianificato', 'chiuso');

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    type event_type NOT NULL,
    people_count INTEGER NOT NULL DEFAULT 1,
    address TEXT,
    notes TEXT,
    status event_status DEFAULT 'pianificato',
    total_cost_estimate DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    portions INTEGER NOT NULL DEFAULT 1
);

-- 6. Requirements / Missing / Checklist
CREATE TABLE event_required_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    qty_required DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL
);

CREATE TABLE event_required_equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    equipment_item_id UUID REFERENCES equipment_items(id) ON DELETE CASCADE,
    qty_required INTEGER NOT NULL
);

CREATE TYPE item_type AS ENUM ('ingredient', 'equipment');

CREATE TABLE event_missing_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    item_type item_type NOT NULL,
    ref_id UUID NOT NULL, -- ingredient_id or equipment_item_id
    qty_missing DECIMAL(10, 2) NOT NULL,
    unit TEXT,
    resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE event_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    item_type item_type NOT NULL,
    label TEXT NOT NULL,
    qty DECIMAL(10, 2) NOT NULL,
    unit TEXT,
    checked BOOLEAN DEFAULT FALSE
);

-- 7. Stock Movements
CREATE TYPE movement_type AS ENUM ('ingredient', 'equipment');

CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type movement_type NOT NULL,
    ref_id UUID NOT NULL, -- ingredient_id or equipment_item_id
    lot_id UUID REFERENCES ingredient_lots(id) ON DELETE SET NULL,
    delta_qty DECIMAL(10, 2) NOT NULL, -- negative for consumption, positive for purchase
    reason TEXT,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL
);

-- Indices for performance
CREATE INDEX idx_ingredient_lots_expiry ON ingredient_lots(expiry_date ASC);
CREATE INDEX idx_ingredient_aliases_name ON ingredient_aliases(alias);
CREATE INDEX idx_event_missing_resolved ON event_missing_items(resolved);
