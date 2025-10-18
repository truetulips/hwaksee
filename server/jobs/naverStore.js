const axios = require('axios');

// 네이버페이 API 연동을 위한 createSmartstoreProduct() 함수
async function createSmartstoreProduct({ maskedPhone, title, price }) {
    try {
        const payload = {
        productName: `[확씨 ${maskedPhone}] ${title}`,
        salePrice: price,
        saleStatus: 'ONSALE',
        stockQuantity: 1,
        categoryId: '50000000', // 테스트용 디지털/가전
        delivery: {
            deliveryCompanyCode: 'POST',
            deliveryMethodType: 'DIRECT',
            deliveryChargeType: 'FREE',
            deliveryCharge: 0
        },
        representativeImage: {
            imageUrl: 'https://hwaksee.kr/img/bi.png'
        }
        };

        const res = await axios.post(
        'https://api.commerce.naver.com/external/v2/products',
        payload,
        {
            headers: {
            'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
            'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
            'Content-Type': 'application/json'
            }
        }
        );

        const productId = res.data.productNo;
        return productId;
    } catch (err) {
        console.error('🔥 스마트스토어 상품 등록 실패:', err.response?.data || err.message);
        throw new Error('스마트스토어 상품 등록 중 오류가 발생했습니다.');
    }
}

module.exports = { createSmartstoreProduct };