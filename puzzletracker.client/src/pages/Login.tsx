import { useState } from 'react';

interface LoginProps {
    apiUrl?: string;
}

const Login = ({ apiUrl = 'https://localhost:7110' }: LoginProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${apiUrl}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                setMessage('✅ Registration successful! You can now login.');
            } else {
                const data = await response.json();
                setMessage(`❌ Registration failed: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            setMessage(`❌ Error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${apiUrl}/login?useCookies=true`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                setMessage('✅ Login successful!');
            } else {
                const data = await response.json();
                setMessage(`❌ Login failed: ${JSON.stringify(data)}`);
            }
        } catch (error) {
            setMessage(`❌ Error: ${error}`);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className="login-container">
            <h1>Login</h1>
            <p>Please log in to your account to access the Puzzle Tracker.</p>
            <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h2>Login / Register</h2>
                <form>
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
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handleRegister}
                            disabled={isLoading}
                            style={{ flex: 1, padding: '10px', fontSize: '14px', cursor: 'pointer' }}
                        >
                            {isLoading ? 'Loading...' : 'Register'}
                        </button>
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            style={{ flex: 1, padding: '10px', fontSize: '14px', cursor: 'pointer' }}
                        >
                            {isLoading ? 'Loading...' : 'Login'}
                        </button>
                    </div>
                </form>
                {message && (
                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da', borderRadius: '4px' }}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Login;