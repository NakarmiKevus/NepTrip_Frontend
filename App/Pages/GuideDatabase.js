import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList,
  StyleSheet, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../API/client';

const GuideDatabase = ({ route, navigation }) => {
  const [guides, setGuides] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuides();
  }, []);

  // Use guides passed via route params if available, otherwise fetch them
  useEffect(() => {
    if (route.params?.guides) {
      setGuides(route.params.guides);
      setLoading(false);
    }
  }, [route.params?.guides]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await client.get('/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Filter guides from all users
        const guideList = response.data.users.filter(user => user.role === 'guide');
        setGuides(guideList);
      } else {
        throw new Error(response.data.message || 'Failed to fetch guides');
      }

      setError(null);
    } catch (err) {
      console.error('❌ Fetch Error:', err);
      setError(err.message || 'Failed to fetch guides data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuides().then(() => setRefreshing(false));
  };

  const handleGuidePress = (guide) => {
    setSelectedGuide(guide);
    setModalVisible(true);
  };

  const renderGuideItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.guideCard}
      onPress={() => handleGuidePress(item)}
    >
      <View style={styles.guideInfo}>
        <Text style={styles.guideName}>{item.fullname}</Text>
        <Text style={styles.guideEmail}>{item.email}</Text>
      </View>
      <View style={styles.guideRole}>
        <Text style={styles.roleText}>
          Guide
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderGuideDetailsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalHeader}>Guide Details</Text>
            
            {selectedGuide && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name:</Text>
                  <Text style={styles.detailValue}>{selectedGuide.fullname}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email:</Text>
                  <Text style={styles.detailValue}>{selectedGuide.email}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role:</Text>
                  <Text style={[styles.detailValue, styles.guideHighlight]}>
                    {selectedGuide.role}
                  </Text>
                </View>
                
                {/* Display all other guide details */}
                {selectedGuide && Object.entries(selectedGuide).map(([key, value]) => {
                  // Skip the already displayed fields and complex objects
                  if (['fullname', 'email', 'role', '_id', '__v'].includes(key) || 
                      typeof value === 'object') {
                    return null;
                  }
                  
                  return (
                    <View style={styles.detailRow} key={key}>
                      <Text style={styles.detailLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                      <Text style={styles.detailValue}>{String(value)}</Text>
                    </View>
                  );
                })}
                
                {/* Handle any nested objects if needed */}
                {selectedGuide && Object.entries(selectedGuide).map(([key, value]) => {
                  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    return (
                      <View key={key} style={styles.nestedContainer}>
                        <Text style={styles.nestedHeader}>
                          {key.charAt(0).toUpperCase() + key.slice(1)}:
                        </Text>
                        
                        {Object.entries(value).map(([nestedKey, nestedValue]) => {
                          if (typeof nestedValue !== 'object') {
                            return (
                              <View style={styles.nestedDetailRow} key={nestedKey}>
                                <Text style={styles.nestedLabel}>{nestedKey}:</Text>
                                <Text style={styles.nestedValue}>{String(nestedValue)}</Text>
                              </View>
                            );
                          }
                          return null;
                        })}
                      </View>
                    );
                  }
                  return null;
                })}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="green" />
        <Text style={styles.loadingText}>Loading guides...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <Text style={styles.headerTitle}>Guides Database</Text>
      
      <View style={styles.summaryBox}>
        <Text style={styles.summaryNumber}>{guides.length}</Text>
        <Text style={styles.summaryLabel}>Total Guides</Text>
      </View>
      
      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>All Guides</Text>
        
        <FlatList
          data={guides}
          keyExtractor={item => item._id}
          renderItem={renderGuideItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No guides found</Text>
          }
        />
      </View>
      
      {renderGuideDetailsModal()}
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
    color: '#009688',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#009688',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop:20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#009688',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  guideCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  guideInfo: {
    flex: 1,
  },
  guideName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  guideEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  guideRole: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
    backgroundColor: '#009688',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#009688',
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  detailValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
  guideHighlight: {
    color: '#009688',
    fontWeight: 'bold',
  },
  nestedContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  nestedHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#009688',
  },
  nestedDetailRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingLeft: 20,
  },
  nestedLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  nestedValue: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#009688',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GuideDatabase;