const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Authorization 헤더 확인
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: '🔒 인증 토큰이 누락되었습니다.' });
    }

    // 2️⃣ 토큰 추출 및 검증
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: '🔒 토큰이 유효하지 않습니다.' });
    }

    // 3️⃣ 사용자 조회
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: '🔒 사용자 정보를 찾을 수 없습니다.' });
    }

    // 4️⃣ 인증 성공 → 사용자 정보 주입
    req.user = {
      _id: user._id,
      role: user.role,     // ✅ 관리자 여부 판단용
      phone: user.phone    // ✅ 필요 시 프론트에 전달 가능
    };

    next(); // 다음 미들웨어 또는 라우트로 진행
  } catch (err) {
    console.error('🔐 인증 오류:', err.message);
    return res.status(401).json({
      message: '🔒 인증 실패: 토큰이 유효하지 않거나 만료되었습니다.',
      detail: err.message
    });
  }
};

module.exports = authMiddleware;