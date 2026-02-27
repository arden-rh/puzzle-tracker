import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

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
        <div className="login-container">
            <h1>Login</h1>
            <p>Please log in to your account to access the Puzzle Tracker.</p>
            <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Login</h2>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                            required
                        />
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{ width: '100%', padding: '10px', fontSize: '14px', cursor: 'pointer' }}
                    >
                        {isLoading ? 'Loading...' : 'Login'}
                    </button>
                </form>
                {message && (
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '10px', 
                        backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da', 
                        borderRadius: '4px',
                        color: message.startsWith('✅') ? '#155724' : '#721c24'
                    }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;