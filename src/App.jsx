// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import HomePage from './pages/HomePage/HomePage';
import PetDetailsPage from './pages/PetDetailsPage/PetDetailsPage';
import PetRegisterPage from './pages/PetRegisterPage/PetRegisterPage';
import './App.css';
import './components/ProtectedRoute/LoadingScreen.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/pets/:petId" 
          element={
            <ProtectedRoute>
              <PetDetailsPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/register-pet" 
          element={
            <ProtectedRoute requiredUserType="protetor">
              <PetRegisterPage />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/edit-pet/:petId" 
          element={
            <ProtectedRoute requiredUserType="protetor">
              <PetRegisterPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 
        <Route 
          path="/adoption-catalog" 
          element={
            <ProtectedRoute requiredUserType="adotante">
              <AdoptionCatalogPage />
            </ProtectedRoute>
          } 
        />
        */}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;