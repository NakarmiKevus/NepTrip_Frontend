import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import bookingApi from '../API/bookingApi';
import { Feather } from '@expo/vector-icons';

const ConfirmPayment = ({ visible, onClose, booking, onPaymentMarked }) => {
  const [rating, setRating] = useState('');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMarkAsPaid = async () => {
    try {
      if (!booking || !booking._id) {
        Alert.alert('Error', 'Booking ID is missing');
        return;
      }

      setLoading(true);

      const response = await bookingApi.markUserPaymentConfirmed(booking._id);
      if (response.success) {
        Alert.alert('Success', 'Payment marked as done.');
        onPaymentMarked(); // ✅ properly named function
        onClose(); // Close modal
      } else {
        throw new Error(response.message || 'Failed to confirm payment');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Confirm Your Payment</Text>

          {booking?.guide?.qrCode ? (
            <Image source={{ uri: booking.guide.qrCode }} style={styles.qrImage} />
          ) : (
            <Text style={styles.noQr}>No QR code available</Text>
          )}

          <Text style={styles.subTitle}>Rate Your Experience</Text>
          <TextInput
            placeholder="Rating (e.g. 4.5)"
            value={rating}
            onChangeText={setRating}
            keyboardType="decimal-pad"
            style={styles.input}
          />

          <TextInput
            placeholder="Write a short review"
            value={review}
            onChangeText={setReview}
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.payBtn}
              onPress={handleMarkAsPaid}
              disabled={loading}
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
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 5
  },
  qrImage: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 10
  },
  noQr: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 15
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    marginBottom: 10
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
  cancelText: {
    color: '#333',
    fontWeight: '600'
  },
  payText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
