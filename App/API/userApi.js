// Import your existing client if you have API setup there
import client from './client';

// Helper function to include Authorization token dynamically
const authHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// ✅ Fetch all users (Admin only)
const getAllUsers = async () => {
  try {
    const response = await client.get('/all-users', authHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch logged-in user's profile
const getUserProfile = async () => {
  try {
    const response = await client.get('/profile', authHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Delete user (Admin only)
const deleteUser = async (userId) => {
  try {
    const response = await client.delete(`/delete-user/${userId}`, authHeader());
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
    const response = await client.put('/update-profile', userData, authHeader());
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Upload or update profile picture
const uploadProfilePicture = async (formData) => {
  try {
    const response = await client.post('/upload-profile', formData, {
      ...authHeader(),
      headers: {
        ...authHeader().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
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
  uploadProfilePicture
};
