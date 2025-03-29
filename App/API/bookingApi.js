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

// ✅ Make a new booking request
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

// ✅ Get only pending booking requests for guide
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

// ✅ Get all booking requests (guide)
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

// ✅ Guide responds to a booking
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

// ✅ Guide completes a tour
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

// ✅ Get all bookings for current user
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

// ✅ Get status of a specific booking
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

// ✅ Get the latest booking for the user - UPDATED TO HANDLE 404
const getLatestBooking = async () => {
  try {
    const response = await bookingClient.get('/latest-booking');
    return response.data;
  } catch (error) {
    console.error('Error in getLatestBooking:', error);
    if (error.response && error.response.status === 404) {
      // If 404, return a success response with no booking
      return { success: true, booking: null, message: 'No bookings found' };
    }
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Network error occurred' };
  }
};

// ✅ Search bookings (guide)
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

// ✅ Get all already booked dates (for disabling in calendar)
const getBookedDates = async () => {
  try {
    const response = await bookingClient.get('/booked-dates');
    return response.data;
  } catch (error) {
    console.error('Error in getBookedDates:', error);
    if (error.response) {
      return error.response.data;
    }
    return { success: false, message: 'Failed to fetch booked dates', dates: [] };
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
  getBookedDates,
};