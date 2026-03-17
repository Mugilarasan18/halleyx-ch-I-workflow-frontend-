import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
    const navigate = useNavigate();
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="navbar">
            <h2>{title}</h2>
            <div>
                <span style={{ marginRight: '15px' }}>Welcome, {username} ({role})</span>
                <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    );
};

export default Navbar;