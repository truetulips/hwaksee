const axios = require('axios');

// 📦 스마트스토어 상품 등록 함수
async function createSmartstoreProduct({ maskedPhone, title, price }) {
  try {
    const originProduct = {
      statusType: "SALE",
      saleType: "NEW",
      leafCategoryId: "50000151", // 카테고리 ID는 실제 값으로 교체
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

    console.log('📦 [상품 등록 요청] endpoint: https://interface.sell.smartstore.naver.com/api/v2/products');
    console.log('📦 [상품 등록 요청] payload:', JSON.stringify(payload, null, 2));

    const res = await axios.post(
      'https://interface.sell.smartstore.naver.com/api/v2/products',
      payload,
      {
        headers: {
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
    } else if (status === 403) {
      console.error('❌ IP 인증이 되지 않았거나 API 접근 권한이 없습니다.');
    } else {
      console.error('❌ 기타 오류 발생');
    }

    throw new Error('스마트스토어 상품 등록 중 오류가 발생했습니다.');
  }
}

module.exports = { createSmartstoreProduct };