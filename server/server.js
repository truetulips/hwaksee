const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cron = require('node-cron');

const { cleanInactiveUsers } = require('./jobs/cleanup');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGIN?.split(',') || ['https://hwaksee.kr'];

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

// 특정 도메인만 허용
app.use(cors({
  origin: 'http://119.204.207.123:3000',
  credentials: true,
}));

function startServer() {
  if (!process.env.MONGO_URI || !process.env.DB_NAME) {
    console.error('❌ 환경변수 MONGO_URI 또는 DB_NAME 누락됨');
    process.exit(1);
  }

  mongoose.connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('✅ MongoDB 연결 완료');

      require('./models/User');

      app.use('/api/auth', require('./routes/authRoutes'));
      app.use('/api/posts', require('./routes/posts'));
      app.use('/api/user', require('./routes/user'));
      app.use('/api/admin', require('./routes/admin'));
      app.use('/api/admin/stats', require('./routes/adminStats'));

      // 정적 파일 서빙 경로 수정
      app.use(express.static('/var/www/hwaksee/build'));

      app.get('*', (req, res) => {
        res.sendFile(path.join('/var/www/hwaksee/build', 'index.html'));
      });

      app.listen(PORT, () => {
        console.log(`🚀 확씨 운영 서버 실행 중: http://localhost:${PORT}`);
      });

      cron.schedule('0 7 * * *', () => {
        console.log('🧹 Running daily cleanup job (inactive users)...');
        cleanInactiveUsers()
          .then(() => {
            console.log('✅ 크론 작업 완료');
          })
          .catch((err) => {
            console.error('❌ 크론 작업 실패:', err.message);
          });
      });
    })
    .catch((err) => {
      console.error('❌ MongoDB 연결 실패:', err.message);
      process.exit(1);
    });
}

startServer();