import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { OngProvider } from './contexts/OngContext';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import OngProtectedRoute from './components/OngProtectedRoute/OngProtectedRoute';
import LoginPage from './pages/LoginPage/LoginPage';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import OngSelectionPage from './pages/OngSelectionPage/OngSelectionPage';
import OngCreatePage from './pages/OngCreatePage/OngCreatePage';
import OngDetailsPage from './pages/OngDetailsPage/OngDetailsPage';
import HomePage from './pages/HomePage/HomePage';
import PetDetailsPage from './pages/PetDetailsPage/PetDetailsPage';
import PetRegisterPage from './pages/PetRegisterPage/PetRegisterPage';
import AdoptionRequestsPage from './pages/AdoptionRequestsPage/AdoptionRequestsPage';
import MyAdoptionRequestsPage from './pages/MyAdoptionRequestsPage/MyAdoptionRequestsPage';
import AdoptionFormPage from './pages/AdoptionFormPage/AdoptionFormPage';
import './App.css';
import './components/ProtectedRoute/LoadingScreen.css';

function App() {
  return (
    <AuthProvider>
      <OngProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route 
            path="/select-ong" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngSelectionPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-ong" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngCreatePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-ong/:ongId" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngCreatePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/ong-details/:ongId" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngDetailsPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <OngProtectedRoute>
                  <HomePage />
                </OngProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pets/:petId" 
            element={
              <ProtectedRoute>
                <OngProtectedRoute>
                  <PetDetailsPage />
                </OngProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/register-pet" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngProtectedRoute>
                  <PetRegisterPage />
                </OngProtectedRoute>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-pet/:petId" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngProtectedRoute>
                  <PetRegisterPage />
                </OngProtectedRoute>
              </ProtectedRoute>
            } 
          />

          {/* Página de solicitações para protetores */}
          <Route 
            path="/solicitacoes-adocao" 
            element={
              <ProtectedRoute requiredUserType="protetor">
                <OngProtectedRoute>
                  <AdoptionRequestsPage />
                </OngProtectedRoute>
              </ProtectedRoute>
            } 
          />

          {/* Página de solicitações para adotantes */}
          <Route 
            path="/minhas-solicitacoes" 
            element={
              <ProtectedRoute requiredUserType="adotante">
                <MyAdoptionRequestsPage />
              </ProtectedRoute>
            } 
          />

          {/* Página do formulário de adoção */}
          <Route 
            path="/formulario-adocao/:petId" 
            element={
              <ProtectedRoute requiredUserType="adotante">
                <AdoptionFormPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </OngProvider>
    </AuthProvider>
  );
}

export default App;