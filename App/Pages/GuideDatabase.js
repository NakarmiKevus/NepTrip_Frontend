import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

import client from '../API/client';
import userApi from '../API/userApi';
import GuideCard from '../Components/GuideCard';
import GuideDetailModal from '../Components/GuideDetailModal';
import GuideEditModal from '../Components/GuideEditModal';

const GuideDatabase = ({ navigation }) => {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [editExperience, setEditExperience] = useState('');
  const [editLanguage, setEditLanguage] = useState('');
  const [editTrekCount, setEditTrekCount] = useState('');
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    fetchGuides();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredGuides(guides);
    } else {
      const filtered = guides.filter((guide) =>
        guide.fullname.toLowerCase().includes(searchText.toLowerCase())
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
      if (!token) throw new Error('No authentication token found');

      const response = await client.get('/all-users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const guideList = response.data.users.filter((user) => user.role === 'guide');
        setGuides(guideList);
        setFilteredGuides(guideList);
      } else {
        throw new Error(response.data.message || 'Failed to fetch guides');
      }

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch guides');
    } finally {
      if (!refreshing) setLoading(false);
    }
  };

  const handleGuidePress = (guide) => {
    setSelectedGuide(guide);
    setDetailModalVisible(true);
  };

  const handleEditPress = () => {
    setEditExperience(selectedGuide.experience || '');
    setEditLanguage(selectedGuide.language || '');
    setEditTrekCount(selectedGuide.trekCount?.toString() || '0');
    setQrImage(selectedGuide.qrCode || '');
    setDetailModalVisible(false);
    setEditModalVisible(true);
  };

  const handleUpdateGuide = async () => {
    try {
      setUpdateLoading(true);
      const updateData = {
        experience: editExperience,
        language: editLanguage,
        trekCount: editTrekCount,
      };

      const response = await userApi.updateGuideDetails(selectedGuide._id, updateData);
      if (!response.success) throw new Error(response.message || 'Update failed');

      const updatedGuide = { ...selectedGuide, ...updateData };
      setGuides((prev) =>
        prev.map((g) => (g._id === selectedGuide._id ? updatedGuide : g))
      );
      setSelectedGuide(updatedGuide);
      setEditModalVisible(false);
      setDetailModalVisible(true);
      alert('Guide updated successfully');
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteGuide = async () => {
    try {
      setDeleteLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await client.delete(`/delete-user/${selectedGuide._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) throw new Error(response.data.message);
      setGuides((prev) => prev.filter((g) => g._id !== selectedGuide._id));
      setDetailModalVisible(false);
      alert('Guide deleted successfully');
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddGuidePress = () => navigation.navigate('AddGuide');

  const renderGuideItem = ({ item }) => (
    <GuideCard guide={item} onPress={() => handleGuidePress(item)} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Text style={styles.header}>Guides</Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guides..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <Feather name="x" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryNumber}>{guides.length}</Text>
        <Text style={styles.summaryLabel}>Total Guides</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddGuidePress}>
          <Text style={styles.addButtonText}>+ Add New Guide</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredGuides}
          keyExtractor={(item) => item._id}
          renderItem={renderGuideItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {searchText ? 'No results found.' : 'No guides available.'}
            </Text>
          }
        />
      )}

      {/* Modals */}
      <GuideDetailModal
        visible={detailModalVisible}
        guide={selectedGuide}
        onClose={() => setDetailModalVisible(false)}
        onEditPress={handleEditPress}
        onDeletePress={handleDeleteGuide}
        deleteLoading={deleteLoading}
      />

      <GuideEditModal
        visible={editModalVisible}
        guide={selectedGuide}
        onClose={() => setEditModalVisible(false)}
        experience={editExperience}
        language={editLanguage}
        trekCount={editTrekCount}
        setExperience={setEditExperience}
        setLanguage={setEditLanguage}
        setTrekCount={setEditTrekCount}
        qrImage={qrImage}
        setQrImage={setQrImage}
        onUpdateGuide={handleUpdateGuide}
        updateLoading={updateLoading}
      />
    </SafeAreaView>
  );
};

export default GuideDatabase;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
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
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  summaryBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3498db',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    marginTop: 30,
  },
});
