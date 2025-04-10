# Vercel Environment Variables Configuration Guide

## Required Environment Variables

For the Zmart Trading Bot synchronization solution to work properly on Vercel, the following environment variables must be configured:

1. `AIRTABLE_API_KEY` - Your Airtable API key (pat8ePqoLIHnQw3GM.e1f4727198651deaaa365863a339c99205da1664746f9be7577f776624b0e6f6)
2. `AIRTABLE_BASE_ID` - Your Airtable base ID (appAs9sZH7OmtYaTJ)
3. `AIRTABLE_TABLE_ID` - Your Airtable table ID for the Coins table (tblDdZFPDFir3KLb9)
4. `UPDATE_INTERVAL` - Interval in milliseconds for automatic updates (300000 for 5 minutes)

## How to Configure Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project (zmart-sync-server)
3. Click on the "Settings" tab
4. Select "Environment Variables" from the left sidebar
5. Add each of the required variables with their corresponding values
6. Make sure to select all deployment environments (Production, Preview, Development)
7. Click "Save" to apply the changes

## Verification

After configuring the environment variables, you should redeploy your project to ensure the changes take effect. You can verify the configuration by:

1. Accessing the `/api/status` endpoint, which should return a JSON response with the server status
2. Checking the logs in the Vercel dashboard for any environment variable related errors

## Security Considerations

- Keep your Airtable API key secure and never expose it in client-side code
- Consider using Vercel's integration with environment variable management tools for production deployments
- Regularly rotate your API keys as part of your security practices
