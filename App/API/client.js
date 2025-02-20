// API/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://192.168.0.105:8000/api/user',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export default client;