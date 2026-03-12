import React, { createContext, useContext, useState, useEffect } from 'react';
import type { JobCard, DailyWorkAllocation } from '../types';

interface JobCardContextType {
  jobCards: JobCard[];
  workAllocations: DailyWorkAllocation[];
  addJobCard: (jobCard: Partial<JobCard>) => void;
  updateJobCard: (id: string, updates: Partial<JobCard>) => void;
  getJobCard: (id: string) => JobCard | undefined;
  addWorkAllocation: (allocation: Partial<DailyWorkAllocation>) => void;
  updateWorkAllocation: (id: string, updates: Partial<DailyWorkAllocation>) => void;
  deleteWorkAllocation: (id: string) => void;
}

const JobCardContext = createContext<JobCardContextType | undefined>(undefined);

export const JobCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [workAllocations, setWorkAllocations] = useState<DailyWorkAllocation[]>([]);

  // Load from local storage on mount
  useEffect(() => {
    const savedCards = localStorage.getItem('jobCards');
    const savedAllocations = localStorage.getItem('workAllocations');
    
    if (savedCards) setJobCards(JSON.parse(savedCards));
    if (savedAllocations) setWorkAllocations(JSON.parse(savedAllocations));
    
    // Seed data if empty
    if (!savedCards || JSON.parse(savedCards).length === 0) {
      const initialCards: JobCard[] = [
        {
          id: 'jc-1',
          ticketNumber: 'JC-2024-001',
          requestedBy: 'John Doe',
          dateRaised: '2024-03-20',
          timeRaised: '10:30',
          priority: 'High',
          requiredCompletionDate: '2024-03-22',
          plantNumber: 'PNT-101',
          plantDescription: 'Conveyor Main Drive',
          plantStatus: 'Shut',
          defect: 'Motor overheating and unusual vibration',
          maintenanceSchedule: 'Quarterly Service',
          workRequest: 'Inspect motor bearings and cooling fan',
          allocatedTrades: ['Fitting', 'Electrical'],
          status: 'Approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      setJobCards(initialCards);
      localStorage.setItem('jobCards', JSON.stringify(initialCards));
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('jobCards', JSON.stringify(jobCards));
  }, [jobCards]);

  useEffect(() => {
    localStorage.setItem('workAllocations', JSON.stringify(workAllocations));
  }, [workAllocations]);

  const addJobCard = (data: Partial<JobCard>) => {
    const newCard: JobCard = {
      ...data as JobCard,
      id: Math.random().toString(36).substr(2, 9),
      ticketNumber: `JC-${new Date().getFullYear()}-${(jobCards.length + 1).toString().padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setJobCards(prev => [...prev, newCard]);
  };

  const updateJobCard = (id: string, updates: Partial<JobCard>) => {
    setJobCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
    ));
  };

  const getJobCard = (id: string) => {
    return jobCards.find(card => card.id === id);
  };

  const addWorkAllocation = (data: Partial<DailyWorkAllocation>) => {
    const newAllocation: DailyWorkAllocation = {
      ...data as DailyWorkAllocation,
      id: Math.random().toString(36).substr(2, 9)
    };
    setWorkAllocations(prev => [...prev, newAllocation]);
  };

  const updateWorkAllocation = (id: string, updates: Partial<DailyWorkAllocation>) => {
    setWorkAllocations(prev => prev.map(alloc => 
      alloc.id === id ? { ...alloc, ...updates } : alloc
    ));
  };

  const deleteWorkAllocation = (id: string) => {
    setWorkAllocations(prev => prev.filter(alloc => alloc.id !== id));
  };

  return (
    <JobCardContext.Provider value={{ 
      jobCards, 
      workAllocations, 
      addJobCard, 
      updateJobCard, 
      getJobCard,
      addWorkAllocation,
      updateWorkAllocation,
      deleteWorkAllocation
    }}>
      {children}
    </JobCardContext.Provider>
  );
};

export const useJobCards = () => {
  const context = useContext(JobCardContext);
  if (!context) {
    throw new Error('useJobCards must be used within a JobCardProvider');
  }
  return context;
};

