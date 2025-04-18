import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const bookingClient = axios.create({
  baseURL: 'http://192.168.0.108:8000/api/booking',
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

// --- API Functions ---

const requestBooking = async (bookingData) => {
  try {
    const response = await bookingClient.post('/request', bookingData);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const getBookingRequests = async () => {
  try {
    const response = await bookingClient.get('/requests');
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const getAllBookingRequests = async () => {
  try {
    const response = await bookingClient.get('/all-requests');
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const respondToBooking = async (bookingId, status) => {
  try {
    const response = await bookingClient.put(`/respond/${bookingId}`, { status });
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const completeTour = async (bookingId) => {
  try {
    const response = await bookingClient.put(`/complete/${bookingId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const getUserBookings = async () => {
  try {
    const response = await bookingClient.get('/user-bookings');
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const getBookingStatus = async (bookingId) => {
  try {
    const response = await bookingClient.get(`/status/${bookingId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const getLatestBooking = async () => {
  try {
    const response = await bookingClient.get('/latest-booking');
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: true, booking: null, message: 'No bookings found' };
    }
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const searchBookings = async (filters) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await bookingClient.get(`/search?${queryParams}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, bookings: [], message: 'Network error occurred' };
  }
};

const getBookedDates = async (guideId) => {
  try {
    const url = guideId ? `/booked-dates?guideId=${guideId}` : '/booked-dates';
    const response = await bookingClient.get(url);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, dates: [], message: 'Failed to fetch booked dates' };
  }
};

const getAvailableGuides = async (date) => {
  try {
    if (!date) return { success: false, message: 'Date is required', guides: [] };
    const response = await bookingClient.get(`/available-guides?date=${date}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, guides: [], message: 'Failed to fetch available guides' };
  }
};

const updatePaymentStatus = async (bookingId, paymentData) => {
  try {
    const response = await bookingClient.put(`/payment/${bookingId}`, paymentData);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

const updatePaymentMethod = async (bookingId, paymentData) => {
  try {
    const response = await bookingClient.put(`/payment-method/${bookingId}`, paymentData);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Network error occurred' };
  }
};

// ✅ NEW: Confirm user-side payment
const markUserPaymentConfirmed = async (bookingId) => {
  try {
    const response = await bookingClient.put(`/mark-user-payment/${bookingId}`);
    return response.data;
  } catch (error) {
    return error.response?.data || { success: false, message: 'Failed to mark payment' };
  }
};

// Export all
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
  markUserPaymentConfirmed // ✅ include this here so it’s usable in ConfirmPayment.js
};
