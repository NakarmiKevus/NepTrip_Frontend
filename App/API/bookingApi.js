// FRONTEND/App/API/bookingApi.js
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
    PUT    /api/booking/respond/:id    => accept/decline booking (guide only)
    GET    /api/booking/user-bookings  => get user’s own bookings
    GET    /api/booking/status/:id     => get a specific booking’s status
*/

// 1) Request a guide
const requestBooking = async (bookingData) => {
  const response = await bookingClient.post('/request', bookingData);
  return response.data;
};

// 2) Guide fetches booking requests
const getBookingRequests = async () => {
  const response = await bookingClient.get('/requests');
  return response.data; // { success, requests }
};

// 3) Guide responds to a booking (accept/decline)
const respondToBooking = async (bookingId, status) => {
  const response = await bookingClient.put(`/respond/${bookingId}`, { status });
  return response.data; // { success, message, booking }
};

// 4) User fetches all their bookings
const getUserBookings = async () => {
  const response = await bookingClient.get('/user-bookings');
  return response.data; // { success, bookings }
};

// 5) User fetches a specific booking status
const getBookingStatus = async (bookingId) => {
  const response = await bookingClient.get(`/status/${bookingId}`);
  return response.data; // { success, booking }
};

const getLatestBooking = async () => {
  const response = await bookingClient.get('/latest-booking');
  return response.data;
};



export default {
  requestBooking,
  getBookingRequests,
  respondToBooking,
  getUserBookings,
  getBookingStatus,
  getLatestBooking,
};
