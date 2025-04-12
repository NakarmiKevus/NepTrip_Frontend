
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import userApi from '../API/userApi';
import bookingApi from '../API/bookingApi';

const { width } = Dimensions.get('window');

const GuideScreen = () => {
  const navigation = useNavigation();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      checkBookingAndRedirect();
    }, [])
  );

  const checkBookingAndRedirect = async () => {
    try {
      const response = await bookingApi.getLatestBooking();
      if (response.success && response.booking) {
        if (response.booking.status === 'pending' || response.booking.status === 'accepted') {
          navigation.replace('BookingStatusLoader');
          return;
        }
      }
      fetchGuides();
    } catch (error) {
      fetchGuides();
    }
  };

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const data = await userApi.getGuides();
      if (data.success && data.guides?.length > 0) {
        setGuides(data.guides);
      } else {
        Alert.alert('Error', 'No guides found.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load guide details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleBookPress = () => {
    navigation.navigate('ConfirmBooking', { guideId: guides[activeIndex]._id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuides();
  };

  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const renderInfoField = (iconName, label, value) => (
    <View style={styles.infoItem}>
      <View style={styles.infoHeader}>
        <Feather name={iconName} size={20} color="#666" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {guides.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            { backgroundColor: index === activeIndex ? '#2196F3' : '#ccc' }
          ]}
          onPress={() => {
            flatListRef.current.scrollToIndex({ index, animated: true });
          }}
        />
      ))}
    </View>
  );

  const renderGuideItem = ({ item }) => (
    <ScrollView 
      style={styles.guideItemContainer}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.profileSection}>
        <Image
          source={item.avatar ? { uri: item.avatar } : require('../../assets/images/Profile.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.fullname}</Text>

        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Feather key={index} name="star" size={20} color="#FFD700" />
          ))}
        </View>

        <View style={styles.trekCountContainer}>
          <Feather name="map" size={16} color="white" />
          <Text style={styles.trekCountText}>{item.trekCount || 0} treks completed</Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
          <Text style={styles.bookButtonText}>Book This Guide</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.personalInfoContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderInfoField('user', 'Full Name', item.fullname)}
        {renderInfoField('mail', 'Email', item.email)}
        {renderInfoField('phone', 'Phone Number', item.phoneNumber)}
        {renderInfoField('map-pin', 'Address', item.address)}
        {renderInfoField('globe', 'Language', item.language)}
        {renderInfoField('briefcase', 'Experience', item.experience)}
        {renderInfoField('map', 'Number of Treks', item.trekCount || '0')}
      </View>
    </ScrollView>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loaderText}>Loading guide details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Trekking Guides</Text>
        <Text style={styles.headerSubtitle}>
          {guides.length > 0 ? `Swipe to explore ${guides.length} available guides` : 'No guides available at the moment'}
        </Text>
      </View>

      {guides.length > 0 ? (
        <>
          <FlatList
            ref={flatListRef}
            data={guides}
            renderItem={renderGuideItem}
            keyExtractor={item => item._id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            bounces={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
          {renderPagination()}
        </>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.noGuideText}>No guides found. Pull down to refresh.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  guideItemContainer: {
    width: width,
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 10,
  },
  name: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  trekCountContainer: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  trekCountText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  bookButton: {
    marginTop: 10,
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  personalInfoContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoItem: {
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginLeft: 30,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noGuideText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default GuideScreen;
