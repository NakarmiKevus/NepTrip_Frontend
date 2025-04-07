import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import bookingApi from '../API/bookingApi';

const Tours = () => {
  const navigation = useNavigation();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAcceptedTours();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchAcceptedTours();
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchAcceptedTours = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching accepted tours...');
      
      const response = await bookingApi.getAllBookingRequests();
      console.log('API response:', response);
      
      if (response.success) {
        // Filter to only show accepted bookings
        const acceptedTours = response.requests.filter(booking => booking.status === 'accepted') || [];
        console.log(`Found ${acceptedTours.length} accepted tours`);
        setTours(acceptedTours);
      } else {
        console.error('API returned error:', response.message);
        setError(response.message || 'Failed to fetch tours');
        Alert.alert('Error', response.message || 'Failed to fetch tours');
      }
    } catch (error) {
      console.error('Exception during fetch:', error);
      setError('Network error. Please check your connection and try again.');
      Alert.alert('Error', 'Failed to load tours. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const completeTourProcess = async (bookingId) => {
    try {
      console.log('Completing tour:', bookingId);
      const response = await bookingApi.completeTour(bookingId);
      
      if (response.success) {
        Alert.alert('Success', 'Tour marked as completed!');
        // Refresh the list
        fetchAcceptedTours();
      } else {
        console.error('API error when completing tour:', response.message);
        Alert.alert('Error', response.message || 'Failed to complete tour');
      }
    } catch (error) {
      console.error('Exception when completing tour:', error);
      Alert.alert('Error', 'An error occurred while completing the tour');
    }
  };

  const handleCompleteTour = async (booking) => {
    Alert.alert(
      'Complete Tour',
      'Are you sure you want to mark this tour as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Complete', 
          onPress: () => completeTourProcess(booking._id)
        }
      ]
    );
  };

  const handleViewDetails = (booking) => {
    console.log('Navigating to tour details with booking:', booking._id);
    navigation.navigate('TourDetails', { booking });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAcceptedTours();
  };

  const formatPaymentMethod = (method) => {
    if (!method) return 'Not specified';
    switch (method) {
      case 'cash': return 'Cash on Arrival';
      case 'online': return 'Online Payment';
      default: return 'Not specified';
    }
  };

  const formatPaymentStatus = (status) => {
    if (!status) return 'Not specified';
    switch (status) {
      case 'paid': return 'Paid';
      case 'partially_paid': return 'Partially Paid';
      case 'unpaid': return 'Unpaid';
      default: return 'Not specified';
    }
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return '#666';
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'partially_paid': return '#FFA500';
      case 'unpaid': return '#F44336';
      default: return '#666';
    }
  };

  const renderTourItem = ({ item }) => (
    <View style={styles.tourCard}>
      <View style={styles.tourHeader}>
        <Text style={styles.tourName}>{item.fullname}</Text>
        <View style={styles.acceptedBadge}>
          <Text style={styles.badgeText}>ACCEPTED</Text>
        </View>
      </View>

      <View style={styles.tourDetails}>
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
        
        {/* Payment Information - Handle case where payment info might not exist */}
        <View style={styles.paymentInfoSection}>
          <View style={styles.detailRow}>
            <Feather 
              name={item.paymentMethod === 'cash' ? 'dollar-sign' : 'credit-card'} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.detailText}>
              Payment: {formatPaymentMethod(item.paymentMethod)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Feather name="info" size={16} color={getPaymentStatusColor(item.paymentStatus)} />
            <Text style={[
              styles.detailText, 
              { color: getPaymentStatusColor(item.paymentStatus) }
            ]}>
              Status: {formatPaymentStatus(item.paymentStatus)}
              {item.paymentAmount > 0 && ` (₹${item.paymentAmount})`}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.completeButton}
          onPress={() => handleCompleteTour(item)}
        >
          <Feather name="check-circle" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Complete Trek</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(item)}
        >
          <Feather name="eye" size={16} color="#0096FF" />
          <Text style={styles.viewDetailsText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading tours...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Feather name="alert-triangle" size={50} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchAcceptedTours()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Tours</Text>
      </View>
      
      <FlatList
        data={tours}
        keyExtractor={(item, index) => item._id || `tour-${index}`}
        renderItem={renderTourItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="map" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No active tours found</Text>
            <Text style={styles.emptySubText}>Accept booking requests to see them here</Text>
          </View>
        }
      />
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
  listContainer: {
    padding: 10,
    paddingBottom: 40,
  },
  tourCard: {
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
  tourHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tourName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  acceptedBadge: {
    backgroundColor: '#4CAF50',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tourDetails: {
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
  paymentInfoSection: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default Tours;