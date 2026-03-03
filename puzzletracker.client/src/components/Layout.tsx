import NavBar from './NavBar';

interface LayoutProps {
	children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

	return (
		<div className="layout h-full min-h-screen min-w-full flex flex-col bg-blue-300">
			<NavBar />

			<main className="layout__main p-4">{children}</main>
		</div>
	);
};

export default Layout;