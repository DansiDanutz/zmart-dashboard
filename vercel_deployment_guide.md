# Vercel Deployment Package for Zmart Trading Bot Synchronization

This package contains all the necessary serverless functions to implement the Zmart Trading Bot synchronization solution on Vercel.

## Files Included

1. `api/status.js` - Endpoint to check server status
2. `api/prices.js` - Endpoint to fetch cryptocurrency prices from Airtable
3. `api/update.js` - Endpoint to manually trigger data updates
4. `api/dashboard-sync.js` - Client-side script for dashboard integration

## Deployment Instructions

### 1. Prepare Your Vercel Project

If you haven't already created a Vercel project:

```bash
# Install Vercel CLI if you don't have it
npm install -g vercel

# Login to Vercel
vercel login

# Initialize a new project in an empty directory
mkdir zmart-sync-server
cd zmart-sync-server
vercel init
```

### 2. Set Up Project Structure

Create the following directory structure:

```
zmart-sync-server/
├── api/
│   ├── status.js
│   ├── prices.js
│   ├── update.js
│   └── dashboard-sync.js
├── package.json
└── vercel.json
```

### 3. Configure Environment Variables

Make sure to set up the following environment variables in your Vercel project:

- `AIRTABLE_API_KEY` - Your Airtable API key
- `AIRTABLE_BASE_ID` - Your Airtable base ID
- `AIRTABLE_TABLE_ID` - Your Airtable table ID for the Coins table
- `UPDATE_INTERVAL` - Interval in milliseconds for automatic updates (e.g., 300000 for 5 minutes)

### 4. Deploy to Vercel

```bash
# Deploy to Vercel
vercel --prod
```

## Usage

Once deployed, you can access the following endpoints:

- `https://your-vercel-domain.vercel.app/api/status` - Check server status
- `https://your-vercel-domain.vercel.app/api/prices` - Get cryptocurrency prices
- `https://your-vercel-domain.vercel.app/api/dashboard-sync.js` - Client-side synchronization script

## Integration with Dashboard

To integrate with the Zmart Trading Bot dashboard:

1. Log in to your dashboard at https://xjjuozap.manus.space/
2. Open your browser's developer console (F12 or right-click and select "Inspect" then "Console")
3. Run the following code:

```javascript
const script = document.createElement('script');
script.src = 'https://your-vercel-domain.vercel.app/api/dashboard-sync.js';
document.head.appendChild(script);
```

This will add a "Sync Prices" button to your dashboard and set up automatic synchronization with Airtable data.

## Permanent Integration

For a permanent solution, you would need to modify the dashboard's HTML to include:

```html
<script src="https://your-vercel-domain.vercel.app/api/dashboard-sync.js"></script>
```

## Troubleshooting

If you encounter issues:

1. Check that all environment variables are correctly set in Vercel
2. Verify that your Airtable API key has access to the specified base and table
3. Check the Vercel deployment logs for any errors
4. Ensure your browser allows loading scripts from your Vercel domain
