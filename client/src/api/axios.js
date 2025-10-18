const axios = require('axios');

module.exports = axios.create({
  baseURL: 'https://hwaksee.kr', // ✅ 배포용 도메인으로 변경
  // baseURL: 'http://172.30.1.52:5000', // 또는 네트워크 접근 시 'http://localhost:5000'
  headers: {
    'Content-Type': 'application/json'
  }
});
