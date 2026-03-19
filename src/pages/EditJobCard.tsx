import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobCardForm from '../components/JobCardForm';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import type { JobCard } from '../types';

const EditJobCard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getJobCard, updateJobCard } = useJobCards();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<Partial<JobCard> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const card = getJobCard(id || '');
    if (card) {
      setInitialData(card);
    }
  }, [id, getJobCard]);

  const handleSave = async (data: Partial<JobCard>) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await updateJobCard(id, { ...data, performedBy: user?.name || 'Unknown', userRole: user?.role });
      navigate('/job-cards');
    } catch (err) {
      console.error('Failed to update job card:', err);
      alert('Failed to update job card. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialData) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-slate-400">Loading Job Card...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <JobCardForm initialData={initialData} onSave={handleSave} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditJobCard;

