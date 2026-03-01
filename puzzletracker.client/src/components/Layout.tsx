import useUser from '../hooks/useUser';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
	const { user, logout } = useUser();

	const handleLogout = async () => {
		try {
			await logout();
			window.location.href = '/';
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	return (
		<div className="layout">
			<nav className="layout__nav">
				<a href="/">Home</a>
				<a href="/puzzles">Puzzles</a>
				{user ? (
					<>
						<a href="/profile">Profile</a>
						<button onClick={handleLogout} style={{ cursor: 'pointer', marginLeft: '10px' }}>
							Logout
						</button>
					</>
				) : (
					<a href="/login">Login</a>
				)}
			</nav>
			<main className="layout__main">{children}</main>
		</div>
	);
};

export default Layout;