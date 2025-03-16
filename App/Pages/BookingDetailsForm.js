import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import bookingApi from '../API/bookingApi';
import { useNavigation, useRoute } from '@react-navigation/native';

const BookingDetailsForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedDate } = route.params;

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    address: '',
    phone: '',
    peopleCount: '',
    destination: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPendingBooking, setHasPendingBooking] = useState(false);

  // Check if the user has a pending booking before submitting a new request
  useEffect(() => {
    const checkPendingBooking = async () => {
      try {
        const response = await bookingApi.getLatestBooking();
        if (response.success && response.booking.status === 'pending') {
          setHasPendingBooking(true);
          navigation.replace('BookingStatusLoader'); // Redirect to loader page
        }
      } catch (error) {
        console.log('No pending booking found:', error);
      }
    };

    checkPendingBooking();
  }, []);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    const { fullname, email, address, phone, peopleCount, destination } = formData;

    if (!fullname || !email || !address || !phone || !peopleCount || !destination) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (hasPendingBooking) {
      Alert.alert('Error', 'You already have a pending booking. Please wait for a response.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await bookingApi.requestBooking({
        ...formData,
        date: selectedDate,
      });

      setIsSubmitting(false);

      if (response.success) {
        Alert.alert('Success', 'Booking request sent!');
        navigation.replace('BookingStatusLoader'); // Redirect to loader page
      } else {
        Alert.alert('Error', response.message || 'Failed to send booking request.');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log('Error booking:', error);
      Alert.alert('Error', 'An error occurred while sending booking request.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Enter Your Booking Details</Text>

      <TextInput placeholder="Full Name" value={formData.fullname} onChangeText={(value) => handleChange('fullname', value)} style={styles.input} />
      <TextInput placeholder="Email" value={formData.email} onChangeText={(value) => handleChange('email', value)} style={styles.input} keyboardType="email-address" />
      <TextInput placeholder="Address" value={formData.address} onChangeText={(value) => handleChange('address', value)} style={styles.input} />
      <TextInput placeholder="Phone Number" value={formData.phone} onChangeText={(value) => handleChange('phone', value)} style={styles.input} keyboardType="phone-pad" />
      <TextInput placeholder="Number of People" value={formData.peopleCount} onChangeText={(value) => handleChange('peopleCount', value)} style={styles.input} keyboardType="numeric" />
      <TextInput placeholder="Destination" value={formData.destination} onChangeText={(value) => handleChange('destination', value)} style={styles.input} />

      {isSubmitting ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <Button title="Submit Booking Request" onPress={handleSubmit} disabled={hasPendingBooking} />
      )}
    </ScrollView>
  );
};

export default BookingDetailsForm;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 5,
  },
  loader: {
    marginTop: 20,
  },
});
