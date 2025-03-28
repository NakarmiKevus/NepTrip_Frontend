import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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

  useEffect(() => {
    const checkBooking = async () => {
      try {
        const response = await bookingApi.getLatestBooking();
        if (response.success && response.booking.status !== 'completed') {
          navigation.replace('BookingStatusLoader');
        }
      } catch (error) {
        console.log('No ongoing booking:', error);
      }
    };
    checkBooking();
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

    try {
      setIsSubmitting(true);
      const response = await bookingApi.requestBooking({
        ...formData,
        date: selectedDate,
      });

      setIsSubmitting(false);

      if (response.success) {
        Alert.alert('Success', 'Booking request sent!');
        navigation.replace('BookingStatusLoader');
      } else {
        Alert.alert('Error', response.message || 'Failed to send booking request.');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log('Error booking:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.dateInfoContainer}>
          <Feather name="calendar" size={20} color="#666" />
          <Text style={styles.dateInfoText}>Booking for: {selectedDate}</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <FormInput label="Full Name" value={formData.fullname} onChangeText={(val) => handleChange('fullname', val)} />
          <FormInput label="Email Address" value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" />
          <FormInput label="Phone Number" value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />
          <FormInput label="Address" value={formData.address} onChangeText={(val) => handleChange('address', val)} />

          <Text style={styles.sectionTitle}>Trip Details</Text>

          <FormInput label="Number of People" value={formData.peopleCount} onChangeText={(val) => handleChange('peopleCount', val)} keyboardType="numeric" />
          <FormInput label="Destination" value={formData.destination} onChangeText={(val) => handleChange('destination', val)} />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Booking Request</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const FormInput = ({ label, value, onChangeText, keyboardType = 'default' }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholder={`Enter your ${label.toLowerCase()}`}
      value={value}
      onChangeText={onChangeText}
      style={styles.input}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f7ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateInfoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingDetailsForm;
