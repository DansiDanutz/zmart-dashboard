// Permanent Dashboard Update Solution
// This script ensures the Zmart Trading Bot dashboard displays exactly the same prices as in Airtable
// without the 8.04% markup, and persists between sessions

// Configuration
const AIRTABLE_API_KEY = "pat8ePqoLIHnQw3GM.e1f4727198651deaaa365863a339c99205da1664746f9be7577f776624b0e6f6";
const AIRTABLE_BASE_ID = "appAs9sZH7OmtYaTJ";
const AIRTABLE_TABLE_ID = "tblDdZFPDFir3KLb9";
const UPDATE_INTERVAL = 300000; // 5 minutes

// Create a server-side integration script that will run on the website server
// This is a Node.js script that should be deployed to the server hosting the website

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Store the latest cryptocurrency prices
let latestPrices = {};

// Function to fetch data from Airtable
async function fetchAirtableData() {
  try {
    console.log('Fetching data from Airtable...');
    const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.records) {
      console.log(`Successfully fetched ${response.data.records.length} records from Airtable`);
      
      // Process the data and store it
      const newPrices = {};
      response.data.records.forEach(record => {
        if (record.fields.Symbol && record.fields.Price !== undefined) {
          newPrices[record.fields.Symbol] = {
            price: record.fields.Price,
            name: record.fields.Name || '',
            pair: record.fields.PAIR || '',
            lastUpdate: record.fields.Last_Update || new Date().toISOString()
          };
        }
      });
      
      // Update the latest prices
      latestPrices = newPrices;
      
      // Save to a JSON file as backup
      fs.writeFileSync(
        path.join(__dirname, 'latest_prices.json'),
        JSON.stringify(latestPrices, null, 2)
      );
      
      console.log('Prices updated and saved to file');
      return true;
    } else {
      console.error('Invalid response from Airtable');
      return false;
    }
  } catch (error) {
    console.error('Error fetching data from Airtable:', error.message);
    return false;
  }
}

// API endpoint to get the latest prices
app.get('/api/prices', (req, res) => {
  res.json(latestPrices);
});

// API endpoint to trigger a manual update
app.post('/api/update', async (req, res) => {
  const success = await fetchAirtableData();
  res.json({ success, message: success ? 'Prices updated successfully' : 'Failed to update prices' });
});

