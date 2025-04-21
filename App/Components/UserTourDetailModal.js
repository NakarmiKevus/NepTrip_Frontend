import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const UserTourDetailModal = ({ visible, onClose, booking }) => {
  if (!booking) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'declined': return '#F44336';
      default: return '#999';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FFA500';
      case 'failed': return '#F44336';
      default: return '#999';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <Animated.View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Tour Details</Text>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
                <Text style={styles.statusText}>{booking.status?.toUpperCase() || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.card}>
                <DetailItem 
                  icon="user" 
                  label="Full Name" 
                  value={booking.fullname} 
                />
                <DetailItem 
                  icon="mail" 
                  label="Email" 
                  value={booking.email} 
                />
                <DetailItem 
                  icon="phone" 
                  label="Phone" 
                  value={booking.phone} 
                  isLast
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tour Information</Text>
              <View style={styles.card}>
                <DetailItem 
                  icon="map-pin" 
                  label="Destination" 
                  value={booking.destination} 
                />
                <DetailItem 
                  icon="calendar" 
                  label="Date" 
                  value={booking.date} 
                />
                <DetailItem 
                  icon="users" 
                  label="People" 
                  value={booking.peopleCount?.toString() || '0'} 
                  isLast
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.card}>
                <DetailItem 
                  icon="credit-card" 
                  label="Payment Method" 
                  value={booking.paymentMethod || 'Not specified'} 
                />
                <DetailItem 
                  icon="dollar-sign" 
                  label="Payment Status" 
                  value={booking.paymentStatus || 'Not specified'} 
                  valueColor={getPaymentStatusColor(booking.paymentStatus)}
                  isLast
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Booking Information</Text>
              <View style={styles.card}>
                <DetailItem 
                  icon="hash" 
                  label="Booking ID" 
                  value={booking._id} 
                  isLast
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const DetailItem = ({ icon, label, value, valueColor, isLast }) => (
  <View style={[styles.detailRow, !isLast && styles.borderBottom]}>
    <View style={styles.iconContainer}>
      <Feather name={icon} size={18} color="#555" />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor, fontWeight: '600' }]}>
        {value || 'N/A'}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  scrollView: {
    maxHeight: '75%',
  },
  scrollContent: {
    padding: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    paddingLeft: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserTourDetailModal;