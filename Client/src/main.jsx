import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import {ToastContainer} from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import "react-toastify/dist/ReactToastify.css";
import { disableReactDevTools } from '@fvilers/disable-react-devtools';

disableReactDevTools();

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
      <AuthProvider>
        <Routes>
          <Route path='/*' element={<App />} />
        </Routes>
        <ToastContainer
          position="top-center"
          autoClose={4500}
          limit={3}
          hideProgressBar
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </AuthProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
)
