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
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import bookingApi from '../API/bookingApi';
import { useNavigation } from '@react-navigation/native';
import ConfirmPayment from '../Components/ConfirmPayment';

const { width } = Dimensions.get('window');

const BookingStatusLoader = () => {
  const [status, setStatus] = useState('pending');
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const navigation = useNavigation();
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const spinAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    fetchBookingStatus();
    const statusInterval = setInterval(fetchBookingStatus, 5000);
    const timeInterval = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    // Spin animation for the loading indicator
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
    
    return () => {
      clearInterval(statusInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const fetchBookingStatus = async () => {
    try {
      setLoading(true);

      // Fetch the latest booking ID from AsyncStorage
      const latestBookingId = await AsyncStorage.getItem('latestBookingId');
      if (!latestBookingId) {
        navigation.navigate('Dashboard');
        return;
      }

      // Fetch only the booking that was just created
      const response = await bookingApi.getBookingStatus(latestBookingId);

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
          } else if (newStatus === 'declined') {
            message = 'Your booking has been declined.';
            // Clear bookingId so user can book again
            await AsyncStorage.removeItem('latestBookingId');
          } else if (newStatus === 'completed') {
            message = 'Your trek has been completed!';
          } else {
            message = `Your booking has been ${newStatus}.`;
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
      Alert.alert('Go Back?', 'Your booking request will continue to be processed.', [
        { text: 'Stay Here', style: 'cancel' },
        { text: 'Go Back', onPress: () => navigation.navigate('Dashboard') },
      ]);
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

  const getStatusBackground = () => {
    if (status === 'accepted') return 'rgba(76, 175, 80, 0.1)';
    if (status === 'declined') return 'rgba(244, 67, 54, 0.1)';
    if (status === 'completed') return 'rgba(33, 150, 243, 0.1)';
    return 'rgba(255, 165, 0, 0.1)';
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBookGuidePress = () => {
    navigation.navigate('Guide', { screen: 'GuideMain' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
        <Feather name="arrow-left" size={24} color="#333" />
      </TouchableOpacity>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2196F3']} />}
      >
        <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
          <Text style={styles.headerTitle}>Booking Status</Text>
          <Text style={styles.headerSubtitle}>
            Track your booking in real-time
          </Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.statusCard, 
            { 
              opacity: fadeAnim,
              backgroundColor: '#fff',
              borderColor: getStatusColor(),
              borderLeftWidth: 5,
            }
          ]}
        >
          <View style={[styles.iconContainer, { backgroundColor: getStatusBackground() }]}>
            {status === 'pending' ? (
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <Feather name="loader" size={40} color="#FFA500" />
              </Animated.View>
            ) : (
              <Feather name={getStatusIcon()} size={40} color={getStatusColor()} />
            )}
          </View>

          <View style={styles.statusTextContainer}>
            <Text style={[styles.statusTitle, { color: getStatusColor() }]}> 
              {status === 'pending' ? 'Awaiting Guide Response' : status === 'accepted' ? 'Booking Accepted!' : status === 'completed' ? 'Trek Completed' : 'Booking Declined'}
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
                <Text style={styles.refreshInfo}>Pull down to refresh or wait for update</Text>
              </View>
            )}
          </View>
        </Animated.View>

        {booking && status !== 'pending' && (
          <Animated.View style={[styles.bookingDetails, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <Feather name="info" size={20} color="#2196F3" />
              <Text style={styles.detailsTitle}>Booking Details</Text>
            </View>
            <Detail label="Destination" value={booking.destination} icon="map-pin" />
            <Detail label="Date" value={booking.date} icon="calendar" />
            <Detail label="Group Size" value={`${booking.peopleCount} people`} icon="users" />
            <Detail label="Request sent" value={new Date(booking.createdAt).toLocaleString()} icon="clock" />
            <Detail label="Response received" value={new Date(booking.updatedAt).toLocaleString()} icon="check" />
            {booking.completedAt && (
              <Detail label="Completed on" value={new Date(booking.completedAt).toLocaleString()} icon="check-square" color="#2196F3" />
            )}
          </Animated.View>
        )}

        {booking && booking.paymentMethod && status !== 'pending' && (
          <Animated.View style={[styles.bookingDetails, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <Feather name="credit-card" size={20} color="#4CAF50" />
              <Text style={styles.detailsTitle}>Payment Details</Text>
            </View>
            <Detail 
              label="Payment Method" 
              value={booking.paymentMethod === 'cash' ? 'Cash on Arrival' : 'Online Payment'} 
              icon={booking.paymentMethod === 'cash' ? 'dollar-sign' : 'credit-card'} 
            />
            <Detail 
              label="Payment Status" 
              value={booking.paymentStatus === 'paid' ? 'Paid' : booking.paymentStatus === 'partially_paid' ? 'Partially Paid' : 'Unpaid'} 
              icon={booking.paymentStatus === 'paid' ? 'check-circle' : 'alert-circle'} 
              color={booking.paymentStatus === 'paid' ? '#4CAF50' : booking.paymentStatus === 'partially_paid' ? '#FFA500' : '#F44336'}
            />
            {booking.paymentAmount > 0 && (
              <Detail label="Amount Paid" value={`₹${booking.paymentAmount}`} icon="credit-card" />
            )}
          </Animated.View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Feather name="alert-triangle" size={24} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBookingStatus}>
              <Feather name="refresh-cw" size={16} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'accepted' && booking?.paymentStatus !== 'paid' && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowPaymentModal(true)}
            activeOpacity={0.8}
          >
            <Feather name="credit-card" size={20} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.actionButtonText}>Make Payment</Text>
          </TouchableOpacity>
        )}

        {(status === 'completed' || status === 'declined' || (status === 'accepted' && booking?.paymentStatus === 'paid')) && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              if (status === 'accepted' && booking?.paymentStatus === 'paid' && !booking?.completedAt) {
                Alert.alert(
                  'Trek Not Completed',
                  'Please wait for your guide to mark the trek as completed before booking another.'
                );
                return;
              }
              handleBookGuidePress();
            }}
            activeOpacity={0.8}
          >
            <Feather name="user" size={20} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.actionButtonText}>Book a Guide</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {booking && (
        <ConfirmPayment
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          booking={booking}
          onPaymentMarked={fetchBookingStatus}
        />
      )}
    </SafeAreaView>
  );
};

const Detail = ({ label, value, icon, color }) => (
  <View style={styles.detailItem}>
    <View style={[styles.iconBadge, { backgroundColor: color ? `${color}20` : '#f0f0f0' }]}>
      <Feather name={icon} size={16} color={color || '#666'} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, color && { color }]}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: { 
    flexGrow: 1, 
    padding: 16,
    paddingTop: 80 
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  iconContainer: { 
    width: 70, 
    height: 70, 
    borderRadius: 35,
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 15,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 6,
  },
  statusDescription: { 
    fontSize: 14, 
    color: '#666', 
    lineHeight: 20 
  },
  waitingInfo: { 
    marginTop: 12, 
  },
  waitingTime: { 
    fontSize: 15, 
    fontWeight: '500', 
    color: '#FFA500' 
  },
  refreshInfo: { 
    fontSize: 12, 
    color: '#999', 
    marginTop: 4 
  },
  bookingDetails: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginLeft: 10,
    color: '#333',
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  errorText: { 
    color: '#D32F2F', 
    marginVertical: 10, 
    textAlign: 'center',
    fontSize: 15,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryButtonText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 15,
  },
  actionButton: {
    backgroundColor: 'black',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default BookingStatusLoader;