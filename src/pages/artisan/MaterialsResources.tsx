import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, Trash2, Box, Wrench, Users, DollarSign } from 'lucide-react';
import { useJobCards } from '../../context/JobCardContext';
import styles from '../JobCards.module.css';

const MaterialsResources: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { jobCards, updateJobCard } = useJobCards();

  const job = jobCards.find(j => j.id === id);

  const [orderedSpares, setOrderedSpares] = useState<any[]>([]);
  const [withdrawnSpares, setWithdrawnSpares] = useState<any[]>([]);
  const [resources, setResources] = useState({
    numArtisans: 1,
    numAssistants: 0,
    hoursPerDay: 0,
    delayNotes: ''
  });

  useEffect(() => {
    if (job) {
      setOrderedSpares(job.sparesOrdered || []);
      setWithdrawnSpares(job.sparesWithdrawn || []);
      setResources({
        numArtisans: job.numArtisans || 1,
        numAssistants: job.numAssistants || 0,
        hoursPerDay: 0, // Mock, needs field mapping if exists
        delayNotes: ''
      });
    }
  }, [job]);

  if (!job) return <div>Job not found</div>;

  const isReadOnly = ['Pending_Supervisor', 'Awaiting_SignOff', 'Closed'].includes(job.status);

  // Ordered Spares Actions
  const addOrderedSpare = () => {
    setOrderedSpares([...orderedSpares, { id: Date.now().toString(), description: '', qty: '', prNo: '', date: new Date().toISOString().split('T')[0] }]);
  };
  const updateOrderedSpare = (index: number, field: string, value: string) => {
    const updated = [...orderedSpares];
    updated[index][field] = value;
    setOrderedSpares(updated);
  };
  const removeOrderedSpare = (index: number) => {
    setOrderedSpares(orderedSpares.filter((_, i) => i !== index));
  };

  // Withdrawn Spares Actions
  const addWithdrawnSpare = () => {
    setWithdrawnSpares([...withdrawnSpares, { id: Date.now().toString(), description: '', qty: '', sivNo: '', cost: '', date: new Date().toISOString().split('T')[0] }]);
  };
  const updateWithdrawnSpare = (index: number, field: string, value: string) => {
    const updated = [...withdrawnSpares];
    updated[index][field] = value;
    setWithdrawnSpares(updated);
  };
  const removeWithdrawnSpare = (index: number) => {
    setWithdrawnSpares(withdrawnSpares.filter((_, i) => i !== index));
  };

  const calculateTotalCost = () => {
    return withdrawnSpares.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0).toFixed(2);
  };

  const handleSaveAndContinue = async () => {
    try {
      await updateJobCard(job.id, {
        sparesOrdered: orderedSpares,
        sparesWithdrawn: withdrawnSpares,
        numArtisans: resources.numArtisans,
        numAssistants: resources.numAssistants,
        // Add mapping for hoursPerDay / delayNotes if your context provides it
      });
      navigate(`/artisan/review/${job.id}`);
    } catch (err: any) {
      alert('Failed to save materials');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={`${styles.tableHeader} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/artisan/execute-work/${job.id}`)}
            className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem' }}>Materials & Resources</h1>
            <p className={styles['text-muted']}>{job.ticketNumber} - Record parts used</p>
          </div>
        </div>
        
        {/* Progress Navigation Tracker */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-emerald-400 font-bold text-sm bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">Execution</span>
          <ArrowRight size={16} className="text-emerald-500" />
          <span className="text-blue-400 font-bold text-sm bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">Materials</span>
          <ArrowRight size={16} className="text-slate-500" />
          <span className="text-slate-500 font-medium text-sm">Submit</span>
        </div>
      </header>

      <div className="space-y-8 mb-12">
        
        {/* Withdrawn Spares (From Stores) */}
        <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Box size={20} className="text-amber-400" />
              Spares / Materials Withdrawn
            </h3>
            {!isReadOnly && (
              <button 
                onClick={addWithdrawnSpare}
                className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20 hover:bg-amber-500/20 transition flex items-center gap-2 text-sm"
              >
                <Plus size={16} /> Add Item
              </button>
            )}
          </div>
          
          {withdrawnSpares.length === 0 ? (
            <div className="text-center py-6 text-slate-500 bg-slate-800/20 rounded-xl border border-white/5 border-dashed">
              No materials withdrawn from stores.
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawnSpares.map((spare, index) => (
                <div key={spare.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-800/40 p-4 rounded-xl border border-white/5">
                  <div className="md:col-span-4">
                    <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Description</label>
                    <input 
                      type="text" value={spare.description} onChange={(e) => updateWithdrawnSpare(index, 'description', e.target.value)} readOnly={isReadOnly}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Quantity</label>
                    <input 
                      type="number" value={spare.qty} onChange={(e) => updateWithdrawnSpare(index, 'qty', e.target.value)} readOnly={isReadOnly}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">SIV No.</label>
                    <input 
                      type="text" value={spare.sivNo} onChange={(e) => updateWithdrawnSpare(index, 'sivNo', e.target.value)} readOnly={isReadOnly}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2 block flex items-center justify-between">Cost <DollarSign size={10}/></label>
                    <input 
                      type="number" value={spare.cost} onChange={(e) => updateWithdrawnSpare(index, 'cost', e.target.value)} readOnly={isReadOnly} step="0.01"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-amber-500"
                    />
                  </div>
                  {!isReadOnly && (
                    <div className="md:col-span-2 md:text-right">
                      <button 
                        onClick={() => removeWithdrawnSpare(index)}
                        className="p-3 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition w-full md:w-auto mt-2 md:mt-0"
                      >
                        <Trash2 size={18} className="mx-auto" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex justify-end p-4 border-t border-white/10">
                <p className="text-white text-lg font-bold">Total Cost: <span className="text-amber-400">${calculateTotalCost()}</span></p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ordered Spares (External) */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-white text-lg font-bold flex items-center gap-2">
                <Wrench size={20} className="text-pink-400" />
                Spares Ordered
              </h3>
              {!isReadOnly && (
                <button 
                  onClick={addOrderedSpare}
                  className="px-4 py-2 rounded-xl bg-pink-500/10 text-pink-400 font-bold border border-pink-500/20 hover:bg-pink-500/20 transition flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add 
                </button>
              )}
            </div>
            
            {orderedSpares.length === 0 ? (
              <div className="text-center py-6 text-slate-500 bg-slate-800/20 rounded-xl border border-white/5 border-dashed">
                No external materials ordered.
              </div>
            ) : (
              <div className="space-y-4">
                {orderedSpares.map((spare, index) => (
                  <div key={spare.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-800/40 p-4 rounded-xl border border-white/5">
                    <div className="md:col-span-4">
                      <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Description</label>
                      <input 
                        type="text" value={spare.description} onChange={(e) => updateOrderedSpare(index, 'description', e.target.value)} readOnly={isReadOnly}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Quantity</label>
                      <input 
                        type="number" value={spare.qty} onChange={(e) => updateOrderedSpare(index, 'qty', e.target.value)} readOnly={isReadOnly}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">PR No.</label>
                      <input 
                        type="text" value={spare.prNo} onChange={(e) => updateOrderedSpare(index, 'prNo', e.target.value)} readOnly={isReadOnly}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-white text-sm outline-none focus:border-pink-500"
                      />
                    </div>
                    {!isReadOnly && (
                      <div className="md:col-span-2 md:text-right">
                        <button 
                          onClick={() => removeOrderedSpare(index)}
                          className="p-2.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition w-full md:w-auto mt-2 md:mt-0"
                        >
                          <Trash2 size={16} className="mx-auto" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Labour / Resources */}
          <div className="glass-panel p-6 border border-white/10 rounded-2xl bg-slate-900/80">
            <h3 className="text-white text-lg font-bold flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
              <Users size={20} className="text-purple-400" />
              Labour Resources
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">No. Artisans</label>
                <input 
                  type="number" value={resources.numArtisans} onChange={(e) => setResources({...resources, numArtisans: parseInt(e.target.value) || 0})} readOnly={isReadOnly}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500 w-full transition shadow-inner"
                />
              </div>
              <div>
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">No. Assistants</label>
                <input 
                  type="number" value={resources.numAssistants} onChange={(e) => setResources({...resources, numAssistants: parseInt(e.target.value) || 0})} readOnly={isReadOnly}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500 w-full transition shadow-inner"
                />
              </div>
              <div className="col-span-2">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Hours Per Day (Est)</label>
                <input 
                  type="number" value={resources.hoursPerDay} onChange={(e) => setResources({...resources, hoursPerDay: parseInt(e.target.value) || 0})} readOnly={isReadOnly}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500 w-full transition shadow-inner"
                />
              </div>
              <div className="col-span-2">
                <label className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-2">Delay Notes</label>
                <textarea 
                  value={resources.delayNotes} onChange={(e) => setResources({...resources, delayNotes: e.target.value})} readOnly={isReadOnly} rows={2}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-purple-500 w-full transition shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {!isReadOnly && (
        <>
          <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] p-4 lg:p-6 bg-slate-900/95 backdrop-blur-md border-t border-white/10 flex justify-end gap-4 z-50">
            <button 
              onClick={() => handleSaveAndContinue()}
              className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition transform hover:-translate-y-1"
            >
              Review & Submit <ArrowRight size={20} />
            </button>
          </div>
          <div className="h-24"></div>
        </>
      )}

      {isReadOnly && (
         <>
         <div className="fixed bottom-0 left-0 right-0 lg:left-[280px] p-4 lg:p-6 bg-slate-900/95 backdrop-blur-md border-t border-white/10 flex justify-end gap-4 z-50">
           <button 
             onClick={() => navigate(`/artisan/review/${job.id}`)}
             className="px-8 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center gap-2 shadow-lg transition"
           >
             View Submission Summary <ArrowRight size={20} />
           </button>
         </div>
         <div className="h-24"></div>
       </>
      )}

    </div>
  );
};

export default MaterialsResources;
