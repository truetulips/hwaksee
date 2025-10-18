const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenvFlow = require('dotenv-flow');
const cron = require('node-cron');

// 🧹 자동 정리 작업
const { cleanInactiveUsers } = require('./jobs/cleanup');

// 📁 라우트 모듈
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/posts');
const adminRoutes = require('./routes/admin');
const adminStatsRoutes = require('./routes/adminStats');
const userRoutes = require('./routes/user');

dotenvFlow.config(); // NODE_ENV에 따라 자동 분기

const allowedOrigins = [
  'http://localhost:3000',
  'http://172.30.1.52:3000',
  'https://hwaksee.kr'
];

// 🚀 앱 초기화
const app = express();

// 🌐 CORS 설정
app.use(cors({
  origin: function(origin, callback) {
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

// 🔗 라우터 연결
app.use('/auth', authRoutes);               // 인증
app.use('/posts', postRoutes);              // 매칭글
app.use('/admin', adminRoutes);             // 관리자 기본
app.use('/admin/stats', adminStatsRoutes);  // 관리자 통계
app.use('/users', userRoutes);              // 사용자 관련

// ✅ 기본 응답 확인용 (테스트용)
// app.get('/', (req, res) => {
//   res.send('✅ 서버 정상 작동 중');
// });

// 🔌 DB 연결 및 서버 시작
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });

    // 🧹 자동 정리 작업: 매일 오전 7시
    cron.schedule('0 7 * * *', async () => {
      console.log('🧹 Running daily cleanup job (inactive users)...');
      await cleanInactiveUsers();
    });
  })
  .catch(err => {
    console.error('❌ DB 연결 실패:', err.message);
    process.exit(1);
  });