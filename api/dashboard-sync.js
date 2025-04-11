/**
 * Zmart Trading Bot Dashboard Synchronization Client Script
 * 
 * This script synchronizes the dashboard with Airtable data by:
 * 1. Fetching the latest prices from the server
 * 2. Updating the dashboard with the correct prices
 * 3. Adding a "Sync Prices" button
 * 4. Intercepting the "Update Data" and "Update All Tables" buttons
 * 5. Setting up automatic updates
 */

(function() {
  console.log("Initializing dashboard synchronization...");
  
  // Configuration
  const SERVER_URL = '__SERVER_URL__';
  const UPDATE_INTERVAL = __UPDATE_INTERVAL__;
  
  // Function to update the dashboard with the correct prices
  function updateDashboardPrices() {
    console.log("Updating dashboard with correct Airtable prices...");
    
    // Show loading indicator
    const loadingIndicator = showLoadingIndicator();
    
    // Fetch data from the server
    fetch(`${SERVER_URL}/api/prices`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`Successfully fetched prices from server, last updated: ${data.lastUpdate}`);
        
        // Process the data
        const prices = data.prices;
        
        // Update the dashboard with the correct prices
        const tableRows = document.querySelectorAll('tr');
        if (tableRows.length <= 1) {
          console.log("No table rows found to update");
          hideLoadingIndicator(loadingIndicator);
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
                console.log(`Updating ${symbol} price from ${currentPrice} to ${airtablePrice}`);
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
        
        // Hide loading indicator
        hideLoadingIndicator(loadingIndicator);
        
        console.log(`Updated ${updatedCount} prices on the dashboard`);
        
        // Add a notification to show the update was successful
        if (updatedCount > 0) {
          showNotification(`Successfully updated ${updatedCount} prices to match Airtable data`, 'success');
        } else {
          showNotification('Prices are already up to date with Airtable', 'info');
        }
      })
      .catch(error => {
        console.error("Error fetching data from server:", error);
        hideLoadingIndicator(loadingIndicator);
        
        // Show error notification
        showNotification(`Error updating prices: ${error.message}`, 'error');
      });
  }
  
  // Function to trigger a manual update from the server
  function triggerServerUpdate() {
    console.log("Triggering server update...");
    
    // Show loading indicator
    const loadingIndicator = showLoadingIndicator();
    
    // Send request to the server
    fetch(`${SERVER_URL}/api/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log(`Server update ${data.success ? 'successful' : 'failed'}: ${data.message}`);
        hideLoadingIndicator(loadingIndicator);
        
        if (data.success) {
          // Update the dashboard with the new prices
          updateDashboardPrices();
        } else {
          showNotification(`Server update failed: ${data.message}`, 'error');
        }
      })
      .catch(error => {
        console.error("Error triggering server update:", error);
        hideLoadingIndicator(loadingIndicator);
        
        // Show error notification
        showNotification(`Error updating server: ${error.message}`, 'error');
      });
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
      
      button.onclick = function(event) {
        console.log("Update Data button clicked - intercepting...");
        
        // Call the original handler if it exists
        if (typeof originalOnClick === 'function') {
          originalOnClick.call(this, event);
        }
        
        // Wait a moment for the original handler to complete
        setTimeout(() => {
          // Update the dashboard with the correct prices
          updateDashboardPrices();
        }, 1000);
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
      
      updateAllTablesButton.onclick = function(event) {
        console.log("Update All Tables button clicked - intercepting...");
        
        // Call the original handler if it exists
        if (typeof originalOnClick === 'function') {
          originalOnClick.call(this, event);
        }
        
        // Wait a moment for the original handler to complete
        setTimeout(() => {
          // Update the dashboard with the correct prices
          updateDashboardPrices();
        }, 1000);
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
        existingSyncButton.onclick = triggerServerUpdate;
        return;
      }
      
      // Create the new button
      const syncButton = document.createElement('button');
      syncButton.textContent = 'Sync Prices';
      syncButton.className = updateDataButton.className; // Use same styling
      syncButton.style.backgroundColor = '#4CAF50'; // Green background
      syncButton.style.marginLeft = '10px';
      
      // Add click handler
      syncButton.onclick = triggerServerUpdate;
      
      // Insert the button next to the Update Data button
      updateDataButton.parentNode.insertBefore(syncButton, updateDataButton.nextSibling);
      console.log("Sync Prices button added successfully");
    }
  }
  
  // Function to show a loading indicator
  function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.padding = '20px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.zIndex = '1000';
    loadingIndicator.textContent = 'Updating prices...';
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
  }
  
  // Function to hide the loading indicator
  function hideLoadingIndicator(loadingIndicator) {
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
  }
  
  // Function to show a notification
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.textContent = message;
    
    // Set color based on type
    switch (type) {
      case 'success':
        notification.style.backgroundColor = '#4CAF50';
        notification.style.color = 'white';
        break;
      case 'error':
        notification.style.backgroundColor = '#f44336';
        notification.style.color = 'white';
        break;
      case 'warning':
        notification.style.backgroundColor = '#ff9800';
        notification.style.color = 'white';
        break;
      case 'info':
      default:
        notification.style.backgroundColor = '#2196F3';
        notification.style.color = 'white';
        break;
    }
    
    document.body.appendChild(notification);
    
    // Remove the notification after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
    
    return notification;
  }
  
  // Function to set up automatic updates
  function setupAutomaticUpdates() {
    console.log(`Setting up automatic updates every ${UPDATE_INTERVAL / 1000} seconds`);
    
    // Set up interval for automatic updates
    setInterval(() => {
      console.log("Running automatic update...");
      updateDashboardPrices();
    }, UPDATE_INTERVAL);
  }
  
  // Main initialization function
  function initialize() {
    console.log("Initializing dashboard synchronization...");
    
    // Set up the interceptors for the update buttons
    interceptUpdateData();
    interceptUpdateAllTables();
    
    // Add the sync button
    addSyncPricesButton();
    
    // Set up automatic updates
    setupAutomaticUpdates();
    
    // Perform initial update
    updateDashboardPrices();
    
    console.log("Dashboard synchronization initialized successfully");
    
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
    indicator.textContent = 'Price Sync Active';
    document.body.appendChild(indicator);
  }
  
  // Start the initialization when the page is fully loaded
  if (document.readyState === 'complete') {
    initialize();
  } else {
    window.addEventListener('load', initialize);
  }
})();
