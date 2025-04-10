// api/status.js
// Serverless function for the status endpoint

export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  
  // Get the current time
  const lastUpdate = new Date().toISOString();
  
  // Count records in Airtable
  let recordCount = 0;
  
  try {
    // Fetch data from Airtable to get record count
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      recordCount = data.records ? data.records.length : 0;
    }
    
    // Return status information
    return res.status(200).json({
      status: 'running',
      lastUpdate: lastUpdate,
      recordCount: recordCount
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}
