const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '.env.production' });

const app = express();
const PORT = process.env.PORT || 8001;

// ✅ CORS 제한 (배포용)
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN?.split(','),
    credentials: true
}));

app.use(express.json());

// ✅ MongoDB 연결
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB 연결 성공'))
    .catch(err => console.error('❌ MongoDB 연결 실패:', err));

// ✅ API 라우터 연결
app.use('/api/posts', require('./routes/posts'));
app.use('/api/user', require('./routes/user'));
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