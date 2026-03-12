import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { JobCard, AllocationSheet, Assignment } from '../types';

const API_BASE = '/api';

interface JobCardContextType {
  jobCards: JobCard[];
  allocationSheets: AllocationSheet[];
  isLoading: boolean;
  error: string | null;
  addJobCard: (jobCard: Partial<JobCard>) => Promise<void>;
  updateJobCard: (id: string, updates: Partial<JobCard>) => Promise<void>;
  getJobCard: (id: string) => JobCard | undefined;
  getJobCardByNumber: (ticketNumber: string) => JobCard | undefined;
  addAllocationSheet: (sheet: Partial<AllocationSheet>) => Promise<void>;
  updateAllocationSheet: (id: string, updates: Partial<AllocationSheet>) => Promise<void>;
  deleteAllocationSheet: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addAuditLog: (log: { jobCardId: string; action: string; performedBy: string; details?: string }) => Promise<void>;
  getAuditLogs: (jobCardId: string) => Promise<any[]>;
  assignments: Assignment[];
  addAssignment: (assignment: Partial<Assignment>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  getAssignments: (jobCardId: string) => Promise<Assignment[]>;
}

const JobCardContext = createContext<JobCardContextType | undefined>(undefined);

export const JobCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [allocationSheets, setAllocationSheets] = useState<AllocationSheet[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [cardsRes, sheetsRes, assignRes] = await Promise.all([
        axios.get(`${API_BASE}/job-cards`),
        axios.get(`${API_BASE}/allocation-sheets`),
        axios.get(`${API_BASE}/assignments`)
      ]);
      setJobCards(Array.isArray(cardsRes.data) ? cardsRes.data : []);
      setAllocationSheets(Array.isArray(sheetsRes.data) ? sheetsRes.data : []);
      setAssignments(Array.isArray(assignRes.data) ? assignRes.data : []);
    } catch (err: any) {
      console.error('Failed to fetch data from API:', err);
      setError(err.response?.data?.error || 'Failed to sync with server');
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
      console.error('Add failed');
    }
  };

  const updateJobCard = async (id: string, updates: Partial<JobCard>) => {
    try {
      const res = await axios.patch(`${API_BASE}/job-cards/${id}`, updates);
      setJobCards(prev => prev.map(card => card.id === id ? res.data : card));
    } catch (err) {
      setJobCards(prev => prev.map(card => card.id === id ? { ...card, ...updates } : card));
    }
  };

  const getJobCard = (id: string) => jobCards.find(card => card.id === id);
  const getJobCardByNumber = (ticketNumber: string) => jobCards.find(card => card.ticketNumber === ticketNumber);

  const addAllocationSheet = async (data: Partial<AllocationSheet>) => {
    try {
      const res = await axios.post(`${API_BASE}/allocation-sheets`, data);
      setAllocationSheets(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to add sheet:', err);
    }
  };

  const updateAllocationSheet = async (id: string, updates: Partial<AllocationSheet>) => {
    try {
      const res = await axios.patch(`${API_BASE}/allocation-sheets/${id}`, updates);
      setAllocationSheets(prev => prev.map(s => s.id === id ? res.data : s));
    } catch (err) {
      console.error('Failed to update sheet:', err);
    }
  };

  const deleteAllocationSheet = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/allocation-sheets/${id}`);
      setAllocationSheets(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const addAuditLog = async (log: { jobCardId: string; action: string; performedBy: string; details?: string }) => {
    try { await axios.post(`${API_BASE}/audit-logs`, log); } catch (err) {}
  };

  const getAuditLogs = async (jobCardId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/audit-logs/${jobCardId}`);
      return res.data;
    } catch (err) { return []; }
  };

  const addAssignment = async (data: Partial<Assignment>) => {
    try {
      const res = await axios.post(`${API_BASE}/assignments`, data);
      setAssignments(prev => [...prev, res.data]);
    } catch (err) {}
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      const res = await axios.patch(`${API_BASE}/assignments/${id}`, updates);
      setAssignments(prev => prev.map(a => a.id === id ? res.data : a));
    } catch (err) {}
  };

  const getAssignments = async (jobCardId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/assignments/${jobCardId}`);
      return res.data;
    } catch (err) { return []; }
  };

  return (
    <JobCardContext.Provider value={{ 
      jobCards, 
      allocationSheets, 
      isLoading,
      error,
      addJobCard, 
      updateJobCard, 
      getJobCard,
      getJobCardByNumber,
      addAllocationSheet,
      updateAllocationSheet,
      deleteAllocationSheet,
      refreshData: fetchData,
      addAuditLog,
      getAuditLogs,
      assignments,
      addAssignment,
      updateAssignment,
      getAssignments
    }}>
      {children}
    </JobCardContext.Provider>
  );
};

export const useJobCards = () => {
  const context = useContext(JobCardContext);
  if (!context) throw new Error('useJobCards must be used within a JobCardProvider');
  return context;
};
