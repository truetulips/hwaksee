const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');

router.get('/', async (req, res) => { try { const totalPosts = await Post.countDocuments();
    const matchedPosts = await Post.countDocuments({ matcher: { $ne: null } });
    const completedTransactions = await Post.countDocuments({ buyerStatus: '완료', sellerStatus: '완료', 'settlementAccount.bank': { $exists: true } });
    const shippingInProgress = await Post.countDocuments({ sellerStatus: '발송' });
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ status: '정지' });

    res.json({
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
});

module.exports = router;