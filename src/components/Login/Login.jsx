import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserController } from '../../controllers/UserController';
import Logo from '../../img/ForraDtyle.png';
import '../../css/login/login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    age: '',
    rol: 2
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await UserController.login(formData.email, formData.password);
    
    if (result.success) {
      // Crear token simple
      const token = btoa(`${result.data.email}:${Date.now()}`);
      const userWithToken = {
        ...result.data,
        token: token,
        rol: result.data.rol // Asegurar que el rol está presente
      };
      
      localStorage.setItem('user', JSON.stringify(userWithToken));
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', result.data.rol); // Guardar rol separadamente
      
      setSuccess(`¡Bienvenido de vuelta, ${result.data.name}! Redirigiendo...`);
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(userWithToken);
        }
        
        // Redirigir según el rol
        if (result.data.rol === 1) {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }, 1500);
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    // En registro, siempre se crea como usuario normal (rol 2)
    const userToCreate = {
      ...formData,
      rol: 2
    };

    const result = await UserController.createUser(userToCreate);
    
    if (result.success) {
      setSuccess(`¡Registro exitoso! Bienvenido ${result.data.name}. Redirigiendo...`);
      
      // Auto login después del registro
      const loginResult = await UserController.login(formData.email, formData.password);
      
      if (loginResult.success) {
        const token = btoa(`${loginResult.data.email}:${Date.now()}`);
        const userWithToken = {
          ...loginResult.data,
          token: token
        };
        
        localStorage.setItem('user', JSON.stringify(userWithToken));
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', loginResult.data.rol);
        
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(userWithToken);
          }
          navigate('/home'); // Los usuarios normales van a /home
        }, 1500);
      }
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      name: '',
      phone: '',
      age: '',
      rol: 2
    });
  };

  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-overlay"></div>
      
      <div className="login-content">
        <div className="login-card">
          
          {/* Lado Izquierdo */}
          <div className="login-left">
            <div>
              <div className="logo-container">
                <img 
                  src={Logo}
                  alt="Logo"
                  className="login-logo"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/120x120?text=ForraStyle';
                  }}
                />
              </div>
              
              <div>
                <h1 className="welcome-title">
                  ¡Bienvenido!
                </h1>
                <p className="welcome-text">
                  {isLogin 
                    ? "Inicia sesión para acceder a tu cuenta y disfrutar de todos nuestros servicios." 
                    : "Crea tu cuenta y únete a nuestra comunidad. Es rápido y sencillo."}
                </p>
              </div>
            </div>
          </div>

          {/* Lado Derecho */}
          <div className="login-right">
            <div className="form-wrapper">
              <div className="form-title">
                <h2>{isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}</h2>
                <p>{isLogin ? 'Ingresa tus credenciales' : 'Completa tus datos'}</p>
              </div>

              {error && (
                <div className="error-message">
                  <div className="error-content">
                    <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="error-text">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="success-message">
                  <div className="success-content">
                    <svg className="success-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="success-text">{success}</p>
                  </div>
                </div>
              )}

              <form className="login-form" onSubmit={isLogin ? handleLogin : handleRegister}>
                {!isLogin && (
                  <div className="form-group">
                    <label>Nombre completo *</label>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Correo electrónico *</label>
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label>Contraseña *</label>
                  <input
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                  />
                  {!isLogin && (
                    <small className="input-hint">La contraseña debe tener al menos 6 caracteres</small>
                  )}
                </div>

                {!isLogin && (
                  <>
                    <div className="form-group">
                      <label>Teléfono (opcional)</label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="5551234567"
                      />
                    </div>

                    <div className="form-group">
                      <label>Edad (opcional)</label>
                      <input
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="18"
                      />
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="forgot-password">
                    <button type="button">
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <div className="spinner">
                      <svg className="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    isLogin ? 'Iniciar Sesión' : 'Registrarse'
                  )}
                </button>

                <div className="toggle-button">
                  <button type="button" onClick={toggleMode}>
                    {isLogin 
                      ? '¿No tienes una cuenta? Regístrate' 
                      : '¿Ya tienes una cuenta? Inicia sesión'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;