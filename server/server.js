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

// ✅ CORS 설정
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

// ✅ 파피콘 정상인데 자꾸 불러?!
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ✅ 기본 API 응답 (Nginx 프록시 확인용)
app.get('/api', (req, res) => {
  res.json({ message: 'API 연결 성공!' });
});

const PORT = process.env.PORT || 5000;

// ✅ MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB 연결 완료');

    // ✅ 모델 초기화
    require('./models/User');

    // ✅ 라우터 등록
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

    // ✅ 서버 시작
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    // ✅ 크론 작업
    cron.schedule('0 7 * * *', async () => {
      console.log('🧹 Running daily cleanup job (inactive users)...');
      await cleanInactiveUsers();
    });
  })
  .catch(err => {
    console.error('❌ DB 연결 실패:', err.message);
    process.exit(1);
  });