const express = require('express');
const axios = require('axios');
const cors = require('cors'); // ← Ajoute cette ligne
const app = express();
const PORT = 4000;

app.use(cors()); // ← Ajoute cette ligne pour autoriser toutes les origines

app.get('/contacts', async (req, res) => {
  try {
    const response = await axios.get('https://api.pepsup.com/api/v1/contacts', {
      headers: {
        'HFAPIKEY': '0IOiLeibD6sF6sJtr17oB8VUKBG6NZ2U',
        'APISECRET': 'odakfDvfUMOKpJAe92u76fqCWHtPvPlo'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => console.log(`Proxy API running on http://localhost:${PORT}`));
