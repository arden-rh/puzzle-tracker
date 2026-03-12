import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Pages
import AddCustomPuzzle from './pages/AddCustomPuzzle';
import EditCustomPuzzle from './pages/EditCustomPuzzle';
import GlobalLibrary from './pages/GlobalLibraryt';
import Home from './pages/Home';
import Layout from './components/Layout';
import Login from './pages/Login';
import NotFound from './pages/NotFound'
import Profile from './pages/Profile';
import ProfileCollection from './pages/ProfileCollection';
import PuzzleDetails from './pages/PuzzleDetails';
import Register from './pages/Register';
import UpdateCollectionPuzzle from './pages/UpdateCollectionPuzzle';
import UpdateProfile from './pages/UpdateProfile';

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
                        <Route path="/register" element={<Register />} />

                        {/* Protected routes */}
                        <Route path="/profile" element={<ProtectedRoute />}>
                            <Route index element={<Profile />} />
                            <Route path="collection" element={<ProfileCollection />} />
                            <Route path="collection/:id" element={<PuzzleDetails />} />
                            <Route path="collection/:id/update" element={<UpdateCollectionPuzzle />} />
                            <Route path="add-puzzle" element={<AddCustomPuzzle />} />
                            <Route path="collection/:id/edit" element={<EditCustomPuzzle />} />
                            <Route path="edit" element={<UpdateProfile />} />
                        </Route>

                        {/* Puzzle routes */}
                        <Route path="/puzzles">
                            <Route index element={<GlobalLibrary />} />
                            <Route path=":id" element={<PuzzleDetails />} />
                        </Route>

                        {/* Catch-all route for 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </UserProvider>
    );
}

export default App;