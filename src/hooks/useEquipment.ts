import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockMode, supabase } from '../services/supabase';
import { useMockDataStore } from '../store/useMockDataStore';
import { EquipmentItem, EquipmentWithKit } from '../types/database';

export const useEquipment = () => {
    const queryClient = useQueryClient();
    const mockStore = useMockDataStore();

    const getEquipment = useQuery({
        queryKey: ['equipment'],
        queryFn: async () => {
            if (isMockMode) return mockStore.equipment;

            const { data, error } = await supabase
                .from('equipment_items')
                .select(`
          *,
          kit_rule:per_person_kit_rules(id, qty_per_person, applies_to)
        `)
                .order('name');

            if (error) throw error;

            return (data as any[]).map(item => ({
                ...item,
                kit_rule: item.kit_rule && item.kit_rule.length > 0 ? item.kit_rule[0] : null
            })) as EquipmentWithKit[];
        },
    });

    const addEquipment = useMutation({
        mutationFn: async (newEquipment: Omit<EquipmentItem, 'id' | 'created_at'>) => {
            if (isMockMode) {
                mockStore.addEquipmentItem(newEquipment);
                return { ...newEquipment, id: 'temp', created_at: new Date().toISOString() };
            }

            const { data, error } = await supabase
                .from('equipment_items')
                .insert(newEquipment)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
        },
    });

    const updateEquipment = useMutation({
        mutationFn: async (equipment: EquipmentItem) => {
            if (isMockMode) {
                mockStore.updateEquipmentItem(equipment);
                return equipment;
            }

            const { data, error } = await supabase
                .from('equipment_items')
                .update(equipment)
                .eq('id', equipment.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
        },
    });

    const deleteEquipment = useMutation({
        mutationFn: async (id: string) => {
            if (isMockMode) {
                mockStore.deleteEquipmentItem(id);
                return id;
            }

            const { error } = await supabase
                .from('equipment_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
        },
    });

    return {
        equipment: getEquipment.data || [],
        isLoading: getEquipment.isLoading,
        error: getEquipment.error,
        addEquipment,
        updateEquipment,
        deleteEquipment,
    };
};
