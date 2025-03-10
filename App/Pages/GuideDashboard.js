import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet
} from 'react-native';
import bookingApi from '../API/bookingApi';

const GuideDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      setLoading(true);
      const data = await bookingApi.getBookingRequests();
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.log('Error fetching requests:', error);
      Alert.alert('Error', 'An error occurred while fetching booking requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (bookingId, status) => {
    try {
      const data = await bookingApi.respondToBooking(bookingId, status);
      if (data.success) {
        Alert.alert('Success', data.message);
        // Remove or update the booking in local state
        setRequests((prev) => prev.filter((req) => req._id !== bookingId));
      } else {
        Alert.alert('Error', data.message || 'Failed to update booking');
      }
    } catch (error) {
      console.log('Error responding to booking:', error);
      Alert.alert('Error', 'An error occurred while responding to the booking');
    }
  };

  const renderRequestItem = ({ item }) => (
    <View style={styles.requestItem}>
      <Text>User: {item.user?.fullname}</Text>
      <Text>Email: {item.user?.email}</Text>
      <Text>Date: {item.date}</Text>
      <View style={styles.buttonRow}>
        <Button
          title="Accept"
          onPress={() => handleRespond(item._id, 'accepted')}
        />
        <View style={{ width: 16 }} />
        <Button
          title="Decline"
          onPress={() => handleRespond(item._id, 'declined')}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guide Dashboard</Text>
      {requests.length === 0 ? (
        <Text>No pending requests.</Text>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item._id}
          renderItem={renderRequestItem}
        />
      )}
    </View>
  );
};

export default GuideDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  requestItem: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
});
