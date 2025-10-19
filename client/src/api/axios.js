import axios from 'axios';

export default axios.create({
  baseURL: 'http://hwaksee.cafe24app.com/api', // ✅ 배포용 도메인으로 변경
  headers: {
    'Content-Type': 'application/json'
  }
});