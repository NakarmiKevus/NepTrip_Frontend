import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import bookingApi from '../API/bookingApi';

const ConfirmBooking = () => {
  const [date, setDate] = useState('');

  const handleConfirmBooking = async () => {
    if (!date) {
      Alert.alert('Error', 'Please enter/select a date.');
      return;
    }
    try {
      const response = await bookingApi.requestBooking(date);
      if (response.success) {
        Alert.alert('Success', response.message || 'Booking request sent!');
        // Optionally navigate the user somewhere else, e.g. to their Dashboard
        // navigation.navigate('Dashboard');
      } else {
        Alert.alert('Error', response.message || 'Failed to send booking request.');
      }
    } catch (error) {
      console.log('Error booking:', error);
      Alert.alert('Error', 'An error occurred while sending booking request.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Booking</Text>
      <Text>Select a date for your guide booking:</Text>
      {/* Simple text input for date; you can replace with a DatePicker */}
      <TextInput
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <Button title="Confirm Booking" onPress={handleConfirmBooking} />
    </View>
  );
};

export default ConfirmBooking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 8,
  },
});
