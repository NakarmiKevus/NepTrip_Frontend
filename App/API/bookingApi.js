import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const bookingClient = axios.create({
  baseURL: 'http://192.168.0.105:8000/api/booking', 
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});


bookingClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


const requestBooking = async (bookingData) => {
  try {
    const response = await bookingClient.post('/request', bookingData);
    return response.data;
  } catch (error) {
    console.error('Error in requestBooking:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const getBookingRequests = async () => {
  try {
    const response = await bookingClient.get('/requests');
    return response.data; 
  } catch (error) {
    console.error('Error in getBookingRequests:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const getAllBookingRequests = async () => {
  try {
    const response = await bookingClient.get('/all-requests');
    return response.data; 
  } catch (error) {
    console.error('Error in getAllBookingRequests:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred', requests: [] };
  }
};


const respondToBooking = async (bookingId, status) => {
  try {
    const response = await bookingClient.put(`/respond/${bookingId}`, { status });
    return response.data; 
  } catch (error) {
    console.error('Error in respondToBooking:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const completeTour = async (bookingId) => {
  try {
    const response = await bookingClient.put(`/complete/${bookingId}`);
    return response.data; 
  } catch (error) {
    console.error('Error in completeTour:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const getUserBookings = async () => {
  try {
    const response = await bookingClient.get('/user-bookings');
    return response.data; 
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const getBookingStatus = async (bookingId) => {
  try {
    const response = await bookingClient.get(`/status/${bookingId}`);
    return response.data; 
  } catch (error) {
    console.error('Error in getBookingStatus:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const getLatestBooking = async () => {
  try {
    const response = await bookingClient.get('/latest-booking');
    return response.data;
  } catch (error) {
    console.error('Error in getLatestBooking:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};


const searchBookings = async (filters) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await bookingClient.get(`/search?${queryParams}`);
    return response.data; 
  } catch (error) {
    console.error('Error in searchBookings:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred', bookings: [] };
  }
};

export default {
  requestBooking,
  getBookingRequests,
  getAllBookingRequests,
  respondToBooking,
  completeTour,
  getUserBookings,
  getBookingStatus,
  getLatestBooking,
  searchBookings,
};