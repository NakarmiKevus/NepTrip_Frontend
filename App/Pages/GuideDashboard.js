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
  SafeAreaView,
  ScrollView, 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import bookingApi from '../API/bookingApi';

const GuideDashboard = ({ navigation }) => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
    completedBookings: 0
  });

  useEffect(() => {
    fetchBookings();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookings();
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getAllBookingRequests();
      
      if (response.success) {
        const allBookings = response.requests || [];
        setBookings(allBookings);
        setFilteredBookings(allBookings);
        
        // Calculate stats
        updateStats(allBookings);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch booking requests');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load booking requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStats = (bookingsData) => {
    const stats = {
      totalBookings: bookingsData.length,
      pendingBookings: bookingsData.filter(b => b.status === 'pending').length,
      activeBookings: bookingsData.filter(b => b.status === 'accepted').length,
      completedBookings: bookingsData.filter(b => b.status === 'completed').length
    };
    setStats(stats);
  };

  const handleRespond = async (bookingId, status) => {
    try {
      const response = await bookingApi.respondToBooking(bookingId, status);
      
      if (response.success) {
        // Update the local state
        const updatedBookings = bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status } 
            : booking
        );
        
        setBookings(updatedBookings);
        updateStats(updatedBookings);
        
        // Apply filters again
        handleFilter(filter, updatedBookings);
      } else {
        Alert.alert('Error', response.message || 'Failed to respond to booking');
      }
    } catch (error) {
      console.error('Error responding to booking:', error);
      Alert.alert('Error', 'Failed to update booking status');
    }
  };

  const handleCompleteTrek = async (bookingId) => {
    try {
      const response = await bookingApi.completeTour(bookingId);
      
      if (response.success) {
        // Update the local state
        const updatedBookings = bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: 'completed' } 
            : booking
        );
        
        setBookings(updatedBookings);
        updateStats(updatedBookings);
        
        // Apply filters again
        handleFilter(filter, updatedBookings);
      } else {
        Alert.alert('Error', response.message || 'Failed to complete tour');
      }
    } catch (error) {
      console.error('Error completing trek:', error);
      Alert.alert('Error', 'Failed to mark trek as completed');
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!text.trim()) {
      handleFilter(filter);
      return;
    }
    
    const searchResults = bookings.filter(booking => {
      const matchesFilter = filter === 'all' || booking.status === filter;
      
      const matchesSearch = 
        booking.fullname?.toLowerCase().includes(text.toLowerCase()) ||
        booking.email?.toLowerCase().includes(text.toLowerCase()) ||
        booking.destination?.toLowerCase().includes(text.toLowerCase()) ||
        booking.date?.includes(text);
        
      return matchesFilter && matchesSearch;
    });
    
    setFilteredBookings(searchResults);
  };

  const handleFilter = (filterType, bookingsData = bookings) => {
    setFilter(filterType);
    
    if (filterType === 'all') {
      if (searchQuery.trim()) {
        const searchResults = bookingsData.filter(booking => 
          booking.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          booking.date?.includes(searchQuery)
        );
        setFilteredBookings(searchResults);
      } else {
        setFilteredBookings(bookingsData);
      }
      return;
    }
    
    const filtered = bookingsData.filter(booking => booking.status === filterType);
    
    if (searchQuery.trim()) {
      const searchResults = filtered.filter(booking => 
        booking.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.destination?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.date?.includes(searchQuery)
      );
      setFilteredBookings(searchResults);
    } else {
      setFilteredBookings(filtered);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return null; // No badge for pending
      case 'accepted':
        return <View style={styles.acceptedBadge}><Text style={styles.badgeText}>ACCEPTED</Text></View>;
      case 'completed':
        return <View style={styles.completedBadge}><Text style={styles.badgeText}>COMPLETED</Text></View>;
      case 'declined':
        return <View style={styles.declinedBadge}><Text style={styles.badgeText}>DECLINED</Text></View>;
      default:
        return null;
    }
  };

  const renderBookingItem = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingName}>{item.fullname}</Text>
        {getStatusBadge(item.status)}
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Feather name="map-pin" size={16} color="#666" />
          <Text style={styles.detailText}>{item.destination || 'Not specified'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>{item.date || 'No date set'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="users" size={16} color="#666" />
          <Text style={styles.detailText}>{item.peopleCount || '2'} people</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="mail" size={16} color="#666" />
          <Text style={styles.detailText}>{item.email || 'No email'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Feather name="phone" size={16} color="#666" />
          <Text style={styles.detailText}>{item.phone || 'No phone'}</Text>
        </View>
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleRespond(item._id, 'accepted')}
          >
            <Feather name="check" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Accept</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.declineButton}
            onPress={() => handleRespond(item._id, 'declined')}
          >
            <Feather name="x" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {item.status === 'accepted' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => handleCompleteTrek(item._id)}
          >
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Complete Trek</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={() => navigation.navigate('Tours', { booking: item })}
          >
            <Feather name="eye" size={16} color="#0096FF" />
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* For completed or declined bookings, show view details button */}
      {(item.status === 'completed' || item.status === 'declined') && (
        <TouchableOpacity 
          style={styles.fullWidthViewDetailsButton}
          onPress={() => navigation.navigate('Tours', { booking: item })}
        >
          <Feather name="eye" size={16} color="#0096FF" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guide Dashboard</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalBookings}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#FFA500' }]}>
          <Text style={[styles.statNumber, { color: 'white' }]}>{stats.pendingBookings}</Text>
          <Text style={[styles.statLabel, { color: 'white' }]}>Pending</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
          <Text style={[styles.statNumber, { color: 'white' }]}>{stats.activeBookings}</Text>
          <Text style={[styles.statLabel, { color: 'white' }]}>Active</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: '#2196F3' }]}>
          <Text style={[styles.statNumber, { color: 'white' }]}>{stats.completedBookings}</Text>
          <Text style={[styles.statLabel, { color: 'white' }]}>Completed</Text>
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bookings..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
            onPress={() => handleFilter('all')}
          >
            <Text style={filter === 'all' ? styles.activeFilterText : styles.filterText}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'pending' && styles.activeFilter]}
            onPress={() => handleFilter('pending')}
          >
            <Text style={filter === 'pending' ? styles.activeFilterText : styles.filterText}>Pending</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'accepted' && styles.activeFilter]}
            onPress={() => handleFilter('accepted')}
          >
            <Text style={filter === 'accepted' ? styles.activeFilterText : styles.filterText}>Accepted</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'completed' && styles.activeFilter]}
            onPress={() => handleFilter('completed')}
          >
            <Text style={filter === 'completed' ? styles.activeFilterText : styles.filterText}>Completed</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'declined' && styles.activeFilter]}
            onPress={() => handleFilter('declined')}
          >
            <Text style={filter === 'declined' ? styles.activeFilterText : styles.filterText}>Declined</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Loading booking requests...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item, index) => item._id || `booking-${index}`}
          renderItem={renderBookingItem}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchBookings();
          }}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="calendar" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No booking requests found</Text>
              {(filter !== 'all' || searchQuery) && (
                <Text style={styles.emptySubText}>Try changing your filters or search terms</Text>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '23%',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    borderRadius: 25,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  activeFilter: {
    backgroundColor: '#000',
  },
  filterText: {
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    padding: 10,
    paddingBottom: 40,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    padding: 15,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  completedBadge: {
    backgroundColor: '#2196F3',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  declinedBadge: {
    backgroundColor: '#F44336',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  declineButton: {
    flexDirection: 'row',
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    flex: 1,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    height: 40,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0096FF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    height: 40,
  },
  fullWidthViewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0096FF',
    padding: 10,
    borderRadius: 5,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '500',
  },
  viewDetailsText: {
    color: '#0096FF',
    marginLeft: 5,
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default GuideDashboard;