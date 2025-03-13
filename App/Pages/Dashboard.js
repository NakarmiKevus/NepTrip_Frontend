import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import TrekkingApi from '../API/trekkingApi'; // ✅ Ensure correct API import

const Dashboard = ({ navigation }) => {
  const [trekkingPlaces, setTrekkingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTrekkingPlaces();
  }, []);

  const fetchTrekkingPlaces = async () => {
    try {
      setLoading(true);
      const response = await TrekkingApi.getAllTrekking();
      
      console.log("Fetched Trekking Places:", response); // ✅ Debugging Log

      if (response && response.trekkingSpots && Array.isArray(response.trekkingSpots)) {
        setTrekkingPlaces(response.trekkingSpots);  // ✅ Ensure correct state update
      } else {
        setTrekkingPlaces([]); // ✅ Handle empty responses correctly
      }
    } catch (error) {
      console.error("Error fetching trekking places:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrekkingPlaces();
  };

  const renderTrekItem = ({ item }) => {
    if (!item || !item.name) return null; // ✅ Prevent rendering empty objects

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('TrekkingDetails', { trekId: item._id })}
      >
        <Text style={styles.trekName}>{item.name}</Text>
        <Text style={styles.trekLocation}>📍 {item.location}</Text>
        <Text style={styles.trekDifficulty}>⛰ Difficulty: {item.difficulty_level}</Text>
        <Text style={styles.trekDistance}>📏 Distance: {item.distance_from_user} km</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Explore Trekking Routes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : trekkingPlaces.length > 0 ? (
        <FlatList
          data={trekkingPlaces}  // ✅ Ensure `trekkingPlaces` is properly set
          keyExtractor={(item) => item._id.toString()}
          renderItem={renderTrekItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.emptyText}>⚠ No trekking places available. Try refreshing.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  card: { 
    backgroundColor: 'white', 
    padding: 15, 
    marginVertical: 8, 
    borderRadius: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 2 
  },
  trekName: { fontSize: 18, fontWeight: 'bold' },
  trekLocation: { fontSize: 16, color: '#555' },
  trekDifficulty: { fontSize: 14, color: '#888', marginTop: 4 },
  trekDistance: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { fontSize: 16, textAlign: 'center', marginTop: 20, color: '#777' }
});

export default Dashboard;
