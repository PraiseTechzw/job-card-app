import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobCardForm from '../components/JobCardForm';
import type { JobCard } from '../types';

const EditJobCard: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [initialData, setInitialData] = useState<Partial<JobCard> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Mock fetching data
    setTimeout(() => {
      setInitialData({
        id,
        ticketNumber: `JC-2026-00${id === 'jc1' ? '1' : 'X'}`,
        requestedBy: 'John Doe',
        plantNumber: 'P-9901',
        plantDescription: 'Main Conveyor Motor',
        defect: 'Excessive heat and noise.',
        workRequest: 'Check bearings and lubrication.',
        status: 'Draft',
        allocatedTrades: ['Fitting', 'Electrical'],
        priority: 'High'
      });
    }, 500);
  }, [id]);

  const handleSave = (data: Partial<JobCard>) => {
    setIsSubmitting(true);
    console.log('Updating Job Card:', data);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/job-cards');
    }, 1000);
  };

  if (!initialData) return <div style={{ padding: '4rem', color: 'white' }}>Loading Job Card...</div>;

  return (
    <div className="animate-fade-in">
      <JobCardForm initialData={initialData} onSave={handleSave} isSubmitting={isSubmitting} />
    </div>
  );
};

export default EditJobCard;
