const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// 거래글 삭제
router.post('/posts/bulk-delete', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: 'ids 배열 필요' });

  try {
    await Post.deleteMany({ _id: { $in: ids } });
    res.json({ success: true });
  } catch (err) {
    console.error('삭제 실패:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

// 거래글 리스트 조회
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts); // ✅ 배열 응답
  } catch (err) {
    console.error('❌ 관리자 거래글 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
});

module.exports = router;