import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

type LoginMode = 'secure' | 'legacy';

const Login: React.FC = () => {
  const [loginMode, setLoginMode] = useState<LoginMode>('secure');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [userId, setUserId] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasStoredUser, setHasStoredUser] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<any>(null);
  
  const { login, loginWithCredentials } = useAuth();

  useEffect(() => {
    const storedUser = localStorage.getItem('utasks_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserId(user.id || '');
        setHasStoredUser(true);
      } catch (error) {
      }
    }
  }, []);

  const handleQuickLogin = async () => {
    const storedUser = localStorage.getItem('utasks_user');
    if (storedUser) {
      setIsLoading(true);
      setError(null);
      try {
        const user = JSON.parse(storedUser);
        const response = await userService.getById(user.id);
        if (response.success && response.data) {
          const authenticatedUser = response.data;
          setSuccessUser(authenticatedUser);
          setShowSuccess(true);
          setTimeout(() => {
            login(authenticatedUser);
          }, 2000);
        } else {
          localStorage.removeItem('utasks_user');
          setHasStoredUser(false);
          setError('Your session has expired. Please log in again.');
        }
      } catch (error) {
        setError('Error during automatic login.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSecureLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await loginWithCredentials(email.trim(), password);

    if (result.success) {
      setShowSuccess(true);
    } else {
      setError(result.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!userId.trim()) {
      setError('Please enter a user ID');
      setIsLoading(false);
      return;
    }

    const response = await userService.getById(userId.trim());

    if (response.success && response.data) {
      const authenticatedUser = response.data;
      setSuccessUser(authenticatedUser);
      setShowSuccess(true);
      setTimeout(() => {
        login(authenticatedUser);
      }, 2000);
    } else {
      setError(response.message || 'User not found. Check your ID or create a new account.');
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="login-success-overlay">
        <div className="login-success-content">
          <div className="login-success-icon"></div>
          <h2 className="login-success-text">Login successful!</h2>
          <p className="login-success-subtext">
            Welcome {successUser?.name || successUser?.username || 'user'}! 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        
        {/* Login Mode Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${loginMode === 'secure' ? 'active' : ''}`}
            onClick={() => setLoginMode('secure')}
          >
            🔐 Secure Login
          </button>
          <button
            className={`auth-tab ${loginMode === 'legacy' ? 'active' : ''}`}
            onClick={() => setLoginMode('legacy')}
          >
            🆔 Login by ID
          </button>
        </div>

        {loginMode === 'secure' ? (
          <>
            <p className="auth-hint">
              Enter your email and password to log in. New user?{' '}
              <Link to="/register" className="auth-link">Create an account</Link>
            </p>
            
            <form onSubmit={handleSecureLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="auth-hint">
              Enter your user ID to log in. If you don't have an account yet,{' '}
              <Link to="/register" className="auth-link">create one</Link>.
            </p>
            <p className="auth-info">
              💡 Your user ID is provided after account creation. You can find it in the header by clicking "View my ID" after logging in.
            </p>
            {hasStoredUser && (
              <div className="quick-login">
                <p>You already have a saved account.</p>
                <button type="button" onClick={handleQuickLogin} className="btn-secondary">
                  Log in automatically
                </button>
              </div>
            )}
            <form onSubmit={handleLegacyLogin}>
              <div className="form-group">
                <label htmlFor="userId">User ID</label>
                <input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your user ID"
                  disabled={isLoading}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </>
        )}
        
        <div className="auth-footer">
          <p>
            Don't have an account yet? <Link to="/register" className="auth-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
