import React from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import userApi from '../API/userApi'; // Import the API for uploading QR images

const GuideEditModal = ({
  visible,
  onClose,
  guide,
  experience,
  language,
  trekCount,
  setExperience,
  setLanguage,
  setTrekCount,
  qrImage,
  setQrImage,
  onUpdateGuide,
  updateLoading,
}) => {
  const pickQrImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets.length > 0) {
      setQrImage(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      if (!qrImage) {
        Alert.alert('Error', 'Please upload a QR image.');
        return;
      }

      // Upload the QR image if it has been updated
      if (qrImage.startsWith('file://')) {
        const formData = new FormData();
        formData.append('qr', {
          uri: qrImage,
          type: 'image/jpeg',
          name: 'qr.jpg',
        });

        const response = await userApi.uploadGuideQrCode(guide._id, formData);
        if (!response.success) {
          throw new Error('Failed to upload QR image.');
        }

        // Update the guide's QR code URL after successful upload
        setQrImage(response.qrCodeUrl); // Assuming the backend returns the updated QR code URL
      }

      // Call the onUpdateGuide function to save other details
      onUpdateGuide();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save changes.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Edit Guide Details</Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.guideName}>Guide: {guide?.fullname}</Text>

            {/* Experience */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Experience:</Text>
              <TextInput
                placeholder="e.g. 5 years"
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
              />
            </View>

            {/* Language */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Languages:</Text>
              <TextInput
                placeholder="e.g. English, Nepali"
                style={styles.input}
                value={language}
                onChangeText={setLanguage}
              />
            </View>

            {/* Trek Count */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Trek Count:</Text>
              <TextInput
                placeholder="e.g. 10"
                keyboardType="numeric"
                style={styles.input}
                value={trekCount}
                onChangeText={setTrekCount}
              />
            </View>

            {/* QR Code Image */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>QR Code:</Text>
              <TouchableOpacity onPress={pickQrImage} style={styles.qrContainer}>
                {qrImage ? (
                  <Image source={{ uri: qrImage }} style={styles.qrImage} />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Feather name="image" size={24} color="#999" />
                    <Text style={{ color: '#999', marginTop: 5 }}>Upload QR</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={updateLoading}>
              {updateLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GuideEditModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  guideName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  qrContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
  },
  qrImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelBtn: {
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  saveBtn: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  cancelText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  saveText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
