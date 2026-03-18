import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });
            const user = response.data;
            
            const userRole = user.role ? user.role.toUpperCase() : 'USER';
            
            localStorage.setItem('role', userRole);
            localStorage.setItem('userId', user.id);
            localStorage.setItem('username', user.username);

            if (onLoginSuccess) {
                onLoginSuccess();
            }

            if (userRole === 'CEO') {
                navigate('/ceo/dashboard');
            } else if (userRole === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/user/dashboard');
            }
        } catch (err) {
            console.error("Login fail error:", err);
            setError('Invalid username or password!');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>System Login</h2>
                {error && <p className="error-msg">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Username</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn">Login</button>
                </form>
                <Link to="/register" className="link-text">Don't have an account? Register</Link>
            </div>
        </div>
    );
};

export default Login;