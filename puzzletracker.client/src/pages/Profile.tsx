import useUser from '../hooks/useUser';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, logout } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div >
            <h1>Profile Page</h1>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h2>Welcome, {user.displayName || user.name}!</h2>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                <p><strong>Puzzles Owned:</strong> {user.totalPuzzlesOwned}</p>
                <p><strong>Puzzles Completed:</strong> {user.totalPuzzlesCompleted}</p>
                {user.bio && (
                    <p><strong>Bio:</strong> {user.bio}</p>
                )}
            </div>
            <button 
                onClick={handleLogout}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Logout
            </button>
        </div>
    );
}

export default Profile;