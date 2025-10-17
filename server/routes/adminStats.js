const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

<<<<<<< HEAD
router.get('/', async (req, res) => { try { const totalPosts = await Post.countDocuments();
    const matchedPosts = await Post.countDocuments({ matcher: { $ne: null } });
    const completedTransactions = await Post.countDocuments({ buyerStatus: '완료', sellerStatus: '완료', 'settlementAccount.bank': { $exists: true } });
    const shippingInProgress = await Post.countDocuments({ sellerStatus: '발송' });
=======
router.get('/', async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const matchedPosts = await Post.countDocuments({ matcher: { $ne: null } });
    const completedTransactions = await Post.countDocuments({
      buyerStatus: '완료',
      sellerStatus: '완료',
      'settlementAccount.bank': { $exists: true }
    });
    const shippingInProgress = await Post.countDocuments({ sellerStatus: '발송' });

>>>>>>> 40c23d38 (Branching point: refs/remotes/origin/main)
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ status: '정지' });

    res.json({
<<<<<<< HEAD
        totalPosts,
        matchedPosts,
        completedTransactions,
        shippingInProgress,
        totalUsers,
        bannedUsers
    });

    } catch (err) {
        console.error('❌ 관리자 통계 오류:', err);
        res.status(500).json({ message: '서버 오류' });
    } 
=======
      totalPosts,
      matchedPosts,
      completedTransactions,
      shippingInProgress,
      totalUsers,
      bannedUsers
    });
  } catch (err) {
    console.error('❌ 관리자 통계 오류:', err);
    res.status(500).json({ message: '서버 오류' });
  }
>>>>>>> 40c23d38 (Branching point: refs/remotes/origin/main)
});

module.exports = router;