import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-hero">
          <h1 className="home-title">
            Welcome to <span className="brand">UTasks</span>
          </h1>
          <p className="home-greeting">
            👋 Hello {user?.name || (user as any)?.username || 'User'} !
          </p>
          <p className="home-subtitle">
            Organize your projects and tasks with simplicity and efficiency
          </p>
        </div>

        <div className="home-features">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Unlimited boards</h3>
            <p>Create as many boards as you want to organize all your projects</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Lists and cards</h3>
            <p>Structure your work with customizable lists and cards</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Priorities and deadlines</h3>
            <p>Set priorities and due dates to stay organized</p>
          </div>
        </div>

        <div className="home-cta">
          <button 
            onClick={() => navigate('/boards')} 
            className="btn-primary-large"
          >
            View my Boards 🚀
          </button>
        </div>

        <div className="home-info">
          <h2>How it works?</h2>
          <div className="info-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Create a Board</h4>
                <p>A board represents a project or workspace</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Add Lists</h4>
                <p>Lists help categorize your tasks (To Do, In Progress, Done...)</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Create Cards</h4>
                <p>Cards are your tasks with title, description, priority and due date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

