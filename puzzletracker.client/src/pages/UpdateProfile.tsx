import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import useUser from '../hooks/useUser';
import Button from '../components/Button';

const UpdateProfile: React.FC = () => {
    const { user, updateUserProfile } = useUser();
    const [displayName, setDisplayName] = useState(user?.displayName ?? '');
    const [profilePicUrl, setProfilePicUrl] = useState(user?.profilePicUrl ?? '');
    const [bio, setBio] = useState(user?.bio ?? '');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleUpdate = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await updateUserProfile({
                displayName: displayName.trim() || undefined,
                profilePicUrl: profilePicUrl.trim() || undefined,
                bio: bio.trim() || undefined,
            });
            setMessage('✅ Profile updated successfully!');
            // Redirect to profile after successful update
            setTimeout(() => navigate('/profile'), 1000);
        } catch (error: unknown) {
            const errorMsg = getErrorMessage(error, 'Profile update failed');
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-8">
            <h2 className='text-2xl'>Update Profile</h2>
            <p className='text-center'>Update your profile on The Puzzle Library</p>
            <div className="bg-indigo-900 rounded shadow-lg p-6 w-full max-w-sm mt-6">
                <h3 className='text-xl'>Update Profile</h3>
                <form onSubmit={handleUpdate} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1">Display name:</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Profile Picture URL:</label>
                        <input
                            type="url"
                            value={profilePicUrl}
                            onChange={(e) => setProfilePicUrl(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Bio:</label>
                        <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="rounded ring ring-indigo-300 p-2 w-full resize-y"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className='w-full p-2 mt-4'
                    >
                        {isLoading ? 'Loading...' : 'Update Profile'}
                    </Button>
                </form>
                {message && (
                    <div className={`mt-4 p-2 rounded ${message.startsWith('✅') ? 'bg-indigo-100 text-green-800' : 'bg-indigo-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default UpdateProfile;