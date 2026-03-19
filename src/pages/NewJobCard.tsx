import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCardForm from '../components/JobCardForm';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import type { JobCard } from '../types';

const NewJobCard: React.FC = () => {
  const navigate = useNavigate();
  const { addJobCard } = useJobCards();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (data: Partial<JobCard>) => {
    try {
      setIsSubmitting(true);
      await addJobCard({ ...data, performedBy: user?.name || 'Unknown', userRole: user?.role });
      navigate('/job-cards');
    } catch (err) {
      console.error('Failed to save job card:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <JobCardForm onSave={handleSave} isSubmitting={isSubmitting} />
    </div>
  );
};

export default NewJobCard;

