// ✅ Updated BookingDetailsForm.js

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
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import bookingApi from '../API/bookingApi';
import userApi from '../API/userApi';
import trekkingApi from '../API/trekkingApi';
import { useNavigation, useRoute } from '@react-navigation/native';

const BookingDetailsForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedDate, guideId, selectedTrek } = route.params || {};

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    address: '',
    phone: '',
    peopleCount: '',
    destination: selectedTrek?.name || '',
    paymentMethod: '',
    advancePayment: false,
    advanceAmount: '0',
    guide: guideId,
  });

  const [trekkingOptions, setTrekkingOptions] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      const bookingRes = await bookingApi.getLatestBooking();
      if (bookingRes.success && bookingRes.booking && bookingRes.booking.status !== 'completed') {
        navigation.replace('BookingStatusLoader');
        return;
      }

      // ✅ Use getUserProfile instead of getCurrentUser
      const profileRes = await userApi.getUserProfile();
      if (profileRes.success && profileRes.user) {
        const user = profileRes.user;
        setFormData((prev) => ({
          ...prev,
          fullname: user.fullname || '',
          email: user.email || '',
          address: user.address || '',
          phone: user.phoneNumber || '', // ✅ correct field
        }));
      }

      const trekRes = await trekkingApi.getAllTrekking();
      setTrekkingOptions(trekRes?.trekkingSpots || []);

      if (guideId) {
        const guideRes = await userApi.getGuideProfile(guideId);
        if (guideRes.success) {
          setSelectedGuide(guideRes.guide);
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      Alert.alert('Error', 'Failed to load booking form data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectPaymentMethod = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setFormData((prev) => ({
      ...prev,
      paymentMethod: methodId,
      advancePayment: methodId === 'cash' ? false : prev.advancePayment,
      advanceAmount: methodId === 'cash' ? '0' : prev.advanceAmount,
    }));
  };

  const toggleAdvancePayment = () => {
    setFormData((prev) => ({
      ...prev,
      advancePayment: !prev.advancePayment,
      advanceAmount: !prev.advancePayment ? '500' : '0',
    }));
  };

  const handleSubmit = async () => {
    const { fullname, email, address, phone, peopleCount, destination, paymentMethod } = formData;

    if (!fullname || !email || !address || !phone || !peopleCount || !destination || !paymentMethod) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const bookingPayload = {
        ...formData,
        date: selectedDate,
        paymentStatus: formData.advancePayment ? 'partially_paid' : 'unpaid',
        paymentAmount: formData.advancePayment ? parseInt(formData.advanceAmount, 10) || 0 : 0,
        guide: guideId,
      };

      const response = await bookingApi.requestBooking(bookingPayload);

      if (response.success) {
        Alert.alert('Success', 'Booking request submitted!');
        navigation.replace('BookingStatusLoader');
      } else {
        Alert.alert('Error', response.message || 'Booking failed.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Booking Details</Text>

        {loading ? (
          <ActivityIndicator size="large" color="black" />
        ) : (
          <>
            {selectedGuide && (
              <View style={styles.guideCard}>
                <Image
                  source={selectedGuide.avatar ? { uri: selectedGuide.avatar } : require('../../assets/images/Profile.png')}
                  style={styles.guideImage}
                />
                <View>
                  <Text style={styles.guideName}>{selectedGuide.fullname}</Text>
                  <Text style={styles.guideExperience}>Experience: {selectedGuide.experience}</Text>
                </View>
              </View>
            )}

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} value={formData.fullname} onChangeText={(val) => handleChange('fullname', val)} />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={formData.email} onChangeText={(val) => handleChange('email', val)} keyboardType="email-address" />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={formData.phone} onChangeText={(val) => handleChange('phone', val)} keyboardType="phone-pad" />

            <Text style={styles.label}>Address</Text>
            <TextInput style={styles.input} value={formData.address} onChangeText={(val) => handleChange('address', val)} />

            <Text style={styles.label}>Number of People</Text>
            <TextInput style={styles.input} value={formData.peopleCount} onChangeText={(val) => handleChange('peopleCount', val)} keyboardType="numeric" />

            <Text style={styles.label}>Destination</Text>
            <View style={styles.dropdown}>
              {trekkingOptions.map((trek) => (
                <TouchableOpacity
                  key={trek._id}
                  onPress={() => handleChange('destination', trek.name)}
                  style={[
                    styles.dropdownItem,
                    formData.destination === trek.name && styles.dropdownSelected,
                  ]}
                >
                  <Text style={formData.destination === trek.name ? styles.selectedText : styles.dropdownText}>
                    {trek.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentContainer}>
              {['cash', 'online'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentButton,
                    selectedPaymentMethod === method && styles.paymentButtonSelected,
                  ]}
                  onPress={() => selectPaymentMethod(method)}
                >
                  <Feather
                    name={method === 'cash' ? 'dollar-sign' : 'credit-card'}
                    size={18}
                    color={selectedPaymentMethod === method ? '#fff' : '#000'}
                  />
                  <Text style={selectedPaymentMethod === method ? styles.paymentTextSelected : styles.paymentText}>
                    {method === 'cash' ? 'Cash on Arrival' : 'Online Payment'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedPaymentMethod === 'online' && (
              <TouchableOpacity onPress={toggleAdvancePayment} style={styles.advanceBox}>
                <Feather
                  name={formData.advancePayment ? 'check-square' : 'square'}
                  size={20}
                  color={formData.advancePayment ? 'black' : '#ccc'}
                />
                <Text style={styles.advanceLabel}>Pay advance amount</Text>
              </TouchableOpacity>
            )}

            {selectedPaymentMethod === 'online' && formData.advancePayment && (
              <>
                <Text style={styles.label}>Advance Amount</Text>
                <TextInput
                  style={styles.input}
                  value={formData.advanceAmount}
                  onChangeText={(val) => handleChange('advanceAmount', val)}
                  keyboardType="numeric"
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.disabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  guideImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  guideName: { fontSize: 16, fontWeight: '600' },
  guideExperience: { fontSize: 14, color: '#666' },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 12,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  dropdownSelected: {
    backgroundColor: '#000',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    fontSize: 14,
    color: '#fff',
  },
  paymentContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 20,
  },
  paymentButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  paymentText: {
    marginLeft: 6,
    color: '#000',
    fontSize: 14,
  },
  paymentTextSelected: {
    marginLeft: 6,
    color: '#fff',
    fontSize: 14,
  },
  advanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  advanceLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default BookingDetailsForm;
