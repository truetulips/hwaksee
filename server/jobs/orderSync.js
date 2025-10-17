// jobs/orderSync.js
import axios from 'axios';
import Post from '../models/Post.js';
import { getAccessToken } from '../utils/naverAuth.js';

export async function syncNaverOrders() {
    const token = await getAccessToken();
    if (!token) {
        console.warn('⚠️ 네이버페이 토큰 없음 → 주문 동기화 중단');
        return;
    }

    try {
        const res = await axios.get(process.env.NAVER_ORDER_API, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            status: 'PAYMENT_COMPLETED',
            startDate: get7DaysAgo(),
            endDate: new Date().toISOString()
        }
        });

        const orders = res.data.orders || [];
        console.log(`🔄 주문 동기화 시작: ${orders.length}건`);

        for (const order of orders) {
        const matchCode = extractMatchCode(order.productName);
        if (!matchCode) {
            console.warn(`⚠️ matchCode 추출 실패 → ${order.productName}`);
            continue;
        }

        const post = await Post.findOne({ matchCode });
        if (!post) {
            console.warn(`⚠️ Post 미존재 → ${matchCode}`);
            continue;
        }

        if (post.buyerStatus === '입금확인') {
            console.log(`⏩ 이미 입금확인됨 → ${matchCode}`);
            continue;
        }

        await Post.updateOne(
            { matchCode },
            {
            $set: {
                buyerStatus: '입금확인',
                paymentMethod: 'pay'
            }
            }
        );

        console.log(`✅ 입금확인 처리됨 → ${matchCode}`);
        }
    } catch (err) {
        console.error('❌ 주문 동기화 실패:', err.response?.data || err.message);
    }
}

function get7DaysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString();
}

function extractMatchCode(name) {
    const match = name.match(/(\d{5}[A-Z])/);
    return match ? match[1] : null;
}