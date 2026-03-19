import axios from 'axios';
(async () => {
  try {
    const res = await axios.post('http://localhost:3001/api/job-cards', {
      requestedBy: 'Test2',
      dateRaised: '2026-03-19',
      timeRaised: '12:00',
      priority: 'High',
      plantDescription: 'Test Machine2',
      defect: 'Test Defect2',
      allocatedTrades: ['Fitting'],
      status: 'Pending_Supervisor',
      workDoneDetails: 'Fixed something'
    });
    console.log('Success:', res.data);
  } catch (err) {
    if (err.response) console.log('Response Error:', err.response.data);
    else console.log('Fetch Error:', err);
  }
})();
