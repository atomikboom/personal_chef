import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, FileText, Package, ShoppingCart, Soup } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useEvents } from '../../src/hooks/useEvents';
import { useIngredients } from '../../src/hooks/useIngredients';
import { Colors, Spacing, Typography } from '../../src/theme/constants';
import { calculateEventRequirements } from '../../src/utils/eventLogic';
import { exportGlobalShoppingList } from '../../src/utils/pdfExport';

export default function ShoppingListModal() {
  const router = useRouter();
  const { events, isLoading: eventsLoading } = useEvents();
  const { ingredients, isLoading: ingLoading } = useIngredients();
  const { equipment, isLoading: eqLoading } = useEquipment();

  const isLoading = eventsLoading || ingLoading || eqLoading;

  const result = useMemo(() => {
    if (isLoading) return null;

    const plannedEvents = events.filter(e => e.status === 'pianificato');
    
    const aggregatedIngredients: Record<string, { id: string, name: string, qty: number, unit: string }> = {};
    const aggregatedEquipment: Record<string, { id: string, name: string, qty: number }> = {};

    plannedEvents.forEach(event => {
      const requirements = calculateEventRequirements(
        event.menu_items.map(mi => ({ recipe: mi.recipe, portions: mi.portions })),
        event.people_count,
        event.type,
        equipment as any
      );

      // Aggregate Ingredients
      Object.values(requirements.ingredientReqs).forEach(req => {
        if (!aggregatedIngredients[req.id]) {
          const ing = ingredients.find(i => i.id === req.id);
          aggregatedIngredients[req.id] = { 
            ...req, 
            qty: 0,
            allergens: (ing as any)?.allergens || []
          };
        }
        aggregatedIngredients[req.id].qty += req.qty;
      });

      // Aggregate Equipment
      Object.values(requirements.equipmentReqs).forEach(req => {
        if (req.isConsumable) {
          if (!aggregatedEquipment[req.id]) {
            aggregatedEquipment[req.id] = { id: req.id, name: req.name, qty: 0 };
          }
          aggregatedEquipment[req.id].qty += req.qty;
        }
      });
    });

    // Calculate what needs to be bought
    const shopListIngredients = Object.values(aggregatedIngredients).map(item => {
      const inStock = ingredients.find(i => i.id === item.id)?.total_quantity || 0;
      const toBuy = Math.max(0, item.qty - inStock);
      return { ...item, inStock, toBuy };
    }).filter(item => item.toBuy > 0);

    const shopListEquipment = Object.values(aggregatedEquipment).map(item => {
      const inStock = equipment.find(e => e.id === item.id)?.quantity_available || 0;
      const toBuy = Math.max(0, item.qty - inStock);
      return { ...item, inStock, toBuy };
    }).filter(item => item.toBuy > 0);

    return { shopListIngredients, shopListEquipment, plannedCount: plannedEvents.length };
  }, [events, ingredients, equipment, isLoading]);

  const handleExport = async () => {
    if (!result) return;
    try {
      await exportGlobalShoppingList(result.shopListIngredients, result.shopListEquipment, result.plannedCount);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading || !result) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'Lista della Spesa Totale',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.summaryCard}>
          <ShoppingCart size={24} color={Colors.primary} />
          <View>
            <Text style={styles.summaryTitle}>Fabbisogno Aggregato</Text>
            <Text style={styles.summarySubtitle}>Basato su {result.plannedCount} eventi programmati</Text>
          </View>
        </View>

        {result.shopListIngredients.length === 0 && result.shopListEquipment.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Hai tutto il necessario in magazzino per i prossimi eventi!</Text>
          </View>
        ) : (
          <>
            {result.shopListIngredients.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Soup size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Ingredienti da Acquistare</Text>
                </View>
                <View style={styles.card}>
                  {result.shopListIngredients.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          {(item as any).allergens?.length > 0 && (
                            <View style={styles.allergenBadge}>
                              <Text style={styles.allergenBadgeText}>Allergeni</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.itemRef}>Disp: {item.inStock} {item.unit} | Tot. serve: {item.qty} {item.unit}</Text>
                      </View>
                      <View style={styles.toBuyBadge}>
                        <Text style={styles.toBuyLabel}>compra</Text>
                        <Text style={styles.toBuyQty}>{item.toBuy.toFixed(2)} {item.unit}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {result.shopListEquipment.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Package size={20} color={Colors.primary} />
                  <Text style={styles.sectionTitle}>Materiali Monouso da Acquistare</Text>
                </View>
                <View style={styles.card}>
                  {result.shopListEquipment.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemRef}>Disp: {item.inStock} pz | Tot. serve: {item.qty} pz</Text>
                      </View>
                      <View style={styles.toBuyBadge}>
                        <Text style={styles.toBuyLabel}>compra</Text>
                        <Text style={styles.toBuyQty}>{item.toBuy} pz</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <FileText size={20} color="#FFF" />
            <Text style={styles.exportButtonText}>Esporta PDF Spesa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    ...Typography.h2,
    marginBottom: 0,
  },
  summarySubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    marginBottom: 0,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  itemName: {
    ...Typography.body,
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemRef: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  toBuyBadge: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
  },
  toBuyLabel: {
    color: '#FFF',
    fontSize: 8,
    textTransform: 'uppercase',
    fontWeight: '900',
    marginBottom: -2,
  },
  toBuyQty: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  allergenBadge: {
    backgroundColor: Colors.error + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  allergenBadgeText: {
    color: Colors.error,
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.xl,
  },
  exportButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
