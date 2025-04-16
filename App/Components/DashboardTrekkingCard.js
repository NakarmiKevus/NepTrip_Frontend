import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Rating } from "react-native-ratings"

const DashboardTrekkingCard = ({ item, onPress, onEdit, onDelete }) => {
  if (!item || !item.name) return null

  const getDifficultyColor = (level) => {
    switch (level) {
      case "Easy":
        return "#4CAF50"
      case "Moderate":
        return "#FF9800"
      case "Hard":
        return "#F44336"
      default:
        return "#757575"
    }
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item._id)}>
      {/* Trek Image */}
      {item.images && item.images.length > 0 ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.noImage]}>
          <Ionicons name="image-outline" size={40} color="#bdbdbd" />
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* Trek Info */}
      <View style={styles.details}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty_level) }]}>
            <Text style={styles.difficultyText}>{item.difficulty_level}</Text>
          </View>
        </View>

        {/* Location */}
        <View style={styles.location}>
          <Ionicons name="location" size={16} color="#757575" />
          <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Rating
            readonly
            startingValue={item.rating || 0}
            imageSize={16}
            fractions={1}
            style={{ paddingVertical: 5 }}
            tintColor="#FFFFFF"
          />
          <Text style={styles.ratingText}>{item.rating?.toFixed(1) || "0.0"}</Text>
        </View>

        {/* Stats */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>Altitude: {item.altitude}m</Text>
          <Text style={styles.metaText}>Distance: {item.distance_from_user}km</Text>
          <Text style={styles.metaText}>Time: {item.time_to_complete}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => onEdit(item._id)}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => onDelete(item._id)}>
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    height: 180,
    width: "100%",
    backgroundColor: "#f0f0f0",
  },
  noImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    marginTop: 8,
    color: "#999",
  },
  details: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    flex: 1,
    marginRight: 8,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  difficultyText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#F1C40F",
    fontWeight: "bold",
  },
  meta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButton: {
    backgroundColor: "#4A90E2",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
})

export default DashboardTrekkingCard
