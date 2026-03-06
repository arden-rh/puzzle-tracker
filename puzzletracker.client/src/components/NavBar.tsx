import useUser from '../hooks/useUser';

const NavBar = () => {
    const { user } = useUser();

    return (
        <nav className="bg-indigo-900/50 text-indigo-100 p-4 min-w-full shadow xl:rounded xl:mt-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-lg lg:text-xl font-bold text-indigo-200">
                    <a href="/">The Puzzle Library</a>
                </h1>
                <div className="flex items-center text-sm uppercase tracking-wider font-medium font-body-font">
                    <a href="/puzzles" className="mr-3">Puzzles</a>
                    {user ? (
                        <a href="/profile">Profile</a>
                    ) : (
                        <a href="/login">Login</a>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;