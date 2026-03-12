import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCardForm from '../components/JobCardForm';
import { useJobCards } from '../context/JobCardContext';
import type { JobCard } from '../types';

const NewJobCard: React.FC = () => {
  const navigate = useNavigate();
  const { addJobCard } = useJobCards();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = (data: Partial<JobCard>) => {
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      addJobCard(data);
      setIsSubmitting(false);
      navigate('/job-cards');
    }, 800);
  };

  return (
    <div className="animate-fade-in">
      <JobCardForm onSave={handleSave} isSubmitting={isSubmitting} />
    </div>
  );
};

export default NewJobCard;

