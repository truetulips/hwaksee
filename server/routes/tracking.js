const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { code, invoice } = req.query;
  const apiKey = process.env.SWEETTRACKER_API_KEY;

  console.log('📦 배송 추적 요청 수신:', req.query);

  try {
    const response = await axios.get('https://info.sweettracker.co.kr/api/v1/trackingInfo', {
      params: {
        t_key: apiKey,
        t_code: code,
        t_invoice: invoice
      }
    });

    console.log('✅ 배송 추적 응답 수신:', response.data);

    res.json(response.data);
  } catch (err) {
    console.error('❌ 배송 추적 API 오류:', err.message);
    res.status(500).json({ message: '배송 추적 실패', error: err.message });
  }
});

module.exports = router;