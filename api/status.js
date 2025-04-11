// api/status.js - Updated with proper Airtable PAT handling
// Serverless function to check server status

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  
  try {
    let recordCount = 0;
    
    // Only fetch from Airtable if all environment variables are set
    if (baseId && apiKey && tableId) {
      // Format the API key correctly for Airtable PAT
      const authHeader = apiKey.startsWith('pat') 
        ? `Bearer ${apiKey}` 
        : `Bearer ${apiKey}`; // Always use Bearer for modern Airtable auth
      
      // Fetch data from Airtable to check connection
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}?maxRecords=1`, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        recordCount = data.records ? data.records.length : 0;
      } else {
        console.error(`Airtable API error: ${response.status}`);
        console.error(`Response: ${await response.text()}`);
      }
    }
    
    // Return server status
    return res.status(200).json({
      status: 'running',
      lastUpdate: new Date().toISOString(),
      recordCount
    });
  } catch (error) {
    console.error('Error in status API:', error);
    
    // Even if there's an error, we still return a 200 status
    // but include the error information
    return res.status(200).json({
      status: 'running',
      lastUpdate: new Date().toISOString(),
      recordCount: 0,
      error: error.message
    });
  }
}
