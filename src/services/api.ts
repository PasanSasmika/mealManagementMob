import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use your computer's IP address (e.g., 192.168.1.5) for physical device testing
const API_BASE_URL = 'http://192.168.8.100:5000/api'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper to set Auth Token globally after login
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const mealService = {
  // Matches the body format: { selections: [{ mealType: '...', dates: ['...'] }] }
  bookMeals: (selections: any) => api.post('/meals/book', { selections }),
  
  // Other methods...
requestNow: (data: { action: boolean }) => api.post('/meals/request-now', data),
  verifyOtp: (requestId: string, otp: string) => api.post('/meals/verify-otp', { requestId, otp }),
};