import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar, 
  Modal, 
  ScrollView, 
  ActivityIndicator, 
  StyleSheet,
  Alert,
  Image,
  TextInput,
  Platform,
  RefreshControl
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons'; // Add this import for the search icon
import client from '../API/client';
import userApi from '../API/userApi';

const getInitials = (name) => {
  if (!name) return '??';
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getRandomColor = (name) => {
  const colors = [
    '#3498db', // blue
    '#2ecc71', // green
    '#9b59b6', // purple
    '#e74c3c', // red
    '#f39c12', // orange
    '#1abc9c', // teal
    '#34495e', // dark blue
  ];
  
  // Use the first character of the name to determine a consistent color
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const GuideDatabase = ({ route, navigation }) => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addGuideModalVisible, setAddGuideModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [addGuideLoading, setAddGuideLoading] = useState(false);
  
  // Edit form state for guide-specific fields
  const [editExperience, setEditExperience] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editTrekCount, setEditTrekCount] = useState('');
  const [editImage, setEditImage] = useState(null);

  // Add guide form state
  const [newFullname, setNewFullname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newExperience, setNewExperience] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newTrekCount, setNewTrekCount] = useState('0');
  const [newImage, setNewImage] = useState(null);

  useEffect(() => {
    fetchGuides();
    
    // Request permission for image picker
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Sorry, we need camera roll permissions to upload profile images.');
        }
      }
    })();
  }, []);

  // Use guides passed via route params if available, otherwise fetch them
  useEffect(() => {
    if (route?.params?.guides) {
      setGuides(route.params.guides);
      setFilteredGuides(route.params.guides);
      setLoading(false);
    }
  }, [route?.params?.guides]);

  // Filter guides when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredGuides(guides);
    } else {
      const filtered = guides.filter(guide => 
        guide.fullname.toLowerCase().includes(searchText.toLowerCase()) ||
        guide.email.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredGuides(filtered);
    }
  }, [searchText, guides]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGuides();
    setRefreshing(false);
  };

  const fetchGuides = async () => {
    try {
      if (!refreshing) setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await client.get('/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter guides from all users
        const guideList = response.data.users.filter(user => user.role === 'guide');
        setGuides(guideList);
        setFilteredGuides(guideList);
      } else {
        throw new Error(response.data.message || 'Failed to fetch guides');
      }

      setError(null);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError(err.message || 'Failed to fetch guides data');
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const handleGuidePress = (guide) => {
    setSelectedGuide(guide);
    setDetailModalVisible(true);
  };

  const handleEditPress = () => {
    // Populate edit form with current guide data
    setEditExperience(selectedGuide.experience || '');
    setEditLanguage(selectedGuide.language || '');
    setEditTrekCount(selectedGuide.trekCount ? selectedGuide.trekCount.toString() : '0');
    setEditImage(null);
    
    // Close detail modal and open edit modal
    setDetailModalVisible(false);
    setEditModalVisible(true);
  };

  const handleUpdateGuide = async () => {
    try {
      setUpdateLoading(true);
      
      // Create update data object with only guide-specific fields
      const updateData = {
        experience: editExperience,
        language: editLanguage,
        trekCount: editTrekCount
      };

      let updatedGuide;
      
      // If image was selected, upload it first
      if (editImage) {
        const formData = new FormData();
        formData.append('profile', {
          uri: editImage,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });
        
        // Upload image
        const imageResponse = await userApi.uploadGuideProfilePicture(selectedGuide._id, formData);
        
        if (imageResponse.success) {
          // Image upload successful, update guide details
          const response = await userApi.updateGuideDetails(selectedGuide._id, updateData);
          
          if (response.success) {
            updatedGuide = response.guide;
            // Update avatar from image upload response
            updatedGuide.avatar = imageResponse.imageUrl;
          } else {
            throw new Error(response.message || 'Failed to update guide');
          }
        } else {
          throw new Error(imageResponse.message || 'Failed to upload image');
        }
      } else {
        // No image, just update guide details
        const response = await userApi.updateGuideDetails(selectedGuide._id, updateData);
        
        if (response.success) {
          updatedGuide = response.guide;
        } else {
          throw new Error(response.message || 'Failed to update guide');
        }
      }
      
      // Update the guides list with the updated guide
      setGuides(prevGuides => 
        prevGuides.map(guide => 
          guide._id === updatedGuide._id ? updatedGuide : guide
        )
      );
      
      // Close the edit modal
      setEditModalVisible(false);
      
      // Update the selected guide for detail view
      setSelectedGuide(updatedGuide);
      setDetailModalVisible(true);
      
      // Show success message
      Alert.alert("Success", "Guide information updated successfully");
    } catch (err) {
      console.error('❌ Update Error:', err);
      Alert.alert("Error", err.message || 'Failed to update guide');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddGuide = async () => {
    try {
      // Validate form
      if (!newFullname || !newEmail || !newPassword) {
        return Alert.alert("Error", "Name, email and password are required");
      }
      
      setAddGuideLoading(true);
      
      // Step 1: Create the guide
      const guideData = {
        fullname: newFullname,
        email: newEmail,
        password: newPassword,
        role: 'guide'
      };
      
      const createResponse = await userApi.createGuide(guideData);
      
      if (!createResponse.success) {
        throw new Error(createResponse.message || 'Failed to create guide');
      }
      
      const newGuideId = createResponse.user.id;
      
      // Step 2: Update guide details
      const guideDetails = {
        phoneNumber: newPhoneNumber,
        address: newAddress,
        experience: newExperience,
        language: newLanguage,
        trekCount: parseInt(newTrekCount) || 0
      };
      
      await userApi.updateGuideDetails(newGuideId, guideDetails);
      
      // Step 3: Upload image if selected
      if (newImage) {
        const formData = new FormData();
        formData.append('profile', {
          uri: newImage,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });
        
        await userApi.uploadGuideProfilePicture(newGuideId, formData);
      }
      
      // Refresh guides list
      await fetchGuides();
      
      // Reset form
      setNewFullname('');
      setNewEmail('');
      setNewPassword('');
      setNewPhoneNumber('');
      setNewAddress('');
      setNewExperience('');
      setNewLanguage('');
      setNewTrekCount('0');
      setNewImage(null);
      
      // Close modal
      setAddGuideModalVisible(false);
      
      // Show success message
      Alert.alert("Success", "Guide added successfully");
    } catch (err) {
      console.error('❌ Add Guide Error:', err);
      Alert.alert("Error", err.message || 'Failed to add guide');
    } finally {
      setAddGuideLoading(false);
    }
  };

  const handleDeleteGuide = async () => {
    if (!selectedGuide) return;
    
    Alert.alert(
      "Delete Guide",
      `Are you sure you want to delete ${selectedGuide.fullname}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setDeleteLoading(true);
              const token = await AsyncStorage.getItem('token');
              if (!token) throw new Error('No authentication token found');
              
              const response = await client.delete(`/delete-user/${selectedGuide._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (response.data.success) {
                setDetailModalVisible(false);
                setGuides(prevGuides => prevGuides.filter(guide => guide._id !== selectedGuide._id));
                Alert.alert("Success", "Guide deleted successfully");
              } else {
                throw new Error(response.data.message || 'Failed to delete guide');
              }
            } catch (err) {
              console.error('❌ Delete Error:', err);
              Alert.alert("Error", err.message || 'Failed to delete guide');
            } finally {
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  const pickImage = async (setImageFunction) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageFunction(result.assets[0].uri);
    }
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const renderGuideItem = ({ item }) => {
    const initials = getInitials(item.fullname);
    const backgroundColor = getRandomColor(item.fullname);

    return (
      <TouchableOpacity 
        style={styles.guideCard} 
        onPress={() => handleGuidePress(item)}
      >
        <View style={[styles.avatar, { backgroundColor }]}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{initials}</Text>
          )}
        </View>
        <View style={styles.guideInfo}>
          <Text style={styles.guideName}>{item.fullname}</Text>
          <Text style={styles.guideEmail}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGuideAvatar = () => {
    if (!selectedGuide) return null;
    
    if (selectedGuide.avatar && selectedGuide.avatar !== '') {
      return (
        <Image 
          source={{ uri: selectedGuide.avatar }} 
          style={styles.modalAvatar} 
        />
      );
    } else {
      const initials = getInitials(selectedGuide.fullname);
      const backgroundColor = getRandomColor(selectedGuide.fullname);
      
      return (
        <View style={[styles.modalAvatarPlaceholder, { backgroundColor }]}>
          <Text style={styles.modalAvatarText}>{initials}</Text>
        </View>
      );
    }
  };

  const renderGuideDetail = (label, value) => {
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value || ''}</Text>
      </View>
    );
  };

  const renderInputField = (label, value, onChangeText, placeholder, secure = false) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}:</Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secure}
        />
      </View>
    );
  };

  // Detail Modal
  const renderDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={detailModalVisible}
      onRequestClose={() => setDetailModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Guide Details</Text>
          
          <View style={styles.avatarContainer}>
            {renderGuideAvatar()}
          </View>
          
          <ScrollView contentContainerStyle={styles.detailsContainer}>
            {selectedGuide && (
              <>
                {/* Basic information section */}
                <Text style={styles.sectionHeader}>Basic Information</Text>
                {renderGuideDetail('Role', selectedGuide.role)}
                {renderGuideDetail('Id', selectedGuide._id)}
                {renderGuideDetail('Full Name', selectedGuide.fullname)}
                {renderGuideDetail('Email', selectedGuide.email)}
                {renderGuideDetail('Phone Number', selectedGuide.phoneNumber || 'Not provided')}
                {renderGuideDetail('Address', selectedGuide.address || 'Not provided')}
                
                {/* Guide specific section - can be edited by admin */}
                <Text style={styles.sectionHeader}>Guide Details</Text>
                <View style={styles.editableSection}>
                  {renderGuideDetail('Experience', selectedGuide.experience || 'Not set')}
                  {renderGuideDetail('Languages', selectedGuide.language || 'Not set')}
                  {renderGuideDetail('Trek Count', selectedGuide.trekCount || '0')}
                  
                  <TouchableOpacity 
                    style={styles.editDetailsButton} 
                    onPress={handleEditPress}
                  >
                    <Text style={styles.editDetailsButtonText}>Edit Guide Details</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Additional information */}
                <Text style={styles.sectionHeader}>System Information</Text>
                {renderGuideDetail('Created At', selectedGuide.createdAt)}
                {renderGuideDetail('Updated At', selectedGuide.updatedAt)}
              </>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={handleDeleteGuide}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Guide</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Edit Modal
  const renderEditModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={editModalVisible}
      onRequestClose={() => {
        setEditModalVisible(false);
        setDetailModalVisible(true);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Edit Guide Details</Text>
          
          <ScrollView contentContainerStyle={styles.editFormContainer}>
            <Text style={styles.editGuideNameLabel}>
              Editing guide details for: {selectedGuide?.fullname}
            </Text>
            
            {/* Profile Image Upload */}
            <View style={styles.imageUploadContainer}>
              <Text style={styles.inputLabel}>Profile Picture:</Text>
              
              <View style={styles.imagePreviewContainer}>
                {editImage ? (
                  <Image source={{ uri: editImage }} style={styles.imagePreview} />
                ) : selectedGuide?.avatar ? (
                  <Image source={{ uri: selectedGuide.avatar }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePreviewPlaceholder}>
                    <Text style={styles.imagePreviewPlaceholderText}>No Image</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => pickImage(setEditImage)}
                >
                  <Text style={styles.uploadButtonText}>Select Image</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {renderInputField('Experience', editExperience, setEditExperience, 'Enter guide experience (e.g. 5 years)')}
            {renderInputField('Languages', editLanguage, setEditLanguage, 'Enter languages spoken (e.g. English, Nepali)')}
            {renderInputField('Trek Count', editTrekCount, setEditTrekCount, 'Enter number of treks completed')}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => {
                  setEditModalVisible(false);
                  setDetailModalVisible(true);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdateGuide}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Add Guide Modal
  const renderAddGuideModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={addGuideModalVisible}
      onRequestClose={() => setAddGuideModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Add New Guide</Text>
          
          <ScrollView contentContainerStyle={styles.editFormContainer}>
            <Text style={styles.editGuideNameLabel}>
              Fill in the details to add a new guide
            </Text>
            
            {/* Profile Image Upload */}
            <View style={styles.imageUploadContainer}>
              <Text style={styles.inputLabel}>Profile Picture:</Text>
              
              <View style={styles.imagePreviewContainer}>
                {newImage ? (
                  <Image source={{ uri: newImage }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.imagePreviewPlaceholder}>
                    <Text style={styles.imagePreviewPlaceholderText}>No Image</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.uploadButton}
                  onPress={() => pickImage(setNewImage)}
                >
                  <Text style={styles.uploadButtonText}>Select Image</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={styles.formSectionHeader}>Required Information</Text>
            {renderInputField('Full Name', newFullname, setNewFullname, 'Enter guide name')}
            {renderInputField('Email', newEmail, setNewEmail, 'Enter guide email')}
            {renderInputField('Password', newPassword, setNewPassword, 'Enter guide password', true)}
            
            <Text style={styles.formSectionHeader}>Additional Information</Text>
            {renderInputField('Phone Number', newPhoneNumber, setNewPhoneNumber, 'Enter phone number')}
            {renderInputField('Address', newAddress, setNewAddress, 'Enter address')}
            {renderInputField('Experience', newExperience, setNewExperience, 'Enter guide experience (e.g. 5 years)')}
            {renderInputField('Languages', newLanguage, setNewLanguage, 'Enter languages spoken (e.g. English, Nepali)')}
            {renderInputField('Trek Count', newTrekCount, setNewTrekCount, 'Enter number of treks completed')}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setAddGuideModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleAddGuide}
                disabled={addGuideLoading}
              >
                {addGuideLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Guide</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.header}>Guides</Text>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guides..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Feather name="x" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.summaryBox}>
        <Text style={styles.summaryNumber}>{guides.length}</Text>
        <Text style={styles.summaryLabel}>Total Guides</Text>
        
        <TouchableOpacity 
          style={styles.addGuideButton}
          onPress={() => setAddGuideModalVisible(true)}
        >
          <Text style={styles.addGuideButtonText}>+ Add New Guide</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text style={styles.loadingText}>Loading guides...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>All Guides</Text>
          
          <FlatList
            data={filteredGuides}
            keyExtractor={item => item._id}
            renderItem={renderGuideItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {searchText.length > 0 
                  ? "No guides match your search" 
                  : "No guides found"}
              </Text>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3498db']}
                tintColor={'#3498db'}
              />
            }
          />
        </View>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
      
      {/* Edit Modal */}
      {renderEditModal()}
      
      {/* Add Guide Modal */}
      {renderAddGuideModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  // Search bar styles
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 30, 
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  summaryBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 0,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
    marginBottom: 15,
  },
  addGuideButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addGuideButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  guideEmail: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'black',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginVertical: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 80,
    marginVertical: 20
  },
  modalAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 80,
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20
  },
  modalAvatarText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    letterSpacing: 4
  },
  detailsContainer: {
    paddingHorizontal: 25,
  },
  editFormContainer: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  formSectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5,
  },
  editableSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  editDetailsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  editDetailsButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  editGuideNameLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
    marginRight: 10
  },
  detailValue: {
    flex: 2,
    fontSize: 18,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageUploadContainer: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  imagePreviewPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  imagePreviewPlaceholderText: {
    color: '#666',
    fontSize: 12,
  },
  uploadButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  }
});

export default GuideDatabase;