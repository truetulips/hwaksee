const axios = require('axios');
const bcrypt = require('bcrypt');
const qs = require('qs');

// 🔐 bcrypt 기반 전자서명 생성 함수
function generateBcryptSignature(clientId, timestamp, clientSecret) {
  const password = `${clientId}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, clientSecret);
  return Buffer.from(hashed, 'utf-8').toString('base64');
}

// 🪙 인증 토큰 발급 함수
async function getAccessToken() {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const accountId = process.env.NAVER_ACCOUNT_ID;
  const timestamp = Date.now().toString();
  const signature = generateBcryptSignature(clientId, timestamp, clientSecret);

  const payload = {
    client_id: clientId,
    grant_type: 'client_credentials',
    client_secret_sign: signature,
    timestamp,
    type: 'SELLER',
    account_id: accountId
  };

  console.log('🔐 [토큰 요청] payload:', payload);

  const res = await axios.post(
    'https://api.commerce.naver.com/v1/oauth2/token',
    qs.stringify(payload),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  console.log('🔐 [토큰 발급 완료] access_token:', res.data.access_token);

  return res.data.access_token;
}

// 📦 스마트스토어 상품 등록 함수
async function createSmartstoreProduct({ maskedPhone, title, price }) {
  try {
    const accessToken = await getAccessToken();

    const originProduct = {
      statusType: "SALE",
      saleType: "NEW",
      leafCategoryId: "50000151",
      name: `[확씨 ${maskedPhone}] ${title}`,
      detailContent: "<p>확씨의 전자결제 선택 시 등록되는 물품입니다.</p>",
      images: {
        representativeImage: {
          url: "https://truetulips.mycafe24.com/img/bi.png"
        },
        optionalImages: []
      },
      salePrice: price,
      stockQuantity: 1,
      deliveryInfo: {
        deliveryType: "DELIVERY",
        deliveryAttributeType: "NORMAL",
        deliveryCompanyCode: "POST",
        deliveryChargeType: "FREE",
        deliveryCharge: 0
      }
    };

    const payload = { originProduct };

    console.log('📦 [상품 등록 요청] endpoint: https://api.commerce.naver.com/external/v1/products/origin-products');
    console.log('📦 [상품 등록 요청] payload:', JSON.stringify(payload, null, 2));

    const res = await axios.post(
      'https://api.commerce.naver.com/external/v1/products/origin-products',
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ [상품 등록 성공] response:', res.data);

    return res.data.productNo;
  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data || err.message;

    console.error('🔥 [상품 등록 실패] 상태코드:', status);
    console.error('🔥 [상품 등록 실패] 응답내용:', message);

    if (status === 404) {
      console.error('❌ 네이버 API 경로가 존재하지 않거나 권한이 없습니다.');
    } else if (status === 401) {
      console.error('❌ 인증 토큰이 유효하지 않거나 만료되었습니다.');
    } else if (status === 403) {
      console.error('❌ 앱 권한이 해당 API에 접근할 수 없습니다.');
    }

    throw new Error('스마트스토어 상품 등록 중 오류가 발생했습니다.');
  }
}

module.exports = { createSmartstoreProduct };