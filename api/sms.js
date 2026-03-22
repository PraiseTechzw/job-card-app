// Using native Node 18+ fetch

export const sendSms = async (phoneNumber, message) => {
  const token = process.env.SMSPOP_API_TOKEN;
  const senderId = process.env.SMSPOP_SENDER_ID;
  
  if (!token) {
    console.warn('SMSPOP_API_TOKEN is not defined in env. Skipping SMS send.');
    return false;
  }
  
  if (!senderId) {
    console.warn('SMSPOP_SENDER_ID is not defined in env. Using default SMSPoe.');
  }

  if (!phoneNumber) {
    console.warn('No phone number provided. Skipping SMS send.');
    return false;
  }

  // Clean phone number (removing any prefixes or adding country code if standard in Zimbabwe 263)
  let cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
  if (cleanNumber.startsWith('0')) {
    cleanNumber = '263' + cleanNumber.substring(1);
  }

  try {
    const campaignData = {
      name: `JobCard_Alert_${new Date().getTime()}`,
      message: message,
      sender_id: senderId || 'SMSPoe',
      contact_import_method: 'manual',
      manual_contacts: cleanNumber,
    };

    const response = await fetch('https://smspop.co.zw/api/campaigns', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(campaignData)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[SMSPop] Gateway explicitly rejected request: ${response.status} ${response.statusText} -> ${errorText}`);
        return false;
    }

    const rawText = await response.text();
    try {
        const result = JSON.parse(rawText);
        console.log('[SMSPop] Send Result:', result);
        return result.success !== false;
    } catch (parseErr) {
        console.error('[SMSPop] API returned invalid JSON (possibly an HTML maintenance page). Raw:', rawText.substring(0, 150));
        return false;
    }
  } catch (err) {
    console.error('[SMSPop] Failed to send SMS:', err);
    return false;
  }
};
