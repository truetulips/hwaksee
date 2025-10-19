const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// 🌐 환경변수 로딩 (Cafe24는 .env 하나로 통일 권장)
dotenv.config(); // .env 또는 .env.production 자동 인식

const app = express();
const PORT = process.env.PORT || 8001;

// ✅ CORS 제한 (배포용)
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN?.split(','),
  credentials: true
}));

app.use(express.json());

// ✅ MongoDB 연결
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI가 설정되지 않았습니다. .env 파일을 확인하세요.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  dbName: process.env.DB_NAME, // .env에 DB_NAME=test 등 명시
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('✅ MongoDB 연결 성공');

    // ✅ 모델 초기화 (연결 이후)
    require('./models/User');

    // ✅ API 라우터 연결
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/posts', require('./routes/posts'));
    app.use('/api/user', require('./routes/user'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/admin/stats', require('./routes/adminStats'));

    // ✅ React 정적 파일 서빙
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    // ✅ 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 확씨 배포 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1);
  });