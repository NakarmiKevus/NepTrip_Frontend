import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a separate axios client for booking endpoints
const bookingClient = axios.create({
  baseURL: 'http://192.168.0.105:8000/api/booking', // Adjust IP/port as needed
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token from AsyncStorage (if available)
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

/* 
  Below are the booking endpoints defined in your backend:
    POST   /api/booking/request        => request a guide
    GET    /api/booking/requests       => get all pending requests (guide only)
    GET    /api/booking/all-requests   => get all requests regardless of status (guide only)
    PUT    /api/booking/respond/:id    => accept/decline booking (guide only)
    PUT    /api/booking/complete/:id   => complete a tour (guide only)
    GET    /api/booking/user-bookings  => get user's own bookings
    GET    /api/booking/status/:id     => get a specific booking's status
    GET    /api/booking/search         => search and filter bookings (guide only)
*/

// 1) Request a guide
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

// 2) Guide fetches pending booking requests
const getBookingRequests = async () => {
  try {
    const response = await bookingClient.get('/requests');
    return response.data; // { success, requests }
  } catch (error) {
    console.error('Error in getBookingRequests:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// 3) Guide fetches all booking requests (including past ones)
const getAllBookingRequests = async () => {
  try {
    const response = await bookingClient.get('/all-requests');
    return response.data; // { success, requests }
  } catch (error) {
    console.error('Error in getAllBookingRequests:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred', requests: [] };
  }
};

// 4) Guide responds to a booking (accept/decline)
const respondToBooking = async (bookingId, status) => {
  try {
    const response = await bookingClient.put(`/respond/${bookingId}`, { status });
    return response.data; // { success, message, booking }
  } catch (error) {
    console.error('Error in respondToBooking:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// 5) Guide completes a tour
const completeTour = async (bookingId) => {
  try {
    const response = await bookingClient.put(`/complete/${bookingId}`);
    return response.data; // { success, message, booking }
  } catch (error) {
    console.error('Error in completeTour:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// 6) User fetches all their bookings
const getUserBookings = async () => {
  try {
    const response = await bookingClient.get('/user-bookings');
    return response.data; // { success, bookings }
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// 7) User fetches a specific booking status
const getBookingStatus = async (bookingId) => {
  try {
    const response = await bookingClient.get(`/status/${bookingId}`);
    return response.data; // { success, booking }
  } catch (error) {
    console.error('Error in getBookingStatus:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// 8) User fetches their most recent booking
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

// 9) Search and filter bookings (guide only)
const searchBookings = async (filters) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await bookingClient.get(`/search?${queryParams}`);
    return response.data; // { success, bookings }
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