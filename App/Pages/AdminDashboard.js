import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TrekkingApi from "../API/trekkingApi";
import DashboardTrekkingCard from "../Components/DashboardTrekkingCard"; // Assuming you have a component for displaying trekking cards

const AdminDashboard = ({ navigation }) => {
  const [trekkingPlaces, setTrekkingPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrekkingPlaces();
    const unsubscribe = navigation.addListener("focus", fetchTrekkingPlaces);
    return unsubscribe;
  }, [navigation]);

  const fetchTrekkingPlaces = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TrekkingApi.getAllTrekking();
      if (response?.success && Array.isArray(response.trekkingSpots)) {
        setTrekkingPlaces(response.trekkingSpots);
      } else {
        setTrekkingPlaces([]);
      }
    } catch (error) {
      console.error("Error fetching trekking places:", error);
      setError("Failed to load trekking places");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrekkingPlaces();
  };

  const handleTrekkingPress = (trekId) => {
    navigation.navigate("TrekkingDetails", { trekId });
  };

  const handleAddTrekkingPress = () => {
    navigation.navigate("TrekkingForm");
  };

  const handleEditTrekking = (trekId) => {
    navigation.navigate("EditTrekking", { trekId });
  };

  const handleDeleteTrekking = (trekId) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this trekking place?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await TrekkingApi.deleteTrekking(trekId);
            Alert.alert("Success", "Trekking place deleted successfully");
            fetchTrekkingPlaces();
          } catch (error) {
            Alert.alert("Error", "Failed to delete trekking place");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Trekking Dashboard</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTrekkingPress}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Add Trek</Text>
          </TouchableOpacity>
        </View>

        {/* Loading */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading trekking places...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTrekkingPlaces}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : trekkingPlaces.length > 0 ? (
          <FlatList
            data={trekkingPlaces}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DashboardTrekkingCard
                item={item}
                onPress={handleTrekkingPress}
                onEdit={handleEditTrekking}
                onDelete={handleDeleteTrekking}
              />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#4A90E2"]} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No trekking places available</Text>
            <Text style={styles.emptySubText}>Add your first trekking place!</Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={handleAddTrekkingPress}>
              <Text style={styles.emptyAddButtonText}>Add Trekking Place</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  addButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#7F8C8D",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#F44336",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 8,
    fontWeight: "bold",
  },
  emptySubText: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 24,
    textAlign: "center",
  },
  emptyAddButton: {
    backgroundColor: "#27AE60",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default AdminDashboard;
