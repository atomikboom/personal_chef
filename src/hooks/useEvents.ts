import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isMockMode, supabase } from '../services/supabase';
import { useMockDataStore } from '../store/useMockDataStore';
import { Event, EventWithDetails } from '../types/database';
import { deductStockFEFO } from '../utils/eventLogic';

export const useEvents = () => {
    const queryClient = useQueryClient();
    const mockStore = useMockDataStore();

    const getEvents = useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            if (isMockMode) return mockStore.events;

            const { data, error } = await supabase
                .from('events')
                .select(`
          *,
          menu_items:event_menu_items(
            *,
            recipe:recipes(
              *,
              ingredients:recipe_ingredients(*, ingredient:ingredients(*)),
              equipment:recipe_equipment(*, equipment_item:equipment_items(*))
            )
          ),
          missing_items:event_missing_items(*),
          kits:event_kits(
            kit:kits(
              *,
              rules:per_person_kit_rules(*, equipment_item:equipment_items(*))
            )
          )
        `)
                .order('datetime', { ascending: true });

            if (error) throw error;
            return data as EventWithDetails[];
        },
    });

    const addEvent = useMutation({
        mutationFn: async ({ event, menuItems, kitIds }: { event: Omit<Event, 'id' | 'created_at'>, menuItems: { recipe_id: string; portions: number }[], kitIds: string[] }) => {
            if (isMockMode) return await mockStore.addEvent(event, menuItems, kitIds);

            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .insert(event)
                .select()
                .single();

            if (eventError) throw eventError;

            if (menuItems.length > 0) {
                const { error: menuError } = await supabase
                    .from('event_menu_items')
                    .insert(menuItems.map(mi => ({ ...mi, event_id: eventData.id })));

                if (menuError) throw menuError;
            }

            if (kitIds && kitIds.length > 0) {
                const { error: kitError } = await supabase
                    .from('event_kits')
                    .insert(kitIds.map(kit_id => ({ event_id: eventData.id, kit_id })));

                if (kitError) throw kitError;
            }

            return eventData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const closeEvent = useMutation({
        mutationFn: async ({ eventId, ingredients, equipment }: { eventId: string; ingredients: any[]; equipment: any[] }) => {
            // First deduct stock using FEFO logic
            await deductStockFEFO(eventId, ingredients, equipment);

            if (isMockMode) {
                mockStore.events = mockStore.events.map(ev =>
                    ev.id === eventId ? { ...ev, status: 'chiuso' } : ev
                );
                return;
            }

            const { error } = await supabase
                .from('events')
                .update({ status: 'chiuso' })
                .eq('id', eventId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const updateEvent = useMutation({
        mutationFn: async (event: Partial<Event> & { id: string }) => {
            if (isMockMode) {
                mockStore.updateEvent(event as Event);
                return event;
            }

            const { data, error } = await supabase
                .from('events')
                .update(event)
                .eq('id', event.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    return {
        events: getEvents.data || [],
        isLoading: getEvents.isLoading,
        error: getEvents.error,
        addEvent,
        updateEvent,
        closeEvent,
    };
};
