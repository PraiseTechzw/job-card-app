export type JobCardStatus = 
  | 'Draft' 
  | 'Pending_Supervisor' 
  | 'Pending_HOD' 
  | 'Approved' 
  | 'Registered'
  | 'Assigned' 
  | 'InProgress' 
  | 'Completed' 
  | 'SignedOff' 
  | 'Closed'
  | 'Rejected';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type Trade = 
  | 'Fitting' 
  | 'Tooling' 
  | 'Electrical' 
  | 'B/ Making' 
  | 'Inst & Cntrl' 
  | 'Machine Shop' 
  | 'Build & Maint' 
  | 'Project';

export interface User {
  id: string;
  name: string;
  role: 'Admin' | 'Initiator' | 'Supervisor' | 'EngSupervisor' | 'Artisan' | 'PlanningOffice' | 'HOD';
  department: string;
}

export interface ResourceUsage {
  id: string;
  date: string;
  artisanName: string;
  hoursWorked: number;
}

export interface JobCard {
  id: string;
  ticketNumber: string;
  requestedBy: string;
  dateRaised: string;
  timeRaised: string;
  priority: Priority;
  requiredCompletionDate: string;
  
  // Plant Info
  plantNumber: string;
  plantDescription: string;
  plantStatus: 'Run' | 'Shut';
  
  // Details
  defect: string;
  maintenanceSchedule: string;
  workRequest: string;
  
  // Trades
  allocatedTrades: Trade[];
  
  // Workflow / Sign-offs
  status: JobCardStatus;
  approvedBySupervisor?: string;
  approvedByHOD?: string;
  issuedTo?: string; // Artisan ID or Name
  registrationPlanning?: string;
  originatorSignOff?: string;
  closedBy?: string;
  
  // Back Form Fields (New)
  workDoneDetails?: string;
  isBreakdown?: boolean;
  resourceUsage?: ResourceUsage[];
  dateFinished?: string;
  startHours?: string;
  causeOfFailure?: string;
  machineDowntime?: string;
  numArtisans?: number;
  numApprentices?: number;
  numAssistants?: number;
  hasHistory?: boolean;
  furtherWorkRequired?: string;
  supervisorComments?: string;
  sparesOrdered?: string;
  sparesWithdrawn?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface DailyWorkAllocation {
  id: string;
  supervisor: string;
  section: string;
  date: string;
  artisanName: string;
  allocatedTask: string;
  jobCardNumber: string;
  estimatedTime: string;
  actualTimeTaken?: string;
}

