import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors';
import useUser from '../hooks/useUser';
import Button from '../components/Button';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await login(email, password);
            setMessage('✅ Login successful!');
            // Redirect to home or profile after successful login
            setTimeout(() => navigate('/'), 1000);
        } catch (error: unknown) {
            const errorMsg = getErrorMessage(error, 'Login failed');
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-8">
            <h2 className='text-2xl mb-2'>Login</h2>
            <p className='text-center'>Please log in to your account to access The Puzzle Library.</p>
            <div className="bg-indigo-900 rounded shadow-lg p-6 w-full max-w-sm mt-6 flex flex-col gap-2">
                <h3 className='text-xl'>Login</h3>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                        <label className="block mb-1">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className='w-full py-2'
                    >
                        {isLoading ? 'Loading...' : 'Login'}
                    </Button>
                </form>
                {message && (
                    <div className={`mt-4 p-2 rounded ${message.startsWith('✅') ? 'bg-indigo-100 text-green-800' : 'bg-indigo-100 text-red-800'}`}>
                        {message}
                    </div>
                )}
            </div>
            <p className="mt-4 text-sm">Don't have an account? <Link to="/register" className="text-indigo-300 hover:underline">Register here</Link></p>
        </div>
    );
}

export default Login;