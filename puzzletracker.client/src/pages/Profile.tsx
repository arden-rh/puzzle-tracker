import Button from '../components/Button';
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
        <div className="flex flex-col gap-4 max-w-2xl mx-auto md:p-4">
            <h2>Profile Page</h2>
            <div className="bg-indigo-900/90 p-4 rounded shadow">
                <h3 className='mb-2'>Welcome, {user.displayName || user.name}!</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
                <p><strong>Puzzles Owned:</strong> {user.totalPuzzlesOwned}</p>
                <p><strong>Puzzles Completed:</strong> {user.totalPuzzlesCompleted}</p>
                {user.bio && (
                    <p><strong>Bio:</strong> {user.bio}</p>
                )}
            </div>
            <div className='flex flex-wrap justify-start gap-2'>
                <Button
                    onClick={() => navigate('/profile/collection')}
                >
                    My Collection
                </Button>
                <Button
                    onClick={() => navigate('/profile/add-puzzle')}
                >
                    Add Puzzle
                </Button>
                <Button
                    onClick={() => navigate('/profile/edit')}
                    disabled={true} // Disable until edit profile page is implemented
                    className='disabled:cursor-not-allowed disabled:bg-gray-500 disabled:text-gray-300'
                >
                    Edit Profile
                </Button>
                <Button
                    onClick={handleLogout}
                    theme="primary"
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default Profile;