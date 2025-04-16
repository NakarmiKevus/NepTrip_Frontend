import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import TrekkingApi from '../API/trekkingApi';

const Dashboard = ({ navigation }) => {
  const [trekkingPlaces, setTrekkingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrekkingPlaces();
  }, []);

  const fetchTrekkingPlaces = async () => {
    try {
      const response = await TrekkingApi.getAllTrekking();
      setTrekkingPlaces(response?.trekkingSpots || []);
    } catch (error) {
      console.error('Error fetching trekking places:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrekkingPlaces();
  };

  const renderHorizontalCard = ({ item }) => (
    <TouchableOpacity
      style={styles.smallCard}
      onPress={() => navigation.navigate('TrekkingDetails', { trekId: item._id })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
        style={styles.smallImage}
      />
      <Text style={styles.smallTitle}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderVerticalCard = (item) => (
    <TouchableOpacity
      key={item._id}
      style={styles.verticalCard}
      onPress={() => navigation.navigate('TrekkingDetails', { trekId: item._id })}
    >
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/300' }}
        style={styles.verticalImage}
      />
      <View style={{ padding: 10 }}>
        <Text style={styles.verticalTitle}>{item.name}</Text>
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.mainTitle}>Ready for a New Adventure?</Text>
      <Text style={styles.subtitle}>Discover new places, hidden gems, and unforgettable experiences</Text>

      {trekkingPlaces[0] && (
        <TouchableOpacity
          onPress={() => navigation.navigate('TrekkingDetails', { trekId: trekkingPlaces[0]._id })}
        >
          <Image
            source={{ uri: trekkingPlaces[0].image || 'https://via.placeholder.com/400' }}
            style={styles.featureImage}
          />
          <Text style={styles.featureTitle}>{trekkingPlaces[0].name}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Explore Top Spots</Text>
      <FlatList
        data={trekkingPlaces.slice(1, 4)}
        renderItem={renderHorizontalCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.sectionTitle}>Iconic Places to Visit</Text>
      {trekkingPlaces.slice(4).map(renderVerticalCard)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 14 },
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
});

export default Dashboard;
