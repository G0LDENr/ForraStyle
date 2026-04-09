import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import HomeAdmin from './pages/home-admin';
import { UserList } from './components/Users/User';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomeAdmin />} />
                <Route path="/home" element={<HomeAdmin />} />
                <Route path="/users" element={<UserList />} />
            </Routes>
        </Router>
    );
}

export default App;