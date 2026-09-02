import axios from 'axios';

// All backend routes live under this base URL.
// Change this if you deploy the backend somewhere else later.
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Before every request, check if we have a token saved (from login)
// and attach it automatically. This means individual pages never
// have to manually add the Authorization header themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// If the backend ever responds with 401 (token invalid/expired),
// automatically log the user out on the frontend so they're not
// stuck in a broken state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
