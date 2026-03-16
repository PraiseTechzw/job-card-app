import React, { useState } from 'react';
import styles from './JobCardForm.module.css';
import { FormField, Input, TextArea, RadioGroup } from '../components/Form';
import type { JobCard, ResourceUsage, SpareOrdered, SpareWithdrawn } from '../types';
import { Plus, Trash2, Package, ShoppingCart } from 'lucide-react';

interface JobCardBackFormProps {
  data: Partial<JobCard>;
  onChange: (updates: Partial<JobCard>) => void;
  readOnly?: boolean;
}

const JobCardBackForm: React.FC<JobCardBackFormProps> = ({ data, onChange, readOnly }) => {
  const resources = data.resourceUsage || [];
  const sparesOrdered = data.sparesOrdered || [];
  const sparesWithdrawn = data.sparesWithdrawn || [];

  const updateField = (field: keyof JobCard, value: any) => {
    onChange({ [field]: value });
  };

  // Labours management
  const handleResourceChange = (id: string, field: keyof ResourceUsage, value: any) => {
    const updated = resources.map(r => r.id === id ? { ...r, [field]: value } : r);
    updateField('resourceUsage', updated);
  };

  const addResource = () => {
    const newRes: ResourceUsage = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      artisanName: '',
      hoursWorked: 0
    };
    updateField('resourceUsage', [...resources, newRes]);
  };

  const removeResource = (id: string) => {
    updateField('resourceUsage', resources.filter(r => r.id !== id));
  };

  // Spares Ordered management
  const addSpareOrdered = () => {
    const newSpare: SpareOrdered = {
      id: Math.random().toString(36).substr(2, 9),
      qty: '',
      description: '',
      prNo: '',
      date: new Date().toISOString().split('T')[0]
    };
    updateField('sparesOrdered', [...sparesOrdered, newSpare]);
  };

  const updateSpareOrdered = (id: string, field: keyof SpareOrdered, value: any) => {
    const updated = sparesOrdered.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateField('sparesOrdered', updated);
  };

  const removeSpareOrdered = (id: string) => {
    updateField('sparesOrdered', sparesOrdered.filter(s => s.id !== id));
  };

  // Spares Withdrawn management
  const addSpareWithdrawn = () => {
    const newSpare: SpareWithdrawn = {
      id: Math.random().toString(36).substr(2, 9),
      qty: '',
      sivNo: '',
      description: '',
      cost: '',
      date: new Date().toISOString().split('T')[0]
    };
    updateField('sparesWithdrawn', [...sparesWithdrawn, newSpare]);
  };

  const updateSpareWithdrawn = (id: string, field: keyof SpareWithdrawn, value: any) => {
    const updated = sparesWithdrawn.map(s => s.id === id ? { ...s, [field]: value } : s);
    updateField('sparesWithdrawn', updated);
  };

  const removeSpareWithdrawn = (id: string) => {
    updateField('sparesWithdrawn', sparesWithdrawn.filter(s => s.id !== id));
  };

  return (
    <div className={styles.paperForm}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.titleText}>JOB CARD BACK-FORM</h1>
          <p className={styles.subtitle}>WORK FEEDBACK & RESOURCE UTILIZATION</p>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>1. WORK FEEDBACK</h2>
        <div className={styles.fullGrid}>
          <FormField label="Details of Work Done">
            <TextArea 
              value={data.workDoneDetails} 
              onChange={e => updateField('workDoneDetails', e.target.value)} 
              disabled={readOnly}
              placeholder="Provide a technical summary of actions taken..."
            />
          </FormField>
          
          <div className={styles.grid}>
            <FormField label="Breakdown?">
              <RadioGroup 
                name="isBreakdown"
                selectedValue={data.isBreakdown ? 'yes' : 'no'}
                onChange={val => updateField('isBreakdown', val === 'yes')}
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
                onChange={e => updateField('causeOfFailure', e.target.value)} 
                disabled={readOnly}
              />
            </FormField>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>2. LABOUR RESOURCES</h2>
        <div className={styles.tableContainer}>
          <table className={styles.resourceTable}>
            <thead>
              <tr>
                <th>Date / Day</th>
                <th>Artisan / Technician</th>
                <th>Hours</th>
                {!readOnly && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {resources.map(res => (
                <tr key={res.id}>
                  <td><input type="date" value={res.date} onChange={e => handleResourceChange(res.id, 'date', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="text" value={res.artisanName} onChange={e => handleResourceChange(res.id, 'artisanName', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="number" value={res.hoursWorked} onChange={e => handleResourceChange(res.id, 'hoursWorked', parseFloat(e.target.value))} disabled={readOnly} /></td>
                  {!readOnly && (
                    <td><button type="button" onClick={() => removeResource(res.id)} className={styles.removeBtn}><Trash2 size={16} /></button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && (
            <button type="button" onClick={addResource} className={styles.addBtn}><Plus size={16} /> Add Labour Row</button>
          )}
        </div>

        <div className={styles.grid + " mt-4"}>
          <FormField label="Date Finished">
            <Input type="date" value={data.dateFinished} onChange={e => updateField('dateFinished', e.target.value)} disabled={readOnly} />
          </FormField>
          <FormField label="Start Hours">
            <Input value={data.startHours} onChange={e => updateField('startHours', e.target.value)} disabled={readOnly} placeholder="Meter reading / start time" />
          </FormField>
          <FormField label="Machine Downtime">
            <Input value={data.machineDowntime} onChange={e => updateField('machineDowntime', e.target.value)} disabled={readOnly} placeholder="e.g. 5 hours" />
          </FormField>
        </div>

        <div className={styles.grid}>
          <FormField label="No. Artisans"><Input type="number" value={data.numArtisans} onChange={e => updateField('numArtisans', parseInt(e.target.value))} disabled={readOnly} /></FormField>
          <FormField label="No. Apprentices"><Input type="number" value={data.numApprentices} onChange={e => updateField('numApprentices', parseInt(e.target.value))} disabled={readOnly} /></FormField>
          <FormField label="No. Assistants"><Input type="number" value={data.numAssistants} onChange={e => updateField('numAssistants', parseInt(e.target.value))} disabled={readOnly} /></FormField>
        </div>
      </div>

      <div className={styles.section}>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={20} className="text-blue-400" />
          <h2 className={styles.sectionHeader} style={{ marginBottom: 0 }}>3. SPARES / MATERIAL ORDERED</h2>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.resourceTable}>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Description</th>
                <th>PR No.</th>
                <th>Date</th>
                {!readOnly && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {sparesOrdered.map(s => (
                <tr key={s.id}>
                  <td><input type="text" value={s.qty} onChange={e => updateSpareOrdered(s.id, 'qty', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="text" value={s.description} onChange={e => updateSpareOrdered(s.id, 'description', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="text" value={s.prNo} onChange={e => updateSpareOrdered(s.id, 'prNo', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="date" value={s.date} onChange={e => updateSpareOrdered(s.id, 'date', e.target.value)} disabled={readOnly} /></td>
                  {!readOnly && (
                    <td><button type="button" onClick={() => removeSpareOrdered(s.id)} className={styles.removeBtn}><Trash2 size={16} /></button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && <button type="button" onClick={addSpareOrdered} className={styles.addBtn}><Plus size={16} /> Add PR Row</button>}
        </div>
      </div>

      <div className={styles.section}>
        <div className="flex items-center gap-2 mb-4">
          <Package size={20} className="text-green-400" />
          <h2 className={styles.sectionHeader} style={{ marginBottom: 0 }}>4. SPARES / MATERIAL WITHDRAWN</h2>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.resourceTable}>
            <thead>
              <tr>
                <th>Qty</th>
                <th>Description</th>
                <th>SIV No.</th>
                <th>Cost</th>
                <th>Date</th>
                {!readOnly && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {sparesWithdrawn.map(s => (
                <tr key={s.id}>
                  <td><input type="text" value={s.qty} onChange={e => updateSpareWithdrawn(s.id, 'qty', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="text" value={s.description} onChange={e => updateSpareWithdrawn(s.id, 'description', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="text" value={s.sivNo} onChange={e => updateSpareWithdrawn(s.id, 'sivNo', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="text" value={s.cost} onChange={e => updateSpareWithdrawn(s.id, 'cost', e.target.value)} disabled={readOnly} /></td>
                  <td><input type="date" value={s.date} onChange={e => updateSpareWithdrawn(s.id, 'date', e.target.value)} disabled={readOnly} /></td>
                  {!readOnly && (
                    <td><button type="button" onClick={() => removeSpareWithdrawn(s.id)} className={styles.removeBtn}><Trash2 size={16} /></button></td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && <button type="button" onClick={addSpareWithdrawn} className={styles.addBtn}><Plus size={16} /> Add SIV Row</button>}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>5. FINALIZATION</h2>
        <div className={styles.grid}>
          <FormField label="History Recorded?">
            <RadioGroup 
              name="hasHistory"
              selectedValue={data.hasHistory ? 'yes' : 'no'}
              onChange={val => updateField('hasHistory', val === 'yes')}
              disabled={readOnly}
              options={[{ value: 'yes', label: 'YES' }, { value: 'no', label: 'NO' }]}
            />
          </FormField>
          <FormField label="Further Work Required?">
            <RadioGroup 
              name="furtherWork"
              selectedValue={data.furtherWorkRequired ? 'yes' : 'no'}
              onChange={val => updateField('furtherWorkRequired', val === 'yes' ? 'Details...' : '')}
              disabled={readOnly}
              options={[{ value: 'yes', label: 'YES' }, { value: 'no', label: 'NO' }]}
            />
          </FormField>
        </div>
        {data.furtherWorkRequired && (
          <div className="mt-2">
            <TextArea 
              value={data.furtherWorkRequired} 
              onChange={e => updateField('furtherWorkRequired', e.target.value)} 
              disabled={readOnly}
              placeholder="Describe further work required..."
            />
          </div>
        )}
        <div className="mt-4">
          <FormField label="Supervisor / Engineering Manager Comments">
            <TextArea 
              value={data.supervisorComments} 
              onChange={e => updateField('supervisorComments', e.target.value)} 
              disabled={readOnly}
              placeholder="Final approval comments..."
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default JobCardBackForm;
