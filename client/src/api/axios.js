import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE || 'https://hwaksee.kr/api';

export default axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});