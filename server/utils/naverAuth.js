const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

let cachedToken = null;
let tokenExpiresAt = null;

function isExpired() {
    return !cachedToken || !tokenExpiresAt || Date.now() >= tokenExpiresAt;
}

async function refreshToken() {
    try {
        const res = await axios.post('https://api.commerce.naver.com/oauth2/token', null, {
        params: {
            grant_type: 'refresh_token',
            client_id: process.env.NAVER_CLIENT_ID,
            client_secret: process.env.NAVER_CLIENT_SECRET,
            refresh_token: process.env.NAVER_REFRESH_TOKEN
        }
        });

        cachedToken = res.data.access_token;
        tokenExpiresAt = Date.now() + (res.data.expires_in * 1000) - 10000; // 10초 여유
        console.log('✅ 네이버 토큰 갱신 완료');
        return cachedToken;
    } catch (err) {
        console.error('❌ 네이버 토큰 갱신 실패:', err.response?.data || err.message);
        return null;
    }
    }

    async function getAccessToken() {
    if (isExpired()) {
        return await refreshToken();
    }
    return cachedToken;
}

module.exports = { getAccessToken };