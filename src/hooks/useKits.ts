import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockMode, supabase } from '../services/supabase';
import { useMockDataStore } from '../store/useMockDataStore';
import { Kit, KitWithRules } from '../types/database';

export const useKits = () => {
    const queryClient = useQueryClient();
    const mockStore = useMockDataStore();

    const getKits = useQuery({
        queryKey: ['kits'],
        queryFn: async () => {
            if (isMockMode) return mockStore.kits;

            const { data, error } = await supabase
                .from('kits')
                .select(`
          *,
          rules:per_person_kit_rules(*, equipment_item:equipment_items(*))
        `)
                .order('name');

            if (error) throw error;
            return data as KitWithRules[];
        },
    });

    const addKit = useMutation({
        mutationFn: async ({ name, description }: { name: string, description?: string }) => {
            if (isMockMode) return mockStore.addKit(name, description);

            const { data, error } = await supabase
                .from('kits')
                .insert({ name, description })
                .select()
                .single();

            if (error) throw error;
            return data as Kit;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kits'] });
        },
    });

    return {
        kits: getKits.data || [],
        isLoading: getKits.isLoading,
        error: getKits.error,
        addKit,
    };
};
