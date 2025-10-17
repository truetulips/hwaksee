const axios = require('axios');
const cheerio = require('cheerio');
const Post = require('../models/Post');

// 📌 내 글 목록 조회
exports.getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        console.error('글 조회 오류:', err.message);
        res.status(500).json({ message: '글 조회 중 오류가 발생했습니다.' });
    }
};

// 📌 글 매칭 처리
exports.matchPost = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
        if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

        post.matched = true;
        await post.save();

        res.status(200).json(post);
    } catch (err) {
        console.error('매칭 오류:', err.message);
        res.status(500).json({ message: '매칭 처리 중 오류가 발생했습니다.' });
    }
};

// 📌 글 삭제
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, userId: req.user._id });
        if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

        await Post.deleteOne({ _id: post._id });
        res.status(200).json({ message: '삭제 완료' });
    } catch (err) {
        console.error('삭제 오류:', err.message);
        res.status(500).json({ message: '글 삭제 중 오류가 발생했습니다.' });
    }
};