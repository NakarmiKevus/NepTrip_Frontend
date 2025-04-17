import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import TrekkingApi from '../API/trekkingApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';
import TrekDetailModal from '../Components/TrekDetailModal'; // for admin
import UserTrekDetailModal from '../Components/UserTrekDetailModal'; // for user

const Dashboard = () => {
  const [trekkingPlaces, setTrekkingPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetchTrekkingPlaces();
    getUserRole();
  }, []);

  const fetchTrekkingPlaces = async () => {
    try {
      const response = await TrekkingApi.getAllTrekking();
      const places = response?.trekkingSpots || [];
      setTrekkingPlaces(places);
      setFilteredPlaces(shuffleArray(places));
    } catch (error) {
      console.error('Error fetching trekking places:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUserRole = async () => {
    const role = await AsyncStorage.getItem('userRole');
    setUserRole(role || '');
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrekkingPlaces();
    setSearchText('');
  };

  const openTrekDetails = (trek) => {
    setSelectedTrek(trek);
    setModalVisible(true);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === '') {
      setFilteredPlaces(trekkingPlaces);
    } else {
      const filtered = trekkingPlaces.filter((trek) =>
        trek.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPlaces(filtered);
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setFilteredPlaces(trekkingPlaces);
  };

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const renderHorizontalCard = ({ item }) => (
    <TouchableOpacity style={styles.smallCard} onPress={() => openTrekDetails(item)}>
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.smallImage}
      />
      <Text style={styles.smallTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVerticalCard = (item) => (
    <TouchableOpacity key={item._id} style={styles.verticalCard} onPress={() => openTrekDetails(item)}>
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300' }}
        style={styles.verticalImage}
      />
      <View style={{ padding: 10 }}>
        <Text style={styles.verticalTitle}>{item.name}</Text>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Content Wrapper */}
        <View style={styles.contentWrapper}>
          {/* Search Bar */}
          <View style={styles.searchBox}>
            <View style={styles.searchContainer}>
              <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                placeholder="Search treks..."
                style={styles.searchInput}
                placeholderTextColor="#666"
                value={searchText}
                onChangeText={handleSearch}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <Feather name="x" size={20} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <Text style={styles.mainTitle}>Ready for a New Adventure?</Text>
          <Text style={styles.subtitle}>
            Discover new places, hidden gems, and unforgettable experiences
          </Text>

          {filteredPlaces[0] && (
            <TouchableOpacity onPress={() => openTrekDetails(filteredPlaces[0])}>
              <Image
                source={{ uri: filteredPlaces[0].images?.[0] || 'https://via.placeholder.com/400' }}
                style={styles.featureImage}
              />
              <Text style={styles.featureTitle}>{filteredPlaces[0].name}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.sectionTitle}>Explore Top Spots</Text>
          <FlatList
            data={filteredPlaces.slice(1, 4)}
            renderItem={renderHorizontalCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            style={{ marginBottom: 20 }}
          />

          <Text style={styles.sectionTitle}>Iconic Places to Visit</Text>
          {filteredPlaces.slice(4).map(renderVerticalCard)}

          {userRole === 'admin' ? (
            <TrekDetailModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              trek={selectedTrek}
            />
          ) : (
            <UserTrekDetailModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              trek={selectedTrek}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff',},
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
  searchBox: {
    marginTop: 10,
    width: '100%',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginLeft:6,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  featureImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 16,
  },
  smallCard: {
    marginRight: 14,
    width: 120,
  },
  smallImage: {
    width: '100%',
    height: 100,
    borderRadius: 10,
  },
  smallTitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  verticalCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  verticalImage: {
    width: '100%',
    height: 180,
  },
  verticalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contentWrapper: {
    marginTop: 35,
  },
});

export default Dashboard;
