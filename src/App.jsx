import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage/HomePage'
import PetDetailsPage from './pages/PetDetailsPage/PetDetailsPage'
import PetRegisterPage from './pages/PetRegisterPage/PetRegisterPage'
import './App.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/pets/:petId" element={<PetDetailsPage />} />
        <Route path="/register-pet" element={<PetRegisterPage />} /> 
      </Routes>
    </>
  )
}

export default App