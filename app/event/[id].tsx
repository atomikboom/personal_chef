import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronLeft, ChevronUp, Circle, FileText, Package, Save, Share2, Soup } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useEvents } from '../../src/hooks/useEvents';
import { useIngredients } from '../../src/hooks/useIngredients';
import { Colors, Spacing, Typography } from '../../src/theme/constants';
import { calculateEventCost, calculateEventRequirements } from '../../src/utils/eventLogic';
import { exportEventChecklist } from '../../src/utils/pdfExport';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { events, isLoading: eventsLoading, updateEvent, closeEvent } = useEvents();
  const { ingredients: allIngredients, isLoading: ingLoading } = useIngredients();
  const { equipment: allEquipment, isLoading: eqLoading } = useEquipment();
  const event = events.find(e => e.id === id);

  const isLoading = eventsLoading || ingLoading || eqLoading;

  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync checklist from notes when event data changes
  React.useEffect(() => {
    if (event?.notes && event.notes.startsWith('{')) {
      try {
        const savedChecklist = JSON.parse(event.notes);
        setChecklist(savedChecklist);
      } catch (e) {
        console.error('Checklist decode error', e);
      }
    }
  }, [event?.notes]);

  const requirements = useMemo(() => {
    if (!event) return null;
    // Normalize kits: in Mock Mode event.kits is KitWithRules[], in Supabase it's { kit: KitWithRules }[]
    const eventKits = event.kits?.map((k: any) => k.kit ? k.kit : k) || [];
    return calculateEventRequirements(
      (event.menu_items || []).map(mi => ({ recipe: mi.recipe, portions: mi.portions })),
      event.people_count,
      event.type,
      eventKits
    );
  }, [event]);

  const eventCost = useMemo(() => {
    if (!event) return null;
    const eventKits = event.kits?.map((k: any) => k.kit ? k.kit : k) || [];
    return calculateEventCost(event, eventKits);
  }, [event]);

  if (isLoading || !event) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const handleSaveChecklist = async () => {
    if (!event) return;
    setIsSaving(true);
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        notes: JSON.stringify(checklist)
      });
      Alert.alert('Successo', 'Stato checklist salvato');
    } catch (error) {
      Alert.alert('Errore', 'Impossibile salvare la checklist');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseEvent = async () => {
    if (!requirements || !event) return;
    try {
      // Before closing, we also save the checklist state
      await updateEvent.mutateAsync({
        id: event.id,
        notes: JSON.stringify(checklist)
      });
      
      await closeEvent.mutateAsync({
        eventId: event.id,
        ingredients: Object.values(requirements.ingredientReqs),
        equipment: Object.values(requirements.equipmentReqs),
      });
      setIsCloseModalVisible(false);
      Alert.alert('Successo', 'Evento chiuso e stock aggiornato');
      router.back();
    } catch (error) {
      Alert.alert('Errore', 'Impossibile chiudere l\'evento');
    }
  };

  const toggleCheck = (id: string) => {
    setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExport = async () => {
    try {
      const eventKits = event.kits?.map((k: any) => k.kit ? k.kit : k) || [];
      await exportEventChecklist(event, eventKits);
    } catch (error) {
      Alert.alert('Errore', 'Impossibile generare il PDF');
    }
  };

  const missingItems = (event.missing_items || []).filter(m => !m.resolved);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: event.title,
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={handleExport} style={{ padding: 10 }}>
            <Share2 size={24} color={Colors.primary} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {event.status === 'chiuso' && (
          <View style={[styles.alertCard, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
            <View style={styles.alertHeader}>
              <CheckCircle2 size={20} color={Colors.success} />
              <Text style={[styles.alertTitle, { color: Colors.success }]}>Evento Chiuso - Stock Scaricato</Text>
            </View>
          </View>
        )}

        {missingItems.length > 0 && event.status !== 'chiuso' && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <AlertTriangle size={20} color={Colors.error} />
              <Text style={styles.alertTitle}>Mancanti da acquistare</Text>
            </View>
            {missingItems.map((m, i) => (
              <View key={i} style={styles.missingItem}>
                <Text style={styles.missingLabel}>
                  {m.item_type === 'ingredient' 
                    ? allIngredients.find(ing => ing.id === m.ref_id)?.name || `Ingrediente (ID: ${m.ref_id.substring(0, 8)}...)`
                    : allEquipment.find(eq => eq.id === m.ref_id)?.name || `Materiale (ID: ${m.ref_id.substring(0, 8)}...)`}
                </Text>
                <Text style={styles.missingQty}>{m.qty_missing} {m.unit || 'pz'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* COST SUMMARY */}
        {eventCost && (
          <View style={styles.costCard}>
            <View style={styles.costHeader}>
              <Text style={styles.costTitle}>Stima Costi</Text>
              <Text style={styles.costTotal}>€{eventCost.totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.costDivider} />
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Food Cost (Menu)</Text>
              <Text style={styles.costValue}>€{eventCost.foodCost.toFixed(2)}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Materiali Monouso</Text>
              <Text style={styles.costValue}>€{eventCost.equipmentCost.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Soup size={20} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Menù</Text>
          </View>
          {(event.menu_items || []).map((mi, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.recipeName}>{mi.recipe.name}</Text>
              <Text style={styles.portions}>{mi.portions} porzioni</Text>
            </View>
          ))}
        </View>

        {requirements && (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Package size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Materiali / Equipment</Text>
              </View>
              <View style={styles.checklist}>
                {Object.values(requirements.equipmentReqs).map((item) => (
                  <View key={item.id} style={styles.checkItemContainer}>
                    <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck(`eq-${item.id}`)}>
                      {checklist[`eq-${item.id}`] ? (
                        <CheckCircle2 size={20} color={Colors.success} />
                      ) : (
                        <Circle size={20} color={Colors.border} />
                      )}
                      <Text style={[styles.checkLabel, checklist[`eq-${item.id}`] && styles.checkedText]}>
                        {item.name} ({item.qty} pz)
                      </Text>
                      <TouchableOpacity onPress={() => toggleExpand(`eq-${item.id}`)}>
                        {expandedItems[`eq-${item.id}`] ? <ChevronUp size={18} color={Colors.textSecondary} /> : <ChevronDown size={18} color={Colors.textSecondary} />}
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {expandedItems[`eq-${item.id}`] && (
                      <View style={styles.breakdown}>
                        {item.breakdown.map((b, idx) => (
                          <Text key={idx} style={styles.breakdownText}>• {b.reason}: {b.qty} pz</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Soup size={20} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Checklist Ingredienti (Aggregata)</Text>
              </View>
              <View style={styles.checklist}>
                {Object.values(requirements.ingredientReqs).map((item) => (
                  <View key={item.id} style={styles.checkItemContainer}>
                    <TouchableOpacity style={styles.checkItem} onPress={() => toggleCheck(`ing-${item.id}`)}>
                      {checklist[`ing-${item.id}`] ? (
                        <CheckCircle2 size={20} color={Colors.success} />
                      ) : (
                        <Circle size={20} color={Colors.border} />
                      )}
                      <Text style={[styles.checkLabel, checklist[`ing-${item.id}`] && styles.checkedText]}>
                        {item.name} ({item.qty} {item.unit})
                      </Text>
                      <TouchableOpacity onPress={() => toggleExpand(`ing-${item.id}`)}>
                        {expandedItems[`ing-${item.id}`] ? <ChevronUp size={18} color={Colors.textSecondary} /> : <ChevronDown size={18} color={Colors.textSecondary} />}
                      </TouchableOpacity>
                    </TouchableOpacity>
                    {expandedItems[`ing-${item.id}`] && (
                      <View style={styles.breakdown}>
                        {item.breakdown.map((b, idx) => (
                          <Text key={idx} style={styles.breakdownText}>• {b.recipeName}: {b.qty} {item.unit}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <TouchableOpacity 
            style={styles.btnSecondary} 
            onPress={handleSaveChecklist}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator size="small" color={Colors.primary} /> : <Save size={18} color={Colors.primary} />}
            <Text style={styles.btnSecondaryText}>Salva Stato</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.btnSecondary} onPress={handleExport}>
            <FileText size={18} color={Colors.primary} />
            <Text style={styles.btnSecondaryText}>PDF</Text>
          </TouchableOpacity>

          {event.status !== 'chiuso' && (
            <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsCloseModalVisible(true)}>
              <Package size={18} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Chiudi</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CLOSE EVENT VALIDATION MODAL */}
      <Modal visible={isCloseModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Conferma Chiusura Evento</Text>
            <Text style={styles.modalSubtitle}>La chiusura dell'evento scaricherà automaticamente le quantità dal magazzino (Logica FEFO).</Text>
            
            <ScrollView style={{ maxHeight: 300, marginVertical: 15 }}>
              <Text style={styles.sectionTitleModal}>Ingredienti da scaricare:</Text>
              {requirements && Object.values(requirements.ingredientReqs).map(ing => {
                const available = allIngredients.find(i => i.id === ing.id)?.total_quantity || 0;
                const isInsufficient = available < ing.qty;
                return (
                  <View key={ing.id} style={styles.modalItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemName}>{ing.name}</Text>
                      {isInsufficient && (
                        <View style={styles.warningRow}>
                          <AlertTriangle size={12} color={Colors.error} />
                          <Text style={styles.warningText}>Disp. insuff: {available} {ing.unit}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.modalItemQty, isInsufficient && { color: Colors.error }]}>
                      {ing.qty} {ing.unit}
                    </Text>
                  </View>
                );
              })}
              
              <Text style={[styles.sectionTitleModal, { marginTop: 15 }]}>Materiali da scaricare:</Text>
              {requirements && Object.values(requirements.equipmentReqs).filter(e => e.isConsumable).map(eq => {
                const available = allEquipment.find(e => e.id === eq.id)?.quantity_available || 0;
                const isInsufficient = available < eq.qty;
                return (
                  <View key={eq.id} style={styles.modalItemRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemName}>{eq.name}</Text>
                      {isInsufficient && (
                        <View style={styles.warningRow}>
                          <AlertTriangle size={12} color={Colors.error} />
                          <Text style={styles.warningText}>Disp. insuff: {available} pz</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.modalItemQty, isInsufficient && { color: Colors.error }]}>
                      {eq.qty} pz
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setIsCloseModalVisible(false)}>
                <Text style={styles.btnCancelText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btnSave, { backgroundColor: Colors.success }]} 
                onPress={handleCloseEvent}
                disabled={closeEvent.isPending}
              >
                {closeEvent.isPending ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.btnSaveText}>Conferma e Scarica</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 120,
  },
  alertCard: {
    backgroundColor: '#FFE5E5',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FFCDCD',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  alertTitle: {
    color: Colors.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  missingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  missingLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  missingQty: {
    fontWeight: 'bold',
    color: Colors.error,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h2,
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recipeName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  portions: {
    color: Colors.primary,
    fontWeight: '700',
  },
  checklist: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
  },
  checkItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  checkLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  breakdown: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginLeft: 32,
  },
  breakdownText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Spacing.xl,
  },
  footerActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  btnSecondary: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  btnSecondaryText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnPrimary: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
  },
  btnPrimaryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 28,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  sectionTitleModal: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  modalItemName: {
    fontSize: 14,
    color: Colors.text,
  },
  modalItemQty: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  btnCancel: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
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
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  btnSaveText: {
    fontWeight: 'bold',
    color: '#FFF',
  },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  warningText: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: '600',
  },
  costCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  costHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  costTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  costTotal: {
    ...Typography.h2,
    color: Colors.primary,
    marginBottom: 0,
  },
  costDivider: {
    height: 1,
    backgroundColor: Colors.background,
    marginVertical: Spacing.sm,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  costLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  costValue: {
    ...Typography.caption,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
