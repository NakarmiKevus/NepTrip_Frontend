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
  StatusBar,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userApi from '../API/userApi';
import bookingApi from '../API/bookingApi';

const { width } = Dimensions.get('window');

const GuideScreen = ({ route }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  useEffect(() => {
    const checkExistingBooking = async () => {
      try {
        const res = await bookingApi.getLatestBooking();
        if (res.success && ['pending', 'accepted'].includes(res.booking.status)) {
          await AsyncStorage.setItem('latestBookingId', res.booking._id);
          navigation.replace('BookingStatusLoader');
        }
      } catch (err) {
        console.log('No active booking, showing guide list');
      }
    };

    checkExistingBooking();
  }, []);

  // ✅ Trigger on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchGuides();
    }, [])
  );

  useEffect(() => {
    if (navigation.isFocused() && route.params?.refresh) {
      navigation.setParams({ refresh: undefined });
      fetchGuides();
    }
  }, [navigation, route.params]);

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

  const handleArrowPress = (direction) => {
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= guides.length) newIndex = guides.length - 1;

    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
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
    itemVisiblePercentThreshold: 50,
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
            { backgroundColor: index === activeIndex ? '#2196F3' : '#ccc' },
          ]}
          onPress={() => {
            flatListRef.current.scrollToIndex({ index, animated: true });
          }}
        />
      ))}
    </View>
  );

  const renderGuideItem = ({ item }) => {
    // Ensure proper rating values
    const averageRating = item.averageRating !== undefined ? item.averageRating : 0;
    const totalReviews = item.totalReviews !== undefined ? item.totalReviews : 0;

    // Debug log
    console.log(`Rendering guide ${item.fullname}: Rating=${averageRating}, Reviews=${totalReviews}`);

    return (
      <ScrollView
        style={styles.guideItemContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={80}
          />
        }
      >
        <View style={styles.profileSection}>
          <Image
            source={item.avatar ? { uri: item.avatar } : require('../../assets/images/Profile.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{item.fullname}</Text>

          <View style={styles.ratingContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Feather
                key={index}
                name="star"
                size={20}
                color={
                  averageRating >= index + 1
                    ? '#FFD700' // Full star
                    : averageRating >= index + 0.5
                    ? '#FFD700' // Half star
                    : '#ccc' // Empty star
                }
              />
            ))}
            <Text style={styles.reviewText}>
              {averageRating.toFixed(1)} ({totalReviews})
            </Text>
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
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="black" />
        <Text style={styles.loaderText}>Loading guide details...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Trekking Guides</Text>
        <Text style={styles.headerSubtitle}>
          {guides.length > 0
            ? `Swipe to explore ${guides.length} available guides`
            : 'No guides available at the moment'}
        </Text>
      </View>

      {guides.length > 0 ? (
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={[styles.arrowButton, styles.leftArrow, activeIndex === 0 && styles.disabledArrow]}
            onPress={() => handleArrowPress(-1)}
            disabled={activeIndex === 0}
          >
            <Feather name="chevron-left" size={30} color={activeIndex === 0 ? '#ccc' : '#000'} />
          </TouchableOpacity>

          <FlatList
            ref={flatListRef}
            data={guides}
            renderItem={renderGuideItem}
            keyExtractor={(item) => item._id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={width}
            bounces={false}
            onViewableItemsChanged={handleViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            contentContainerStyle={{ flexGrow: 1 }}
          />

          <TouchableOpacity
            style={[styles.arrowButton, styles.rightArrow, activeIndex === guides.length - 1 && styles.disabledArrow]}
            onPress={() => handleArrowPress(1)}
            disabled={activeIndex === guides.length - 1}
          >
            <Feather name="chevron-right" size={30} color={activeIndex === guides.length - 1 ? '#ccc' : '#000'} />
          </TouchableOpacity>

          {renderPagination()}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.noGuideText}>No guides found. Pull down to refresh.</Text>
        </ScrollView>
      )}
    </View>
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
  contentContainer: {
    flex: 1,
    position: 'relative',
  },
  arrowButton: {
    position: 'absolute',
    top: '40%',
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 20,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
  disabledArrow: {
    opacity: 0.3,
  },
  guideItemContainer: {
    width,
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
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
