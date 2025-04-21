import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import bookingApi from '../API/bookingApi';
import { Feather } from '@expo/vector-icons';

const ConfirmPayment = ({ visible, onClose, booking, onPaymentMarked }) => {
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [localQrCode, setLocalQrCode] = useState(null);
  const ratingRef = useRef('');
  const initialRenderDone = useRef(false);
  
  // Log booking object to debug QR code
  useEffect(() => {
    if (booking) {
      console.log("Booking guide data:", booking.guide);
      console.log("QR Code URL:", booking.guide?.qrCode);
    }
  }, [booking]);
  
  // Store QR code when component mounts or booking changes
  useEffect(() => {
    if (booking?.guide?.qrCode) {
      console.log("Setting QR code:", booking.guide.qrCode);
      setLocalQrCode(booking.guide.qrCode);
    }
    
    // Reset rating only when modal first opens
    if (visible && !initialRenderDone.current) {
      setRating('');
      initialRenderDone.current = true;
    } else if (!visible) {
      // Reset flag when modal closes
      initialRenderDone.current = false;
    }
  }, [booking, visible]);

  const handleStarPress = (value) => {
    console.log(`Star pressed: ${value}`);
    setRating(value.toString());
    ratingRef.current = value.toString(); // Store in ref to persist between renders
  };

  const handleMarkAsPaid = async () => {
    try {
      if (!booking || !booking._id) {
        Alert.alert('Error', 'Booking ID is missing');
        return;
      }

      // Use rating from ref as a backup
      const currentRating = rating || ratingRef.current;

      if (!currentRating || isNaN(parseFloat(currentRating)) || parseFloat(currentRating) < 0 || parseFloat(currentRating) > 5) {
        Alert.alert('Error', 'Please select a rating by tapping on the stars');
        return;
      }

      setLoading(true);
      
      const ratingValue = parseFloat(currentRating);
      console.log(`Submitting rating: ${ratingValue} for booking: ${booking._id}`);

      const response = await bookingApi.markUserPaymentConfirmed(booking._id, {
        rating: ratingValue,
      });

      console.log('Payment confirmation response:', response);

      if (response.success) {
        Alert.alert('Success', 'Payment marked as done and rating submitted.');
        if (onPaymentMarked) {
          onPaymentMarked();
        }
      } else {
        throw new Error(response.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error in handleMarkAsPaid:', error);
      Alert.alert('Error', error.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  // Use either state or ref for current rating
  const displayRating = rating || ratingRef.current;

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity 
            key={star} 
            onPress={() => handleStarPress(star)}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Feather 
              name="star" 
              size={30} 
              color={parseFloat(displayRating) >= star ? '#FFD700' : '#ccc'} 
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Confirm Your Payment</Text>

          {localQrCode ? (
            <View style={styles.qrContainer}>
              <Image 
                source={{ uri: localQrCode }} 
                style={styles.qrImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={styles.qrPlaceholder}>
              <Text style={styles.noQr}>No QR code available</Text>
            </View>
          )}

          <Text style={styles.subTitle}>Rate Your Experience</Text>
          <Text style={styles.ratingLabel}>
            Selected rating: {displayRating ? `${displayRating}/5` : 'None'}
          </Text>
          {renderStars()}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.payBtn,
                !displayRating && styles.disabledBtn
              ]}
              onPress={handleMarkAsPaid}
              disabled={!displayRating || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="white" style={{ marginRight: 6 }} />
                  <Text style={styles.payText}>Mark as Paid</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmPayment;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%'
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  qrContainer: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center'
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5
  },
  noQr: {
    textAlign: 'center',
    color: '#888',
    padding: 10
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  cancelBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
    alignItems: 'center'
  },
  payBtn: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledBtn: {
    backgroundColor: '#a0d0f7',
    opacity: 0.7
  },
  cancelText: {
    color: '#333',
    fontWeight: '600'
  },
  payText: {
    color: 'white',
    fontWeight: 'bold'
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  starButton: {
    padding: 10, // Larger touch area
  },
  starIcon: {
    marginHorizontal: 5
  }
});