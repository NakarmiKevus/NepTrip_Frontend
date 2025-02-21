import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';

export const GuideScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Guide</Text>

        <View style={styles.guideCard}>
          <Image
            source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7SP7b4iDyJF2XqiZetPcWO36Csyjxp.png' }}
            style={styles.guideImage}
          />
          <Text style={styles.guideName}>Name</Text>
          <Text style={styles.appointmentText}>Make Appointment</Text>

          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua.
          </Text>

          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => console.log('Book pressed')}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:50,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center', // Centers content
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  guideCard: {
    width: '90%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  guideImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  guideName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  appointmentText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: 'black',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
