import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Save } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { STANDARD_UNITS } from '../../src/constants/units';
import { useIngredients } from '../../src/hooks/useIngredients';
import { Colors, Spacing, Typography } from '../../src/theme/constants';

export default function AddLotModal() {
  const router = useRouter();
  const { ingredientId, name, unit } = useLocalSearchParams<{ ingredientId: string; name: string; unit: string }>();
  const { addLot } = useIngredients();
  
  const [form, setForm] = useState({
    quantity_available: '',
    unit: unit || 'g',
    expiry_date: new Date().toISOString().split('T')[0],
    price_override: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!form.quantity_available || !form.expiry_date) return;

    await addLot.mutateAsync({
      ingredient_id: ingredientId,
      quantity_available: parseFloat(form.quantity_available),
      unit: form.unit,
      expiry_date: form.expiry_date,
      price_override: form.price_override ? parseFloat(form.price_override) : null,
      notes: form.notes || null,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Aggiungi Lotto per:</Text>
        <Text style={styles.subtitle}>{name}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, { flex: 2 }]}>
          <Text style={styles.label}>Quantità *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.placeholder}
            keyboardType="decimal-pad"
            value={form.quantity_available}
            onChangeText={(t) => setForm({ ...form, quantity_available: t })}
          />
        </View>
        <View style={[styles.section, { flex: 3 }]}>
          <Text style={styles.label}>Unità</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitSelector}>
            {STANDARD_UNITS.map((u) => (
              <TouchableOpacity
                key={u.value}
                style={[styles.unitButton, form.unit === u.value && styles.unitButtonActive]}
                onPress={() => setForm({ ...form, unit: u.value })}
              >
                <Text style={[styles.unitButtonText, form.unit === u.value && styles.unitButtonTextActive]}>
                  {u.value}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Data di Scadenza (YYYY-MM-DD) *</Text>
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

      <View style={styles.section}>
        <Text style={styles.label}>Prezzo d'Acquisto Specifico (€)</Text>
        <TextInput
          style={styles.input}
          placeholder="Lascia vuoto per usare il default"
          placeholderTextColor={Colors.placeholder}
          keyboardType="decimal-pad"
          value={form.price_override}
          onChangeText={(t) => setForm({ ...form, price_override: t })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          placeholder="es: Acquistato da Fornitore X"
          placeholderTextColor={Colors.placeholder}
          multiline
          value={form.notes}
          onChangeText={(t) => setForm({ ...form, notes: t })}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Save size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>Aggiungi Lotto</Text>
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
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  subtitle: {
    ...Typography.h2,
    marginTop: 4,
  },
  section: {
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
  unitSelector: {
    flexDirection: 'row',
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
  unitButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  unitButtonTextActive: {
    color: '#FFF',
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
