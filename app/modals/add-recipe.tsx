import { useLocalSearchParams, useRouter } from 'expo-router';
import { Clock, Plus, Save, Search, Trash2 } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useIngredients } from '../../src/hooks/useIngredients';
import { useRecipes } from '../../src/hooks/useRecipes';
import { Colors, Spacing, Typography } from '../../src/theme/constants';

export default function AddRecipeModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { recipes, addRecipe, updateRecipe, addRecipeIngredient, addRecipeEquipment } = useRecipes();
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    prep_time_minutes: '30',
    people_count: '4',
  });
  const { ingredients: allIngredients } = useIngredients();
  const { equipment: allEquipment } = useEquipment();
  
  const [composition, setComposition] = useState<{
    id: string;
    name: string;
    type: 'food' | 'equipment';
    qty: number;
    unit: string;
    category?: string;
  }[]>([]);

  // Catalog State
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogType, setCatalogType] = useState<'food' | 'equipment'>('food');
  const [itemInputs, setItemInputs] = useState<Record<string, { qty: string; unit: string }>>({});

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && recipes.length > 0) {
      const rec = recipes.find(r => r.id === id);
      if (rec) {
        setForm({
          name: rec.name,
          description: rec.description || '',
          prep_time_minutes: rec.prep_time_minutes.toString(),
          people_count: (rec as any).people_count?.toString() || '4',
        });
      }
    }
  }, [id, recipes]);

  const handleSave = async () => {
    if (!form.name) return;

    const recipeData = {
      name: form.name,
      description: form.description,
      prep_time_minutes: parseInt(form.prep_time_minutes) || 30,
      people_count: parseInt(form.people_count) || 4,
    };

    try {
        let recipeId = id;
        if (isEditing) {
            await updateRecipe.mutateAsync({
                id,
                ...recipeData
            } as any);
        } else {
            const result = await addRecipe.mutateAsync(recipeData);
            recipeId = (result as any).id;
        }

        if (recipeId) {
            // Add composition items
            // For simplicity in this modal, we treat it as an initial set.
            // If editing, we might want to handle diffs, but the user mostly asked for "creation"
            for (const item of composition) {
                if (item.type === 'food') {
                    await addRecipeIngredient.mutateAsync({
                        recipeId,
                        ingredientId: item.id,
                        qty: item.qty,
                        unit: item.unit
                    });
                } else {
                    await addRecipeEquipment.mutateAsync({
                        recipeId,
                        equipmentId: item.id,
                        qty: item.qty
                    });
                }
            }
        }

        router.back();
    } catch (error) {
        Alert.alert('Errore', 'Impossibile salvare la ricetta e la sua composizione');
    }
  };

  const handleAddToComposition = (item: any, type: 'food' | 'equipment') => {
    const input = itemInputs[item.id];
    const numericQty = parseFloat(input.qty);
    if (isNaN(numericQty) || numericQty <= 0) {
      Alert.alert('Attenzione', 'Inserisci una quantità valida');
      return;
    }

    const newItem = {
        id: item.id,
        name: item.name,
        type,
        qty: parseFloat(input.qty),
        unit: input.unit || (type === 'food' ? item.base_unit : 'pz'),
        category: item.category
    };

    setComposition([...composition, newItem]);
    
    // Reset input
    setItemInputs(prev => ({
        ...prev,
        [item.id]: { qty: '', unit: type === 'food' ? item.base_unit : 'pz' }
    }));
  };

  const removeFromComposition = (index: number) => {
    setComposition(composition.filter((_, i) => i !== index));
  };

  const filteredCatalog = useMemo(() => {
    const items = catalogType === 'food' ? allIngredients : allEquipment;
    return items.filter(i => i.name.toLowerCase().includes(catalogSearch.toLowerCase()));
  }, [allIngredients, allEquipment, catalogSearch, catalogType]);

  const updateItemInput = (id: string, field: 'qty' | 'unit', value: string) => {
    setItemInputs(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { qty: '', unit: '' }), [field]: value }
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Nome Ricetta *</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Pasta al pesto"
          placeholderTextColor={Colors.placeholder}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />
      </View>

      {/* New section for people count */}
      <View style={styles.section}>
        <Text style={styles.label}>Per quante persone?</Text>
        <TextInput
          style={styles.input}
          placeholder="es. 4"
          placeholderTextColor={Colors.placeholder}
          keyboardType="numeric"
          value={form.people_count}
          onChangeText={(t) => setForm({ ...form, people_count: t })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Tempo di Preparazione (minuti)</Text>
        <View style={styles.timeInputContainer}>
          <Clock size={20} color={Colors.textSecondary} />
          <TextInput
            style={[styles.input, { flex: 1, borderLeftWidth: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }]}
            placeholder="30"
            placeholderTextColor={Colors.placeholder}
            keyboardType="numeric"
            value={form.prep_time_minutes}
            onChangeText={(t) => setForm({ ...form, prep_time_minutes: t })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Descrizione / Note</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Breve descrizione o passaggi chiave..."
          placeholderTextColor={Colors.placeholder}
          multiline
          numberOfLines={4}
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
        />
      </View>

      <View style={styles.divider} />

      {/* COMPOSITION LIST */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Composizione Iniziale</Text>
        {composition.length === 0 ? (
          <Text style={styles.emptyText}>Nessun elemento aggiunto alla composizione</Text>
        ) : (
          composition.map((item, idx) => (
            <View key={`${item.id}-${idx}`} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>{item.qty} {item.unit}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromComposition(idx)}>
                <Trash2 size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <View style={styles.divider} />

      {/* CATALOG QUICK ADD */}
      <View style={styles.catalogSection}>
        <Text style={styles.catalogTitle}>Aggiungi dal Catalogo</Text>
        
        <View style={styles.catalogHeader}>
          <View style={styles.catalogSearch}>
            <Search size={18} color={Colors.textSecondary} />
            <TextInput
              style={styles.catalogInput}
              placeholder="Cerca ingredienti o materiali..."
              placeholderTextColor={Colors.placeholder} // Added placeholderTextColor
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
          {filteredCatalog.slice(0, 10).map(item => {
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
                  
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
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
                    onPress={() => handleAddToComposition(item, catalogType)}
                  >
                    <Plus size={18} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          {filteredCatalog.length > 10 && (
              <Text style={styles.infoText}>Filtra la ricerca per vedere altri risultati...</Text>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Save size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>{isEditing ? 'Aggiorna Ricetta' : 'Crea Ricetta'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Annulla</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingLeft: 12,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontStyle: 'italic',
    padding: 10,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemQty: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  catalogSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.md,
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
    borderRadius: 10,
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
    gap: Spacing.xs,
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
  quickAddBtn: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    gap: 8,
    marginTop: Spacing.sm,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    alignItems: 'center',
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  infoText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});
