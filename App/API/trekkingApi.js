import apiClient from './apiClient';

// ✅ Fetch all trekking places dynamically
const getAllTrekking = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Fetch details of a specific trekking place
const getTrekkingById = async (id) => {
  try {
    const response = await apiClient.get(`/dashboard/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Admin adds a new trekking place
const addTrekking = async (trekkingData) => {
  try {
    const response = await apiClient.post('/dashboard', trekkingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default { getAllTrekking, getTrekkingById, addTrekking };
