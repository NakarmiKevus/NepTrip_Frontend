import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

const AdminDashboard = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch all users
      const response = await client.get('/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUsers(response.data.users);

        // Extract guides from users list
        const guideList = response.data.users.filter(user => user.role === 'guide');
        setGuides(guideList);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }

      setError(null);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError(err.message || 'Failed to fetch dashboard data');
      Alert.alert('Error', err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const navigateToUsers = () => {
    navigation.navigate('UsersDatabase', { users });
  };

  const navigateToGuides = () => {
    navigation.navigate('GuideDatabase', { guides });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <Text style={styles.header}>Admin Dashboard</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Summary Boxes */}
          <View style={styles.summaryContainer}>
            <TouchableOpacity 
              style={styles.summaryBox}
              onPress={navigateToUsers}
            >
              <Text style={styles.summaryNumber}>{users.length}</Text>
              <Text style={styles.summaryLabel}>Total Users</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.summaryBox}
              onPress={navigateToGuides}
            >
              <Text style={styles.summaryNumber}>{guides.length}</Text>
              <Text style={styles.summaryLabel}>Total Guides</Text>
            </TouchableOpacity>
          </View>          
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'black',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'black',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  navigationContainer: {
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#4a6da7',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default AdminDashboard;