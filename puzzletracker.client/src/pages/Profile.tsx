import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Hooks
import useUser from '../hooks/useUser';
// Components
import Button from '../components/Button';
import ButtonLink from '../components/ButtonLink';

const Profile = () => {
    const { user, logout, refreshUserProfile } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        refreshUserProfile();
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!user) {
        return <div className='w-full flex items-center justify-center text-center'><span>Loading...</span></div>;
    }

    return (
        <div className="flex flex-col gap-4 max-w-2xl mx-auto md:p-4">
            <h2>Profile Page</h2>
            <div className='flex gap-4 items-center justify-center px-4'>
                <p className='mb-2 font-medium text-lg'>Welcome, {user.displayName || user.name}!</p>
                {user.profilePicUrl && <img src={user.profilePicUrl} alt="Profile" className="w-28 h-28 rounded-full mb-4 shadow-md ring ring-indigo-900" />}
            </div>
            <div className="bg-indigo-900/90 p-4 rounded shadow flex flex-col gap-2 font-light">
                <div className='font-poppins tracking-widest text-indigo-50'>
                    <p><span className='uppercase font-medium text-indigo-300 mr-2'>Email:</span>{user.email}</p>
                    <p><span className='uppercase font-medium text-indigo-300 mr-2'>Display Name:</span>{user.displayName || 'Not set'}</p>
                    {user.bio && (
                        <div className='flex flex-col'>
                            <span className='uppercase font-medium text-indigo-300'>Bio:</span>
                            <p>{user.bio}</p>
                        </div>
                    )}
                </div>
                <div className='font-poppins tracking-widest text-indigo-50'>
                    <h3 className="mb-1 uppercase">Statistics</h3>
                    <p><span className='uppercase font-medium text-indigo-300 mr-2'>In Collection:</span>{user.totalPuzzlesInCollection}</p>
                    <p><span className='uppercase font-medium text-indigo-300 mr-2'>Owned:</span>{user.totalPuzzlesOwned}</p>
                    <p><span className='uppercase font-medium text-indigo-300 mr-2'>Completed:</span>{user.totalPuzzlesCompleted}</p>
                </div>
            </div>
            <div className='flex flex-wrap justify-start gap-2'>
                <ButtonLink
                    route={'/profile/collection'}
                >
                    My Collection
                </ButtonLink>
                <ButtonLink
                    route={'/profile/custom-puzzles/add'}
                >
                    Create new custom puzzle
                </ButtonLink>

                <ButtonLink
                    route={'/profile/edit'}
                >
                    Edit Profile
                </ButtonLink>
                <Button
                    onClick={handleLogout}
                    theme="secondary"
                >
                    Logout
                </Button>
            </div>
        </div>
    );
}

export default Profile;