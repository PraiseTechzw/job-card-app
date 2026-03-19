import axios from 'axios';
(async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/job-cards', {
      requestedBy: 'Test',
      dateRaised: '2026-03-19',
      timeRaised: '12:00',
      priority: 'High',
      plantDescription: 'Test Machine',
      defect: 'Test Defect',
      allocatedTrades: ['Fitting'],
      status: 'Pending_Supervisor',
      approvedBySupervisor: '123'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
})();
