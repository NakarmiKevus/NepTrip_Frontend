import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const GuideScreen = () => {
  const navigation = useNavigation();

  const guideInfo = {
    name: 'John Doe',
    bio: 'Experienced trekking guide with 10+ years in the Himalayas.',
    experience: '10 years',
    languages: ['English', 'Nepali'],
    availability: 'March - November',
    price: '$50 per day',
    ratings: 4.8,
  };

  // Function to render stars based on ratings
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FontAwesome key={i} name="star" size={50} color="#FFD700" />);
    }
    if (halfStar) {
      stars.push(<FontAwesome key="half" name="star-half-full" size={50} color="#FFD700" />);
    }

    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7SP7b4iDyJF2XqiZetPcWO36Csyjxp.png' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{guideInfo.name}</Text>
          <Text style={styles.bio}>{guideInfo.bio}</Text>

          <View style={styles.ratingContainer}>
            {renderStars(guideInfo.ratings)}
          </View>
          <Text style={styles.ratingText}>{guideInfo.ratings}/5</Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.personalInfoContainer}>
          <Text style={styles.sectionTitle}>Guide Information</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{guideInfo.experience}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Languages</Text>
            <Text style={styles.infoValue}>{guideInfo.languages.join(', ')}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Price</Text>
            <Text style={styles.infoValue}>{guideInfo.price}</Text>
          </View>
        </View>
        <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('ConfirmBooking')}
      >
        <Text style={styles.bookButtonText}>Book</Text>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
    marginTop:50,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  ratingText: {
    fontSize: 18,
    marginLeft: 5,
    fontWeight: '600',
    color: '#666',
  },
  personalInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoItem: {
    marginBottom: 15,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
  bookButton: {
    marginTop: 20,
    backgroundColor: 'black',
    paddingVertical: 15,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 8,
  },
  
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default GuideScreen;
