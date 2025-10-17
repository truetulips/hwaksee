const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// 🔐 회원가입
router.post('/register', async (req, res) => {
  const { phone, password, role } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: '전화번호와 비밀번호는 필수입니다.' });
  }

  try {
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(409).json({ message: '이미 등록된 전화번호입니다.' });
    }

    const newUser = new User({
      phone,
      password, // 모델에서 자동 해싱
      role: role || 'user' // 기본 역할 지정
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('회원가입 오류:', err.message);
    res.status(500).json({ message: '회원가입 실패' });
  }
});

// 🔐 로그인
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ message: '전화번호와 비밀번호는 필수입니다.' });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        _id: user._id,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('로그인 오류:', err.message);
    res.status(500).json({ message: '로그인 실패' });
  }
});

// 🔐 현재 사용자 정보 반환
router.get('/me', auth, async (req, res) => {
  const { _id, phone, role } = req.user;
  res.json({ _id, phone, role });
});

module.exports = router;