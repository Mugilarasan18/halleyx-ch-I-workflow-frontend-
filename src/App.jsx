import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CeoDashboard from './pages/CeoDashboard';

function App() {
  // Role-a state-la vachikkuvom
  const [role, setRole] = useState(localStorage.getItem('role'));

  // Login success aagum podhu indha function-a Login page call pannum
  const handleLoginSuccess = () => {
    setRole(localStorage.getItem('role'));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Pass the function as a prop to Login */}
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={handleLoginSuccess} />} 
        />
        
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes based on 'role' state */}
        <Route 
          path="/user/dashboard" 
          element={role === 'USER' ? <UserDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/dashboard" 
          element={role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/ceo/dashboard" 
          element={role === 'CEO' ? <CeoDashboard /> : <Navigate to="/login" />} 
        />

        {/* Incorrect URL vandha Login-ku anuppu */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;