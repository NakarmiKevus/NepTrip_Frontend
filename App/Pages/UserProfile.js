import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

const UserProfile = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    avatar: "",
    phoneNumber: "",
    address: "",
    // Stats (could be fetched from separate endpoints)
    treks: 0,
    guides: 0,
    reviews: 0,
  });

  // Fetch user profile data from the backend
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Try to get user from AsyncStorage first
      const userJSON = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      
      if (userJSON && token) {
        // If we have user data cached, show it immediately
        const userData = JSON.parse(userJSON);
        setUser({
          ...user,
          fullname: userData.fullname,
          email: userData.email,
          avatar: userData.avatar && userData.avatar !== '' ? userData.avatar : 'https://via.placeholder.com/150',
        });
        
        // Then try to get fresh data from the API
        try {
          const response = await client.get('/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.success) {
            // Update user state with the latest data
            setUser({
              ...user,
              fullname: response.data.user.fullname,
              email: response.data.user.email,
              avatar: response.data.user.avatar && response.data.user.avatar !== '' 
                ? response.data.user.avatar 
                : 'https://via.placeholder.com/150',
              phoneNumber: response.data.user.phoneNumber || '',
              address: response.data.user.address || '',
              treks: response.data.user.treks || 0,
              guides: response.data.user.guides || 0,
              reviews: response.data.user.reviews || 0,
            });
            
            // Also update the cached user data
            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
          }
        } catch (apiError) {
          console.log('Could not fetch fresh profile data:', apiError);
          // Continue showing cached data, don't show error
        }
      } else {
        // If no token or user data in AsyncStorage, redirect to login
        Alert.alert('Session Expired', 'Please login again', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to landing page
              navigation.reset({
                index: 0,
                routes: [{ name: 'AppForm' }], // Change to your actual landing screen name
              });
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show alert here, just finish loading
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      // Reset navigation stack and go to landing page (AppForm)
      navigation.reset({
        index: 0,
        routes: [{ name: 'AppForm' }], // Navigate to the landing page
      });
      
      Alert.alert('Logged Out', 'You have been successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Edit profile navigation
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchUserProfile();
    
    // Add navigation listener to refresh data when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProfile();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loaderText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image 
            source={user.avatar && user.avatar !== '' ? { uri: user.avatar } : { uri: 'https://via.placeholder.com/150' }} 
            style={styles.avatar} 
          />
          <Text style={styles.name}>{user.fullname}</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.treks}</Text>
            <Text style={styles.statLabel}>Treks</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.guides}</Text>
            <Text style={styles.statLabel}>Guides</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <View style={styles.personalInfoContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="user" size={20} color="#666" />
              <Text style={styles.infoLabel}>Full Name</Text>
            </View>
            <Text style={styles.infoValue}>{user.fullname}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="mail" size={20} color="#666" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="phone" size={20} color="#666" />
              <Text style={styles.infoLabel}>Phone Number</Text>
            </View>
            <Text style={styles.infoValue}>{user.phoneNumber || 'Not provided'}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="map-pin" size={20} color="#666" />
              <Text style={styles.infoLabel}>Address</Text>
            </View>
            <Text style={styles.infoValue}>{user.address || 'Not provided'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  personalInfoContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoItem: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  logoutButton: {
    marginTop: 20,
    backgroundColor: 'black',
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserProfile;