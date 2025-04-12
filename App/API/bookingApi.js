import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create an Axios client for booking API
const bookingClient = axios.create({
  baseURL: 'http://192.168.0.108:8000/api/booking',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Request a new booking
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

// Get booking requests
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

// Get all booking requests
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

// Respond to a booking request
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

// Mark a tour as complete
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

// Get bookings for a user
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

// Get the status of a booking
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

// Get the latest booking
const getLatestBooking = async () => {
  try {
    const response = await bookingClient.get('/latest-booking');
    return response.data;
  } catch (error) {
    console.error('Error in getLatestBooking:', error);
    if (error.response && error.response.status === 404) {
      return { success: true, booking: null, message: 'No bookings found' };
    }
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// Search bookings with filters
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

// Get booked dates for a guide
const getBookedDates = async (guideId) => {
  try {
    let url = '/booked-dates';
    if (guideId) {
      url += `?guideId=${guideId}`;
    }
    const response = await bookingClient.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getBookedDates:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Failed to fetch booked dates', dates: [] };
  }
};

// Get available guides for a date
const getAvailableGuides = async (date) => {
  try {
    if (!date) {
      return { success: false, message: 'Date is required', guides: [] };
    }
    const response = await bookingClient.get(`/available-guides?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error in getAvailableGuides:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Failed to fetch available guides', guides: [] };
  }
};

// Update payment status for a booking
const updatePaymentStatus = async (bookingId, paymentData) => {
  try {
    const response = await bookingClient.put(`/payment/${bookingId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// Update payment method for a booking
const updatePaymentMethod = async (bookingId, paymentData) => {
  try {
    const response = await bookingClient.put(`/payment-method/${bookingId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error('Error updating payment method:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// Export all API functions
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
  getBookedDates,
  getAvailableGuides,
  updatePaymentStatus,
  updatePaymentMethod,
};