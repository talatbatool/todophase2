import axios from 'axios';
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export default api;









// import axios from 'axios';
// const api = axios.create({
//   baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000') + '/api',
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });


// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export default api;