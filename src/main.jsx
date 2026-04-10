import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Home from './pages/home';
import HomeAdmin from './pages/home-admin';
import { UserList } from './components/Users/User';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/admin" element={<HomeAdmin />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;