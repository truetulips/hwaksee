import axios from 'axios';

export default axios.create({
  baseURL: 'http://172.30.1.52:5000', // 또는 네트워크 접근 시 'http://localhost:5000'
  headers: {
    'Content-Type': 'application/json'
  }
});
