import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import userApi from '../API/userApi';

const GuideScreen = () => {
  const navigation = useNavigation();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      const data = await userApi.getGuides();
      if (data.success && data.guides?.length > 0) {
        setGuide(data.guides[0]); // Fetch first guide
      } else {
        Alert.alert('Error', 'No guide found.');
      }
    } catch (error) {
      console.log('Error fetching guide:', error);
      Alert.alert('Error', 'Failed to load guide details.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = () => {
    navigation.navigate('ConfirmBooking');
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loaderText}>Loading guide details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {guide ? (
        <>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            {/* Guide Image */}
            <Image
              source={
                guide.avatar
                  ? { uri: guide.avatar }
                  : require('../../assets/images/Profile.png')
              }
              style={styles.avatar}
            />

            {/* Guide Name */}
            <Text style={styles.name}>{guide.fullname}</Text>
            {/* <Text style={styles.subText}>{guide.fullname}</Text> */}

            {/* Star Rating */}
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, index) => (
                <Feather key={index} name="star" size={20} color="black" />
              ))}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Details Section */}
          <View style={styles.detailsSection}>
            {renderInfoField('Email', guide.email)}
            {renderInfoField('Phone Number', guide.phone)}
            {renderInfoField('Address', guide.address)}
            {renderInfoField('Language', guide.language)}
            {renderInfoField('Experience', guide.experience)}

            {/* Book Button */}
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

// Function to render greyed-out input fields
const renderInfoField = (label, value) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputBox}>
      <Text style={styles.inputText}>{value || 'N/A'}</Text>
    </View>
  </>
);

export default GuideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingTop:100,
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
  subText: {
    fontSize: 14,
    color: '#777',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  detailsSection: {
    width: '90%',
  },
  label: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
    marginBottom: 4,
  },
  inputBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
  },
  bookButton: {
    width: '100%',
    backgroundColor: 'black',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
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
