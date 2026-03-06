import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../hooks/useUser';
import Button from '../components/Button';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useUser();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            await login(email, password);
            setMessage('✅ Login successful!');
            // Redirect to home or profile after successful login
            setTimeout(() => navigate('/'), 1000);
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || 'Login failed';
            setMessage(`❌ ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-4 mt-8">
            <h2 className='text-2xl'>Login</h2>
            <p className='text-center'>Please log in to your account to access the Puzzle Tracker.</p>
            <div className="bg-indigo-900 rounded shadow-lg p-6 w-full max-w-sm mt-6">
                <h3 className='text-xl'>Login</h3>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block mb-1">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="rounded ring ring-indigo-300 p-2 w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
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
                        className='w-full p-2 mt-4'
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
        </div>
    );
}

export default Login;