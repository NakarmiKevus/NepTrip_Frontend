// FRONTEND/App/API/client.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
  baseURL: 'http://192.168.0.105:8000/api/user', // Adjust IP/port as needed
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach the token to every request if it exists
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;