import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

type RegisterMode = 'secure' | 'legacy';

const Register: React.FC = () => {
  const [registerMode, setRegisterMode] = useState<RegisterMode>('secure');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successUser, setSuccessUser] = useState<any>(null);
  
  const { register, registerWithPassword, login } = useAuth();

  const handleSecureRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    const result = await registerWithPassword(name.trim(), email.trim(), password);

    if (result.success && result.user) {
      setSuccessUser(result.user);
      setShowSuccess(true);
    } else {
      setError(result.message || 'Error creating account');
      setIsLoading(false);
    }
  };

  const handleLegacyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!name.trim() || !email.trim()) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    const result = await register(name.trim(), email.trim());

    if (result.success && result.user) {
      setSuccessUser(result.user);
      setShowSuccess(true);
      setTimeout(() => {
        login(result.user!);
      }, 2000);
    } else {
      setError(result.message || 'Error creating account');
      setIsLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="login-success-overlay">
        <div className="login-success-content">
          <div className="login-success-icon"></div>
          <h2 className="login-success-text">Account created successfully!</h2>
          <p className="login-success-subtext">
            Welcome {successUser?.name || successUser?.username || 'user'}! 🎉
          </p>
          {registerMode === 'legacy' && successUser?.id && (
            <p className="login-success-id">
              Your User ID: <code>{successUser.id}</code>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create an account</h2>
        
        {/* Register Mode Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${registerMode === 'secure' ? 'active' : ''}`}
            onClick={() => setRegisterMode('secure')}
          >
            🔐 Secure Register
          </button>
          <button
            className={`auth-tab ${registerMode === 'legacy' ? 'active' : ''}`}
            onClick={() => setRegisterMode('legacy')}
          >
            🆔 Quick Register
          </button>
        </div>

        {registerMode === 'secure' ? (
          <>
            <p className="auth-hint">
              Create a secure account with a password.
            </p>
            <form onSubmit={handleSecureRegister}>
              <div className="form-group">
                <label htmlFor="name">Username</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your username"
                  disabled={isLoading}
                  required
                />
              </div>
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
                  placeholder="Enter your password (min. 6 characters)"
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="auth-hint">
              Quick registration without password. You'll receive a User ID to log in.
            </p>
            <form onSubmit={handleLegacyRegister}>
              <div className="form-group">
                <label htmlFor="name">Username</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  disabled={isLoading}
                  required
                />
              </div>
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
              {error && <div className="error-message">{error}</div>}
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Creating...' : 'Create account'}
              </button>
            </form>
          </>
        )}
        
        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login" className="auth-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
