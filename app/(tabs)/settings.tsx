import { useRouter } from 'expo-router';
import { Info, LogOut, Table2 } from 'lucide-react-native';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { Colors, Spacing, Typography } from '../../src/theme/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Sei sicuro di voler uscire?',
      [
        { text: 'Annulla', style: 'cancel' },
        { text: 'Esci', style: 'destructive', onPress: logout }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurazione Kit</Text>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/modals/manage-kits')}
        >
          <Table2 size={20} color={Colors.primary} />
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>Regole Kit per Persona</Text>
            <Text style={styles.menuDesc}>Definisci piatti, posate e bicchieri standard per servizio</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        <View style={styles.infoCard}>
          <Info size={20} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Questa app è in modalità preview. Il login è locale e lo stock viene sincronizzato con Supabase.
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color={Colors.error} />
        <Text style={styles.logoutText}>Esci dall'Account</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Versione 1.0.0 (MVP)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.md,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    ...Typography.body,
    fontWeight: '600',
  },
  menuDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.md,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#0D47A1',
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    margin: Spacing.xl,
    padding: Spacing.md,
    borderRadius: 16,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  logoutText: {
    color: Colors.error,
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: Spacing.xl,
  },
});
