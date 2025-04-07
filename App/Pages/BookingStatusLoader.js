import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import bookingApi from '../API/bookingApi';
import { useNavigation } from '@react-navigation/native';

const BookingStatusLoader = () => {
  const [status, setStatus] = useState('pending');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    fetchBookingStatus();
    const statusInterval = setInterval(fetchBookingStatus, 5000);
    const timeInterval = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchBookingStatus = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getLatestBooking();
      
      if (response.success) {
        if (!response.booking) {
          // No booking found, navigate back to dashboard
          navigation.navigate('Dashboard');
          return;
        }
        
        const newStatus = response.booking.status;
        const alertKey = `alert_shown_for_${response.booking._id}`;

        setBooking(response.booking);
        setStatus(newStatus);
        setError(null);

        const alreadyShown = await AsyncStorage.getItem(alertKey);
        if (newStatus !== 'pending' && alreadyShown !== 'true') {
          Alert.alert('Booking Update', `Your booking has been ${newStatus}!`);
          await AsyncStorage.setItem(alertKey, 'true');
        }
      } else {
        setError('Unable to fetch booking status. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while checking your booking status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookingStatus();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleBackPress = () => {
    if (status === 'pending') {
      Alert.alert(
        'Go Back?',
        'Your booking request will continue to be processed. You can check its status later.',
        [
          { text: 'Stay Here', style: 'cancel' },
          { text: 'Go Back', onPress: () => navigation.navigate('Dashboard') },
        ]
      );
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const getStatusColor = () => {
    if (status === 'accepted') return '#4CAF50';
    if (status === 'declined') return '#F44336';
    return '#FFA500';
  };

  // Helper functions for payment information
  const formatPaymentMethod = (method) => {
    switch (method) {
      case 'cash': return 'Cash on Arrival';
      case 'online': return 'Online Payment';
      default: return 'Not specified';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash': return 'dollar-sign';
      case 'online': return 'credit-card';
      default: return 'help-circle';
    }
  };

  const formatPaymentStatus = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partially_paid': return 'Partially Paid';
      case 'unpaid': return 'Unpaid';
      default: return 'Unknown';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid': return 'check-circle';
      case 'partially_paid': return 'clock';
      case 'unpaid': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'partially_paid': return '#FFA500';
      case 'unpaid': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Status</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.statusCard}>
          <View style={styles.iconContainer}>
            {status === 'pending' ? (
              <ActivityIndicator size="large" color="#FFA500" />
            ) : (
              <Feather
                name={status === 'accepted' ? 'check-circle' : 'x-circle'}
                size={60}
                color={getStatusColor()}
              />
            )}
          </View>

          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {status === 'pending' ? 'Awaiting Guide Response' : status === 'accepted' ? 'Booking Accepted!' : 'Booking Declined'}
          </Text>

          <Text style={styles.statusDescription}>
            {status === 'pending'
              ? 'Your booking request has been sent. Please wait for guide response.'
              : status === 'accepted'
              ? 'Your booking is accepted. Happy trekking!'
              : 'Guide declined your request. Try booking again later.'}
          </Text>

          {status === 'pending' && (
            <View style={styles.waitingInfo}>
              <Text style={styles.waitingTime}>Waiting time: {formatTime(timeElapsed)}</Text>
              <Text style={styles.refreshInfo}>Pull down to refresh or wait</Text>
            </View>
          )}
        </View>

        {booking && (
          <View style={styles.bookingDetails}>
            <Text style={styles.detailsTitle}>Booking Details</Text>
            <Detail label="Destination" value={booking.destination} icon="map-pin" />
            <Detail label="Date" value={booking.date} icon="calendar" />
            <Detail label="Group Size" value={`${booking.peopleCount} people`} icon="users" />
            <Detail label="Request sent" value={new Date(booking.createdAt).toLocaleString()} icon="clock" />
            {status !== 'pending' && (
              <Detail
                label="Response received"
                value={new Date(booking.updatedAt).toLocaleString()}
                icon={status === 'accepted' ? 'check' : 'x'}
              />
            )}
          </View>
        )}

        {/* Payment Details Card - Without Instructions Section */}
        {booking && booking.paymentMethod && (
          <View style={styles.paymentDetailsCard}>
            <Text style={styles.detailsTitle}>Payment Details</Text>
            
            <Detail 
              label="Payment Method" 
              value={formatPaymentMethod(booking.paymentMethod)} 
              icon={getPaymentMethodIcon(booking.paymentMethod)} 
            />
            
            <Detail 
              label="Payment Status" 
              value={formatPaymentStatus(booking.paymentStatus)} 
              icon={getPaymentStatusIcon(booking.paymentStatus)}
              color={getPaymentStatusColor(booking.paymentStatus)}
            />
            
            {booking.paymentAmount > 0 && (
              <Detail 
                label="Amount Paid" 
                value={`₹${booking.paymentAmount}`} 
                icon="credit-card" 
              />
            )}
            
            {booking.status === 'accepted' && booking.paymentStatus !== 'paid' && booking.paymentMethod === 'online' && (
              <TouchableOpacity
                style={styles.makePaymentButton}
                onPress={() => Alert.alert(
                  'Payment Reminder', 
                  'Please make the payment using the provided details to confirm your booking.'
                )}
              >
                <Feather name="credit-card" size={16} color="#fff" />
                <Text style={styles.makePaymentText}>Make Payment</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBookingStatus}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {status !== 'pending' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.actionButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Updated Detail component to support colors
const Detail = ({ label, value, icon, color }) => (
  <View style={styles.detailItem}>
    <Feather name={icon} size={18} color={color || "#666"} />
    <Text style={[styles.detailText, color && { color }]}>
      {label}: {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 15,
    height: 60,
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  waitingInfo: {
    marginTop: 15,
    alignItems: 'center',
  },
  waitingTime: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFA500',
  },
  refreshInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  bookingDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginVertical: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Payment Details Styles
  paymentDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  makePaymentButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  makePaymentText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default BookingStatusLoader;