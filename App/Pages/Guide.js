import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// If you have an API to fetch the single guide, import it (e.g., userApi.getGuides())
import userApi from '../API/userApi';

const GuideScreen = () => {
  const navigation = useNavigation();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGuide();
  }, []);

  const fetchGuide = async () => {
    try {
      setLoading(true);
      // Example: If your backend has GET /api/user/guides returning [{...guideInfo...}]
      const data = await userApi.getGuides();
      if (data.success && data.guides?.length > 0) {
        setGuide(data.guides[0]); // or handle multiple
      }
    } catch (error) {
      console.log('Error fetching guide:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookPress = () => {
    // Navigate to ConfirmBooking screen
    navigation.navigate('ConfirmBooking');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {guide ? (
        <>
          <Text style={styles.title}>Guide Information</Text>
          <Text style={styles.info}>Name: {guide.fullname}</Text>
          <Text style={styles.info}>Email: {guide.email}</Text>
          <Button title="Book" onPress={handleBookPress} />
        </>
      ) : (
        <Text>No guide found.</Text>
      )}
    </View>
  );
};

export default GuideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  info: {
    marginBottom: 4,
  },
});
