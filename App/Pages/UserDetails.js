import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, SafeAreaView, StatusBar,
  ActivityIndicator, RefreshControl, TextInput, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';
import { Feather } from '@expo/vector-icons';
import UserCard from '../Components/UserCard';
import UserDetailModal from '../Components/UserDetailModal';

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      if (!refreshing) setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await client.get('/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
  };

  const handleUserPress = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const handleDeleteUser = async () => {
    try {
      setDeleteLoading(true);
      const token = await AsyncStorage.getItem('token');
      await client.delete(`/delete-user/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedUsers = users.filter(u => u._id !== selectedUser._id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      setModalVisible(false);
      Alert.alert('Success', 'User deleted successfully');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    const nameParts = name.split(' ');
    return nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  const getRandomColor = (name) => {
    const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', '#1abc9c', '#34495e'];
    const charCode = name.charCodeAt(0) || 0;
    return colors[charCode % colors.length];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <Text style={styles.header}>Users</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={20} color="#999" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="black" />
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <UserCard
              user={item}
              onPress={handleUserPress}
              getInitials={getInitials}
              getRandomColor={getRandomColor}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
        />
      )}

      <UserDetailModal
        visible={modalVisible}
        user={selectedUser}
        onClose={() => setModalVisible(false)}
        onDelete={handleDeleteUser}
        deleteLoading={deleteLoading}
        getInitials={getInitials}
        getRandomColor={getRandomColor}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  clearIcon: {
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default UserDetails;
