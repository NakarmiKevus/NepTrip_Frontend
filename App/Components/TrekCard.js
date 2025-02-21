import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export const TrekCard = ({ trek, onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, style]}>
      <Image
        source={{ uri: trek.image }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <Text style={styles.trekName}>{trek.name}</Text>
        <View style={styles.trekDetails}>
          <Text style={styles.difficultyText}>{trek.difficulty}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.distanceText}>{trek.distance}</Text>
        </View>
        <Text style={styles.locationText}>{trek.location}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  trekName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  trekDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  difficultyText: {
    color: '#2196F3',
    fontSize: 14,
    fontWeight: '500',
  },
  dotSeparator: {
    marginHorizontal: 8,
    color: '#666',
  },
  distanceText: {
    color: '#666',
    fontSize: 14,
  },
  locationText: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
  },
});