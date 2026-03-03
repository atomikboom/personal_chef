import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Package, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMockDataStore } from '../../src/store/useMockDataStore';
import { Colors, Spacing, Typography } from '../../src/theme/constants';
import { KitWithRules } from '../../src/types/database';

export default function ManageKitsModal() {
  const router = useRouter();
  const kits = useMockDataStore(state => state.kits);
  const equipment = useMockDataStore(state => state.equipment);
  const addKit = useMockDataStore(state => state.addKit);
  const deleteKit = useMockDataStore(state => state.deleteKit);
  const addKitRule = useMockDataStore(state => state.addKitRule);
  const removeKitRule = useMockDataStore(state => state.removeKitRule);

  const [selectedKit, setSelectedKit] = useState<KitWithRules | null>(null);
  const [newKitName, setNewKitName] = useState('');
  const [showAddKit, setShowAddKit] = useState(false);

  const handleAddKit = () => {
    if (!newKitName) return;
    const kit = addKit(newKitName);
    setNewKitName('');
    setShowAddKit(false);
    setSelectedKit(kit);
  };

  const confirmDeleteKit = (id: string) => {
    Alert.alert('Elimina Kit', 'Sei sicuro di voler eliminare questo kit?', [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Elimina', style: 'destructive', onPress: () => {
            deleteKit(id);
            if (selectedKit?.id === id) setSelectedKit(null);
        }}
    ]);
  };

  const handleAddRule = (equipmentId: string) => {
    if (!selectedKit) return;
    addKitRule(selectedKit.id, equipmentId, 1);
  };

  // Re-fetch selected kit to get updated rules
  const currentKit = selectedKit ? kits.find(k => k.id === selectedKit.id) : null;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Gestione Kit',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
        ),
      }} />

      <View style={styles.sidebar}>
        <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>I tuoi Kit</Text>
            <TouchableOpacity onPress={() => setShowAddKit(true)}>
                <Plus size={20} color={Colors.primary} />
            </TouchableOpacity>
        </View>

        {showAddKit && (
            <View style={styles.addKitForm}>
                <TextInput 
                    style={styles.inputSmall} 
                    placeholder="Nome Kit..."
                    value={newKitName}
                    onChangeText={setNewKitName}
                    autoFocus
                />
                <View style={styles.addKitActions}>
                    <TouchableOpacity onPress={() => setShowAddKit(false)}>
                        <Text style={styles.cancelText}>X</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleAddKit}>
                        <Text style={styles.addText}>Aggiungi</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false}>
            {kits.map(kit => (
                <TouchableOpacity 
                    key={kit.id} 
                    style={[styles.kitItem, selectedKit?.id === kit.id && styles.kitItemActive]}
                    onPress={() => setSelectedKit(kit)}
                >
                    <Text style={[styles.kitItemText, selectedKit?.id === kit.id && styles.kitItemTextActive]}>
                        {kit.name}
                    </Text>
                    <TouchableOpacity onPress={() => confirmDeleteKit(kit.id)}>
                        <Trash2 size={16} color={selectedKit?.id === kit.id ? '#FFF' : Colors.error} />
                    </TouchableOpacity>
                </TouchableOpacity>
            ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {currentKit ? (
            <ScrollView contentContainerStyle={styles.detailsScroll}>
                <Text style={styles.detailsTitle}>{currentKit.name}</Text>
                <Text style={styles.detailsDesc}>{currentKit.description || 'Nessuna descrizione'}</Text>
                
                <View style={styles.rulesHeader}>
                    <Text style={styles.sectionLabel}>Materiali Inclusi (per persona)</Text>
                </View>

                {currentKit.rules.map(rule => (
                    <View key={rule.id} style={styles.ruleRow}>
                        <Package size={18} color={Colors.textSecondary} />
                        <Text style={styles.ruleName}>{rule.equipment_item.name}</Text>
                        <TextInput 
                            style={styles.ruleQtyInput}
                            keyboardType="numeric"
                            value={String(rule.qty_per_person)}
                            onChangeText={(val) => {
                                // Logic to update rule qty in store could be added if needed
                                // For now we keep it simple
                            }}
                        />
                        <TouchableOpacity onPress={() => removeKitRule(currentKit.id, rule.id)}>
                            <Trash2 size={18} color={Colors.error} />
                        </TouchableOpacity>
                    </View>
                ))}

                <View style={styles.divider} />
                <Text style={styles.sectionLabel}>Aggiungi al Kit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.equipmentPicker}>
                    {equipment.filter(e => !currentKit.rules.some(r => r.equipment_item_id === e.id)).map(e => (
                        <TouchableOpacity key={e.id} style={styles.equipChip} onPress={() => handleAddRule(e.id)}>
                            <Text style={styles.equipChipText}>{e.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </ScrollView>
        ) : (
            <View style={styles.emptyState}>
                <Package size={48} color={Colors.placeholder} />
                <Text style={styles.emptyText}>Seleziona un Kit per modificarne le regole</Text>
            </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background,
  },
  sidebar: {
    width: 200,
    backgroundColor: Colors.surface,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    padding: Spacing.sm,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: 4,
  },
  sidebarTitle: {
    fontWeight: 'bold',
    color: Colors.text,
  },
  addKitForm: {
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  inputSmall: {
    fontSize: 14,
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  addKitActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelText: { color: Colors.textSecondary, fontSize: 12 },
  addText: { color: Colors.primary, fontSize: 12, fontWeight: 'bold' },
  kitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  kitItemActive: {
    backgroundColor: Colors.primary,
  },
  kitItemText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  kitItemTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  detailsScroll: {
    padding: Spacing.lg,
  },
  detailsTitle: {
    ...Typography.h1,
    color: Colors.primary,
  },
  detailsDesc: {
    ...Typography.caption,
    marginBottom: Spacing.lg,
  },
  rulesHeader: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.caption,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    gap: 10,
  },
  ruleName: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
  },
  ruleQtyInput: {
    width: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.background,
    borderRadius: 6,
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xl,
  },
  equipmentPicker: {
    flexDirection: 'row',
  },
  equipChip: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipChipText: {
    fontSize: 12,
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: 10,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
});
