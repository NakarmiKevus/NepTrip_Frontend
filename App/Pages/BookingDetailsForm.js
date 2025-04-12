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
import { useNavigation, useRoute } from '@react-navigation/native';

const BookingDetailsForm = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedDate, guideId } = route.params;

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    address: '',
    phone: '',
    peopleCount: '',
    destination: '',
    paymentMethod: '', // Added payment method field
    advancePayment: false, // Whether user will pay advance
    advanceAmount: '0', // Amount for advance payment
    guide: guideId, // Add the guide ID to the booking
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  // Payment method options - simplified to just online and cash
  const paymentMethods = [
    { id: 'cash', name: 'Cash on Arrival', icon: 'dollar-sign' },
    { id: 'online', name: 'Online Payment', icon: 'credit-card' },
  ];

  useEffect(() => {
    const checkBooking = async () => {
      try {
        const response = await bookingApi.getLatestBooking();
        if (response.success && response.booking && response.booking.status !== 'completed') {
          navigation.replace('BookingStatusLoader');
        } else {
          // Fetch guide details if we have a guideId
          if (guideId) {
            fetchGuideDetails();
          }
        }
      } catch (error) {
        console.log('No ongoing booking:', error);
        // Fetch guide details if we have a guideId
        if (guideId) {
          fetchGuideDetails();
        } else {
          setLoading(false);
        }
      }
    };
    checkBooking();
  }, []);

  const fetchGuideDetails = async () => {
    try {
      setLoading(true);
      const response = await userApi.getGuideProfile(guideId);
      if (response.success) {
        setSelectedGuide(response.guide);
      } else {
        Alert.alert('Error', 'Could not fetch guide details.');
      }
    } catch (error) {
      console.error('Error fetching guide details:', error);
      Alert.alert('Error', 'Failed to load guide information.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const selectPaymentMethod = (methodId) => {
    setSelectedPaymentMethod(methodId);
    setFormData({ 
      ...formData, 
      paymentMethod: methodId,
      // Reset advance payment if switching to cash
      advancePayment: methodId === 'cash' ? false : formData.advancePayment,
      advanceAmount: methodId === 'cash' ? '0' : formData.advanceAmount
    });
  };
  
  const toggleAdvancePayment = () => {
    setFormData({ 
      ...formData, 
      advancePayment: !formData.advancePayment,
      advanceAmount: !formData.advancePayment ? '500' : '0'
    });
  };

  const handleSubmit = async () => {
    const { fullname, email, address, phone, peopleCount, destination, paymentMethod } = formData;

    if (!fullname || !email || !address || !phone || !peopleCount || !destination) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method.');
      return;
    }

    try {
      setIsSubmitting(true);
      const bookingPayload = {
        ...formData,
        date: selectedDate,
        paymentStatus: formData.advancePayment ? 'partially_paid' : 'unpaid',
        paymentAmount: formData.advancePayment ? parseInt(formData.advanceAmount, 10) || 0 : 0,
        guide: guideId // Ensure the guide ID is included in the request
      };
      
      const response = await bookingApi.requestBooking(bookingPayload);

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading guide information...</Text>
          </View>
        ) : (
          <>
            {/* Guide Info Card */}
            {selectedGuide && (
              <View style={styles.guideInfoCard}>
                <View style={styles.guideInfoHeader}>
                  <Image 
                    source={selectedGuide.avatar ? { uri: selectedGuide.avatar } : require('../../assets/images/Profile.png')} 
                    style={styles.guideAvatar} 
                  />
                  <View style={styles.guideInfoTextContainer}>
                    <Text style={styles.guideName}>{selectedGuide.fullname}</Text>
                    <Text style={styles.guideDetail}>Experience: {selectedGuide.experience || 'N/A'}</Text>
                  </View>
                </View>
              </View>
            )}

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

              {/* Payment Method Section */}
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <Text style={styles.paymentNote}>Please select your preferred payment method:</Text>
              
              <View style={styles.paymentMethodsContainer}>
                {paymentMethods.map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      selectedPaymentMethod === method.id && styles.selectedPaymentMethod
                    ]}
                    onPress={() => selectPaymentMethod(method.id)}
                  >
                    <Feather 
                      name={method.icon} 
                      size={24} 
                      color={selectedPaymentMethod === method.id ? '#fff' : '#333'} 
                    />
                    <Text 
                      style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.id && styles.selectedPaymentMethodText
                      ]}
                    >
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Advance Payment Option - only show for online payments */}
              {selectedPaymentMethod === 'online' && (
                <TouchableOpacity 
                  style={styles.advancePaymentContainer}
                  onPress={toggleAdvancePayment}
                >
                  <View style={styles.checkboxContainer}>
                    <View style={[styles.checkbox, formData.advancePayment && styles.checkboxSelected]}>
                      {formData.advancePayment && <Feather name="check" size={16} color="#fff" />}
                    </View>
                    <Text style={styles.advancePaymentText}>Pay advance amount</Text>
                  </View>
                  
                  {formData.advancePayment && (
                    <View style={styles.advanceAmountContainer}>
                      <Text style={styles.advanceAmountLabel}>Advance Amount (₹):</Text>
                      <TextInput
                        style={styles.advanceAmountInput}
                        value={formData.advanceAmount}
                        onChangeText={(val) => handleChange('advanceAmount', val)}
                        keyboardType="numeric"
                        placeholder="Enter amount"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )}
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
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  guideInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  guideInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guideAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  guideInfoTextContainer: {
    flex: 1,
  },
  guideName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guideDetail: {
    fontSize: 14,
    color: '#666',
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
  // Payment Method Styles
  paymentNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  paymentMethodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paymentMethod: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedPaymentMethod: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  paymentMethodText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
    color: '#333',
  },
  selectedPaymentMethodText: {
    color: '#fff',
  },
  // Advance Payment Styles
  advancePaymentContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  advancePaymentText: {
    fontSize: 16,
    color: '#333',
  },
  advanceAmountContainer: {
    marginTop: 15,
  },
  advanceAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  advanceAmountInput: {
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