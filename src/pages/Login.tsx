import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Key, User, Loader2 } from 'lucide-react';
import styles from './Login.module.css';
import SEO from '../components/SEO';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <SEO title="Login" description="Sign in to the Mega Pak Zimbabwe Job Card Management System." />
      <div className={styles.glassPanel}>
        <div className={styles.header}>
          <div className={styles.logoWrapper}>
            <img 
              src="http://www.megapak.co.zw/wp-content/uploads/2021/04/WhatsApp-Image-2021-04-14-at-12.07.24-1.jpeg" 
              alt="Mega Pak Logo" 
              className={styles.logo}
              style={{ width: '100%', height: 'auto', borderRadius: '8px', marginBottom: '16px' }}
            />
          </div>
          <p className={styles.subtitle}>Sign in to access maintenance portal</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorAlert}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={18} />
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Key className={styles.inputIcon} size={18} />
              <input 
                type="password" 
                className={styles.input} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitBtn} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Don't have an account? Contact the IT administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
