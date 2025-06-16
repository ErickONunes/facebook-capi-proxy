
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/event', async (req, res) => {
  try {
    const receivedData = req.body;
    const access_token = process.env.ACCESS_TOKEN;
    const pixel_id = process.env.PIXEL_ID;

    if (!access_token || !pixel_id) {
      return res.status(500).json({ error: 'ACCESS_TOKEN ou PIXEL_ID não configurado no .env' });
    }

    let events = [];

    if (Array.isArray(receivedData.data)) {
      events = receivedData.data;
    } else {
      events = [receivedData];
    }

    const preparedEvents = events.map(event => {
      return {
        event_name: event.event_name,
        event_time: event.event_time || Math.floor(Date.now() / 1000),
        user_data: event.user_data,
        test_event_code: event.test_event_code || undefined
      };
    });

    const payload = {
      data: preparedEvents
    };

    const fbResponse = await axios.post(
      `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${access_token}`,
      payload
    );

    res.status(200).json(fbResponse.data);
  } catch (error) {
    console.error('Facebook API Error:', error.response ? error.response.data : error.message);
    res.status(500).json(error.response ? error.response.data : { error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Facebook CAPI Proxy running on port ${PORT}`);
});
