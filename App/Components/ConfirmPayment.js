import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import bookingApi from '../API/bookingApi';

const ConfirmPayment = ({ visible, onClose, booking, onPaymentMarked }) => {
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) setRating('');
  }, [visible]);

  const handleSubmit = async () => {
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) {
      Alert.alert('Error', 'Please select a rating between 1 and 5');
      return;
    }

    setLoading(true);
    try {
      const res = await bookingApi.markUserPaymentConfirmed(booking._id, { rating: parseFloat(rating) });
      if (res.success) {
        Alert.alert('Success', 'Payment and rating submitted');
        onPaymentMarked?.();
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () =>
    [1, 2, 3, 4, 5].map((val) => (
      <TouchableOpacity key={val} onPress={() => setRating(val.toString())}>
        <Feather
          name="star"
          size={28}
          color={parseFloat(rating) >= val ? '#FFD700' : '#ccc'}
          style={styles.star}
        />
      </TouchableOpacity>
    ));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Confirm Your Payment</Text>

          {booking?.guide?.qrCode ? (
            <Image source={{ uri: booking.guide.qrCode }} style={styles.qr} resizeMode="contain" />
          ) : (
            <Text style={styles.noQr}>QR code not available</Text>
          )}

          <Text style={styles.subTitle}>Rate Your Experience</Text>
          <View style={styles.starRow}>{renderStars()}</View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, !rating && styles.disabled]}
              onPress={handleSubmit}
              disabled={loading || !rating}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Mark as Paid</Text>
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
  container: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  qr: {
    width: 180,
    height: 180,
    alignSelf: 'center',
    marginBottom: 15
  },
  noQr: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 15
  },
  subTitle: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15
  },
  star: {
    marginHorizontal: 5
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center'
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center'
  },
  disabled: {
    backgroundColor: '#a0d0f7'
  },
  cancelText: {
    color: '#333',
    fontWeight: '600'
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});
