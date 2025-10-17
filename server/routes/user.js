const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');

const router = express.Router();

// PATCH /users/mark-inactive
router.patch('/mark-inactive', authMiddleware, async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (user.role === 'admin') {
    return res.status(403).json({ message: 'Admin accounts are not marked inactive' });
  }

  user.inactiveSince = new Date();
  await user.save();

  res.json({
    message: '계정 삭제 예약됨',
    inactiveSince: user.inactiveSince
  });
});

// GET /users (관리자용 + 작성글 수 포함)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '관리자만 접근 가능합니다' });
    }

    const users = await User.find({}, 'phone inactiveSince role');

    const usersWithPostCount = await Promise.all(users.map(async user => {
      const postCount = await Post.countDocuments({ author: user._id.toString() }); // 문자열 기반 매칭
      return {
        _id: { $oid: user._id.toString() },
        phone: user.phone,
        inactiveSince: user.inactiveSince,
        role: user.role,
        postCount
      };
    }));

    res.json(usersWithPostCount);
  } catch (err) {
    console.error('사용자 조회 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// DELETE /users/:id (관리자용)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '관리자만 삭제 가능' });
    }

    const result = await User.deleteOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: '사용자 없음' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('삭제 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;