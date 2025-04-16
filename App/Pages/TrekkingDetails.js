import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import TrekkingApi from '../API/trekkingApi';

const TrekkingDetails = ({ route, navigation }) => {
  const { trekId } = route.params;
  const [trekDetails, setTrekDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrekDetails();
  }, []);

  const fetchTrekDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching trek details for ID:', trekId);
      const response = await TrekkingApi.getTrekkingById(trekId);
      
      console.log('API Response:', response);
      
      if (response && response.success && response.trekking) {
        setTrekDetails(response.trekking);
      } else {
        setError('Failed to load trek details');
      }
    } catch (error) {
      console.error('Error in fetchTrekDetails:', error);
      setError(error.message || 'An error occurred while fetching trek details');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTrekDetails();
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading trek details...</Text>
      </View>
    );
  }

  if (error || !trekDetails) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>⚠️ {error || 'Trek details not found'}</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{trekDetails.name}</Text>
      <Text style={styles.detailText}>📍 Location: {trekDetails.location}</Text>
      <Text style={styles.detailText}>⛰️ Altitude: {trekDetails.altitude}m</Text>
      <Text style={styles.detailText}>⭐ Review: {trekDetails.review}</Text>
      <Text style={styles.detailText}>⏳ Time to Complete: {trekDetails.time_to_complete}</Text>
      <Text style={styles.detailText}>📏 Distance: {trekDetails.distance_from_user} km</Text>
      <Text style={styles.detailText}>🚀 Difficulty Level: {trekDetails.difficulty_level}</Text>
      <Text style={styles.detailText}>🌿 Eco-Cultural Info: {trekDetails.eco_cultural_info}</Text>
      
      <Text style={styles.gearHeader}>🎒 Gear Checklist:</Text>
      {trekDetails.gear_checklist && trekDetails.gear_checklist.length > 0 ? (
        trekDetails.gear_checklist.map((item, index) => (
          <Text key={index} style={styles.gearItem}>• {item}</Text>
        ))
      ) : (
        <Text style={styles.detailText}>No gear checklist provided.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  gearHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  gearItem: {
    fontSize: 16,
    marginLeft: 16,
    marginVertical: 2,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TrekkingDetails;