// api/prices.js - Updated with proper Airtable PAT handling
// Serverless function to fetch cryptocurrency prices from Airtable

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed', 
      details: 'Only GET requests are allowed for this endpoint' 
    });
  }
  
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  
  // Validate environment variables
  if (!baseId || !apiKey || !tableId) {
    return res.status(500).json({
      error: 'Server configuration error',
      details: 'Missing required environment variables'
    });
  }
  
  try {
    console.log(`Fetching data from Airtable base: ${baseId}, table: ${tableId}`);
    
    // Format the API key correctly for Airtable PAT
    // If it already starts with 'pat', we need to use Bearer auth
    const authHeader = apiKey.startsWith('pat') 
      ? `Bearer ${apiKey}` 
      : `Bearer ${apiKey}`; // Always use Bearer for modern Airtable auth
    
    // Fetch data from Airtable
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`Airtable API error: ${response.status}`);
      console.error(`Response: ${await response.text()}`);
      
      return res.status(response.status).json({
        error: 'Error fetching data from Airtable',
        details: `Airtable API error: ${response.status}`,
        authType: authHeader.split(' ')[0] // Log auth type for debugging (Bearer)
      });
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.records ? data.records.length : 0} records from Airtable`);
    
    // Process the data
    const prices = {};
    const lastUpdateTime = new Date().toISOString();
    
    if (data.records && Array.isArray(data.records)) {
      data.records.forEach(record => {
        if (record.fields.Symbol && record.fields.Price !== undefined) {
          prices[record.fields.Symbol] = {
            price: record.fields.Price,
            name: record.fields.Name || '',
            pair: record.fields.PAIR || '',
            lastUpdate: record.fields.Last_Update || lastUpdateTime
          };
        }
      });
    }
    
    // Return the processed data
    return res.status(200).json({
      prices,
      lastUpdate: lastUpdateTime,
      recordCount: Object.keys(prices).length
    });
  } catch (error) {
    console.error('Error in prices API:', error);
    
    return res.status(500).json({
      error: 'Error fetching data from Airtable',
      details: error.message
    });
  }
}
