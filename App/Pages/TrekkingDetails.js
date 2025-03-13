import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import TrekkingApi from '../API/trekkingApi';

const TrekkingDetails = ({ route }) => {
  const { trekId } = route.params;
  const [trekDetails, setTrekDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrekDetails();
  }, []);

  const fetchTrekDetails = async () => {
    try {
      const response = await TrekkingApi.getTrekkingById(trekId);
      setTrekDetails(response.trekkingPlace);
    } catch (error) {
      console.error('Error fetching trek details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!trekDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>⚠ Trek details not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{trekDetails.name}</Text>
      <Text style={styles.detailText}>📍 Location: {trekDetails.location}</Text>
      <Text style={styles.detailText}>⛰ Altitude: {trekDetails.altitude}m</Text>
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
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  detailText: { fontSize: 16, marginBottom: 8 },
  gearHeader: { fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  gearItem: { fontSize: 16, color: '#007bff', marginVertical: 2 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: 'red' },
});

export default TrekkingDetails;
