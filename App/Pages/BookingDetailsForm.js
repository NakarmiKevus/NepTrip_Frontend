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

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 24 }} /> {/* Empty view for balanced header */}
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.dateInfoContainer}>
          <Feather name="calendar" size={20} color="#666" />
          <Text style={styles.dateInfoText}>
            Booking for: {selectedDate}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter your full name"
              value={formData.fullname}
              onChangeText={(value) => handleChange('fullname', value)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              placeholder="Enter your email"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              placeholder="Enter your phone number"
              value={formData.phone}
              onChangeText={(value) => handleChange('phone', value)}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              placeholder="Enter your address"
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              style={styles.input}
            />
          </View>

          <Text style={styles.sectionTitle}>Trip Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of People</Text>
            <TextInput
              placeholder="Enter number of people"
              value={formData.peopleCount}
              onChangeText={(value) => handleChange('peopleCount', value)}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Destination</Text>
            <TextInput
              placeholder="Enter destination"
              value={formData.destination}
              onChangeText={(value) => handleChange('destination', value)}
              style={styles.input}
            />
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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