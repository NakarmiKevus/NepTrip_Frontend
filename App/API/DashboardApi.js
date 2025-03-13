import apiClient from './apiClient';

// ✅ Fetch all dashboard statistics (Future feature: analytics, number of treks, etc.)
const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default { getDashboardStats };
