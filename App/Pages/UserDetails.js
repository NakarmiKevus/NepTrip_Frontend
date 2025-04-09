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
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

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

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await client.get('/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      setError(null);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserPress = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${selectedUser.fullname}?`,
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
              
              const response = await client.delete(`/delete-user/${selectedUser._id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (response.data.success) {
                setModalVisible(false);
                setUsers(prevUsers => prevUsers.filter(user => user._id !== selectedUser._id));
                Alert.alert("Success", "User deleted successfully");
              } else {
                throw new Error(response.data.message || 'Failed to delete user');
              }
            } catch (err) {
              console.error('❌ Delete Error:', err);
              Alert.alert("Error", err.message || 'Failed to delete user');
            } finally {
              setDeleteLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }) => {
    const initials = getInitials(item.fullname);
    const backgroundColor = getRandomColor(item.fullname);

    return (
      <TouchableOpacity 
        style={styles.userCard} 
        onPress={() => handleUserPress(item)}
      >
        <View style={[styles.avatar, { backgroundColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.fullname}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderUserAvatar = () => {
    if (!selectedUser) return null;
    
    if (selectedUser.avatar && selectedUser.avatar !== '') {
      return (
        <Image 
          source={{ uri: selectedUser.avatar }} 
          style={styles.modalAvatar} 
        />
      );
    } else {
      const initials = getInitials(selectedUser.fullname);
      const backgroundColor = getRandomColor(selectedUser.fullname);
      
      return (
        <View style={[styles.modalAvatarPlaceholder, { backgroundColor }]}>
          <Text style={styles.modalAvatarText}>{initials}</Text>
        </View>
      );
    }
  };

  const renderUserDetail = (label, value) => {
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value || ''}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.header}>Users</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>User Details</Text>
            
            <View style={styles.avatarContainer}>
              {renderUserAvatar()}
            </View>
            
            <ScrollView contentContainerStyle={styles.detailsContainer}>
              {selectedUser && (
                <>
                  {renderUserDetail('Role', selectedUser.role)}
                  {renderUserDetail('Id', selectedUser._id)}
                  {renderUserDetail('Full Name', selectedUser.fullname)}
                  {renderUserDetail('Email', selectedUser.email)}
                  {renderUserDetail('Created At', selectedUser.createdAt)}
                  {renderUserDetail('Updated At', selectedUser.updatedAt)}
                  {selectedUser.phoneNumber && renderUserDetail('Phone Number', selectedUser.phoneNumber)}
                  {selectedUser.address && renderUserDetail('Address', selectedUser.address)}
                </>
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.closeButton} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={handleDeleteUser}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.deleteButtonText}>Delete User</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  userCard: {
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
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
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
    marginVertical:20
  },
  modalAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 80,
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:20
  },
  modalAvatarText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    letterSpacing:4
  },
  detailsContainer: {
    paddingHorizontal: 25,
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
    marginRight:10
  },
  detailValue: {
    flex: 2,
    fontSize: 18,
    color: '#333',
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
});

export default UserDetails;