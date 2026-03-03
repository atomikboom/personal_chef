import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEquipment } from '../../src/hooks/useEquipment';
import { Colors, Spacing, Typography } from '../../src/theme/constants';

const CATEGORIES = ['Piatti', 'Posate', 'Bicchieri', 'Coltelli', 'Attrezzatura', 'Altro'];

export default function AddMaterialModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { equipment, addEquipment, updateEquipment } = useEquipment();
  
  const [form, setForm] = useState({
    name: '',
    category: 'Altro',
    is_consumable: false,
    quantity_available: '',
    unit_price: '',
  });

  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && equipment.length > 0) {
      const item = equipment.find(e => e.id === id);
      if (item) {
        setForm({
          name: item.name,
          category: item.category,
          is_consumable: item.is_consumable,
          quantity_available: item.quantity_available.toString(),
          unit_price: item.unit_price.toString(),
        });
      }
    }
  }, [id, equipment]);

  const handleSave = async () => {
    if (!form.name) return;

    const eqData = {
      name: form.name,
      category: form.category,
      is_consumable: form.is_consumable,
      quantity_available: parseFloat(form.quantity_available) || 0,
      unit_price: parseFloat(form.unit_price) || 0,
    };

    if (isEditing) {
      await updateEquipment.mutateAsync({
        id,
        ...eqData
      } as any);
    } else {
      await addEquipment.mutateAsync(eqData);
    }

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.label}>Nome Materiale / Equipment *</Text>
        <TextInput
          style={styles.input}
          placeholder="es. Calici Vino"
          placeholderTextColor={Colors.placeholder}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                form.category === cat && styles.categoryChipActive
              ]}
              onPress={() => setForm({ ...form, category: cat })}
            >
              <Text style={[
                styles.categoryText,
                form.category === cat && styles.categoryTextActive
              ]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Quantità Iniziale (pz)</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={Colors.placeholder}
            keyboardType="numeric"
            value={form.quantity_available}
            onChangeText={(t) => setForm({ ...form, quantity_available: t })}
          />
        </View>
        <View style={[styles.section, { flex: 1 }]}>
          <Text style={styles.label}>Prezzo Unittario (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.placeholder}
            keyboardType="decimal-pad"
            value={form.unit_price}
            onChangeText={(t) => setForm({ ...form, unit_price: t })}
          />
        </View>
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Materiale Consumabile</Text>
          <Text style={styles.switchDesc}>Attiva se l'articolo viene buttato dopo l'uso (es. tovaglioli)</Text>
        </View>
        <Switch
          value={form.is_consumable}
          onValueChange={(v) => setForm({ ...form, is_consumable: v })}
          trackColor={{ false: Colors.border, true: Colors.primary }}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Save size={20} color="#FFF" />
        <Text style={styles.saveButtonText}>{isEditing ? 'Aggiorna Materiale' : 'Salva Materiale'}</Text>
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
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  switchLabel: {
    ...Typography.body,
    fontWeight: 'bold',
  },
  switchDesc: {
    ...Typography.caption,
    marginTop: 2,
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
