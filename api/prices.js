// api/prices.js
// Serverless function for the prices endpoint

export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;
  const tableId = process.env.AIRTABLE_TABLE_ID;
  
  try {
    // Fetch data from Airtable
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the data and format it like our original API
    const prices = {};
    const lastUpdateTime = new Date().toISOString();
    
    if (data.records && Array.isArray(data.records)) {
      data.records.forEach(record => {
        if (record.fields.Symbol && record.fields.Price !== undefined) {
          prices[record.fields.Symbol] = {
            price: record.fields.Price,
            name: record.fields.Name || '',
            pair: record.fields.PAIR || '',
            lastUpdate: record.fields.Last_Update || lastUpdateTime,
            technicalIndicatorScore: record.fields.TechnicalIndicatorScore,
            timeframeAlignmentScore: record.fields.TimeframeAlignmentScore,
            liquidationDataScore: record.fields.LiquidationDataScore
          };
        }
      });
    }
    
    // Return the formatted data
    return res.status(200).json({
      prices: prices,
      lastUpdate: lastUpdateTime
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Error fetching data from Airtable',
      details: error.message
    });
  }
}
