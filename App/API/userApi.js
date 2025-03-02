// Import your existing client if you have API setup there
import client from './client';

// If your client.js doesn't have auth token handling, you might need to add it here
const getAllUsers = async () => {
  try {
    const response = await client.get('/all-users');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const getUserProfile = async () => {
  try {
    const response = await client.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add other user-related API methods here

export default {
  getAllUsers,
  getUserProfile
};