'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Providers wrapper — wraps all client-side context providers
 * Keeps the root layout a server component
 */
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastClassName="!rounded-2xl !font-semibold !text-sm"
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
