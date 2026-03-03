import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Layout from './components/Layout';
import GlobalLibrary from './pages/GlobalLibraryt';
import ProfileCollection from './pages/ProfileCollection';
// Context
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    return (
        <UserProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />

                        {/* Protected routes */}
                        <Route path="/profile" element={<ProtectedRoute />}>
                            <Route index element={<Profile />} />
                            <Route path="collection" element={<ProfileCollection />} />
                        </Route>

                        {/* Puzzle routes */}
                        <Route path="/puzzles">
                            <Route index element={<GlobalLibrary />} />
                            <Route path=":id" element={<div>Single Puzzle View (TODO)</div>} />
                        </Route>

                        {/* Catch-all route for 404 */}
                        <Route path="*" element={<div>404 Not Found</div>} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;