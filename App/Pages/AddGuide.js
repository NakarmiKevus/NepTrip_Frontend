import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import userApi from '../API/userApi';

const AddGuide = ({ navigation }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState('');
  const [language, setLanguage] = useState('');
  const [trekCount, setTrekCount] = useState('0');
  const [image, setImage] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (setter) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5
    });

    if (!result.canceled && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const handleAddGuide = async () => {
    if (!fullname || !email || !password) {
      return Alert.alert('Error', 'Full Name, Email, and Password are required.');
    }

    if (!image) {
      return Alert.alert('Error', 'Profile picture is required.');
    }

    if (!qrImage) {
      return Alert.alert('Error', 'QR code image is required.');
    }

    try {
      setLoading(true);

      const guideData = {
        fullname,
        email,
        password,
        role: 'guide'
      };

      const createResponse = await userApi.createGuide(guideData);
      if (!createResponse.success) throw new Error('Failed to create guide');

      const newGuideId = createResponse.user.id;

      const guideDetails = {
        phoneNumber,
        address,
        experience,
        language,
        trekCount: parseInt(trekCount) || 0
      };

      await userApi.updateGuideDetails(newGuideId, guideDetails);

      // Upload profile picture
      if (image) {
        const profileForm = new FormData();
        profileForm.append('profile', {
          uri: image,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });

        await userApi.uploadGuideProfilePicture(newGuideId, profileForm);
      }

      // Upload QR code image
      if (qrImage) {
        const qrForm = new FormData();
        qrForm.append('qr', {
          uri: qrImage,
          type: 'image/jpeg',
          name: 'qr.jpg'
        });

        await userApi.uploadGuideQrCode(newGuideId, qrForm);
      }

      Alert.alert('Success', 'Guide added successfully');
      navigation.goBack();

    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, value, setValue, icon, secure = false, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather name={icon} size={20} color="#555" style={styles.inputIcon} />
        <TextInput
          style={[
            styles.input, 
            multiline && { height: 80, textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={setValue}
          placeholder={`Enter ${label}`}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.header}>Add New Guide</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Profile Picture Section */}
            <Text style={styles.sectionLabel}>Profile Picture</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setImage)}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Feather name="camera" size={30} color="#2196F3" />
                  <Text style={styles.imageText}>Upload Profile Photo</Text>
                </View>
              )}
              {image && (
                <View style={styles.editImageBadge}>
                  <Feather name="edit-2" size={15} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* QR Code Section */}
            <Text style={styles.sectionLabel}>Payment QR Code</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={() => pickImage(setQrImage)}>
              {qrImage ? (
                <Image source={{ uri: qrImage }} style={styles.image} />
              ) : (
                <View style={styles.imagePickerContent}>
                  <Feather name="credit-card" size={30} color="#2196F3" />
                  <Text style={styles.imageText}>Upload QR Code</Text>
                </View>
              )}
              {qrImage && (
                <View style={styles.editImageBadge}>
                  <Feather name="edit-2" size={15} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {renderInput('Full Name', fullname, setFullname, 'user')}
            {renderInput('Email', email, setEmail, 'mail', false, 'email-address')}
            {renderInput('Password', password, setPassword, 'lock', true)}
            {renderInput('Phone Number', phoneNumber, setPhoneNumber, 'phone', false, 'phone-pad')}
            {renderInput('Address', address, setAddress, 'map-pin', false, 'default', true)}
            {renderInput('Experience (years)', experience, setExperience, 'briefcase', false, 'numeric')}
            {renderInput('Languages', language, setLanguage, 'globe')}
            {renderInput('Trek Count', trekCount, setTrekCount, 'map', false, 'numeric')}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddGuide}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Feather name="user-plus" size={18} color="white" style={{ marginRight: 8 }} />
                    <Text style={styles.addButtonText}>Add Guide</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    padding: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#333'
  },
  formContainer: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#333',
  },
  imagePicker: {
    alignSelf: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2196F3',
  },
  imagePickerContent: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8f4fd',
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageText: {
    color: '#2196F3',
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 5
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 1,
    marginLeft: 10,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    backgroundColor: '#f1f3f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default AddGuide;