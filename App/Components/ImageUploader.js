import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import client from '../API/client';

const ImageUploader = ({ route, navigation }) => {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const token = route.params?.token;

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to upload your profile picture.', [{ text: 'OK' }]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      await requestPermission();
      return;
    }

    try {
      const response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!response.canceled && response.assets?.[0]?.uri) {
        setImage(response.assets[0].uri);
        setProgress(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadProfileImage = async () => {
    if (!image || isUploading) return;

    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('profile', {
      name: `profile_${Date.now()}.jpg`,
      uri: image,
      type: 'image/jpeg',
    });

    try {
      const res = await client.post('/upload-profile', formData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      if (res.data.success) {
        Alert.alert('Success', 'Profile image uploaded successfully!', [
          { text: 'OK', onPress: () => navigation.replace('Dashboard', { user: res.data.user }) },
        ]);
      } else {
        Alert.alert('Upload Failed', res.data.message || 'Failed to upload image');
      }
    } catch (error) {
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = async () => {
    try {
      const token = route.params?.token;
  
      // ✅ Ensure the token is stored
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
  
      navigation.replace('Dashboard');
    } catch (error) {
      console.error('Error handling skip:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.uploadButtonContainer} disabled={isUploading}>
        {image ? (
          <Image source={{ uri: image }} style={styles.profileImage} resizeMode="cover" />
        ) : (
          <Text style={styles.uploadButtonText}>Upload your Profile Picture</Text>
        )}
      </TouchableOpacity>

      {progress > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{`Uploading: ${progress}%`}</Text>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        {image && (
          <TouchableOpacity
            onPress={uploadProfileImage}
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            disabled={isUploading}
          >
            <Text style={styles.uploadButtonLabel}>{isUploading ? 'Uploading...' : 'Upload'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} disabled={isUploading}>
          <Text style={[styles.skipButtonText, isUploading && styles.skipButtonDisabled]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  uploadButtonContainer: {
    height: 170,
    width: 170,
    borderRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#555',
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#f5f5f5',
  },
  uploadButtonText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.5,
    fontWeight: 'bold',
    padding: 10,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 85,
  },
  progressContainer: {
    width: '80%',
    marginVertical: 10,
  },
  progressText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  uploadButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 15,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  skipButtonDisabled: {
    opacity: 0.5,
  },
});

export default ImageUploader;