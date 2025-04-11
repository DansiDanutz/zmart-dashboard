// api/update.js - Updated with proper Airtable PAT handling
// Serverless function to manually trigger an update from Airtable

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use POST to trigger updates.' 
    });
  }
  
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  
  // Validate environment variables
  if (!baseId || !apiKey || !tableId) {
    return res.status(500).json({
      success: false,
      message: 'Server configuration error: Missing required environment variables'
    });
  }
  
  try {
    // Format the API key correctly for Airtable PAT
    const authHeader = apiKey.startsWith('pat') 
      ? `Bearer ${apiKey}` 
      : `Bearer ${apiKey}`; // Always use Bearer for modern Airtable auth
    
    // Fetch fresh data from Airtable
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
        success: false,
        message: `Airtable API error: ${response.status}`,
        authType: authHeader.split(' ')[0] // Log auth type for debugging (Bearer)
      });
    }
    
    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Successfully fetched latest data from Airtable',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in update API:', error);
    
    return res.status(500).json({
      success: false,
      message: `Error updating data: ${error.message}`
    });
  }
}
