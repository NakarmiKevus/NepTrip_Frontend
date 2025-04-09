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
  TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Edit form state for guide-specific fields
  const [editExperience, setEditExperience] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editTrekCount, setEditTrekCount] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  // Use guides passed via route params if available, otherwise fetch them
  useEffect(() => {
    if (route?.params?.guides) {
      setGuides(route.params.guides);
      setLoading(false);
    }
  }, [route?.params?.guides]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
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
      } else {
        throw new Error(response.data.message || 'Failed to fetch guides');
      }

      setError(null);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError(err.message || 'Failed to fetch guides data');
    } finally {
      setLoading(false);
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
      
      // Make API call to update guide
      const response = await userApi.updateGuideDetails(selectedGuide._id, updateData);
      
      if (response.success) {
        // Update the guides list with the updated guide
        const updatedGuide = response.guide;
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
      } else {
        throw new Error(response.message || 'Failed to update guide');
      }
    } catch (err) {
      console.error('❌ Update Error:', err);
      Alert.alert("Error", err.message || 'Failed to update guide');
    } finally {
      setUpdateLoading(false);
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

  const renderGuideItem = ({ item }) => {
    const initials = getInitials(item.fullname);
    const backgroundColor = getRandomColor(item.fullname);

    return (
      <TouchableOpacity 
        style={styles.guideCard} 
        onPress={() => handleGuidePress(item)}
      >
        <View style={[styles.avatar, { backgroundColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
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

  const renderInputField = (label, value, onChangeText, placeholder) => {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>{label}:</Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.header}>Guides</Text>
      
      <View style={styles.summaryBox}>
        <Text style={styles.summaryNumber}>{guides.length}</Text>
        <Text style={styles.summaryLabel}>Total Guides</Text>
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
            data={guides}
            keyExtractor={item => item._id}
            renderItem={renderGuideItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No guides found</Text>}
          />
        </View>
      )}

      {/* Detail Modal */}
      {renderDetailModal()}
      
      {/* Edit Modal */}
      {renderEditModal()}
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
});

export default GuideDatabase;