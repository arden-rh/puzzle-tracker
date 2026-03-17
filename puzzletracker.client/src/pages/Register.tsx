import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import useUser from '../hooks/useUser';
import Button from '../components/Button';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useUser();

    const validateForm = () => {
        if (!email.trim()) {
            setMessage('❌ Email is required');
            return false;
        }

        if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setMessage('❌ Please enter a valid email address');
            return false;
        }

        if (!password.trim()) {
            setMessage('❌ Password is required');
            return false;
        }

        if (password !== confirmPassword) {
            setMessage('❌ Passwords do not match');
            return false;
        }

        setMessage('');
        return true;
    }

    const handleRegister = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const isValid = validateForm();

        if (!isValid) {
            setIsLoading(false);
            return;
        };

        try {
            await register(email, password, confirmPassword, displayName);
            setMessage('✅ Registration successful!');
            // Redirect to home after successful registration
            setTimeout(() => navigate('/'), 1000);
        } catch (error: unknown) {
            const errorMsg = getErrorMessage(error, 'Registration failed');
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-8">
            <h2 className='text-2xl'>Register</h2>
            <p className='text-center'>Create your own profile on The Puzzle Library</p>
            <div className="bg-indigo-900 rounded shadow-lg p-6 w-full max-w-sm mt-6">
                <h3 className='text-xl'>Register</h3>
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Display Name:</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Confirm Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className='w-full p-2 mt-4'
                    >
                        {isLoading ? 'Loading...' : 'Register'}
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

export default Register;