import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* <Route path="/puzzles" element={<Puzzles />} /> */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login apiUrl="https://localhost:7110" />} />
                <Route path="/" element={<Home />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;