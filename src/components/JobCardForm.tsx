import React, { useState } from 'react';
import styles from './JobCardForm.module.css';
import { FormField, Input, TextArea, Select, CheckboxGroup, RadioGroup } from '../components/Form';
import type { JobCard, Trade, JobCardStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useRuntimeConfig } from '../context/RuntimeConfigContext';
import machineLocations from '../data/machine_locations.json';
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
    	plantLocation: initialData?.plantLocation || '',
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
    // Use ONLY the exact machine list provided by the user (preserve order).
    const fallbackMachines = [
      'EXB02','HYPET 400','UROLA BLOWER','KM02','KM04','SACMI','INJ03','CHIPPER','EXB02 CHIPPER','HUSKY','KM01','CMM Mitutoyo','INJ06','EXB04 CHIPPER','WINTEC','DBs','AIR DRYERS','FILMATIC BLOWER','CHILLER','INJ07','SB10','L132 RS COMPRESSOR','L132 COMPRESSOR','COLDROOM','UROLA','UROLA MAHEU','KM','KM03','TUMBLER','SB13','SERVICES','SACMI LAB','UROLA TRIMMER','TC500','TMC 750','MC03','NETSTAL','HOOVER','TC480','TC300','16G MOULD','INJ02','TRANSFORMER','FLAME TREATER','TMC','AIR COMPRESSORS','WALKER DRIER','EXB03 CHIPPER','CHILLER FRIGO','AIR CONDITIONERS','L30 COMPRESSOR','CHIPPER 2','ROTO','SB11','CHILLER TC500','CHILLER KM3','LABELLER','EXB03','EXB04','EXB04 LEAK TESTER','CHILLER 360','INJ05'
    ];

    return fallbackMachines.map((name) => ({ code: String(name).trim(), name: String(name).trim() }));
  }, [masterData]);

  const locationOptions = React.useMemo(() => {
    const fromMaster = masterData?.Locations || masterData?.locations || masterData?.['Locations'] || null;
    if (Array.isArray(fromMaster)) {
      return fromMaster.map((item: any) => {
        if (typeof item === 'string') return String(item).trim();
        if (item && (item.name || item.code)) return String(item.name || item.code).trim();
        return '';
      }).filter(Boolean).sort();
    }

    // fallback list extracted from provided image
    return [
      'BLOW','CREDITORS','ENGINEERING','HQ','IT','LIM','PET','POLYCYCLING','PREFORMS','QC LAB','ROTO','SACMI','SALES','STORES','TRADITIONAL CANTEEN','WARE HOUSE','WESTERN CANTEEN','WILLOWVALE MAHEU'
    ];
  }, [masterData]);

  const selectMachine = (selectedValue: string) => {
    if (!selectedValue) {
      setFormData((prev) => ({ ...prev, plantNumber: '', plantDescription: '', plantLocation: '' }));
      return;
    }

    const selected = machineOptions.find((item) => `${item.code}__${item.name}` === selectedValue);
    if (selected) {
      const mappedLocation = machineLocations[selected.name] || machineLocations[selected.code] || '';
      setFormData((prev) => ({ ...prev, plantNumber: selected.code, plantDescription: selected.name, plantLocation: mappedLocation }));
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
                  ...machineOptions.map((item) => ({ value: `${item.code}__${item.name}`, label: item.name || item.code })),
                ]}
              />
            </FormField>
            <FormField label="Plant Description" required error={errors.plantDescription}>
              <Input value={formData.plantDescription} readOnly placeholder="Select a machine above" />
            </FormField>
            <FormField label="Location">
              <Select
                value={formData.plantLocation || ''}
                onChange={e => handleChange('plantLocation', e.target.value)}
                options={[
                  { value: '', label: 'Choose a location...' },
                  ...locationOptions.map((loc) => ({ value: loc, label: loc }))
                ]}
              />
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
