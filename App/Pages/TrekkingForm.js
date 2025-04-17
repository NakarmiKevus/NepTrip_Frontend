import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  StyleSheet,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { Rating } from 'react-native-ratings';
import TrekkingApi from '../API/trekkingApi';

const TrekkingForm = ({ navigation }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [altitude, setAltitude] = useState('');
  const [rating, setRating] = useState(3); // Default to 3 stars
  const [review, setReview] = useState('');
  const [distance, setDistance] = useState('');
  const [timeToComplete, setTimeToComplete] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [ecoCulturalInfo, setEcoCulturalInfo] = useState('');
  const [gearChecklist, setGearChecklist] = useState([]);
  const [newGearItem, setNewGearItem] = useState('');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add gear item to the checklist
  const handleAddGearItem = () => {
    if (newGearItem.trim() !== '') {
      setGearChecklist([...gearChecklist, newGearItem.trim()]);
      setNewGearItem('');
    }
  };

  // Remove gear item from the checklist
  const handleRemoveGear = (index) => {
    const updatedGear = [...gearChecklist];
    updatedGear.splice(index, 1);
    setGearChecklist(updatedGear);
  };

  // Pick images from device library
  const pickImages = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Permission to access camera roll is required!');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Prepare images in the format expected by the API
        const selectedImages = result.assets.map(asset => {
          // Create file objects compatible with FormData
          const fileType = asset.uri.split('.').pop();
          return {
            uri: asset.uri,
            name: `image-${Date.now()}.${fileType}`,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
          };
        });
        
        setImages([...images, ...selectedImages]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  // Remove image from selected images
  const handleRemoveImage = (index) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  // Reset form after submission
  const resetForm = () => {
    setName('');
    setLocation('');
    setAltitude('');
    setRating(3);
    setReview('');
    setDistance('');
    setTimeToComplete('');
    setDifficulty('');
    setEcoCulturalInfo('');
    setGearChecklist([]);
    setNewGearItem('');
    setImages([]);
  };

  // Handle form submission
  const handleAddTrekking = async () => {
    // Validate form fields
    if (!name || !location || !altitude || !review || !distance || 
        !timeToComplete || !difficulty || !ecoCulturalInfo || gearChecklist.length === 0) {
      Alert.alert('Error', 'Please fill all fields and add at least one gear item.');
      return;
    }

    // Validate we have at least 3 images
    if (images.length < 3) {
      Alert.alert('Error', 'Please upload at least 3 images');
      return;
    }

    // Show loading indicator
    setIsLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', name);
      formData.append('location', location);
      formData.append('altitude', altitude);
      const roundedRating = Math.round(rating * 2) / 2; // Round to the nearest 0.5
      formData.append('rating', roundedRating.toString());
      formData.append('review', review);
      formData.append('distance_from_user', distance);
      formData.append('time_to_complete', timeToComplete);
      formData.append('difficulty_level', difficulty);
      formData.append('eco_cultural_info', ecoCulturalInfo);
      
      // Add gear checklist
      gearChecklist.forEach((item, index) => {
        formData.append(`gear_checklist[${index}]`, item);
      });
      
      // Add each image to the form data
      images.forEach(image => {
        formData.append('images', image);
      });

      // Submit to API
      const response = await TrekkingApi.addTrekking(formData);
      
      if (response && response.success) {
        Alert.alert(
          'Success', 
          'Trekking place added successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        resetForm();
      } else {
        Alert.alert('Error', response?.message || 'Failed to add trekking place');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Add New Trekking Place</Text>
      </View>

      {/* Basic Details */}
      <TextInput 
        style={styles.input} 
        placeholder="Trekking Name" 
        value={name} 
        onChangeText={setName} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Location" 
        value={location} 
        onChangeText={setLocation} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Altitude (meters)" 
        keyboardType="numeric" 
        value={altitude} 
        onChangeText={setAltitude} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Distance from User (km)" 
        keyboardType="numeric" 
        value={distance} 
        onChangeText={setDistance} 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Time to Complete (e.g. '3 days')" 
        value={timeToComplete} 
        onChangeText={setTimeToComplete} 
      />

      {/* Difficulty Selection */}
      <Text style={styles.label}>Difficulty Level:</Text>
      <View style={styles.difficultyContainer}>
        {['Easy', 'Moderate', 'Hard'].map((level) => (
          <TouchableOpacity 
            key={level} 
            style={[
              styles.difficultyOption, 
              difficulty === level && styles.selectedDifficulty
            ]}
            onPress={() => setDifficulty(level)}
          >
            <Text style={[
              styles.difficultyText, 
              difficulty === level && styles.selectedDifficultyText
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Star Rating */}
      <Text style={styles.label}>Trek Rating:</Text>
      <View style={styles.ratingContainer}>
        <Rating
          showRating
          type="star"
          ratingCount={5}
          imageSize={30}
          fractions={2} // Enables half-star ratings
          onFinishRating={(value) => {
            const roundedValue = Math.round(value * 2) / 2; // Round to the nearest 0.5
            setRating(roundedValue);
          }}
          style={{ paddingVertical: 10 }}
          startingValue={rating}
        />
      </View>

      {/* Review Text */}
      <Text style={styles.label}>Review Comments:</Text>
      <TextInput 
        style={[styles.input, styles.multilineInput]} 
        placeholder="Provide detailed feedback about this trek" 
        value={review} 
        onChangeText={setReview}
        multiline
      />
      
      <TextInput 
        style={[styles.input, styles.multilineInput]} 
        placeholder="Eco-Cultural Info" 
        value={ecoCulturalInfo} 
        onChangeText={setEcoCulturalInfo}
        multiline
      />

      {/* Gear Checklist */}
      <Text style={styles.label}>Gear Checklist:</Text>
      <View style={styles.gearInputContainer}>
        <TextInput 
          style={styles.gearInput} 
          placeholder="Add gear item" 
          value={newGearItem} 
          onChangeText={setNewGearItem} 
        />
        <TouchableOpacity 
          style={styles.addGearButton} 
          onPress={handleAddGearItem}
        >
          <Text style={styles.addGearText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Display Gear Items */}
      {gearChecklist.length > 0 && (
        <View style={styles.gearListContainer}>
          {gearChecklist.map((item, index) => (
            <View key={index} style={styles.gearItemRow}>
              <Text style={styles.gearItem}>• {item}</Text>
              <TouchableOpacity onPress={() => handleRemoveGear(index)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Image Upload Section */}
      <Text style={styles.label}>Trek Images (Minimum 3):</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickImages}>
        <Text style={styles.uploadButtonText}>Select Images</Text>
      </TouchableOpacity>
      
      {/* Display Selected Images */}
      {images.length > 0 && (
        <View style={styles.imagesPreviewContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => handleRemoveImage(index)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
      
      {/* Selected Image Count */}
      <Text style={[
        styles.imageCountText, 
        images.length < 3 ? styles.warningText : styles.successText
      ]}>
        {images.length} of 3 required images selected
      </Text>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[
          styles.submitButton, 
          isLoading && styles.disabledButton
        ]} 
        onPress={handleAddTrekking}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Add Trekking Place</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginBottom: 15, 
    size: 200,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007bff',
  },
  spacer: {
    width: 50, 
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  difficultyOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#999',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  difficultyText: {
    fontSize: 16,
    color: '#000',
  },
  selectedDifficultyText: {
    color: '#fff',
  },
  ratingContainer: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 8,
    padding: 5,
  },
  gearInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gearInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: 'white',
  },
  addGearButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  addGearText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  gearListContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  gearItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  gearItem: {
    fontSize: 16,
    flex: 1,
  },
  removeText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 5,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagesPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageCountText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  warningText: {
    color: '#dc3545',
  },
  successText: {
    color: '#28a745',
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrekkingForm;