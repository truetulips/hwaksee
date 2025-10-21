const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenvFlow = require('dotenv-flow');
const cron = require('node-cron');

dotenvFlow.config();

const { cleanInactiveUsers } = require('./jobs/cleanup');

const allowedOrigins = [
  'http://localhost:3000',
  'http://172.30.1.6:3000',
  'https://hwaksee.kr'
];

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('❌ CORS 차단됨:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB 연결 완료');

    // ✅ mongoose 연결 이후에만 모델과 라우터 require
    require('./models/User'); // 모델 강제 초기화
    const authRoutes = require('./routes/authRoutes');
    const postRoutes = require('./routes/posts');
    const adminRoutes = require('./routes/admin');
    const adminStatsRoutes = require('./routes/adminStats');
    const userRoutes = require('./routes/user');

    app.use('/auth', authRoutes);
    app.use('/posts', postRoutes);
    app.use('/admin', adminRoutes);
    app.use('/admin/stats', adminStatsRoutes);
    app.use('/users', userRoutes);

    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    cron.schedule('0 7 * * *', async () => {
      console.log('🧹 Running daily cleanup job (inactive users)...');
      await cleanInactiveUsers();
    });
  })
  .catch(err => {
    console.error('❌ DB 연결 실패:', err.message);
    process.exit(1);
  });