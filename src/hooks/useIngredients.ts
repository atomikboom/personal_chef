import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockMode, supabase } from '../services/supabase';
import { useMockDataStore } from '../store/useMockDataStore';
import { Ingredient, IngredientLot, IngredientWithDetails } from '../types/database';

export const useIngredients = () => {
    const queryClient = useQueryClient();
    const mockStore = useMockDataStore();

    const getIngredients = useQuery({
        queryKey: ['ingredients'],
        queryFn: async () => {
            if (isMockMode) return mockStore.ingredients;

            const { data, error } = await supabase
                .from('ingredients')
                .select(`
          *,
          aliases:ingredient_aliases(*),
          lots:ingredient_lots(*),
          conversions:ingredient_conversions(*)
        `)
                .order('name');

            if (error) throw error;

            return (data as any[]).map(item => ({
                ...item,
                total_quantity: item.lots.reduce((acc: number, lot: any) => acc + Number(lot.quantity_available), 0)
            })) as IngredientWithDetails[];
        },
    });

    const addIngredient = useMutation({
        mutationFn: async ({ ingredient, initialLot, conversions }: {
            ingredient: Omit<Ingredient, 'id' | 'created_at'>,
            initialLot?: Omit<IngredientLot, 'id' | 'created_at' | 'ingredient_id'>,
            conversions?: { unit: string; ratio: number }[]
        }) => {
            if (isMockMode) {
                mockStore.addIngredient(ingredient, initialLot, conversions);
                return { ...ingredient, id: 'temp', created_at: new Date().toISOString() };
            }

            const { data, error } = await supabase
                .from('ingredients')
                .insert(ingredient)
                .select()
                .single();

            if (error) throw error;

            if (initialLot) {
                await supabase.from('ingredient_lots').insert({
                    ...initialLot,
                    ingredient_id: data.id
                });
            }

            if (conversions && conversions.length > 0) {
                await supabase.from('ingredient_conversions').insert(
                    conversions.map(c => ({ ...c, ingredient_id: data.id }))
                );
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });

    const updateIngredient = useMutation({
        mutationFn: async ({ ingredient, conversions, expiry_date }: { ingredient: Ingredient, conversions?: { unit: string; ratio: number }[], expiry_date?: string }) => {
            if (isMockMode) {
                mockStore.updateIngredient(ingredient, conversions, expiry_date);
                return ingredient;
            }

            const { data, error } = await supabase
                .from('ingredients')
                .update(ingredient)
                .eq('id', ingredient.id)
                .select()
                .single();

            if (error) throw error;

            if (conversions) {
                // Simple strategy: delete and re-insert conversions
                await supabase.from('ingredient_conversions').delete().eq('ingredient_id', ingredient.id);
                if (conversions.length > 0) {
                    await supabase.from('ingredient_conversions').insert(
                        conversions.map(c => ({ ...c, ingredient_id: ingredient.id }))
                    );
                }
            }

            if (expiry_date) {
                // Update the most recent lot's expiry date
                const { data: lots } = await supabase
                    .from('ingredient_lots')
                    .select('id')
                    .eq('ingredient_id', ingredient.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                if (lots && lots.length > 0) {
                    await supabase
                        .from('ingredient_lots')
                        .update({ expiry_date })
                        .eq('id', lots[0].id);
                }
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });

    const deleteIngredient = useMutation({
        mutationFn: async (id: string) => {
            if (isMockMode) {
                mockStore.deleteIngredient(id);
                return id;
            }

            const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });

    const addLot = useMutation({
        mutationFn: async (lot: Omit<IngredientLot, 'id' | 'created_at'>) => {
            if (isMockMode) {
                mockStore.addLot(lot);
                return { ...lot, id: 'temp', created_at: new Date().toISOString() };
            }

            const { data, error } = await supabase
                .from('ingredient_lots')
                .insert(lot)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ingredients'] });
        },
    });

    return {
        ingredients: getIngredients.data || [],
        isLoading: getIngredients.isLoading,
        error: getIngredients.error,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addLot,
    };
};
