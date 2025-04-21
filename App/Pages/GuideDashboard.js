import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import bookingApi from '../API/bookingApi';

const GuideDashboard = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, accepted: 0, completed: 0 });

  useEffect(() => {
    fetchBookings();
    const unsubscribe = navigation.addListener('focus', fetchBookings);
    return unsubscribe;
  }, [navigation]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getAllBookingRequests();
      if (res.success) {
        const data = res.requests || [];
        setBookings(data);
        handleFilter(filter, data);
        setStats({
          total: data.length,
          pending: data.filter(b => b.status === 'pending').length,
          accepted: data.filter(b => b.status === 'accepted').length,
          completed: data.filter(b => b.status === 'completed').length,
        });
      } else {
        Alert.alert('Error', res.message || 'Failed to fetch bookings');
      }
    } catch {
      Alert.alert('Error', 'Unable to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    handleFilter(filter, bookings, text);
  };

  const handleFilter = (type, data = bookings, search = searchQuery) => {
    setFilter(type);
    let filtered = type === 'all' ? data : data.filter(b => b.status === type);
    if (search) {
      filtered = filtered.filter(b =>
        b.fullname?.toLowerCase().includes(search.toLowerCase()) ||
        b.destination?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredBookings(filtered);
  };

  const handleRespond = async (id, status) => {
    try {
      const res = await bookingApi.respondToBooking(id, status);
      if (res.success) fetchBookings();
    } catch {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleComplete = async (id) => {
    try {
      const res = await bookingApi.completeTour(id);
      if (res.success) fetchBookings();
    } catch {
      Alert.alert('Error', 'Failed to mark as completed');
    }
  };

  const renderBooking = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.name}>{item.fullname}</Text>
        <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.badgeText}>{capitalize(item.status)}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Feather name="map-pin" size={14} color="#555" />
        <Text style={styles.infoText}>{item.destination}</Text>
      </View>
      <View style={styles.infoRow}>
        <Feather name="calendar" size={14} color="#555" />
        <Text style={styles.infoText}>{item.date}</Text>
      </View>
      <View style={styles.infoRow}>
        <Feather name="users" size={14} color="#555" />
        <Text style={styles.infoText}>{item.peopleCount} people</Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.button, styles.accept]}
            onPress={() => handleRespond(item._id, 'accepted')}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.decline]}
            onPress={() => handleRespond(item._id, 'declined')}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'accepted' && (
        <TouchableOpacity
          style={[styles.button, styles.complete, { marginTop: 10 }]}
          onPress={() => handleComplete(item._id)}
        >
          <Text style={styles.buttonText}>Complete Trek</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Guide Dashboard</Text>

      <View style={styles.stats}>
        <StatBox label="Total" value={stats.total} color="#f0f0f0" textColor="#333" />
        <StatBox label="Pending" value={stats.pending} color="#FFA500" />
        <StatBox label="Active" value={stats.accepted} color="#4CAF50" />
        <StatBox label="Completed" value={stats.completed} color="#2196F3" />
      </View>

      <View style={styles.searchBar}>
        <Feather name="search" size={16} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search bookings..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Feather name="x" size={16} color="#777" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filters}>
        {['all', 'pending', 'accepted', 'completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
            onPress={() => handleFilter(f)}
          >
            <Text style={filter === f ? styles.activeFilterText : styles.filterText}>
              {capitalize(f)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBooking}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchBookings} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="calendar" size={40} color="#ccc" />
              <Text style={styles.emptyText}>No bookings found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const StatBox = ({ label, value, color, textColor = '#fff' }) => (
  <View style={[styles.statBox, { backgroundColor: color }]}>
    <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: textColor }]}>{label}</Text>
  </View>
);

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return '#FFA500';
    case 'accepted': return '#4CAF50';
    case 'completed': return '#2196F3';
    case 'declined': return '#F44336';
    default: return '#999';
  }
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  header: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    padding: 16, 
    color: '#333', 
    marginTop: -50,
    marginBottom: 12
  },
  stats: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 12,
    paddingHorizontal: 16
  },
  statBox: {
    width: '22%',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  statValue: { 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  statLabel: { 
    fontSize: 12 
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    height: 38,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 15,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  filterButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#000',
  },
  filterText: {
    fontSize: 13,
    color: '#555',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  name: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#555',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  accept: { backgroundColor: '#4CAF50' },
  decline: { backgroundColor: '#F44336' },
  complete: { backgroundColor: '#2196F3' },
  emptyBox: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: '#999',
    fontSize: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { 
    padding: 16, 
    paddingBottom: 40 
  },
});

export default GuideDashboard;