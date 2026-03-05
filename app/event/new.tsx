import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Package, Plus, Save } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEquipment } from '../../src/hooks/useEquipment';
import { useEvents } from '../../src/hooks/useEvents';
import { useKits } from '../../src/hooks/useKits';
import { useRecipes } from '../../src/hooks/useRecipes';
import { Colors, Spacing, Typography } from '../../src/theme/constants';
import { calculateEventRequirements, deductStockFEFO } from '../../src/utils/eventLogic';

export default function NewEventScreen() {
  const router = useRouter();
  const { recipes } = useRecipes();
  const { equipment } = useEquipment();
  const { addEvent } = useEvents();
  const { kits } = useKits();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'domicilio' | 'asporto'>('domicilio');
  const [peopleCount, setPeopleCount] = useState('2');
  const [useSamePortions, setUseSamePortions] = useState(true);
  const [address, setAddress] = useState('');
  const [selectedRecipes, setSelectedRecipes] = useState<{ id: string; name: string; portions: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestAllergies, setGuestAllergies] = useState('');
  const [selectedKitIds, setSelectedKitIds] = useState<string[]>([]);

  const requirements = useMemo(() => {
    const totals = selectedRecipes.reduce((acc, r) => acc + r.portions, 0);
    
    // Check for allergy conflicts
    const conflicts: string[] = [];
    const eventAllergies = guestAllergies.toLowerCase().split(',').map(a => a.trim()).filter(a => a);
    
    selectedRecipes.forEach(sr => {
        const recipe = recipes.find(r => r.id === sr.id);
        if (recipe && eventAllergies.length > 0) {
            const recipeAllergens = new Set<string>();
            recipe.ingredients.forEach(ri => {
                const ing = ri.ingredient as any;
                if (ing && ing.allergens) {
                    ing.allergens.forEach((a: string) => recipeAllergens.add(a));
                }
            });

            eventAllergies.forEach(allergy => {
                recipeAllergens.forEach(ra => {
                    if (ra.toLowerCase().includes(allergy)) {
                        conflicts.push(`${recipe.name}: contiene ${ra}`);
                    }
                });
            });
        }
    });

    return { totals, conflicts: Array.from(new Set(conflicts)) };
  }, [selectedRecipes, guestAllergies, recipes]);

  const customAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleCreate = async () => {
    console.log('--- Inizio Creazione Evento ---');
    
    // Validation
    const guestNum = parseInt(peopleCount);
    if (!title) {
      customAlert('Attenzione', 'Inserisci un titolo per l\'evento');
      return;
    }
    if (isNaN(guestNum) || guestNum <= 0) {
      customAlert('Attenzione', 'Inserisci un numero di ospiti valido');
      return;
    }
    if (selectedRecipes.length === 0) {
      customAlert('Attenzione', 'Seleziona almeno una ricetta');
      return;
    }

    setLoading(true);
    console.log('Valori:', { title, type, guestNum, recipesCount: selectedRecipes.length });

    try {
      const eventData = {
        title,
        type,
        people_count: guestNum,
        address: type === 'domicilio' ? address : null,
        datetime: new Date().toISOString(),
        status: 'pianificato' as const,
        total_cost_estimate: 0,
        guest_allergies: guestAllergies || null,
        notes: '',
      };

      const menuItemsData = selectedRecipes.map(sr => ({
        recipe_id: sr.id,
        portions: sr.portions
      }));

      console.log('1. Salvataggio evento...');
      const newEvent = await addEvent.mutateAsync({ 
        event: eventData, 
        menuItems: menuItemsData,
        kitIds: selectedKitIds
      });

      if (!newEvent || !newEvent.id) {
        throw new Error('Salvataggio fallito: ID non ricevuto');
      }

      console.log('2. Calcolo fabbisogno...');
      const menuItemsWithFullDetails = selectedRecipes.map(sr => {
        const recipe = recipes.find(r => r.id === sr.id);
        if (!recipe) throw new Error(`Ricetta non trovata: ${sr.id}`);
        return { recipe, portions: sr.portions };
      });

      const selectedKits = (kits || []).filter(k => selectedKitIds.includes(k.id));

      const { ingredientReqs, equipmentReqs } = calculateEventRequirements(
        menuItemsWithFullDetails,
        guestNum,
        type,
        selectedKits
      );

      console.log('3. Scarico magazzino...');
      await deductStockFEFO(
        newEvent.id,
        Object.values(ingredientReqs),
        Object.values(equipmentReqs)
      );

      console.log('--- Evento Creato con Successo ---');
      customAlert('Ottimo!', 'Evento creato e magazzino aggiornato.');
      router.replace('/(tabs)/events');
    } catch (error: any) {
      console.error('ERRORE CREAZIONE EVENTO:', error);
      customAlert('Errore', error.message || 'Si è verificato un errore imprevisto');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecipe = (recipe: any) => {
    if (selectedRecipes.some(r => r.id === recipe.id)) {
      setSelectedRecipes(selectedRecipes.filter(r => r.id !== recipe.id));
    } else {
      setSelectedRecipes([...selectedRecipes, { 
        id: recipe.id, 
        name: recipe.name, 
        portions: useSamePortions ? (parseInt(peopleCount) || 1) : 1
      }]);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Nuovo Evento',
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
        )
      }} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.label}>Titolo Evento</Text>
          <TextInput
            style={styles.input}
            placeholder="es. Cena Rossi"
            placeholderTextColor={Colors.placeholder}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity 
                style={[styles.toggleBtn, type === 'domicilio' && styles.toggleBtnActive]}
                onPress={() => setType('domicilio')}
              >
                <Text style={[styles.toggleText, type === 'domicilio' && styles.toggleTextActive]}>Domicilio</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, type === 'asporto' && styles.toggleBtnActive]}
                onPress={() => setType('asporto')}
              >
                <Text style={[styles.toggleText, type === 'asporto' && styles.toggleTextActive]}>Asporto</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.section, { width: 100 }]}>
            <Text style={styles.label}>Ospiti</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor={Colors.placeholder}
              keyboardType="numeric"
              value={peopleCount}
              onChangeText={(val) => {
                setPeopleCount(val);
                if (useSamePortions) {
                    const count = parseInt(val) || 1;
                    setSelectedRecipes(prev => prev.map(r => ({ ...r, portions: count })));
                }
              }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Allergie / Intolleranze Ospiti (es. Glutine, Lattosio)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nessuna"
            placeholderTextColor={Colors.placeholder}
            value={guestAllergies}
            onChangeText={setGuestAllergies}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Configurazione Porzioni</Text>
          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => {
                const newSameValue = !useSamePortions;
                setUseSamePortions(newSameValue);
                if (newSameValue) {
                    const count = parseInt(peopleCount) || 1;
                    setSelectedRecipes(prev => prev.map(r => ({ ...r, portions: count })));
                }
            }}
          >
            <View style={[styles.checkbox, useSamePortions && styles.checkboxSelected]}>
                {useSamePortions && <View style={styles.checkboxInner} />}
            </View>
            <Text style={styles.checkboxLabel}>Stesse porzioni per tutti i piatti (={peopleCount})</Text>
          </TouchableOpacity>
        </View>

        {type === 'domicilio' && (
          <View style={styles.section}>
            <Text style={styles.label}>Indirizzo</Text>
            <TextInput
              style={styles.input}
              placeholder="Via Giotto, 10..."
              placeholderTextColor={Colors.placeholder}
              value={address}
              onChangeText={setAddress}
            />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Kit da aggiungere (Personale/Servizio)</Text>
          <View style={styles.kitList}>
            {(kits || []).map(kit => {
              const isSelected = selectedKitIds.includes(kit.id);
              return (
                <TouchableOpacity 
                  key={kit.id} 
                  style={[styles.kitChip, isSelected && styles.kitChipActive]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedKitIds(selectedKitIds.filter(id => id !== kit.id));
                    } else {
                      setSelectedKitIds([...selectedKitIds, kit.id]);
                    }
                  }}
                >
                  <Package size={16} color={isSelected ? "#FFF" : Colors.primary} />
                  <Text style={[styles.kitChipText, isSelected && styles.kitChipTextActive]}>{kit.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cerca Ricette</Text>
          <TextInput
            style={styles.input}
            placeholder="Cerca per nome..."
            placeholderTextColor={Colors.placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Menù dell'Evento</Text>
          <View style={styles.recipeList}>
            {recipes
              .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(recipe => {
              const isSelected = selectedRecipes.some(sr => sr.id === recipe.id);
              const portions = selectedRecipes.find(sr => sr.id === recipe.id)?.portions || (parseInt(peopleCount) || 1);
              
              return (
                <View key={recipe.id} style={[styles.itemRow, isSelected && styles.itemRowActive]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, isSelected && styles.itemNameActive]}>{recipe.name}</Text>
                  </View>
                  
                  <View style={styles.itemActionRow}>
                    {!useSamePortions && isSelected && (
                        <TextInput
                            style={styles.qtyInput}
                            placeholder="0"
                            placeholderTextColor={Colors.placeholder}
                            keyboardType="numeric"
                            value={portions.toString()}
                            onChangeText={(val) => {
                                const p = parseInt(val) || 0;
                                setSelectedRecipes(prev => prev.map(sr => sr.id === recipe.id ? { ...sr, portions: p } : sr));
                            }}
                        />
                    )}
                    {isSelected && !useSamePortions && <Text style={[styles.qtyUnit, isSelected && styles.qtyUnitActive]}>porz.</Text>}
                    
                    <TouchableOpacity 
                      style={[styles.selectBtn, isSelected && styles.selectBtnActive]}
                      onPress={() => toggleRecipe(recipe)}
                    >
                      <Plus size={18} color={isSelected ? "#FFF" : Colors.primary} style={isSelected && { transform: [{ rotate: '45deg' }] }} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {selectedRecipes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Riepilogo Fabbisogno</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewText}>
                {useSamePortions 
                   ? `Verranno calcolati i fabbisogni per ${peopleCount} ospiti (tutti i piatti).`
                   : `Verranno calcolati i fabbisogni basati sulle porzioni specifiche impostate.`}
              </Text>
              {requirements.conflicts.length > 0 && (
                <View style={styles.warningBox}>
                  <Text style={styles.warningTitle}>⚠️ Attenzione Allergeni!</Text>
                  {requirements.conflicts.map((c: string, i: number) => (
                    <Text key={i} style={styles.warningText}>• {c}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer con pulsante fisso in basso */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, (loading || !title || selectedRecipes.length === 0) && styles.disabled]} 
          onPress={() => {
            console.log('--- Click su Crea Evento ---');
            handleCreate();
          }}
          disabled={loading || !title || selectedRecipes.length === 0}
          activeOpacity={0.7}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" />
              <Text style={styles.saveText}>Conferma e Crea Evento</Text>
            </>
          )}
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
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 120, // Spazio extra per il footer
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.caption,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  toggleTextActive: {
    color: '#FFF',
  },
  recipeList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemRowActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  itemNameActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  qtyUnit: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  qtyUnitActive: {
    color: Colors.primary,
  },
  selectBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  selectBtnActive: {
    backgroundColor: Colors.primary,
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
    zIndex: 999, // Forza in primo piano su Web
    elevation: 5,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.5,
  },
  previewCard: {
    backgroundColor: Colors.primary + '10', // 10% opacity
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  warningBox: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.error + '10',
    padding: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  warningTitle: {
    color: Colors.error,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  warningText: {
    color: Colors.error,
    fontSize: 12,
  },
  previewText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#FFF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  portionInputCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 10,
  },
  portionInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 40,
    height: 30,
    borderRadius: 6,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  portionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kitList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kitChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  kitChipActive: {
    backgroundColor: Colors.primary,
  },
  kitChipText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  kitChipTextActive: {
    color: '#FFF',
  },
});
