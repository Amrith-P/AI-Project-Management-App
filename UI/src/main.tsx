import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import './index.css'
import App from './App.tsx'
import axios from 'axios'

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to session expired if not already on an auth page
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register' && path !== '/session-expired') {
        window.location.href = '/session-expired';
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
