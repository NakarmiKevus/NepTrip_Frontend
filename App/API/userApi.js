import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get authorization headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ✅ Fetch all users (Admin only)
const getAllUsers = async () => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.get('/all-users', authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch logged-in user's profile (used throughout the app)
const getUserProfile = async () => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.get('/profile', authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Delete a user (Admin only)
const deleteUser = async (userId) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.delete(`/delete-user/${userId}`, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch all guides dynamically (public)
const getGuides = async () => {
  try {
    const response = await client.get('/guides');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch a specific guide's profile
const getGuideProfile = async (guideId) => {
  try {
    const response = await client.get(`/guide/${guideId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Update user profile (name, email, address, phone)
const updateUserProfile = async (userData) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.put('/update-profile', userData, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Upload or update user profile picture
const uploadProfilePicture = async (formData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await client.post('/upload-profile', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Update guide details (Admin only)
const updateGuideDetails = async (guideId, guideData) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.put(`/update-guide/${guideId}`, guideData, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Create a new guide (Admin only)
const createGuide = async (guideData) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.post('/create-guide', guideData, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Upload guide's profile picture (Admin only)
const uploadGuideProfilePicture = async (guideId, formData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await client.post(`/upload-guide-profile/${guideId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Upload guide's QR code (Admin only)
const uploadGuideQrCode = async (guideId, formData) => {
  try {
    const token = await AsyncStorage.getItem('token');
    const response = await client.post(`/upload-guide-qr/${guideId}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const fetchGuides = async () => {
  try {
    setLoading(true);
    const data = await userApi.getGuides();
    console.log("API Response:", JSON.stringify(data)); // ✅ Added logging for API response
    if (data.success && data.guides?.length > 0) {
      setGuides(data.guides);
    } else {
      Alert.alert('Error', 'No guides found.');
    }
  } catch (error) {
    console.error("Error fetching guides:", error); // ✅ Added error logging
    Alert.alert('Error', 'Failed to load guide details.');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};

exports.getAllGuides = async (req, res) => {
  try {
    // Fetch all users with the role of 'guide'
    const guides = await User.find({ role: 'guide' })
      .select('fullname email phoneNumber address avatar qrCode experience trekCount language');

    // Enrich each guide with average rating and total reviews
    const enrichedGuides = await Promise.all(
      guides.map(async (guide) => {
        // Fetch all bookings with ratings for the current guide
        const reviews = await Booking.find({
          guide: guide._id,
          rating: { $exists: true, $ne: null }
        }).select('rating');

        const totalReviews = reviews.length;
        let averageRating = 0;

        // Calculate the average rating if there are reviews
        if (totalReviews > 0) {
          const sum = reviews.reduce((total, booking) => total + booking.rating, 0);
          averageRating = Number((sum / totalReviews).toFixed(1));
        }

        console.log(`Guide ${guide.fullname}: ${totalReviews} reviews, avg rating: ${averageRating}`);

        // Return the enriched guide object
        return {
          ...guide.toObject(),
          averageRating,
          totalReviews
        };
      })
    );

    // Respond with the enriched guides
    res.json({ success: true, guides: enrichedGuides });
  } catch (error) {
    console.error("Error in getAllGuides:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default {
  getAllUsers,
  getUserProfile,
  deleteUser,
  getGuides,
  getGuideProfile,
  updateUserProfile,
  uploadProfilePicture,
  updateGuideDetails,
  createGuide,
  uploadGuideProfilePicture,
  uploadGuideQrCode, // ✅ New function for QR code upload
  fetchGuides, // ✅ Added fetchGuides function
};
