import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  StyleSheet 
} from 'react-native';
import TrekkingApi from '../API/trekkingApi'; // Ensure correct API import

const AdminDashboard = () => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [altitude, setAltitude] = useState('');
  const [review, setReview] = useState('');
  const [distance, setDistance] = useState('');
  const [timeToComplete, setTimeToComplete] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ecoCulturalInfo, setEcoCulturalInfo] = useState('');
  const [gearChecklist, setGearChecklist] = useState([]);
  const [newGearItem, setNewGearItem] = useState('');

  const handleAddGearItem = () => {
    if (newGearItem.trim() !== '') {
      setGearChecklist([...gearChecklist, newGearItem.trim()]);
      setNewGearItem('');
    }
  };

  const handleAddTrekking = async () => {
    if (!name || !location || !altitude || !review || !distance || !timeToComplete || !difficulty || !ecoCulturalInfo || gearChecklist.length === 0) {
      Alert.alert('Error', 'Please fill all fields and add at least one gear item.');
      return;
    }

    try {
      const trekkingData = {
        name,
        location,
        altitude: parseFloat(altitude),
        review,
        distance_from_user: parseFloat(distance),
        time_to_complete: timeToComplete,
        difficulty_level: difficulty,
        eco_cultural_info: ecoCulturalInfo,
        gear_checklist: gearChecklist,
      };

      const response = await TrekkingApi.addTrekking(trekkingData);
      if (response.success) {
        Alert.alert('Success', 'Trekking place added successfully');
        setName('');
        setLocation('');
        setAltitude('');
        setReview('');
        setDistance('');
        setTimeToComplete('');
        setDifficulty('');
        setEcoCulturalInfo('');
        setGearChecklist([]);
      } else {
        Alert.alert('Error', response.message || 'Failed to add trekking place');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Admin - Add Trekking Place</Text>

      <TextInput style={styles.input} placeholder="Trekking Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Altitude (meters)" keyboardType="numeric" value={altitude} onChangeText={setAltitude} />
      <TextInput style={styles.input} placeholder="Review" value={review} onChangeText={setReview} />
      <TextInput style={styles.input} placeholder="Distance from User (km)" keyboardType="numeric" value={distance} onChangeText={setDistance} />
      <TextInput style={styles.input} placeholder="Time to Complete (e.g. '3 days')" value={timeToComplete} onChangeText={setTimeToComplete} />
      
      <Text style={styles.label}>Difficulty Level:</Text>
      <View style={styles.difficultyContainer}>
        {['Easy', 'Moderate', 'Hard'].map((level) => (
          <TouchableOpacity 
            key={level} 
            style={[styles.difficultyOption, difficulty === level && styles.selectedDifficulty]}
            onPress={() => setDifficulty(level)}
          >
            <Text style={[styles.difficultyText, difficulty === level && styles.selectedDifficultyText]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Eco-Cultural Info" value={ecoCulturalInfo} onChangeText={setEcoCulturalInfo} />

      <Text style={styles.label}>Gear Checklist:</Text>
      <View style={styles.gearInputContainer}>
        <TextInput style={styles.gearInput} placeholder="Add gear item" value={newGearItem} onChangeText={setNewGearItem} />
        <TouchableOpacity style={styles.addGearButton} onPress={handleAddGearItem}>
          <Text style={styles.addGearText}>+</Text>
        </TouchableOpacity>
      </View>

      {gearChecklist.length > 0 && (
        <View style={styles.gearListContainer}>
          {gearChecklist.map((item, index) => (
            <Text key={index} style={styles.gearItem}>• {item}</Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleAddTrekking}>
        <Text style={styles.buttonText}>Add Trekking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: 'white' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  difficultyContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  difficultyOption: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#999' },
  selectedDifficulty: { backgroundColor: '#007bff' },
  difficultyText: { fontSize: 16, color: '#000' },
  selectedDifficultyText: { color: '#fff' },
  gearInputContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  gearInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, backgroundColor: 'white' },
  addGearButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 8, marginLeft: 8 },
  addGearText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  gearListContainer: { marginTop: 10, backgroundColor: '#fff', padding: 10, borderRadius: 8 },
  gearItem: { fontSize: 16, marginVertical: 2 },
  button: { backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default AdminDashboard;
