const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ✅ 회원가입
exports.register = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: '이미 등록된 전화번호입니다.' });
    }

    const user = new User({ phone, password });
    await user.save();

    res.status(201).json({
      message: '회원가입 성공',
      user: { _id: user._id, phone: user.phone }
    });
  } catch (err) {
    console.error('회원가입 오류:', err.message);
    res.status(500).json({ message: '회원가입 중 오류가 발생했습니다.' });
  }
};

// ✅ 로그인
exports.login = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: '존재하지 않는 사용자입니다.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role }, // ✅ 반드시 role 포함
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: '로그인 성공',
      token,
      user: { _id: user._id, phone: user.phone }
    });
  } catch (err) {
    console.error('로그인 오류:', err.message);
    res.status(500).json({ message: '로그인 중 오류가 발생했습니다.' });
  }
};

// ✅ 로그인 상태 확인
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('사용자 정보 조회 오류:', err.message);
    res.status(500).json({ message: '사용자 정보 조회 중 오류가 발생했습니다.' });
  }
};

// ✅ 계정 삭제
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.userId);
    res.status(200).json({ message: '계정이 삭제되었습니다.' });
  } catch (err) {
    console.error('계정 삭제 오류:', err.message);
    res.status(500).json({ message: '계정 삭제 중 오류가 발생했습니다.' });
  }
};