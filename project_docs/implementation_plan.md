# Implementation Plan - Project Refinement

This plan addresses the non-functional buttons, adds material tracking to event menus, implements ingredient aggregation, and proposes UX improvements.

## Proposed Changes

### [Component] Event Creation Flow
#### [MODIFY] [new.tsx](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/app/event/new.tsx)
- Improve button visibility and accessibility, especially for Web.
- Ensure the `handleCreate` logic is robust and provides clear feedback.
- Fix any potential Z-index issues that might prevent clicking on some devices.

### [Component] Logic & Store
#### [MODIFY] [useMockDataStore.ts](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/src/store/useMockDataStore.ts)
- Add `updateIngredient`, `deleteIngredient` actions.
- Add `updateEquipmentItem`, `deleteEquipmentItem` actions.
- Add `updateRecipe`, `deleteRecipe` actions.
- **[NEW]** Add `addRecipeIngredient`, `removeRecipeIngredient` to manage recipe composition.
- **[NEW]** Implement `unitConversion` logic in `calculateEventRequirements` to handle cases like Avocado -> Slices.

#### [MODIFY] [hooks/*.ts](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/src/hooks/)
- Update all hooks to include `update` and `delete` mutations.

### [Component] Item Management (CRUD UI)
#### [MODIFY] [index.tsx](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/app/(tabs)/index.tsx)
#### [MODIFY] [materials.tsx](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/app/(tabs)/materials.tsx)
#### [MODIFY] [recipes.tsx](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/app/(tabs)/recipes.tsx)
- Add swipe-to-delete or action icons (Edit/Delete) to each item card.
- Open existing modals in "Edit mode" when the edit icon is clicked.

### [Component] Recipe Composition
#### [NEW] [app/recipe/[id].tsx](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/app/recipe/[id].tsx)
- Detailed view for managing a specific recipe.
- UI to select ingredients from the inventory and specify `qty_per_portion`.
- UI to select equipment items and specify `qty_required`.

### [Component] Advanced Unit Conversions
#### [MODIFY] [types/database.ts](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/src/types/database.ts)
- Add `conversions` field to `IngredientWithDetails` (e.g., `{ unit: 'fetta', ratio: 0.1 }` means 1 fetta = 0.1 units).
#### [MODIFY] [eventLogic.ts](file:///Applications/MAMP/htdocs/PERSONAL_CHEF/src/utils/eventLogic.ts)
- Update calculation logic to apply ratios when `recipe_ingredient.unit` differs from `ingredient.base_unit`.

## Verification Plan
### Automated Tests
- Verify unit conversion: Recipe requires 10 "fette" of Avocado, Ingredient is in "pz", ratio 10:1 -> verify 1 "pz" is calculated.
- Verify CRUD: Add, Edit, and Delete an ingredient and ensure it disappears from the list.

### Manual Verification
- Test recipe composition by adding 3 ingredients and 2 materials to "Pasta al Ragù" and check if they show up in Event Details.
