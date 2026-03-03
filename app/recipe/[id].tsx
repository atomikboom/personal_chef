import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Box, ChevronLeft, Plus, Search, Soup, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useIngredients } from '../../src/hooks/useIngredients';
import { useRecipes } from '../../src/hooks/useRecipes';
import { Colors, Spacing, Typography } from '../../src/theme/constants';
import { calculateRecipeCost } from '../../src/utils/eventLogic';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { recipes, isLoading: loadingRecipes, addRecipeIngredient, removeRecipeIngredient, addRecipeEquipment, removeRecipeEquipment } = useRecipes();
  const { ingredients: allIngredients } = useIngredients();
  const { equipment: allEquipment } = useEquipment();

  const recipe = recipes.find(r => r.id === id);

  const [isAddIngredientVisible, setIsAddIngredientVisible] = useState(false);
  const [isAddEquipmentVisible, setIsAddEquipmentVisible] = useState(false);
  
  const [selectedIngredientId, setSelectedIngredientId] = useState('');
  const [ingredientQty, setIngredientQty] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');

  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [equipmentQty, setEquipmentQty] = useState('');

  // Catalog State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogType, setCatalogType] = useState<'food' | 'equipment'>('food');
  const [itemInputs, setItemInputs] = useState<Record<string, { qty: string; unit: string }>>({});

  if (loadingRecipes || !recipe) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleAddItem = async (item: any, type: 'food' | 'equipment') => {
    const input = itemInputs[item.id];
    if (!input || !input.qty) {
      Alert.alert('Attenzione', 'Inserisci una quantità');
      return;
    }

    try {
      if (type === 'food') {
        await addRecipeIngredient.mutateAsync({
          recipeId: recipe.id,
          ingredientId: item.id,
          qty: parseFloat(input.qty),
          unit: input.unit || item.base_unit,
        });
      } else {
        await addRecipeEquipment.mutateAsync({
          recipeId: recipe.id,
          equipmentId: item.id,
          qty: parseInt(input.qty),
        });
      }
      // Reset input for this item
      setItemInputs(prev => ({
        ...prev,
        [item.id]: { qty: '', unit: type === 'food' ? item.base_unit : 'pz' }
      }));
    } catch (error) {
      Alert.alert('Errore', 'Impossibile aggiungere l\'elemento');
    }
  };

  const filteredCatalog = useMemo(() => {
    if (catalogType === 'food') {
      return allIngredients.filter(i => 
        i.name.toLowerCase().includes(catalogSearch.toLowerCase())
      );
    } else {
      return allEquipment.filter(e => 
        e.name.toLowerCase().includes(catalogSearch.toLowerCase())
      );
    }
  }, [allIngredients, allEquipment, catalogSearch, catalogType]);

  const updateItemInput = (id: string, field: 'qty' | 'unit', value: string) => {
    setItemInputs(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { qty: '', unit: '' }), [field]: value }
    }));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: recipe.name,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
        ),
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerInfo}>
          <Text style={styles.description}>{recipe.description || 'Nessuna descrizione'}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recipe.prep_time_minutes} min</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: Colors.success + '20' }]}>
              <Text style={[styles.badgeText, { color: Colors.success }]}>
                Portione: €{calculateRecipeCost(recipe).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* INGREDIENTS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Soup size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Ingredienti per porzione</Text>
            </View>
            <TouchableOpacity style={styles.miniAddButton} onPress={() => setIsAddIngredientVisible(true)}>
              <Plus size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {recipe.ingredients.length === 0 ? (
            <Text style={styles.emptyText}>Nessun ingrediente aggiunto</Text>
          ) : (
            recipe.ingredients.map(ri => (
              <View key={ri.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{ri.ingredient.name}</Text>
                  <Text style={styles.itemQty}>{ri.qty_per_portion} {ri.unit}</Text>
                </View>
                <TouchableOpacity onPress={() => removeRecipeIngredient.mutate({ recipeId: recipe.id, riId: ri.id })}>
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* EQUIPMENT SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Box size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Materiali / Equipment</Text>
            </View>
          </View>

          {recipe.equipment.length === 0 ? (
            <Text style={styles.emptyText}>Nessun materiale aggiunto</Text>
          ) : (
            recipe.equipment.map(re => (
              <View key={re.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{re.equipment_item.name}</Text>
                  <Text style={styles.itemQty}>{re.qty_required} pz</Text>
                </View>
                <TouchableOpacity onPress={() => removeRecipeEquipment.mutate({ recipeId: recipe.id, reId: re.id })}>
                  <Trash2 size={18} color={Colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.divider} />

        {/* QUICK ADD CATALOG SECTION */}
        <View style={styles.catalogSection}>
          <Text style={styles.catalogTitle}>Aggiunta Rapida (Catalogo)</Text>
          
          <View style={styles.catalogHeader}>
            <View style={styles.catalogSearch}>
              <Search size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.catalogInput}
                placeholder="Cerca nel catalogo..."
                placeholderTextColor={Colors.placeholder}
                value={catalogSearch}
                onChangeText={setCatalogSearch}
              />
            </View>
            <View style={styles.typeSelector}>
              <TouchableOpacity 
                style={[styles.typeBtn, catalogType === 'food' && styles.typeBtnActive]}
                onPress={() => setCatalogType('food')}
              >
                <Text style={[styles.typeBtnText, catalogType === 'food' && styles.typeBtnTextActive]}>Cibo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, catalogType === 'equipment' && styles.typeBtnActive]}
                onPress={() => setCatalogType('equipment')}
              >
                <Text style={[styles.typeBtnText, catalogType === 'equipment' && styles.typeBtnTextActive]}>Materiali</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.catalogList}>
            {filteredCatalog.length === 0 ? (
              <Text style={styles.emptyText}>Nessun elemento trovato</Text>
            ) : (
              filteredCatalog.map(item => {
                const isFood = catalogType === 'food';
                const baseUnit = isFood ? (item as any).base_unit : 'pz';
                const input = itemInputs[item.id] || { qty: '', unit: baseUnit };
                const units = isFood 
                  ? [baseUnit, ...((item as any).conversions?.map((c: any) => c.unit) || [])]
                  : ['pz'];

                return (
                  <View key={item.id} style={styles.catalogItem}>
                    <View style={{ flex: 1.5 }}>
                        <Text style={styles.catalogItemName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.catalogItemSub}>{isFood ? (item as any).category : 'Materiale'}</Text>
                    </View>
                    
                    <View style={styles.catalogActionRow}>
                        <TextInput
                            style={styles.qtyInput}
                            placeholder="0"
                            placeholderTextColor={Colors.placeholder}
                            keyboardType="numeric"
                            value={input.qty}
                            onChangeText={(v) => updateItemInput(item.id, 'qty', v)}
                        />
                        
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catalogUnitSelector}>
                            {units.map(u => (
                                <TouchableOpacity 
                                    key={u}
                                    style={[styles.unitChip, input.unit === u && styles.unitChipActive]}
                                    onPress={() => updateItemInput(item.id, 'unit', u)}
                                >
                                    <Text style={[styles.unitChipText, input.unit === u && styles.unitChipTextActive]}>{u}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity 
                            style={styles.quickAddBtn}
                            onPress={() => handleAddItem(item, catalogType)}
                        >
                            <Plus size={18} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

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
  },
  headerInfo: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: 0,
  },
  miniAddButton: {
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    padding: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  itemQty: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
  },
  unitSelector: {
    flexDirection: 'row',
  },
  unitButtonMini: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    justifyContent: 'center',
    marginRight: 4,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitButtonTextMini: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#FFF',
  },
  selector: {
    maxHeight: 200,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  selectorItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectorItemActive: {
    backgroundColor: Colors.primary + '20',
  },
  selectorText: {
    fontSize: 15,
  },
  selectorTextActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  btnCancel: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnCancelText: {
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  btnSave: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  btnSaveText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  quickAddBtn: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catalogSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catalogTitle: {
    ...Typography.h2,
    fontSize: 18,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  catalogHeader: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  catalogSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catalogInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 2,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  typeBtnActive: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.primary,
  },
  catalogList: {
    gap: Spacing.sm,
  },
  catalogItem: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catalogItemName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  catalogItemSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  catalogActionRow: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    color: Colors.text,
  },
  catalogUnitSelector: {
    flex: 1,
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 4,
    justifyContent: 'center',
  },
  unitChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitChipText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  unitChipTextActive: {
    color: '#FFF',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
});
