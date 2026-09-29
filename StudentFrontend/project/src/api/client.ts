import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const studentName = sessionStorage.getItem('studentName');
  if (studentName) {
    config.headers['X-Student-Name'] = studentName;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const message =
        (data && (data.message || data.error || data)) ||
        `Request failed with status ${error.response.status}`;
      return Promise.reject(new Error(typeof message === 'string' ? message : JSON.stringify(message)));
    }
    if (error.request) {
      if (error.code === 'ERR_NETWORK') {
        return Promise.reject(
          new Error(
            'Cannot reach the backend server at http://localhost:8080. This may be a CORS or network issue. Make sure the Spring Boot backend is running.'
          )
        );
      }
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('The request to the backend timed out. Please try again.'));
      }
      return Promise.reject(new Error('No response received from the backend server.'));
    }
    return Promise.reject(new Error(error.message || 'An unexpected error occurred.'));
  }
);

export default api;
