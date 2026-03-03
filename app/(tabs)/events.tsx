import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import { AlertCircle, ChevronRight, MapPin, Plus, Search, ShoppingCart, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEvents } from '../../src/hooks/useEvents';
import { Colors, Spacing, Typography } from '../../src/theme/constants';
import { EventWithDetails } from '../../src/types/database';

export default function EventsScreen() {
  const { events, isLoading } = useEvents();
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredEvents = useMemo(() => {
    return events.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.address && item.address.toLowerCase().includes(search.toLowerCase()))
    );
  }, [events, search]);

  const renderItem = ({ item }: { item: EventWithDetails }) => {
    const hasMissing = item.missing_items.some(m => !m.resolved);

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push(`/event/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>
              {format(parseISO(item.datetime), "EEEE d MMMM 'alle' HH:mm", { locale: it })}
            </Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'domicilio' ? Colors.primary : Colors.secondary }]}>
            <Text style={styles.badgeText}>{item.type === 'domicilio' ? 'Domicilio' : 'Asporto'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Users size={16} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{item.people_count} persone</Text>
          </View>
          {item.address && (
            <View style={styles.infoItem}>
              <MapPin size={16} color={Colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>{item.address}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.menuInfo}>
            <Text style={styles.menuText}>
              {item.menu_items.length} ricette nel menù
            </Text>
          </View>
          {hasMissing && (
            <View style={styles.alertBadge}>
              <AlertCircle size={14} color={Colors.error} />
              <Text style={styles.alertText}>Mancanti</Text>
            </View>
          )}
          <View style={{ flex: 1 }} />
          <ChevronRight size={20} color={Colors.border} />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca eventi..."
            placeholderTextColor={Colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: Colors.secondary }]}
          onPress={() => router.push('/modals/shopping-list' as any)}
        >
          <ShoppingCart size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/event/new')}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEvents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessun evento programmato</Text>
          </View>
        }
      />
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
  header: {
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.xs,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  eventTitle: {
    ...Typography.body,
    fontWeight: 'bold',
    fontSize: 18,
  },
  eventDate: {
    ...Typography.caption,
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
    gap: Spacing.sm,
  },
  menuInfo: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  menuText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alertText: {
    fontSize: 12,
    color: Colors.error,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    ...Typography.textSecondary,
    fontSize: 16,
  },
});
