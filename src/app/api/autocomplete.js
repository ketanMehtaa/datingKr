// pages/api/autocomplete.js
export default async function handler(req, res) {
    const { input } = req.query; // Extract input from query parameters
    
    if (!input) {
      return res.status(400).json({ error: 'Input parameter is required' });
    }
  
    try {
      const response = await fetch(`https://api.olamaps.io/places/v1/autocomplete?input=${input}&api_key=${process.env.OLA_API_KEY}`, {
        method: 'GET',
        headers: {
          'X-Request-Id': process.env.OLA_CLIENT_ID,
          'Authorization': `Bearer ${process.env.OLA_CLIENT_SECRET}`,
        },
      });
  
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch data from Ola Maps API' });
      }
  
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  