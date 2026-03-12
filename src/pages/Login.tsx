import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import styles from './Login.module.css';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<User['role']>('Initiator');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.bgShape}></div>
      <div className={`glass-panel ${styles.loginCard}`}>
        <div className={styles.brand}>
          <PenTool className={styles.logoIcon} size={40} />
          <span className={styles.brandText}>Job Card System</span>
        </div>
        <p className={styles.subtitle}>Industrial Job Card Management</p>
        
        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Demo Role</label>
            <select 
              className={styles.selectRole}
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
            >
              <option value="Admin">Admin (Full Access)</option>
              <option value="Initiator">Initiator / Requester</option>
              <option value="Supervisor">Supervisor</option>
              <option value="EngSupervisor">Engineering Supervisor</option>
              <option value="Artisan">Artisan / Technician</option>
              <option value="PlanningOffice">Planning Office</option>
            </select>
          </div>
          
          <button type="submit" className={styles.loginBtn}>
            Sign In to Dashboard
          </button>
        </form>

        <p className={styles.demoNote}>
          Proceed by selecting a role to view the system through a specific permission perspective.
        </p>
      </div>
    </div>
  );
};

export default Login;