// Serve the client-side script
app.get('/dashboard-sync.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`
    // Dashboard Synchronization Script
    // This script ensures the dashboard displays exactly the same prices as in Airtable
    
    (function() {
      console.log("Initializing permanent dashboard synchronization...");
      
      // Configuration
      const API_ENDPOINT = window.location.origin + '/api/prices';
      const UPDATE_ENDPOINT = window.location.origin + '/api/update';
      const UPDATE_INTERVAL = ${UPDATE_INTERVAL}; // 5 minutes
      
      // Function to update the dashboard with the latest prices
      function updateDashboardPrices(prices) {
        console.log("Updating dashboard with latest prices...");
        
        // Get all rows in the table
        const tableRows = document.querySelectorAll('tr');
        if (tableRows.length <= 1) {
          console.log("No table rows found to update");
          return;
        }
        
        // Update each row with the corresponding price
        let updatedCount = 0;
        
        // Skip header row
        for (let i = 1; i < tableRows.length; i++) {
          const row = tableRows[i];
          const cells = row.querySelectorAll('td');
          
          if (cells.length >= 3) { // Ensure we have enough cells
            const symbolCell = cells[0];
            const priceCell = cells[2]; // Price is the 3rd column (index 2)
            
            const symbol = symbolCell.textContent.trim();
            if (prices[symbol] && prices[symbol].price !== undefined) {
              const airtablePrice = prices[symbol].price;
              const currentPrice = parseFloat(priceCell.textContent.replace(/,/g, ''));
              
              // Only update if the price is different
              if (Math.abs(currentPrice - airtablePrice) > 0.001) {
                console.log(\`Updating \${symbol} price from \${currentPrice} to \${airtablePrice}\`);
                priceCell.textContent = airtablePrice.toString();
                
                // Add visual feedback for the update
                priceCell.style.backgroundColor = "#e6ffe6"; // Light green
                setTimeout(() => {
                  priceCell.style.backgroundColor = "";
                }, 2000);
                
                updatedCount++;
              }
            }
          }
        }
        
        console.log(\`Updated \${updatedCount} prices on the dashboard\`);
        
        // Update the "Last updated" text
        const lastUpdatedElement = document.querySelector('.last-updated');
        if (lastUpdatedElement) {
          const now = new Date();
          lastUpdatedElement.textContent = \`Last updated: \${now.toLocaleDateString()}, \${now.toLocaleTimeString()}\`;
        } else {
          // If there's no last-updated element, update the text that shows the last update time
          const lastUpdatedText = document.querySelector('div:contains("Last updated:")');
          if (lastUpdatedText) {
            const now = new Date();
            lastUpdatedText.textContent = \`Last updated: \${now.toLocaleDateString()}, \${now.toLocaleTimeString()}\`;
          }
        }
      }
      
      // Function to fetch the latest prices from the API
      async function fetchLatestPrices() {
        try {
          console.log("Fetching latest prices from API...");
          const response = await fetch(API_ENDPOINT);
          if (!response.ok) {
            throw new Error(\`API error: \${response.status}\`);
          }
          
          const prices = await response.json();
          console.log("Successfully fetched latest prices");
          return prices;
        } catch (error) {
          console.error("Error fetching latest prices:", error);
          return null;
        }
      }
      
      // Function to trigger a manual update
      async function triggerManualUpdate() {
        try {
          console.log("Triggering manual update...");
          const response = await fetch(UPDATE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(\`API error: \${response.status}\`);
          }
          
          const result = await response.json();
          console.log("Manual update result:", result);
          
          if (result.success) {
            // Fetch the updated prices and update the dashboard
            const prices = await fetchLatestPrices();
            if (prices) {
              updateDashboardPrices(prices);
            }
          }
          
          return result.success;
        } catch (error) {
          console.error("Error triggering manual update:", error);
          return false;
        }
      }
      
      // Function to intercept the "Update Data" button click
      function interceptUpdateData() {
        console.log("Setting up Update Data button interception...");
        
        // Find all update buttons
        const updateButtons = Array.from(document.querySelectorAll('button')).filter(
          button => button.textContent.includes('Update Data')
        );
        
        updateButtons.forEach(button => {
          console.log("Found Update Data button:", button);
          
          // Create a new click handler that wraps the original
          const originalOnClick = button.onclick;
          
          button.onclick = async function(event) {
            console.log("Update Data button clicked - intercepting...");
            
            // Trigger a manual update
            await triggerManualUpdate();
            
            // Call the original handler if it exists
            if (typeof originalOnClick === 'function') {
              originalOnClick.call(this, event);
            }
          };
        });
      }
      
      // Function to intercept the "Update All Tables" button click
      function interceptUpdateAllTables() {
        console.log("Setting up Update All Tables button interception...");
        
        // Find the Update All Tables button
        const updateAllTablesButton = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent.includes('Update All Tables')
        );
        
        if (updateAllTablesButton) {
          console.log("Found Update All Tables button:", updateAllTablesButton);
          
          // Create a new click handler that wraps the original
          const originalOnClick = updateAllTablesButton.onclick;
          
          updateAllTablesButton.onclick = async function(event) {
            console.log("Update All Tables button clicked - intercepting...");
            
            // Trigger a manual update
            await triggerManualUpdate();
            
            // Call the original handler if it exists
            if (typeof originalOnClick === 'function') {
              originalOnClick.call(this, event);
            }
          };
        }
      }
      
      // Function to add a "Sync Prices" button
      function addSyncPricesButton() {
        console.log("Adding Sync Prices button...");
        
        // Find the container where the Update Data button is
        const updateDataButton = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent.includes('Update Data')
        );
        
        if (updateDataButton && updateDataButton.parentNode) {
          console.log("Found Update Data button parent:", updateDataButton.parentNode);
          
          // Check if the Sync Prices button already exists
          const existingSyncButton = Array.from(document.querySelectorAll('button')).find(
            button => button.textContent.includes('Sync Prices')
          );
          
          if (existingSyncButton) {
            console.log("Sync Prices button already exists, updating click handler");
            existingSyncButton.onclick = triggerManualUpdate;
            return;
          }
          
          // Create the new button
          const syncButton = document.createElement('button');
          syncButton.textContent = 'Sync Prices';
          syncButton.className = updateDataButton.className; // Use same styling
          syncButton.style.backgroundColor = '#4CAF50'; // Green background
          syncButton.style.marginLeft = '10px';
          
          // Add click handler
          syncButton.onclick = triggerManualUpdate;
          
          // Insert the button next to the Update Data button
          updateDataButton.parentNode.insertBefore(syncButton, updateDataButton.nextSibling);
          console.log("Sync Prices button added successfully");
        }
      }
      
      // Function to set up automatic synchronization
      function setupAutoSync() {
        console.log("Setting up automatic synchronization...");
        
        // Perform initial sync
        fetchLatestPrices().then(prices => {
          if (prices) {
            updateDashboardPrices(prices);
          }
        });
        
        // Set up interval for regular syncing
        setInterval(async () => {
          console.log("Auto-sync triggered");
          const prices = await fetchLatestPrices();
          if (prices) {
            updateDashboardPrices(prices);
          }
        }, UPDATE_INTERVAL);
      }
      
      // Main initialization function
      function initialize() {
        console.log("Initializing permanent dashboard synchronization...");
        
        // Set up the interceptors for the update buttons
        interceptUpdateData();
        interceptUpdateAllTables();
        
        // Add the direct sync button
        addSyncPricesButton();
        
        // Set up automatic synchronization
        setupAutoSync();
        
        console.log("Permanent dashboard synchronization initialized successfully");
      }
      
      // Start the initialization when the page is fully loaded
      if (document.readyState === 'complete') {
        initialize();
      } else {
        window.addEventListener('load', initialize);
      }
    })();
  `);
});

// Initialize by fetching data from Airtable
fetchAirtableData();

// Set up automatic updates
setInterval(fetchAirtableData, UPDATE_INTERVAL);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
