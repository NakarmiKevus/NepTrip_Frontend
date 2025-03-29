import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import userApi from '../API/userApi';
import bookingApi from '../API/bookingApi';

const GuideScreen = () => {
  const navigation = useNavigation();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      checkBookingAndRedirect();
    }, [])
  );

  const checkBookingAndRedirect = async () => {
    try {
      const response = await bookingApi.getLatestBooking();
      if (response.success && response.booking) {
        // Only check if booking exists
        if (response.booking.status === 'pending' || response.booking.status === 'accepted') {
          navigation.replace('BookingStatusLoader');
          return;
        }
      }
      fetchGuide(); // If no redirect, fetch guide normally
    } catch (error) {
      console.log('Error checking booking:', error);
      fetchGuide();
    }
  };

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const data = await userApi.getGuides();
      if (data.success && data.guides?.length > 0) {
        setGuide(data.guides[0]);
      } else {
        Alert.alert('Error', 'No guide found.');
      }
    } catch (error) {
      console.log('Error fetching guide:', error);
      Alert.alert('Error', 'Failed to load guide details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookPress = () => {
    navigation.navigate('ConfirmBooking');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuide();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loaderText}>Loading guide details...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {guide ? (
        <>
          <View style={styles.profileSection}>
            <Image
              source={guide.avatar ? { uri: guide.avatar } : require('../../assets/images/Profile.png')}
              style={styles.avatar}
            />
            <Text style={styles.name}>{guide.fullname}</Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <Feather key={index} name="star" size={20} color="black" />
              ))}
            </View>
            <View style={styles.trekCountContainer}>
              <Feather name="map" size={16} color="white" />
              <Text style={styles.trekCountText}>
                {guide.trekCount || 0} treks completed
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.personalInfoContainer}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderInfoField('user', 'Full Name', guide.fullname)}
            {renderInfoField('mail', 'Email', guide.email)}
            {renderInfoField('phone', 'Phone Number', guide.phoneNumber)}
            {renderInfoField('map-pin', 'Address', guide.address)}
            {renderInfoField('globe', 'Language', guide.language)}
            {renderInfoField('briefcase', 'Experience', guide.experience)}
            {renderInfoField('map', 'Number of Treks', guide.trekCount || '0')}
            <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.noGuideText}>No guide found.</Text>
      )}
    </ScrollView>
  );
};

const renderInfoField = (iconName, label, value) => (
  <View style={styles.infoItem}>
    <View style={styles.infoHeader}>
      <Feather name={iconName} size={20} color="#666" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

export default GuideScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    marginBottom: 10,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trekCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 5,
  },
  trekCountText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  personalInfoContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginLeft: 30,
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: 'black',
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noGuideText: {
    fontSize: 16,
    marginTop: 20,
    color: '#666',
    textAlign: 'center',
  },
});