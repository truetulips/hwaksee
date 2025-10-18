const cron = require('node-cron');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { syncNaverOrders } = require('../jobs/orderSync');

dotenv.config();

async function ensureMongoConnection() {
    if (mongoose.connection.readyState === 0) {
        try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB 연결 완료');
        } catch (err) {
        console.error('❌ MongoDB 연결 실패:', err.message);
        }
    }
    }

    cron.schedule('*/10 * * * *', async () => {
    console.log('⏰ [CRON] 네이버 주문 동기화 시작');
    try {
        await ensureMongoConnection();
        await syncNaverOrders();
    } catch (err) {
        console.error('❌ [CRON] 주문 동기화 실패:', err.message);
    }
});