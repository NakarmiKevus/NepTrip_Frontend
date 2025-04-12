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
    const timeInterval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
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
          let message = '';
          if (newStatus === 'accepted') {
            message = 'Your booking has been accepted!';
          } else if (newStatus === 'completed') {
            message = 'Your trek has been completed! Thank you for choosing our service.';
          } else if (newStatus === 'declined') {
            message = 'Your booking has been declined.';
          } else {
            message = `Your booking has been ${newStatus}!`;
          }
          Alert.alert('Booking Update', message);
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
    if (status === 'completed') return '#2196F3';
    return '#FFA500';
  };

  const getStatusIcon = () => {
    if (status === 'pending') return null;
    if (status === 'accepted') return 'check-circle';
    if (status === 'completed') return 'award';
    return 'x-circle';
  };

  const handleBookGuidePress = () => {
    navigation.navigate('Guide'); // Navigate to the Guide screen
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
              <Feather name={getStatusIcon()} size={60} color={getStatusColor()} />
            )}
          </View>

          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {status === 'pending'
              ? 'Awaiting Guide Response'
              : status === 'accepted'
              ? 'Booking Accepted!'
              : status === 'completed'
              ? 'Trek Completed'
              : 'Booking Declined'}
          </Text>

          <Text style={styles.statusDescription}>
            {status === 'pending'
              ? 'Your booking request has been sent. Please wait for guide response.'
              : status === 'accepted'
              ? 'Your booking is accepted. Happy trekking!'
              : status === 'completed'
              ? 'Your trek has been completed. Thank you for choosing our service!'
              : 'Guide declined your request. Try booking again later.'}
          </Text>

          {status === 'pending' && (
            <View style={styles.waitingInfo}>
              <Text style={styles.waitingTime}>Waiting time: {formatTime(timeElapsed)}</Text>
              <Text style={styles.refreshInfo}>Pull down to refresh or wait</Text>
            </View>
          )}
        </View>

        {booking && status !== 'pending' && (
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
                icon={status === 'accepted' ? 'check' : status === 'completed' ? 'award' : 'x'}
              />
            )}
            {booking.completedAt && status === 'completed' && (
              <Detail
                label="Completed on"
                value={new Date(booking.completedAt).toLocaleString()}
                icon="check-square"
                color="#2196F3"
              />
            )}
          </View>
        )}

        {/* Payment Details Card */}
        {booking && booking.paymentMethod && status !== 'pending' && (
          <View style={styles.bookingDetails}>
            <Text style={styles.detailsTitle}>Payment Details</Text>
            <Detail 
              label="Payment Method" 
              value={booking.paymentMethod === 'cash' ? 'Cash on Arrival' : 'Online Payment'} 
              icon={booking.paymentMethod === 'cash' ? 'dollar-sign' : 'credit-card'} 
            />
            
            <Detail 
              label="Payment Status" 
              value={booking.paymentStatus ? 
                (booking.paymentStatus === 'paid' ? 'Paid' : 
                 booking.paymentStatus === 'partially_paid' ? 'Partially Paid' : 
                 'Unpaid') : 'Not specified'}
              icon={booking.paymentStatus === 'paid' ? 'check-circle' : 'alert-circle'}
              color={booking.paymentStatus === 'paid' ? '#4CAF50' : 
                    booking.paymentStatus === 'partially_paid' ? '#FFA500' : '#F44336'}
            />
            
            {booking.paymentAmount > 0 && (
              <Detail 
                label="Amount Paid" 
                value={`₹${booking.paymentAmount}`} 
                icon="credit-card" 
              />
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

        {(status === 'declined' || status === 'completed') && (
          <TouchableOpacity style={styles.actionButton} onPress={handleBookGuidePress}>
            <Text style={styles.actionButtonText}>Book a Guide</Text>
          </TouchableOpacity>
        )}

        {status !== 'pending' && status !== 'completed' && status !== 'declined' && (
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('GuideMain')}>
            <Text style={styles.actionButtonText}>Book a Guide</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Detail component for displaying booking information
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
});

export default BookingStatusLoader;