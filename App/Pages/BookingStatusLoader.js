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
    // Initial fetch
    fetchBookingStatus();

    // Set up interval to check status every 5 seconds
    const statusInterval = setInterval(fetchBookingStatus, 5000);
    
    // Set up interval to increment time elapsed every second
    const timeInterval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    // Clean up intervals on component unmount
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
        setBooking(response.booking);
        setStatus(response.booking.status);
        setError(null);

        // If booking status is not pending anymore, notify user
        if (response.booking.status !== 'pending' && status === 'pending') {
          Alert.alert(
            'Booking Update',
            `Your booking has been ${response.booking.status}!`
          );
        }
      } else {
        setError('Unable to fetch booking status. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching booking status:', error);
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

  // If user wants to go back to dashboard
  const handleBackPress = () => {
    if (status === 'pending') {
      Alert.alert(
        'Go Back?',
        'Your booking request will continue to be processed. You can check its status later from your profile.',
        [
          { text: 'Stay Here', style: 'cancel' },
          { text: 'Go Back', onPress: () => navigation.navigate('Dashboard') }
        ]
      );
    } else {
      navigation.navigate('Dashboard');
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'accepted':
        return '#4CAF50'; // Green
      case 'declined':
        return '#F44336'; // Red
      default:
        return '#FFA500'; // Orange for pending
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Status</Text>
          <View style={{ width: 24 }} /> {/* Empty view for balanced header */}
        </View>
        
        <View style={styles.statusCard}>
          <View style={styles.iconContainer}>
            {status === 'pending' ? (
              <ActivityIndicator size="large" color="#FFA500" />
            ) : status === 'accepted' ? (
              <Feather name="check-circle" size={60} color="#4CAF50" />
            ) : (
              <Feather name="x-circle" size={60} color="#F44336" />
            )}
          </View>
          
          <Text style={[styles.statusTitle, { color: getStatusColor() }]}>
            {status === 'pending' 
              ? 'Awaiting Guide Response' 
              : status === 'accepted' 
                ? 'Booking Accepted!' 
                : 'Booking Declined'}
          </Text>
          
          <Text style={styles.statusDescription}>
            {status === 'pending' 
              ? 'Your booking request has been sent to the guide. Please wait for their response.' 
              : status === 'accepted' 
                ? 'Your guide has accepted your booking request. You are all set for your trek!' 
                : 'Unfortunately, the guide has declined your booking request. You can try booking with another guide.'}
          </Text>
          
          {status === 'pending' && (
            <View style={styles.waitingInfo}>
              <Text style={styles.waitingTime}>Waiting time: {formatTime(timeElapsed)}</Text>
              <Text style={styles.refreshInfo}>
                Pull down to refresh or wait for automatic update
              </Text>
            </View>
          )}
        </View>
        
        {booking && (
          <View style={styles.bookingDetails}>
            <Text style={styles.detailsTitle}>Booking Details</Text>
            
            <View style={styles.detailItem}>
              <Feather name="map-pin" size={18} color="#666" />
              <Text style={styles.detailText}>Destination: {booking.destination}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Feather name="calendar" size={18} color="#666" />
              <Text style={styles.detailText}>Date: {booking.date}</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Feather name="users" size={18} color="#666" />
              <Text style={styles.detailText}>Group Size: {booking.peopleCount} people</Text>
            </View>
            
            <View style={styles.detailItem}>
              <Feather name="clock" size={18} color="#666" />
              <Text style={styles.detailText}>
                Request sent: {new Date(booking.createdAt).toLocaleString()}
              </Text>
            </View>
            
            {status !== 'pending' && (
              <View style={styles.detailItem}>
                <Feather 
                  name={status === 'accepted' ? "check" : "x"} 
                  size={18} 
                  color={status === 'accepted' ? "#4CAF50" : "#F44336"} 
                />
                <Text style={styles.detailText}>
                  Response received: {new Date(booking.updatedAt).toLocaleString()}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={fetchBookingStatus}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {status !== 'pending' && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text style={styles.actionButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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