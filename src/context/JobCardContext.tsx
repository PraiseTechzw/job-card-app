import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import type { JobCard, AllocationSheet, Assignment, AuditTrailEntry } from '../types';
import { getErrorMessage } from '../utils/http';

const API_BASE = '/api';

interface JobCardContextType {
  jobCards: JobCard[];
  allocationSheets: AllocationSheet[];
  isLoading: boolean;
  error: string | null;
  addJobCard: (jobCard: Partial<JobCard>) => Promise<JobCard>;
  updateJobCard: (id: string, updates: Partial<JobCard>) => Promise<JobCard>;
  getJobCard: (id: string) => JobCard | undefined;
  getJobCardByNumber: (ticketNumber: string) => JobCard | undefined;
  addAllocationSheet: (sheet: Partial<AllocationSheet>) => Promise<AllocationSheet>;
  updateAllocationSheet: (id: string, updates: Partial<AllocationSheet>) => Promise<AllocationSheet>;
  deleteAllocationSheet: (id: string) => Promise<void>;
  refreshData: () => Promise<void>;
  addAuditLog: (log: { jobCardId: string; action: string; performedBy: string; details?: string }) => Promise<void>;
  getAuditLogs: (jobCardId: string) => Promise<AuditTrailEntry[]>;
  assignments: Assignment[];
  addAssignment: (assignment: Partial<Assignment>) => Promise<Assignment>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<Assignment>;
  getAssignments: (jobCardId: string) => Promise<Assignment[]>;
}

const JobCardContext = createContext<JobCardContextType | undefined>(undefined);

export const JobCardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [allocationSheets, setAllocationSheets] = useState<AllocationSheet[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isManualRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      const [cardsRes, sheetsRes, assignRes] = await Promise.allSettled([
        axios.get(`${API_BASE}/job-cards`),
        axios.get(`${API_BASE}/allocation-sheets`),
        axios.get(`${API_BASE}/assignments`)
      ]);

      const cardsData = cardsRes.status === 'fulfilled' ? cardsRes.value.data : [];
      const sheetsData = sheetsRes.status === 'fulfilled' ? sheetsRes.value.data : [];
      const assignmentsData = assignRes.status === 'fulfilled' ? assignRes.value.data : [];

      if (cardsRes.status === 'rejected') {
        throw cardsRes.reason;
      }

      // Debug: log fetched card count to help diagnose missing UI rows
      try {
        const len = Array.isArray(cardsData) ? cardsData.length : 0;
        console.debug(`[JobCardContext] fetched job-cards: ${len}`);
      } catch (e) { /* ignore */ }

      setJobCards(Array.isArray(cardsData) ? cardsData : []);
      setAllocationSheets(Array.isArray(sheetsData) ? sheetsData : []);
      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
      if (isManualRefresh) toast.success('Data synced with server');
    } catch (error) {
      console.error('Failed to fetch data from API:', error);
      const errMsg = getErrorMessage(error, 'Failed to sync with server');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refreshData = async () => {
    await fetchData(true);
  };

  const addJobCard = async (data: Partial<JobCard>) => {
    try {
      const res = await axios.post(`${API_BASE}/job-cards`, data);
      setJobCards(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error('Add failed', error);
      throw error;
    }
  };

  const updateJobCard = async (id: string, updates: Partial<JobCard>) => {
    try {
      const res = await axios.patch(`${API_BASE}/job-cards/${id}`, updates);
      setJobCards(prev => prev.map(card => card.id === id ? res.data : card));
      return res.data;
    } catch (error) {
      console.error('[JobCardContext] updateJobCard explicitly failed:', error);
      // Do NOT silently merge broken requests into local memory. Throw it beautifully!
      throw error;
    }
  };

  const getJobCard = (id: string) => jobCards.find(card => card.id === id);
  const getJobCardByNumber = (ticketNumber: string) => jobCards.find(card => card.ticketNumber === ticketNumber);

  const addAllocationSheet = async (data: Partial<AllocationSheet>) => {
    try {
      const res = await axios.post(`${API_BASE}/allocation-sheets`, data);
      setAllocationSheets(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error('Failed to add sheet:', error);
      throw error;
    }
  };

  const updateAllocationSheet = async (id: string, updates: Partial<AllocationSheet>) => {
    try {
      const res = await axios.patch(`${API_BASE}/allocation-sheets/${id}`, updates);
      setAllocationSheets(prev => prev.map(s => s.id === id ? res.data : s));
      return res.data;
    } catch (error) {
      console.error('Failed to update sheet:', error);
      throw error;
    }
  };

  const deleteAllocationSheet = async (id: string) => {
    try {
      await axios.delete(`${API_BASE}/allocation-sheets/${id}`);
      setAllocationSheets(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  };

  const addAuditLog = async (log: { jobCardId: string; action: string; performedBy: string; details?: string }) => {
    try {
      await axios.post(`${API_BASE}/audit-logs`, log);
    } catch (error) {
      console.error('Failed to add audit log:', error);
      throw error;
    }
  };

  const getAuditLogs = async (jobCardId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/audit-logs/${jobCardId}`);
      return res.data;
    } catch { return []; }
  };

  const addAssignment = async (data: Partial<Assignment>) => {
    try {
      const res = await axios.post(`${API_BASE}/assignments`, data);
      setAssignments(prev => [...prev, res.data]);
      return res.data;
    } catch (error) {
      console.error('Failed to add assignment:', error);
      throw error;
    }
  };

  const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
    try {
      const res = await axios.patch(`${API_BASE}/assignments/${id}`, updates);
      setAssignments(prev => prev.map(a => a.id === id ? res.data : a));
      return res.data;
    } catch (error) {
      console.error('Failed to update assignment:', error);
      throw error;
    }
  };

  const getAssignments = async (jobCardId: string) => {
    try {
      const res = await axios.get(`${API_BASE}/assignments/${jobCardId}`);
      return res.data;
    } catch { return []; }
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
      refreshData,
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
