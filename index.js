// index.js - Alternative approach using a static file
// This file should be placed in the root of your Vercel project

// Export a simple handler function
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Set the content type to JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Return a simple message
  res.status(200).send('console.log("Hello from Vercel!");');
}
