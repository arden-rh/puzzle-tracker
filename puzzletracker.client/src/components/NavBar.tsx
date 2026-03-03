import useUser from '../hooks/useUser';

const NavBar = () => {
    const { user } = useUser();

    return (
        <nav className="bg-blue-950 text-white p-4 min-w-full">
            <div className="container mx-auto flex justify-between items-center">
                <a href="/" className="text-lg font-bold">The Puzzle Library</a>
                <div className="flex items-center text-sm">
                    <a href="/puzzles" className="mr-4">Puzzles</a>
                    {user ? (
                        <>
                            <a href="/profile">Profile</a>
                        </>
                    ) : (
                        <a href="/login">Login</a>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;