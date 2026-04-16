import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from '../components/Perfil/Perfil';
import '../css/home/home.css';

const Home = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    setUserData(user);
  }, [navigate]);

  return (
    <div className="home-app">
      <main className="main-content">
        <div className="content-header">
          <h1>Mi Perfil</h1>
        </div>
        <div className="content-body">
          <Profile userData={userData} orders={[]} />
        </div>
      </main>
    </div>
  );
};

export default Home;