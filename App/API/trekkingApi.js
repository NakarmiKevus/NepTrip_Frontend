import apiClient from './apiClient';

// ✅ Get all trekking places
const getAllTrekking = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error in getAllTrekking:', error);
    throw error.response?.data || { message: error.message };
  }
};

// ✅ Get a specific trekking place by ID
const getTrekkingById = async (id) => {
  try {
    const response = await apiClient.get(`/dashboard/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getTrekkingById:', error);
    throw error.response?.data || { message: error.message };
  }
};

// ✅ Add a new trekking place (Admin)
const addTrekking = async (trekkingData) => {
  try {
    const response = await apiClient.post('/dashboard', trekkingData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error in addTrekking:', error);
    throw error.response?.data || { message: error.message };
  }
};

// ✅ Update a trekking place (Admin)
const updateTrekking = async (id, trekkingData) => {
  try {
    const response = await apiClient.put(`/dashboard/${id}`, trekkingData);
    return response.data;
  } catch (error) {
    console.error('Error in updateTrekking:', error);
    throw error.response?.data || { message: error.message };
  }
};

// ✅ Delete a trekking place (Admin)
const deleteTrekking = async (id) => {
  try {
    const response = await apiClient.delete(`/dashboard/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteTrekking:', error);
    throw error.response?.data || { message: error.message };
  }
};

export default {
  getAllTrekking,
  getTrekkingById,
  addTrekking,
  updateTrekking,
  deleteTrekking,
};
