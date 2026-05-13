import React, { useState } from 'react';
import styles from './JobCardForm.module.css';
import { FormField, Input, TextArea, Select, CheckboxGroup, RadioGroup } from '../components/Form';
import type { JobCard, Trade, JobCardStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useJobCards } from '../context/JobCardContext';
import { useRuntimeConfig } from '../context/RuntimeConfigContext';
import { Send, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobCardFormProps {
  initialData?: Partial<JobCard>;
  onSave: (data: Partial<JobCard>) => void;
  isSubmitting?: boolean;
}

const TRADE_OPTIONS: Trade[] = [
  'Fitting', 'Tooling', 'Electrical', 'B/ Making', 
  'Inst & Cntrl', 'Machine Shop', 'Build & Maint', 'Project'
];

const JobCardForm: React.FC<JobCardFormProps> = ({ initialData, onSave, isSubmitting }) => {
  const { user } = useAuth();
  const { jobCards } = useJobCards();
  const { masterData } = useRuntimeConfig();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<JobCard>>({
    ticketNumber: initialData?.ticketNumber || 'AUTO-GEN',
    requestedBy: initialData?.requestedBy || user?.name || '',
    dateRaised: initialData?.dateRaised || new Date().toISOString().split('T')[0],
    timeRaised: initialData?.timeRaised || new Date().toTimeString().split(' ')[0].substring(0, 5),
    priority: initialData?.priority || 'Medium',
    requiredCompletionDate: initialData?.requiredCompletionDate || '',
    plantNumber: initialData?.plantNumber || '',
    plantDescription: initialData?.plantDescription || '',
    plantStatus: initialData?.plantStatus || 'Run',
    defect: initialData?.defect || '',
    maintenanceSchedule: initialData?.maintenanceSchedule || '',
    workRequest: initialData?.workRequest || '',
    allocatedTrades: initialData?.allocatedTrades || [],
    status: initialData?.status || 'Draft',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const machineOptions = React.useMemo(() => {
    const fromMaster = Array.isArray(masterData?.['Plants / Assets'])
      ? masterData['Plants / Assets']
          .filter((item: any) => item?.active !== false)
          .map((item: any) => ({
            code: String(item.code || item.name || '').trim(),
            name: String(item.name || item.code || '').trim(),
          }))
      : [];

    const fromJobs = jobCards
      .map((card) => ({
        code: card.plantNumber?.trim() || '',
        name: card.plantDescription?.trim() || '',
      }))
      .filter((item) => item.code || item.name);

    return [...fromMaster, ...fromJobs].reduce<Array<{ code: string; name: string }>>((acc, item) => {
      const key = `${item.code}::${item.name}`.toLowerCase();
      if (!acc.some((existing) => `${existing.code}::${existing.name}`.toLowerCase() === key)) {
        acc.push(item);
      }
      return acc;
    }, []).sort((a, b) => a.code.localeCompare(b.code));
  }, [jobCards, masterData]);

  const selectMachine = (selectedValue: string) => {
    if (!selectedValue) {
      setFormData((prev) => ({ ...prev, plantNumber: '', plantDescription: '' }));
      return;
    }

    const selected = machineOptions.find((item) => `${item.code}__${item.name}` === selectedValue);
    if (selected) {
      setFormData((prev) => ({ ...prev, plantNumber: selected.code, plantDescription: selected.name }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.requestedBy) newErrors.requestedBy = 'Required';
    if (!formData.plantNumber) newErrors.plantNumber = 'Required';
    if (!formData.plantDescription) newErrors.plantDescription = 'Required';
    if (!formData.defect) newErrors.defect = 'Required';
    if (!formData.workRequest) newErrors.workRequest = 'Required';
    if (!formData.requiredCompletionDate) newErrors.requiredCompletionDate = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof JobCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleTrade = (trade: Trade) => {
    const current = formData.allocatedTrades || [];
    if (current.includes(trade)) {
      handleChange('allocatedTrades', current.filter(t => t !== trade));
    } else {
      handleChange('allocatedTrades', [...current, trade]);
    }
  };

  const handleSubmit = (status: JobCardStatus) => (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'Draft' && !validate()) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave({ ...formData, status });
  };

  return (
    <div className={styles.formContainer}>
      <form className={styles.paperForm} onSubmit={handleSubmit('Pending_Supervisor')}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.ticketBox}>
              <span className={styles.ticketLabel}>Job Card Number</span>
              <span className={styles.ticketValue}>{formData.ticketNumber}</span>
            </div>
          </div>
          <div className={styles.headerTitle}>
            <h1 className={styles.titleText}>JOB CARD FRONT</h1>
            <p className={styles.subtitle}>MAINTENANCE & ENGINEERING SERVICES</p>
          </div>
          <div className={styles.headerRight}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
              <ArrowLeft size={18} /> Back
            </button>
          </div>
        </div>

        {/* Originator Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>1. GENERATION / ORIGINATOR DETAILS</h2>
          <div className={styles.grid}>
            <FormField label="Requested By" required error={errors.requestedBy}>
              <Input 
                value={formData.requestedBy} 
                onChange={e => handleChange('requestedBy', e.target.value)} 
                placeholder="Name of requester"
              />
            </FormField>
            <div className={styles.subGrid}>
              <FormField label="Date Raised">
                <Input type="date" value={formData.dateRaised} readOnly />
              </FormField>
              <FormField label="Time Raised">
                <Input type="time" value={formData.timeRaised} readOnly />
              </FormField>
            </div>
            <FormField label="Priority" required>
              <Select 
                value={formData.priority}
                onChange={e => handleChange('priority', e.target.value)}
                options={[
                  { value: 'Low', label: 'Low - Routine' },
                  { value: 'Medium', label: 'Medium - Normal' },
                  { value: 'High', label: 'High - Urgent' },
                  { value: 'Critical', label: 'Critical - Breakdown' }
                ]}
              />
            </FormField>
            <FormField label="Required Completion Date" required error={errors.requiredCompletionDate}>
              <Input 
                type="date" 
                value={formData.requiredCompletionDate} 
                onChange={e => handleChange('requiredCompletionDate', e.target.value)} 
              />
            </FormField>
          </div>
        </div>

        {/* Plant Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>2. PLANT & ASSET INFORMATION</h2>
          <div className={styles.grid}>
            <FormField label="Plant Number" required error={errors.plantNumber}>
              <Select
                value={formData.plantNumber && formData.plantDescription ? `${formData.plantNumber}__${formData.plantDescription}` : ''}
                onChange={(e) => selectMachine(e.target.value)}
                options={[
                  { value: '', label: 'Choose a machine / asset...' },
                  ...machineOptions.map((item) => ({ value: `${item.code}__${item.name}`, label: `${item.code} - ${item.name}` })),
                ]}
              />
            </FormField>
            <FormField label="Plant Description" required error={errors.plantDescription}>
              <Input value={formData.plantDescription} readOnly placeholder="Select a machine above" />
            </FormField>
            <FormField label="Plant Status">
              <RadioGroup 
                name="plantStatus"
                selectedValue={formData.plantStatus || 'Run'}
                onChange={val => handleChange('plantStatus', val)}
                options={[
                  { value: 'Run', label: 'RUN' },
                  { value: 'Shut', label: 'SHUT' }
                ]}
              />
            </FormField>
          </div>
        </div>

        {/* Work Details Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>3. DEFECT & WORK REQUEST</h2>
          <div className={styles.fullGrid}>
            <FormField label="Defect / Problem observed" required error={errors.defect}>
              <TextArea 
                value={formData.defect} 
                onChange={e => handleChange('defect', e.target.value)} 
                placeholder="Describe the failure or observation..."
              />
            </FormField>
            <FormField label="Work Request / Instruction" required error={errors.workRequest}>
              <TextArea 
                value={formData.workRequest} 
                onChange={e => handleChange('workRequest', e.target.value)} 
                placeholder="What needs to be done?"
              />
            </FormField>
            <FormField label="Maintenance Schedule Link">
              <Input 
                value={formData.maintenanceSchedule} 
                onChange={e => handleChange('maintenanceSchedule', e.target.value)} 
                placeholder="Reference schedule if applicable"
              />
            </FormField>
          </div>
        </div>

        {/* Allocation Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>4. SECTION / TRADE ALLOCATION</h2>
          <CheckboxGroup 
            options={TRADE_OPTIONS}
            selectedValues={formData.allocatedTrades || []}
            onChange={(val) => toggleTrade(val as Trade)}
          />
        </div>

        {/* Official Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>5. OFFICIAL USE / SIGN-OFFS</h2>
          <div className={styles.signOffGrid}>
            <div className={styles.signOffItem}>
              <span className={styles.signOffLabel}>Appr. Supervisor</span>
              <div className={styles.signOffLine}>{formData.approvedBySupervisor || '________________'}</div>
            </div>
            <div className={styles.signOffItem}>
              <span className={styles.signOffLabel}>Appr. HOD</span>
              <div className={styles.signOffLine}>{formData.approvedByHOD || '________________'}</div>
            </div>
            <div className={styles.signOffItem}>
              <span className={styles.signOffLabel}>Issued To</span>
              <div className={styles.signOffLine}>{formData.issuedTo || '________________'}</div>
            </div>
            <div className={styles.signOffItem}>
              <span className={styles.signOffLabel}>Reg Planning</span>
              <div className={styles.signOffLine}>{formData.registrationPlanning || '________________'}</div>
            </div>
            <div className={styles.signOffItem}>
              <span className={styles.signOffLabel}>Orig Sign Off</span>
              <div className={styles.signOffLine}>{formData.originatorSignOff || '________________'}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            type="button" 
            className="btn btn-ghost" 
            onClick={handleSubmit('Draft')}
            disabled={isSubmitting}
          >
            <Save size={18} /> Save as Draft
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            <Send size={18} /> Submit for Approval
          </button>
        </div>
      </form>
    </div>

  );
};

export default JobCardForm;
