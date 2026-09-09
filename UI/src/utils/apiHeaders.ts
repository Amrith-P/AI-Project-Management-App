import { API_BASE_URL } from './config';

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export { API_BASE_URL };
