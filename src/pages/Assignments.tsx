import React, { useState } from 'react';
import { useJobCards } from '../context/JobCardContext';
import { useAuth } from '../context/AuthContext';
import { Search, UserPlus } from 'lucide-react';
import styles from './JobCards.module.css';

const Assignments: React.FC = () => {
  const { jobCards, addAssignment, updateJobCard, addAuditLog } = useJobCards();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [assignmentData, setAssignmentData] = useState({
    artisanName: '',
    section: '',
    expectedStartDate: '',
    expectedCompletionDate: '',
    notes: ''
  });

  const registeredCards = jobCards.filter(card => 
    card.status === 'Registered' &&
    (card.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.plantDescription.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    try {
      await addAssignment({
        jobCardId: selectedCard,
        assignedBy: user?.name || 'Unknown',
        assignedDate: new Date().toISOString().split('T')[0],
        ...assignmentData,
        status: 'Assigned'
      });

      await updateJobCard(selectedCard, { status: 'Assigned', issuedTo: assignmentData.artisanName });
      
      await addAuditLog({
        jobCardId: selectedCard,
        action: 'Job Assigned',
        performedBy: user?.name || 'Unknown',
        details: `Job assigned to ${assignmentData.artisanName}`
      });

      setSelectedCard(null);
      setAssignmentData({
        artisanName: '',
        section: '',
        expectedStartDate: '',
        expectedCompletionDate: '',
        notes: ''
      });
      alert('Job successfully assigned.');
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Job Assignment</h1>
          <p className={styles.subtitle}>Assign registered job cards to technicians/artisans</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Registered Jobs Queue */}
        <div className="lg:col-span-2">
          <div className={styles.filtersGlass}>
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search registered jobs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Job Card #</th>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredCards.map(card => (
                  <tr key={card.id} className={selectedCard === card.id ? 'bg-blue-600/10' : ''}>
                    <td className={styles.ticketNo}>{card.ticketNumber}</td>
                    <td>{card.plantDescription}</td>
                    <td>
                      <span className={`badge badge-${card.priority.toLowerCase()}`}>
                        {card.priority}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedCard(card.id)}
                        className={`btn btn-sm ${selectedCard === card.id ? 'btn-primary' : 'btn-ghost'}`}
                      >
                        <UserPlus size={14} /> {selectedCard === card.id ? 'Selected' : 'Select to Assign'}
                      </button>
                    </td>
                  </tr>
                ))}
                {registeredCards.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-slate-500 italic">No registered jobs waiting for assignment.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Assignment Form */}
        <div>
          <div className="glass-panel p-6 sticky top-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <UserPlus size={20} className="text-blue-400" />
              Assignment Details
            </h2>
            
            {!selectedCard ? (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-white/10 rounded-xl">
                Select a job from the queue to start assignment.
              </div>
            ) : (
              <form onSubmit={handleAssign} className="space-y-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 mb-4">
                  <div className="text-xs text-slate-400 uppercase font-bold mb-1">Target Job</div>
                  <div className="font-bold text-white">
                    {jobCards.find(c => c.id === selectedCard)?.ticketNumber} - {jobCards.find(c => c.id === selectedCard)?.plantDescription}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Artisan / Technician Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white"
                    placeholder="Enter name"
                    value={assignmentData.artisanName}
                    onChange={e => setAssignmentData({...assignmentData, artisanName: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Section / Trade</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white"
                    placeholder="e.g. Fitting, Electrical"
                    value={assignmentData.section}
                    onChange={e => setAssignmentData({...assignmentData, section: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Exp. Start</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm"
                      value={assignmentData.expectedStartDate}
                      onChange={e => setAssignmentData({...assignmentData, expectedStartDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Exp. Finish</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white text-sm"
                      value={assignmentData.expectedCompletionDate}
                      onChange={e => setAssignmentData({...assignmentData, expectedCompletionDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-300">Assignment Notes</label>
                  <textarea 
                    className="w-full bg-slate-900/50 border border-white/10 rounded-lg p-2.5 text-white min-h-[100px]"
                    placeholder="Any specific instructions..."
                    value={assignmentData.notes}
                    onChange={e => setAssignmentData({...assignmentData, notes: e.target.value})}
                  />
                </div>

                <button type="submit" className="w-full btn btn-primary py-3 flex items-center justify-center gap-2">
                  <UserPlus size={18} /> Confirm Assignment
                </button>
                <button type="button" onClick={() => setSelectedCard(null)} className="w-full btn btn-ghost">
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
