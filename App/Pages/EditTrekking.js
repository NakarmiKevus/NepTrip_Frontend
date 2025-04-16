import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Rating } from "react-native-ratings";
import TrekkingApi from "../API/trekkingApi";
import { Ionicons } from "@expo/vector-icons";

const EditTrekking = ({ route, navigation }) => {
  const { trekId } = route.params;
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [altitude, setAltitude] = useState("");
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [distance, setDistance] = useState("");
  const [timeToComplete, setTimeToComplete] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [ecoCulturalInfo, setEcoCulturalInfo] = useState("");
  const [gearChecklist, setGearChecklist] = useState([]);

  useEffect(() => {
    fetchTrekDetails();
  }, []);

  const fetchTrekDetails = async () => {
    try {
      setLoading(true);
      const res = await TrekkingApi.getTrekkingById(trekId);
      if (res && res.success && res.trekking) {
        const trek = res.trekking;
        setName(trek.name);
        setLocation(trek.location);
        setAltitude(trek.altitude.toString());
        setRating(trek.rating);
        setReview(trek.review);
        setDistance(trek.distance_from_user.toString());
        setTimeToComplete(trek.time_to_complete);
        setDifficulty(trek.difficulty_level);
        setEcoCulturalInfo(trek.eco_cultural_info);
        setGearChecklist(trek.gear_checklist || []);
      }
    } catch (error) {
      console.error("Error fetching trek:", error);
      Alert.alert("Error", "Failed to load trek data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (
      !name || !location || !altitude || !review || !distance ||
      !timeToComplete || !difficulty || !ecoCulturalInfo || gearChecklist.length === 0
    ) {
      return Alert.alert("Error", "Please fill all fields and add gear items.");
    }

    try {
      setUpdating(true);
      const updatedTrek = {
        name,
        location,
        altitude,
        rating,
        review,
        distance_from_user: distance,
        time_to_complete: timeToComplete,
        difficulty_level: difficulty,
        eco_cultural_info: ecoCulturalInfo,
        gear_checklist: gearChecklist,
      };

      // Send update request (you should create this in trekkingApi if not already)
      // await TrekkingApi.updateTrekking(trekId, updatedTrek);

      Alert.alert("Success", "Trekking details updated!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update trek.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading trek details...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Trekking Details</Text>

      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
      <TextInput style={styles.input} placeholder="Altitude (m)" value={altitude} keyboardType="numeric" onChangeText={setAltitude} />
      <TextInput style={styles.input} placeholder="Distance (km)" value={distance} keyboardType="numeric" onChangeText={setDistance} />
      <TextInput style={styles.input} placeholder="Time to Complete" value={timeToComplete} onChangeText={setTimeToComplete} />

      <Text style={styles.label}>Difficulty Level:</Text>
      <View style={styles.difficultyContainer}>
        {["Easy", "Moderate", "Hard"].map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.difficultyOption, difficulty === level && styles.selectedDifficulty]}
            onPress={() => setDifficulty(level)}
          >
            <Text style={difficulty === level ? styles.selectedDifficultyText : styles.difficultyText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Rating:</Text>
      <Rating
        showRating
        type="star"
        ratingCount={5}
        imageSize={30}
        fractions={1}
        startingValue={rating}
        onFinishRating={setRating}
        style={{ marginBottom: 16 }}
      />

      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Review"
        value={review}
        onChangeText={setReview}
        multiline
      />
      <TextInput
        style={[styles.input, { minHeight: 80 }]}
        placeholder="Eco-Cultural Info"
        value={ecoCulturalInfo}
        onChangeText={setEcoCulturalInfo}
        multiline
      />

      <Text style={styles.label}>Gear Checklist:</Text>
      {gearChecklist.map((item, index) => (
        <View key={index} style={styles.gearItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
          <Text style={styles.gearText}>{item}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate} disabled={updating}>
        {updating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.updateBtnText}>Update Trek</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555",
  },
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: "white",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  difficultyOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
  },
  selectedDifficulty: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  difficultyText: {
    color: "#000",
  },
  selectedDifficultyText: {
    color: "#fff",
  },
  gearItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  gearText: {
    marginLeft: 8,
    fontSize: 14,
  },
  updateBtn: {
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  updateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditTrekking;
