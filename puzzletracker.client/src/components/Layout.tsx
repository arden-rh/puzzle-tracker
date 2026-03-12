import NavBar from './NavBar';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

	return (
		<div className="layout h-full min-h-screen min-w-full flex flex-col items-center bg-indigo-950">
			<NavBar />

			<main className="p-4 min-w-full flex flex-col items-center">{children}</main>
		</div>
	);
};

export default Layout;