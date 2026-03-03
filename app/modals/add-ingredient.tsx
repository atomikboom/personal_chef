import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Plus, Save, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { STANDARD_UNITS } from '../../src/constants/units';
import { useIngredients } from '../../src/hooks/useIngredients';
import { Colors, Spacing, Typography } from '../../src/theme/constants';

const CATEGORIES = ['Carne', 'Pesce', 'Verdura', 'Pasta', 'Riso', 'Latticini', 'Spezie', 'Altro'];

export default function AddIngredientModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { ingredients, addIngredient, updateIngredient } = useIngredients();
  
  const [form, setForm] = useState({
    name: '',
    base_unit: 'g',
    category: 'Altro',
    default_price: '',
    initial_qty: '',
    expiry_date: new Date().toISOString().split('T')[0],
    allergens: [] as string[],
  });
  const [conversions, setConversions] = useState<{ unit: string; ratio: number }[]>([]);

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && ingredients.length > 0) {
      const ing = ingredients.find(i => i.id === id);
      if (ing) {
        setForm({
          name: ing.name,
          base_unit: ing.base_unit,
          category: (ing as any).category || 'Altro',
          default_price: ing.default_price.toString(),
          initial_qty: '', 
          expiry_date: ing.lots?.[0]?.expiry_date || new Date().toISOString().split('T')[0],
          allergens: (ing as any).allergens || [],
        });
        setConversions((ing as any).conversions || []);
      }
    }
  }, [id, ingredients]);

  const handleAddConversion = () => {
    setConversions([...conversions, { unit: '', ratio: 1 }]);
  };

  const handleUpdateConversion = (index: number, field: 'unit' | 'ratio', value: string) => {
    const newConversions = [...conversions];
    if (field === 'ratio') {
        newConversions[index].ratio = parseFloat(value) || 0;
    } else {
        newConversions[index].unit = value;
    }
    setConversions(newConversions);
  };

  const handleRemoveConversion = (index: number) => {
    setConversions(conversions.filter((_, i) => i !== index));
  };

  const toggleAllergen = (allergen: string) => {
    const current = form.allergens;
    if (current.includes(allergen)) {
      setForm({ ...form, allergens: current.filter(a => a !== allergen) });
    } else {
      setForm({ ...form, allergens: [...current, allergen] });
    }
  };

  const handleSave = async () => {
    if (!form.name) return;

    if (isEditing) {
      await updateIngredient.mutateAsync({
        ingredient: {
            id,
            name: form.name,
            base_unit: form.base_unit,
            category: form.category,
            allergens: form.allergens,
            default_price: parseFloat(form.default_price) || 0,
        } as any,
        conversions,
        expiry_date: form.expiry_date // We'll need to update hook to support this
      });
    } else {
      await addIngredient.mutateAsync({
        ingredient: {
          name: form.name,
          base_unit: form.base_unit,
          category: form.category,
          allergens: form.allergens,
          default_price: parseFloat(form.default_price) || 0,
        },
        initialLot: form.initial_qty ? {
            quantity_available: parseFloat(form.initial_qty),
            unit: form.base_unit,
            expiry_date: form.expiry_date,
            price_override: null,
            notes: 'Primo lotto inizializzazione'
        } : undefined,
        conversions
      });
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Nome Ingrediente *</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Farina 00"
          placeholderTextColor={Colors.placeholder}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.unitButton, form.category === cat && styles.unitButtonActive]}
              onPress={() => setForm({ ...form, category: cat })}
            >
              <Text style={[styles.unitButtonText, form.category === cat && styles.unitButtonTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Unità di Misura Base</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
            {STANDARD_UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.unitButton, form.base_unit === u.value && styles.unitButtonActive]}
                onPress={() => setForm({ ...form, base_unit: u.value })}
              >
                <Text style={[styles.unitButtonText, form.base_unit === u.value && styles.unitButtonTextActive]}>
                  {u.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Prezzo Medio (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.placeholder}
            keyboardType="decimal-pad"
            value={form.default_price}
            onChangeText={(t) => setForm({ ...form, default_price: t })}
          />
        </View>
      </View>

      <View style={styles.divider} />
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Conversioni Unità</Text>
        <TouchableOpacity style={styles.miniAddButton} onPress={handleAddConversion}>
            <Plus size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>Definisci quante unità base corrispondono a 1 unità alternativa (es: 1 fetta = 0.1 pz)</Text>
      
      {conversions.map((conv, index) => (
        <View key={index} style={styles.conversionRow}>
            <View style={{ flex: 2 }}>
                <Text style={styles.label}>Unità Alt.</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
                    {STANDARD_UNITS.map((u) => (
                    <TouchableOpacity
                        key={u.value}
                        style={[styles.unitButtonMini, conv.unit === u.value && styles.unitButtonActive]}
                        onPress={() => handleUpdateConversion(index, 'unit', u.value)}
                    >
                        <Text style={[styles.unitButtonTextMini, conv.unit === u.value && styles.unitButtonTextActive]}>
                        {u.value}
                        </Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={{ flex: 2, marginLeft: 10 }}>
                <Text style={styles.label}>Rapporto</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="1.0" 
                    placeholderTextColor={Colors.placeholder}
                    keyboardType="numeric"
                    value={conv.ratio.toString()}
                    onChangeText={(t) => handleUpdateConversion(index, 'ratio', t)}
                />
            </View>
            <TouchableOpacity 
                style={styles.removeButton} 
                onPress={() => handleRemoveConversion(index)}
            >
                <Trash2 size={18} color={Colors.error} />
            </TouchableOpacity>
        </View>
      ))}

      <View style={styles.divider} />
      <View style={styles.section}>
        <Text style={styles.label}>Allergeni e Intolleranze</Text>
        <View style={styles.categoryGrid}>
          {['Glutine', 'Lattosio', 'Uova', 'Frutta a guscio', 'Pesce', 'Molluschi', 'Soia', 'Senape', 'Sedano'].map((allergen) => (
            <TouchableOpacity
              key={allergen}
              style={[
                styles.categoryChip,
                form.allergens.includes(allergen) && styles.categoryChipActive
              ]}
              onPress={() => toggleAllergen(allergen)}
            >
              <Text style={[
                styles.categoryText,
                form.allergens.includes(allergen) && styles.categoryTextActive
              ]}>{allergen}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isEditing ? (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Aggiorna Scadenza Lotto Corrente</Text>
          <View style={styles.section}>
            <Text style={styles.label}>Data di Scadenza (YYYY-MM-DD)</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="2024-12-31"
                placeholderTextColor={Colors.placeholder}
                value={form.expiry_date}
                onChangeText={(t) => setForm({ ...form, expiry_date: t })}
              />
              <Calendar size={20} color={Colors.textSecondary} style={styles.icon} />
            </View>
          </View>
        </>
      ) : (
        <>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Primo Lotto (Giacenza Iniziale)</Text>
          
          <View style={styles.section}>
            <Text style={styles.label}>Quantità Iniziale</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.placeholder}
              keyboardType="decimal-pad"
              value={form.initial_qty}
              onChangeText={(t) => setForm({ ...form, initial_qty: t })}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Data di Scadenza (YYYY-MM-DD)</Text>
            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="2024-12-31"
                placeholderTextColor={Colors.placeholder}
                value={form.expiry_date}
                onChangeText={(t) => setForm({ ...form, expiry_date: t })}
              />
              <Calendar size={20} color={Colors.textSecondary} style={styles.icon} />
            </View>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Save size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>{isEditing ? 'Aggiorna Ingrediente' : 'Salva Ingrediente'}</Text>
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    right: 12,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFF',
  },
  unitSelector: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  unitButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center',
    marginRight: 8,
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
  unitButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  unitButtonTextMini: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#FFF',
  },
  conversionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  removeButton: {
    padding: 10,
    marginBottom: 4,
  },
  miniAddButton: {
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    position: 'relative',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: 16,
    gap: 8,
    marginTop: Spacing.lg,
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
});
