import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { JobCard, DailyWorkAllocation } from '../types';

const API_BASE = '/api';

interface JobCardContextType {
  jobCards: JobCard[];
  workAllocations: DailyWorkAllocation[];
  isLoading: boolean;
  addJobCard: (jobCard: Partial<JobCard>) => Promise<void>;
  updateJobCard: (id: string, updates: Partial<JobCard>) => Promise<void>;
  getJobCard: (id: string) => JobCard | undefined;
  addWorkAllocation: (allocation: Partial<DailyWorkAllocation>) => Promise<void>;
  updateWorkAllocation: (id: string, updates: Partial<DailyWorkAllocation>) => Promise<void>;
  deleteWorkAllocation: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const JobCardContext = createContext<JobCardContextType | undefined>(undefined);

export const JobCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [workAllocations, setWorkAllocations] = useState<DailyWorkAllocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cardsRes, allocRes] = await Promise.all([
        axios.get(`${API_BASE}/job-cards`),
        axios.get(`${API_BASE}/allocations`)
      ]);
      setJobCards(cardsRes.data);
      setWorkAllocations(allocRes.data);
    } catch (err) {
      console.error('Failed to fetch data from API, using local fallback:', err);
      // Fallback to local storage if API fails (e.g. during dev without DB)
      const savedCards = localStorage.getItem('jobCards');
      const savedAllocations = localStorage.getItem('workAllocations');
      if (savedCards) setJobCards(JSON.parse(savedCards));
      if (savedAllocations) setWorkAllocations(JSON.parse(savedAllocations));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addJobCard = async (data: Partial<JobCard>) => {
    try {
      const res = await axios.post(`${API_BASE}/job-cards`, data);
      setJobCards(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Add failed, using local offline mode');
      const newCard: JobCard = {
        ...data as JobCard,
        id: Math.random().toString(36).substr(2, 9),
        ticketNumber: `JC-OFF-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setJobCards(prev => [...prev, newCard]);
      localStorage.setItem('jobCards', JSON.stringify([...jobCards, newCard]));
    }
  };

  const updateJobCard = async (id: string, updates: Partial<JobCard>) => {
    try {
      const res = await axios.patch(`${API_BASE}/job-cards/${id}`, updates);
      setJobCards(prev => prev.map(card => card.id === id ? res.data : card));
    } catch (err) {
      setJobCards(prev => prev.map(card => 
        card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
      ));
    }
  };

  const getJobCard = (id: string) => {
    return jobCards.find(card => card.id === id);
  };

  const addWorkAllocation = async (data: Partial<DailyWorkAllocation>) => {
    try {
      const res = await axios.post(`${API_BASE}/allocations`, data);
      setWorkAllocations(prev => [...prev, res.data]);
    } catch (err) {
      const newAllocation: DailyWorkAllocation = {
        ...data as DailyWorkAllocation,
        id: Math.random().toString(36).substr(2, 9)
      };
      setWorkAllocations(prev => [...prev, newAllocation]);
    }
  };

  const updateWorkAllocation = async (id: string, updates: Partial<DailyWorkAllocation>) => {
    // Note: Patch endpoint for allocations not yet in backend index.js example 
    // but we update local state for immediate feedback
    setWorkAllocations(prev => prev.map(alloc => 
      alloc.id === id ? { ...alloc, ...updates } : alloc
    ));
  };

  const deleteWorkAllocation = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/allocations/${id}`);
      setWorkAllocations(prev => prev.filter(alloc => alloc.id !== id));
    } catch (err) {
      setWorkAllocations(prev => prev.filter(alloc => alloc.id !== id));
    }
  };

  return (
    <JobCardContext.Provider value={{ 
      jobCards, 
      workAllocations, 
      isLoading,
      addJobCard, 
      updateJobCard, 
      getJobCard,
      addWorkAllocation,
      updateWorkAllocation,
      deleteWorkAllocation,
      refreshData: fetchData
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

