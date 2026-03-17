import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { username, password, role });
            alert('Registration Successful! Please login.');
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Username might exist.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Register User</h2>
                {error && <p className="error-msg">{error}</p>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                            <option value="CEO">CEO</option>
                        </select>
                    </div>
                    <button type="submit" className="btn">Register</button>
                </form>
                <Link to="/login" className="link-text">Already have an account? Login</Link>
            </div>
        </div>
    );
};

export default Register;