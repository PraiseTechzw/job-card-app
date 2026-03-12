import React, { useState } from 'react';
import styles from './JobCardForm.module.css';
import { FormField, Input, TextArea, RadioGroup } from '../components/Form';
import type { JobCard, ResourceUsage } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface JobCardBackFormProps {
  data: Partial<JobCard>;
  onChange: (updates: Partial<JobCard>) => void;
  readOnly?: boolean;
}

const JobCardBackForm: React.FC<JobCardBackFormProps> = ({ data, onChange, readOnly }) => {
  const [resources, setResources] = useState<ResourceUsage[]>(data.resourceUsage || []);

  const handleResourceChange = (id: string, field: keyof ResourceUsage, value: any) => {
    const updated = resources.map(r => r.id === id ? { ...r, [field]: value } : r);
    setResources(updated);
    onChange({ resourceUsage: updated });
  };

  const addResource = () => {
    const newRes: ResourceUsage = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      artisanName: '',
      hoursWorked: 0
    };
    const updated = [...resources, newRes];
    setResources(updated);
    onChange({ resourceUsage: updated });
  };

  const removeResource = (id: string) => {
    const updated = resources.filter(r => r.id !== id);
    setResources(updated);
    onChange({ resourceUsage: updated });
  };

  return (
    <div className={styles.paperForm}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.titleText}>JOB CARD BACK</h1>
          <p className={styles.subtitle}>WORK FEEDBACK & RESOURCE CAPTURE</p>
        </div>
      </div>

      {/* Work Details */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>1. DETAILS OF WORK DONE</h2>
        <div className={styles.fullGrid}>
          <FormField label="Comprehensive Feedback">
            <TextArea 
              value={data.workDoneDetails} 
              onChange={e => onChange({ workDoneDetails: e.target.value })} 
              disabled={readOnly}
              placeholder="Describe what was actually done..."
            />
          </FormField>
          <div className={styles.grid}>
            <FormField label="Was this a Breakdown?">
              <RadioGroup 
                name="isBreakdown"
                selectedValue={data.isBreakdown ? 'yes' : 'no'}
                onChange={val => onChange({ isBreakdown: val === 'yes' })}
                disabled={readOnly}
                options={[
                  { value: 'yes', label: 'YES' },
                  { value: 'no', label: 'NO' }
                ]}
              />
            </FormField>
            <FormField label="Cause of Failure">
              <Input 
                value={data.causeOfFailure} 
                onChange={e => onChange({ causeOfFailure: e.target.value })} 
                disabled={readOnly}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>2. RESOURCES USED (LABOUR)</h2>
        <div className={styles.tableContainer}>
          <table className={styles.resourceTable}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Artisan Name</th>
                <th>Hours Worked</th>
                {!readOnly && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {resources.map(res => (
                <tr key={res.id}>
                  <td>
                    <input 
                      type="date" 
                      value={res.date} 
                      onChange={e => handleResourceChange(res.id, 'date', e.target.value)}
                      disabled={readOnly}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={res.artisanName} 
                      onChange={e => handleResourceChange(res.id, 'artisanName', e.target.value)}
                      disabled={readOnly}
                    />
                  </td>
                  <td>
                    <input 
                      type="number" 
                      value={res.hoursWorked} 
                      onChange={e => handleResourceChange(res.id, 'hoursWorked', parseFloat(e.target.value))}
                      disabled={readOnly}
                    />
                  </td>
                  {!readOnly && (
                    <td>
                      <button type="button" onClick={() => removeResource(res.id)} className={styles.removeBtn}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && (
            <button type="button" onClick={addResource} className={styles.addBtn}>
              <Plus size={16} /> Add Entry
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className={styles.section}>
        <div className={styles.grid}>
          <FormField label="Date Finished">
            <Input type="date" value={data.dateFinished} onChange={e => onChange({ dateFinished: e.target.value })} disabled={readOnly} />
          </FormField>
          <FormField label="Total Machine Downtime">
            <Input value={data.machineDowntime} onChange={e => onChange({ machineDowntime: e.target.value })} disabled={readOnly} placeholder="e.g. 4.5 hours" />
          </FormField>
        </div>
        <div className={styles.grid}>
          <FormField label="No. of Artisans">
            <Input type="number" value={data.numArtisans} onChange={e => onChange({ numArtisans: parseInt(e.target.value) })} disabled={readOnly} />
          </FormField>
          <FormField label="No. of Apprentices">
            <Input type="number" value={data.numApprentices} onChange={e => onChange({ numApprentices: parseInt(e.target.value) })} disabled={readOnly} />
          </FormField>
          <FormField label="No. of Assistants">
            <Input type="number" value={data.numAssistants} onChange={e => onChange({ numAssistants: parseInt(e.target.value) })} disabled={readOnly} />
          </FormField>
        </div>
      </div>

      {/* Spares and Further Work */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>3. MATERIAL & SPARES</h2>
        <div className={styles.grid}>
          <FormField label="Spares Ordered">
            <TextArea value={data.sparesOrdered} onChange={e => onChange({ sparesOrdered: e.target.value })} disabled={readOnly} />
          </FormField>
          <FormField label="Spares Withdrawn">
            <TextArea value={data.sparesWithdrawn} onChange={e => onChange({ sparesWithdrawn: e.target.value })} disabled={readOnly} />
          </FormField>
        </div>
        <div className={styles.fullGrid}>
          <FormField label="Further Work Required?">
            <TextArea value={data.furtherWorkRequired} onChange={e => onChange({ furtherWorkRequired: e.target.value })} disabled={readOnly} />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default JobCardBackForm;
