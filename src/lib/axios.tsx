// // lib/axios.js
// import axios from 'axios';
// import { useAuthStore } from '../store/authStore';

// const instance = axios.create({
//   timeout: 10000,
//   withCredentials: true,
// });

// // Middleware-style import for Zustand (not reactive)
// let token = null;
// const authStore = useAuthStore.getState();
// token = authStore.token?.access_token;

// instance.interceptors.request.use((config) => {
//   config.baseURL = 'https://t1wfswdh-3000.inc1.devtunnels.ms/'; // change this to your IP address
//   // config.baseURL = 'http://3.110.180.116:3000/'; // change this to your IP address

//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// export default instance;





// lib/axios.js
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const instance = axios.create({
  timeout: 10000,
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token?.access_token;

  // config.baseURL = 'https://2ppcf4sc-3000.inc1.devtunnels.ms/';
  // config.baseURL = 'http://3.110.180.116:3000';
  config.baseURL = 'https://api.mydriversa.co.za/';

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(token, 'token in interceptor');

  return config;
});

export default instance;
