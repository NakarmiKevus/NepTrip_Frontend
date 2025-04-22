import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const getDifficultyColor = (level) => {
  const levelLower = level.toLowerCase();
  if (levelLower.includes('easy')) return '#4CAF50';
  if (levelLower.includes('moderate')) return '#FFA000';
  if (levelLower.includes('difficult') || levelLower.includes('hard')) return '#F44336';
  if (levelLower.includes('extreme')) return '#9C27B0';
  return '#2196F3';
};

const StarRating = ({ rating, size = 18, color = '#FFC107' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(<FontAwesome key={i} name="star" size={size} color={color} style={{ marginRight: 2 }} />);
    } else if (i === fullStars && halfStar) {
      stars.push(<FontAwesome key={i} name="star-half-o" size={size} color={color} style={{ marginRight: 2 }} />);
    } else {
      stars.push(<FontAwesome key={i} name="star-o" size={size} color={color} style={{ marginRight: 2 }} />);
    }
  }

  return <View style={{ flexDirection: 'row' }}>{stars}</View>;
};

const InfoBadge = ({ icon, label, value, iconColor = '#007AFF' }) => (
  <View style={styles.infoBadgeRow}>
    <Feather name={icon} size={18} color={iconColor} style={{ marginRight: 6 }} />
    <Text style={styles.infoBadgeText}>
      <Text style={styles.infoBadgeLabel}>{label}: </Text>
      <Text style={styles.infoBadgeValue}>{value}</Text>
    </Text>
  </View>
);

const UserTrekDetailModal = ({ visible, onClose, trek }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef(null);
  const navigation = useNavigation();

  if (!trek) return null;

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    scrollRef.current?.scrollTo({ x: width * index, animated: true });
    setCurrentIndex(index);
  };

  const prevImage = () => {
    const prev = currentIndex === 0 ? trek.images.length - 1 : currentIndex - 1;
    scrollToIndex(prev);
  };

  const nextImage = () => {
    const next = currentIndex === trek.images.length - 1 ? 0 : currentIndex + 1;
    scrollToIndex(next);
  };

  const handleBook = () => {
    navigation.navigate('Guide', { selectedTrek: trek });
    onClose();
  };

  const hasImages = trek.images && trek.images.length > 0;
  const difficultyColor = getDifficultyColor(trek.difficulty_level);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{trek.name}</Text>
              <View style={styles.headerButtons}>
                <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                  <Text style={styles.difficultyText}>{trek.difficulty_level}</Text>
                </View>
                <TouchableOpacity style={styles.iconButton} onPress={onClose}>
                  <Feather name="x" size={22} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Image Slider */}
            <View style={styles.sliderContainer}>
              {hasImages ? (
                <>
                  <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {trek.images.map((uri, index) => (
                      <Image key={index} source={{ uri }} style={styles.image} resizeMode="cover" />
                    ))}
                  </ScrollView>

                  <TouchableOpacity style={[styles.imageNavButton, styles.prevButton]} onPress={prevImage}>
                    <Feather name="chevron-left" size={24} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.imageNavButton, styles.nextButton]} onPress={nextImage}>
                    <Feather name="chevron-right" size={24} color="#fff" />
                  </TouchableOpacity>

                  <View style={styles.pagination}>
                    {trek.images.map((_, index) => (
                      <View
                        key={index}
                        style={[styles.paginationDot, index === currentIndex && styles.activeDot]}
                      />
                    ))}
                  </View>
                </>
              ) : (
                <View style={styles.noImageContainer}>
                  <Feather name="image" size={40} color="#999" />
                  <Text style={styles.noImageText}>No Images Available</Text>
                </View>
              )}
            </View>

            {/* Info Badges */}
            <View style={styles.quickInfoContainer}>
              <InfoBadge icon="map-pin" label="Location" value={trek.location} />
              <InfoBadge icon="trending-up" label="Altitude" value={`${trek.altitude}m`} />
              <InfoBadge icon="clock" label="Duration" value={trek.time_to_complete} />
              <InfoBadge icon="navigation" label="Distance" value={`${trek.distance_from_user}km`} />
            </View>

            <ScrollView style={styles.detailsScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>Rating</Text>
                <View style={styles.ratingRow}>
                  <StarRating rating={trek.rating} size={22} />
                  <Text style={styles.ratingText}>{trek.rating}/5</Text>
                </View>

                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{trek.review}</Text>

                <Text style={styles.sectionTitle}>Eco-Cultural Info</Text>
                <Text style={styles.description}>{trek.eco_cultural_info}</Text>

                <Text style={styles.sectionTitle}>Gear Checklist</Text>
                {trek.gear_checklist && trek.gear_checklist.length > 0 ? (
                  trek.gear_checklist.map((item, index) => (
                    <View key={index} style={styles.gearItemContainer}>
                      <Feather name="check-circle" size={18} color="#4CAF50" />
                      <Text style={styles.gearItem}>{item}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noGearText}>No gear information available</Text>
                )}
              </View>
            </ScrollView>

            {/* Book Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.bookBtn} onPress={handleBook}>
                <Text style={styles.bookBtnText}>Book Guide</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default UserTrekDetailModal;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    width: '100%',
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    color: '#333',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sliderContainer: {
    height: 240,
    position: 'relative',
  },
  image: {
    width: width - 32,
    height: 240,
    borderRadius: 12,
  },
  imageNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  prevButton: { left: 10 },
  nextButton: { right: 10 },
  pagination: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  noImageContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  noImageText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  quickInfoContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    gap: 10,
  },
  infoBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  infoBadgeText: {
    flexShrink: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoBadgeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  infoBadgeValue: {
    fontSize: 14,
    color: '#444',
  },
  detailsScroll: { flexGrow: 1 },
  detailsContainer: { padding: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  gearItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  gearItem: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  noGearText: {
    fontSize: 15,
    color: '#666',
    fontStyle: 'italic',
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookBtn: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
