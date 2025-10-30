const axios = require('axios');
const qs = require('qs');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

let cachedToken = null;
let tokenExpiresAt = null;

// ✅ 전자서명 생성
function generateClientSecretSign(clientId, clientSecret, timestamp) {
  const password = `${clientId}_${timestamp}`;
  const hashed = bcrypt.hashSync(password, clientSecret);
  return Buffer.from(hashed, "utf-8").toString("base64");
}

// ✅ 토큰 발급
async function getAccessToken() {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const clientId = process.env.NAVER_COMMERCE_CLIENT_ID;
  const clientSecret = process.env.NAVER_COMMERCE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('NAVER_COMMERCE_CLIENT_ID 또는 CLIENT_SECRET 환경변수가 설정되지 않았습니다.');
  }

  const timestamp = Date.now().toString();
  const clientSecretSign = generateClientSecretSign(clientId, clientSecret, timestamp);

  const data = qs.stringify({
    client_id: clientId,
    timestamp,
    grant_type: 'client_credentials',
    client_secret_sign: clientSecretSign,
    type: 'SELF'
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
  tokenExpiresAt = Date.now() + (res.data.expires_in * 1000) - 5000;
  return cachedToken;
}

// ✅ 이미지 업로드
async function uploadProductImage(accessToken) {
  const form = new FormData();
  const imagePath = path.resolve('/var/www/hwaksee/bi.png');
  form.append('imageFiles', fs.createReadStream(imagePath));

  const res = await axios.post(
    'https://api.commerce.naver.com/external/v1/product-images/upload',
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  return res.data.images[0].url;
}

// 📦 상품 등록
async function createSmartstoreProduct({ title, buyerAmount }) {
  try {
    const accessToken = await getAccessToken();
    const imageUrl = await uploadProductImage(accessToken);
    const today = new Date();
    const packDate = today.toISOString().slice(0, 7); // "YYYY-MM"

    const originProduct = {
      statusType: "SALE",
      saleType: "OLD",
      leafCategoryId: "50000345",
      name: `[확씨] ${title}`,
      detailContent: "<center><img src='http://truetulips.mycafe24.com/img/bi.png' width='500' height=auto /><br />확씨의 전자결제 선택 시 등록되는 물품입니다.<br />거래 물품의 상세한 정보는 확씨의 링크 등록 을 반드시 확인 해주시기 바랍니다.</center>",
      images: {
        representativeImage: { url: imageUrl },
        optionalImages: []
      },
      salePrice: buyerAmount,
      stockQuantity: 1,
      deliveryInfo: {
        deliveryType: "DELIVERY",
        deliveryAttributeType: "NORMAL",
        logisticsCompanyId: "EPOST",
        deliveryCompany: "EPOST",
        deliveryChargeType: "FREE",
        deliveryCharge: 0,
        deliveryFee: {
          deliveryChargeType: "FREE",
          deliveryCharge: 0
        },
        claimDeliveryInfo: {
          returnDeliveryCompanyPriorityType: "PRIMARY",
          returnDeliveryFee: 0,
          returnDeliveryCharge: 0,
          exchangeDeliveryCharge: 0,
          exchangeDeliveryFee: 0,
          shippingAddressId: null
        }
      },
      detailAttribute: {
        naverShoppingSearchInfo: {
          modelName: title
        },
        afterServiceInfo: {
          afterServiceTelephoneNumber: "0507-1466-3435",
          afterServiceGuideContent: "네이버톡이나 고객센터로 문의해주세요."
        },
        minorPurchasable: true,
        originAreaInfo: {
          originAreaCode: "00",
          content: "국산",
          plural: false
        },
        productInfoProvidedNotice: {
          productInfoProvidedNoticeType: "WEAR",
          wear: {
            material: "면",
            color: "흰색",
            size: "FREE",
            manufacturer: "쓰리디웨이브",
            caution: "세탁 시 주의",
            warrantyPolicy: "소비자분쟁해결기준에 따름",
            afterServiceDirector: "고객센터",
            packDate
          }
        }
      }
    };

    const smartstoreChannelProduct = {
      channelProductName: title,
      bbsSeq: null,
      storeKeepExclusiveProduct: false,
      naverShoppingRegistration: true,
      channelProductDisplayStatusType: "ON"
    };

    const payload = {
      originProduct,
      smartstoreChannelProduct
    };

    const res = await axios.post(
      'https://api.commerce.naver.com/external/v2/products',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const result = res.data;
    const smartstoreChannelProductNo = result?.smartstoreChannelProductNo;

    console.log("✅ 상품 등록 성공!");
    console.log("채널상품번호:", smartstoreChannelProductNo);

    if (!smartstoreChannelProductNo) {
      console.error("❌ 채널상품번호 누락:", result);
      throw new Error("상품 등록 응답에 smartstoreChannelProductNo가 없습니다.");
    }

    return { smartstoreChannelProductNo };
  } catch (err) {
    const status = err.response?.status;
    const invalids = err.response?.data?.invalidInputs;

    console.error(`🔥 [상품 등록 실패] 상태코드: ${status}`);
    if (invalids) {
      console.error('❌ 유효하지 않은 입력값:');
      invalids.forEach(i => console.error(`- ${i.name}: ${i.message}`));
    } else {
      console.error('❌ 응답내용:', err.response?.data || err.message);
    }

    throw new Error('스마트스토어 상품 등록 중 오류가 발생했습니다.');
  }
}

module.exports = { createSmartstoreProduct };