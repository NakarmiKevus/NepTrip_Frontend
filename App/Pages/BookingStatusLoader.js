import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import bookingApi from '../API/bookingApi';
import { useNavigation } from '@react-navigation/native';

const BookingStatusLoader = () => {
  const [status, setStatus] = useState('pending');
  const navigation = useNavigation();

  useEffect(() => {
    const checkBookingStatus = async () => {
      try {
        const data = await bookingApi.getLatestBooking();
        setStatus(data.booking.status);

        if (data.booking.status !== 'pending') {
          Alert.alert('Booking Update', `Your booking has been ${data.booking.status}`);
          navigation.navigate('Dashboard'); // Redirect to Dashboard
        } else {
          setTimeout(checkBookingStatus, 5000); // Check status every 5 seconds
        }
      } catch (error) {
        console.log('Error fetching booking status:', error);
      }
    };

    checkBookingStatus();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2196F3" />
      <Text style={styles.text}>Waiting for Guide's Response...</Text>
    </View>
  );
};

export default BookingStatusLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
    fontSize: 16,
  },
});
