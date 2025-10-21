import axios from 'axios';

export default axios.create({
  baseURL: 'http://172.30.1.52:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});