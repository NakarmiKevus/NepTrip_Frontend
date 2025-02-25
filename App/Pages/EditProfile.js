import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

const EditProfile = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [userData, setUserData] = useState({
    fullname: '',
    email: '',
    avatar: '',
    phoneNumber: '',
    address: '',
  });

  // Fetch current user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Session Expired', 'Please login again');
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppForm' }],
        });
        return;
      }
      
      const response = await client.get('/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        const user = response.data.user;
        setUserData({
          fullname: user.fullname || '',
          email: user.email || '',
          avatar: user.avatar || '',
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
        });
        
        if (user.avatar) {
          setImage(user.avatar);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      
      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppForm' }],
        });
      } else {
        Alert.alert('Error', 'Failed to fetch profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
        setImageChanged(true);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate inputs
      if (!userData.fullname.trim()) {
        Alert.alert('Error', 'Full name is required');
        setSaving(false);
        return;
      }
      
      if (!userData.email.trim() || !userData.email.includes('@')) {
        Alert.alert('Error', 'Valid email is required');
        setSaving(false);
        return;
      }
      
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const formData = new FormData();
      formData.append('fullname', userData.fullname);
      formData.append('email', userData.email);
      formData.append('phoneNumber', userData.phoneNumber || '');
      formData.append('address', userData.address || '');
      
      // Add image if it was changed
      if (imageChanged && image) {
        formData.append('profile', {
          name: `profile_${Date.now()}.jpg`,
          uri: image,
          type: 'image/jpeg',
        });
      }
      
      // Update profile
      const response = await client.put('/update-profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });
      
      if (response.data.success) {
        // Update stored user data
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
        
        Alert.alert(
          'Success', 
          'Profile updated successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading profile data...</Text> 
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} /> {/* Empty view for even spacing */}
        </View>
        
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={40} color="#888" />
            </View>
          )}
          <View style={styles.editIconContainer}>
            <Feather name="edit-2" size={15} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={userData.fullname}
              onChangeText={(text) => setUserData({ ...userData, fullname: text })}
              placeholder="Enter your full name"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={userData.phoneNumber}
              onChangeText={(text) => setUserData({ ...userData, phoneNumber: text })}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, styles.addressInput]}
              value={userData.address}
              onChangeText={(text) => setUserData({ ...userData, address: text })}
              placeholder="Enter your address"
              multiline={true}
              numberOfLines={3}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#000',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;