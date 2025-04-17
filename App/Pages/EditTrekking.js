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
  Modal,
  KeyboardAvoidingView,
  Platform,
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
  
  // State for gear management
  const [showGearModal, setShowGearModal] = useState(false);
  const [newGearItem, setNewGearItem] = useState("");
  const [editingGearIndex, setEditingGearIndex] = useState(null);

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
      !timeToComplete || !difficulty || !ecoCulturalInfo
    ) {
      return Alert.alert("Error", "Please fill all required fields.");
    }

    if (gearChecklist.length === 0) {
      return Alert.alert("Error", "Please add at least one gear item to the checklist.");
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

      // Call the update API
      const res = await TrekkingApi.updateTrekking(trekId, updatedTrek);

      if (res.success) {
        Alert.alert("Success", "Trekking details updated!");
        navigation.goBack();
      } else {
        Alert.alert("Error", res.message || "Update failed.");
      }
    } catch (error) {
      console.error("Update error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setUpdating(false);
    }
  };

  // Gear management functions
  const openAddGearModal = () => {
    setNewGearItem("");
    setEditingGearIndex(null);
    setShowGearModal(true);
  };

  const openEditGearModal = (index) => {
    setNewGearItem(gearChecklist[index]);
    setEditingGearIndex(index);
    setShowGearModal(true);
  };

  const saveGearItem = () => {
    if (!newGearItem.trim()) {
      Alert.alert("Error", "Please enter a gear item.");
      return;
    }

    if (editingGearIndex !== null) {
      // Edit existing item
      const updatedList = [...gearChecklist];
      updatedList[editingGearIndex] = newGearItem.trim();
      setGearChecklist(updatedList);
    } else {
      // Add new item
      setGearChecklist([...gearChecklist, newGearItem.trim()]);
    }
    
    setShowGearModal(false);
    setNewGearItem("");
    setEditingGearIndex(null);
  };

  const removeGearItem = (index) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            const updatedList = [...gearChecklist];
            updatedList.splice(index, 1);
            setGearChecklist(updatedList);
          } 
        }
      ]
    );
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Edit Trekking Details</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Trek Name *" 
            value={name} 
            onChangeText={setName} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Location *" 
            value={location} 
            onChangeText={setLocation} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Altitude (m) *" 
            value={altitude} 
            keyboardType="numeric" 
            onChangeText={setAltitude} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Distance (km) *" 
            value={distance} 
            keyboardType="numeric" 
            onChangeText={setDistance} 
          />
          <TextInput 
            style={styles.input} 
            placeholder="Time to Complete *" 
            value={timeToComplete} 
            onChangeText={setTimeToComplete} 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <View style={styles.difficultyContainer}>
            {["Easy", "Moderate", "Hard"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.difficultyOption, difficulty === level && styles.selectedDifficulty]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={difficulty === level ? styles.selectedDifficultyText : styles.difficultyText}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating & Review</Text>
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
            placeholder="Review *"
            value={review}
            onChangeText={setReview}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <TextInput
            style={[styles.input, { minHeight: 80 }]}
            placeholder="Eco-Cultural Information *"
            value={ecoCulturalInfo}
            onChangeText={setEcoCulturalInfo}
            multiline
          />
        </View>

        <View style={styles.section}>
          <View style={styles.gearHeader}>
            <Text style={styles.sectionTitle}>Gear Checklist</Text>
            <TouchableOpacity 
              style={styles.addGearBtn} 
              onPress={openAddGearModal}
            >
              <Ionicons name="add-circle" size={24} color="#007bff" />
              <Text style={styles.addGearText}>Add Item</Text>
            </TouchableOpacity>
          </View>
          
          {gearChecklist.length === 0 ? (
            <Text style={styles.emptyGearText}>No gear items added yet. Tap "Add Item" to start.</Text>
          ) : (
            gearChecklist.map((item, index) => (
              <View key={index} style={styles.gearItem}>
                <View style={styles.gearItemLeft}>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
                  <Text style={styles.gearText}>{item}</Text>
                </View>
                <View style={styles.gearItemActions}>
                  <TouchableOpacity onPress={() => openEditGearModal(index)} style={styles.gearActionBtn}>
                    <Ionicons name="pencil-outline" size={18} color="#007bff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeGearItem(index)} style={styles.gearActionBtn}>
                    <Ionicons name="trash-outline" size={18} color="#dc3545" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity 
          style={styles.updateBtn} 
          onPress={handleUpdate} 
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateBtnText}>Update Trek</Text>
          )}
        </TouchableOpacity>

        {/* Gear Item Modal */}
        <Modal
          visible={showGearModal}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {editingGearIndex !== null ? "Edit Gear Item" : "Add Gear Item"}
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Enter gear item"
                value={newGearItem}
                onChangeText={setNewGearItem}
                autoFocus
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setShowGearModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.saveButton]} 
                  onPress={saveGearItem}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  difficultyContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  difficultyOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    minWidth: 100,
    alignItems: "center",
  },
  selectedDifficulty: {
    backgroundColor: "#007bff",
    borderColor: "#007bff",
  },
  difficultyText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDifficultyText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  // Gear styles
  gearHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addGearBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  addGearText: {
    color: "#007bff",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyGearText: {
    color: "#666",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
  gearItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  gearItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  gearText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  gearItemActions: {
    flexDirection: "row",
  },
  gearActionBtn: {
    padding: 6,
    marginLeft: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#007bff",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  // Update button
  updateBtn: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  updateBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default EditTrekking;