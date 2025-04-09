import client from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
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

// ✅ Fetch logged-in user's profile
const getUserProfile = async () => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.get('/profile', authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Delete user (Admin only)
const deleteUser = async (userId) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.delete(`/delete-user/${userId}`, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch all guides dynamically
const getGuides = async () => {
  try {
    const response = await client.get('/guides');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch a specific guide's details
const getGuideProfile = async (guideId) => {
  try {
    const response = await client.get(`/guide/${guideId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Update user profile (Name, Email, Address, Phone)
const updateUserProfile = async (userData) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.put('/update-profile', userData, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Upload or update profile picture
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

// ✅ Update guide details (Admin only - for experience, language, trek count)
const updateGuideDetails = async (guideId, guideData) => {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await client.put(`/update-guide/${guideId}`, guideData, authHeaders);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
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
  updateGuideDetails
};