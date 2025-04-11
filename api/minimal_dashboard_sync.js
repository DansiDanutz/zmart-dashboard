// api/dashboard-sync.js - Extremely simplified version
// This is a minimal version that just returns a basic script to test if the endpoint works

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
  
  // The simplest possible client script
  const clientScript = `
/**
 * Minimal Zmart Trading Bot Dashboard Synchronization Client Script
 */

(function() {
  console.log("Minimal dashboard sync script loaded successfully");
  
  // Add a small indicator to show the script is active
  const indicator = document.createElement('div');
  indicator.style.position = 'fixed';
  indicator.style.bottom = '10px';
  indicator.style.right = '10px';
  indicator.style.backgroundColor = '#4CAF50';
  indicator.style.color = 'white';
  indicator.style.padding = '5px 10px';
  indicator.style.borderRadius = '5px';
  indicator.style.fontSize = '12px';
  indicator.style.opacity = '0.7';
  indicator.textContent = 'Sync Script Loaded';
  document.body.appendChild(indicator);
})();
  `;
  
  // Send the client script
  res.status(200).send(clientScript);
}
