// dashboard-sync.js - Ultra-minimal CommonJS version
// This file uses the absolute minimum code needed to work

// Use CommonJS module.exports
module.exports = function(req, res) {
  // Set content type
  res.setHeader('Content-Type', 'application/javascript');
  
  // Return a simple script
  res.status(200).send('console.log("Hello from dashboard-sync.js");');
};
