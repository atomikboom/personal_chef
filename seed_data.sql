-- Seed data per Personal Chef Assistant

-- 1. Ingredienti
INSERT INTO ingredients (name, base_unit, default_price) VALUES
('Salmone Fresco', 'g', 0.025),
('Pasta Corta', 'g', 0.003),
('Olio EVO', 'ml', 0.015),
('Pomodorini', 'g', 0.005);

-- 2. Alias
INSERT INTO ingredient_aliases (ingredient_id, alias) VALUES
((SELECT id FROM ingredients WHERE name = 'Salmone Fresco'), 'Salmone Filetto'),
((SELECT id FROM ingredients WHERE name = 'Salmone Fresco'), 'Trancio di Salmone');

-- 3. Lotti (alcuni in scadenza)
INSERT INTO ingredient_lots (ingredient_id, quantity_available, unit, expiry_date) VALUES
((SELECT id FROM ingredients WHERE name = 'Salmone Fresco'), 1000, 'g', CURRENT_DATE + INTERVAL '2 days'),
((SELECT id FROM ingredients WHERE name = 'Salmone Fresco'), 2000, 'g', CURRENT_DATE + INTERVAL '10 days'),
((SELECT id FROM ingredients WHERE name = 'Pasta Corta'), 5000, 'g', CURRENT_DATE + INTERVAL '100 days');

-- 4. Attrezzatura
INSERT INTO equipment_items (name, category, is_consumable, quantity_available, unit_price) VALUES
('Piatto Piano Bianco', 'Piatti', false, 24, 5.00),
('Forchetta Acciaio', 'Posate', false, 24, 2.00),
('Coltello Acciaio', 'Posate', false, 24, 2.50),
('Bicchiere Vetro', 'Bicchieri', false, 24, 3.00),
('Tovagliolo Carta', 'Altro', true, 100, 0.05);

-- 5. Regole Kit (Default)
INSERT INTO per_person_kit_rules (equipment_item_id, qty_per_person, applies_to) VALUES
((SELECT id FROM equipment_items WHERE name = 'Piatto Piano Bianco'), 1, 'entrambi'),
((SELECT id FROM equipment_items WHERE name = 'Forchetta Acciaio'), 1, 'entrambi'),
((SELECT id FROM equipment_items WHERE name = 'Bicchiere Vetro'), 1, 'domicilio');

-- 6. Ricette
INSERT INTO recipes (name, description, prep_time_minutes) VALUES
('Pasta al Salmone', 'Un classico veloce e saporito', 20);

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, qty_per_portion, unit) VALUES
((SELECT id FROM recipes WHERE name = 'Pasta al Salmone'), (SELECT id FROM ingredients WHERE name = 'Pasta Corta'), 100, 'g'),
((SELECT id FROM recipes WHERE name = 'Pasta al Salmone'), (SELECT id FROM ingredients WHERE name = 'Salmone Fresco'), 80, 'g'),
((SELECT id FROM recipes WHERE name = 'Pasta al Salmone'), (SELECT id FROM ingredients WHERE name = 'Olio EVO'), 10, 'ml');

INSERT INTO recipe_equipment (recipe_id, equipment_item_id, qty_required) VALUES
((SELECT id FROM recipes WHERE name = 'Pasta al Salmone'), (SELECT id FROM equipment_items WHERE name = 'Piatto Piano Bianco'), 1);
