
import axios, { AxiosInstance } from 'axios';


const BASE_URL = "https://arbe-production.up.railway.app";
const TIMEOUT = 50000;
const COMMON_HEADERS = {
 'Content-Type': 'application/json',
 Accept: 'application/json',
};

export enum AxiosErrorCode {
  TooManyRequests = 429,
  BadRequest = 400,
  InternalServerError = 500,
}


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: COMMON_HEADERS,
});


// Function to create an Axios instance with Bearer token
export const createAuthAxiosInstance = (token: string) => {
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
      ...COMMON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });
  attachInterceptors(axiosInstance);


  return axiosInstance;
};


// Function to attach interceptors to any Axios instance
const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response, // Pass successful responses through
    (error) => {
      if (error.response) {
        if (error.response.status === 500) {
          console.warn('Server error! Please try again later.');
        }
      } else if (error.request) {
        console.error('Network error! Please check your connection.');
      } else {
        console.error('Request error:', error.message);
      }


      return Promise.reject(error);
    },
  );
};


attachInterceptors(axiosInstance);


export default axiosInstance;
