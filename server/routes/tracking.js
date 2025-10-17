const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/tracking', async (req, res) => {
  const { code, invoice } = req.query;
  const apiKey = process.env.SWEETTRACKER_API_KEY;

  try {
    const response = await axios.get('https://info.sweettracker.co.kr/api/v1/trackingInfo', {
      params: {
        t_key: apiKey,
        t_code: code,
        t_invoice: invoice
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: '배송 추적 실패', error: err.message });
  }
});

module.exports = router;