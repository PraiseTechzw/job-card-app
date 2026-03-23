import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCardForm from '../components/JobCardForm';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import type { JobCard } from '../types';

import { toast } from 'react-hot-toast';

const NewJobCard: React.FC = () => {
  const navigate = useNavigate();
  const { addJobCard } = useJobCards();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (data: Partial<JobCard>) => {
    const loadingToast = toast.loading('Creating job card...');
    try {
      setIsSubmitting(true);
      await addJobCard({ ...data, performedBy: user?.name || 'Unknown', userRole: user?.role });
      toast.success('Job card created successfully', { id: loadingToast });
      navigate('/job-cards');
    } catch (err: any) {
      console.error('Failed to save job card:', err);
      toast.error(err?.message || 'Failed to create job card. Please try again.', { id: loadingToast });
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

