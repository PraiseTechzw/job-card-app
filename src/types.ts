export type JobCardStatus = 
  | 'Draft' 
  | 'Pending_Supervisor' 
  | 'Pending_HOD' 
  | 'Approved' 
  | 'Registered'
  | 'Assigned' 
  | 'InProgress' 
  | 'Awaiting_SignOff' 
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
  employeeId: string;
  name: string;
  email: string;
  role: 'Admin' | 'Initiator' | 'Supervisor' | 'EngSupervisor' | 'Artisan' | 'PlanningOffice' | 'HOD';
  department: string;
  section?: string;
  status: 'Active' | 'Inactive' | 'Locked';
  lastLogin?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  entityId?: string;
  details?: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export interface MasterDataItem {
  id: string;
  type: 'Department' | 'Plant' | 'Asset' | 'EquipmentCategory' | 'JobType' | 'FailureCode' | 'RootCause' | 'MaintenanceCategory' | 'Section';
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export interface WorkflowRule {
  id: string;
  fromStatus: JobCardStatus;
  toStatus: JobCardStatus;
  requiredRole: string[];
  requiresApproval: boolean;
  canReturn: boolean;
  mandatoryFields: string[];
}

export interface SystemSettings {
  id: string;
  authMethod: 'Local' | 'OIDC' | 'ActiveDirectory';
  emailEnabled: boolean;
  smsEnabled: boolean;
  archiveRetentionMonths: number;
  maintenanceWindow?: string;
  brandingName: string;
  allowedUploadTypes: string[];
}

export interface NotificationRule {
  id: string;
  status: JobCardStatus;
  recipients: string[]; // Role names or 'RequestedBy'
  channels: ('Email' | 'InApp' | 'SMS')[];
  isEnabled: boolean;
}

export interface SpareOrdered {
  id: string;
  qty: string;
  description: string;
  prNo: string;
  date: string;
}

export interface ResourceUsage {
  id: string;
  date: string;
  artisanName: string;
  hoursWorked: number;
}

export interface SpareWithdrawn {
  id: string;
  qty: string;
  sivNo: string;
  description: string;
  cost: string;
  date: string;
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
  
  // Back Form Fields
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
  failureType?: string;
  maintenanceType?: string;
  safetyNotes?: string;
  sparesOrdered?: SpareOrdered[];
  sparesWithdrawn?: SpareWithdrawn[];
  originatorComment?: string;
  originatorSignOffDate?: string;
  originatorSignOffTime?: string;
  closureComment?: string;
  closedByDate?: string;
  closedByTime?: string;
  
  // API Operations Metadata
  performedBy?: string;
  userRole?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface AllocationRow {
  id: string;
  sheetId: string;
  artisanName: string;
  allocatedTask: string;
  jobCardNumber: string;
  estimatedTime: string;
  actualTimeTaken?: string;
}

export interface AllocationSheet {
  id: string;
  supervisor: string;
  section: string;
  date: string;
  rows: AllocationRow[];
  createdAt: string;
}
export interface Assignment {
  id: string;
  jobCardId: string;
  artisanName: string;
  section?: string;
  assignedBy: string;
  assignedDate: string;
  expectedStartDate?: string;
  expectedCompletionDate?: string;
  actualStartTime?: string;
  actualCompletionTime?: string;
  notes?: string;
  status: 'Assigned' | 'InProgress' | 'Completed';
  createdAt: string;
}

