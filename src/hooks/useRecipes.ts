import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockMode, supabase } from '../services/supabase';
import { useMockDataStore } from '../store/useMockDataStore';
import { Recipe, RecipeWithDetails } from '../types/database';

export const useRecipes = () => {
    const queryClient = useQueryClient();
    const mockStore = useMockDataStore();

    const getRecipes = useQuery({
        queryKey: ['recipes'],
        queryFn: async () => {
            if (isMockMode) return mockStore.recipes;

            const { data, error } = await supabase
                .from('recipes')
                .select(`
          *,
          ingredients:recipe_ingredients(*, ingredient:ingredients(*)),
          equipment:recipe_equipment(*, equipment_item:equipment_items(*))
        `)
                .order('name');

            if (error) throw error;
            return data as RecipeWithDetails[];
        },
    });

    const addRecipe = useMutation({
        mutationFn: async (newRecipe: Omit<Recipe, 'id' | 'created_at'>) => {
            if (isMockMode) {
                return mockStore.addRecipe(newRecipe);
            }

            const { data, error } = await supabase
                .from('recipes')
                .insert(newRecipe)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });

    const updateRecipe = useMutation({
        mutationFn: async (recipe: Recipe) => {
            if (isMockMode) {
                mockStore.updateRecipe(recipe);
                return recipe;
            }

            const { data, error } = await supabase
                .from('recipes')
                .update(recipe)
                .eq('id', recipe.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });

    const deleteRecipe = useMutation({
        mutationFn: async (id: string) => {
            if (isMockMode) {
                mockStore.deleteRecipe(id);
                return id;
            }

            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['recipes'] });
        },
    });

    const addRecipeIngredient = useMutation({
        mutationFn: async ({ recipeId, ingredientId, qty, unit }: { recipeId: string; ingredientId: string; qty: number; unit: string }) => {
            if (isMockMode) {
                mockStore.addRecipeIngredient(recipeId, ingredientId, qty, unit);
                return;
            }
            const { error } = await supabase.from('recipe_ingredients').insert({ recipe_id: recipeId, ingredient_id: ingredientId, qty_per_portion: qty, unit });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
    });

    const removeRecipeIngredient = useMutation({
        mutationFn: async ({ recipeId, riId }: { recipeId: string; riId: string }) => {
            if (isMockMode) {
                mockStore.removeRecipeIngredient(recipeId, riId);
                return;
            }
            const { error } = await supabase.from('recipe_ingredients').delete().eq('id', riId);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
    });

    const addRecipeEquipment = useMutation({
        mutationFn: async ({ recipeId, equipmentId, qty }: { recipeId: string; equipmentId: string; qty: number }) => {
            if (isMockMode) {
                mockStore.addRecipeEquipment(recipeId, equipmentId, qty);
                return;
            }
            const { error } = await supabase.from('recipe_equipment').insert({ recipe_id: recipeId, equipment_item_id: equipmentId, qty_required: qty });
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
    });

    const removeRecipeEquipment = useMutation({
        mutationFn: async ({ recipeId, reId }: { recipeId: string; reId: string }) => {
            if (isMockMode) {
                mockStore.removeRecipeEquipment(recipeId, reId);
                return;
            }
            const { error } = await supabase.from('recipe_equipment').delete().eq('id', reId);
            if (error) throw error;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recipes'] }),
    });

    return {
        recipes: getRecipes.data || [],
        isLoading: getRecipes.isLoading,
        error: getRecipes.error,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addRecipeIngredient,
        removeRecipeIngredient,
        addRecipeEquipment,
        removeRecipeEquipment,
    };
};
