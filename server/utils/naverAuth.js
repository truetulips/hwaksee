const axios = require('axios');
const qs = require('qs');
const dotenv = require('dotenv');
dotenv.config();

let cachedToken = null;
let tokenExpiresAt = null;

function isExpired() {
    return !cachedToken || !tokenExpiresAt || Date.now() >= tokenExpiresAt;
}

async function refreshToken() {
    try {
        const data = qs.stringify({
        grant_type: 'client_credentials',
        client_id: process.env.NAVER_CLIENT_ID,
        client_secret: process.env.NAVER_CLIENT_SECRET
        });

        const res = await axios.post(
        'https://api.commerce.naver.com/external/v1/oauth2/token',
        data,
        {
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
            }
        }
        );

        cachedToken = res.data.access_token;
        tokenExpiresAt = Date.now() + (res.data.expires_in * 1000) - 10000;
        console.log('✅ 네이버 토큰 갱신 완료');
        return cachedToken;
    } catch (err) {
        console.error('❌ 네이버 토큰 갱신 실패:', err.response?.data || err.message);
        throw new Error('네이버 토큰 갱신 실패');
    }
}

async function getAccessToken() {
    if (isExpired()) {
        return await refreshToken();
    }
    return cachedToken;
}

module.exports = { getAccessToken };