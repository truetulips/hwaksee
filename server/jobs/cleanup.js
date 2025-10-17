require('dotenv').config();
const mongoose = require('mongoose');
const cron = require('node-cron');
const Post = require('../models/Post');
const User = require('../models/User');

// 🔹 글 삭제
const cleanOldPosts = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const deleted = await Post.deleteMany({
      createdAt: { $lte: sevenDaysAgo },
      $or: [
        { status: '등록', matcher: null },
        { status: '완료' }
      ]
    });

    if (deleted.deletedCount === 0) {
      console.log('🟢 [글] 삭제 대상 없음');
    } else {
      console.log(`📝 [글] ${deleted.deletedCount}건 삭제 완료`);
    }
  } catch (err) {
    console.error('❌ [글] 삭제 중 오류 발생:', err.message);
  }
};

// 🔹 계정 삭제 (글 없는 유저만)
const cleanInactiveUsers = async () => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const candidates = await User.find({
      inactiveSince: { $lte: sevenDaysAgo },
      role: { $nin: ['admin', 'manager'] }
    });

    if (candidates.length === 0) {
      console.log('🟢 [계정] 삭제 대상 없음');
      return;
    }

    let deletedCount = 0;

    for (const user of candidates) {
      // const postCount = await Post.countDocuments({ userId: user._id });
      const postCount = await Post.countDocuments({ author: user._id });
      if (postCount === 0) {
        await User.deleteOne({ _id: user._id });
        console.log(`🗑️ [계정] 삭제됨 → ${user.phone} (ID: ${user._id})`);
        deletedCount++;
      } else {
        console.log(`⏸️ [계정] 유지됨 → ${user.phone} (글 ${postCount}개 보유)`);
      }
    }

    console.log(`✅ [계정] 총 ${deletedCount}개 삭제 완료`);
  } catch (err) {
    console.error('❌ [계정] 삭제 중 오류 발생:', err.message);
  }
};

// 🔹 전체 실행
const runCleanup = async () => {
  console.log('🚀 [정리 작업 시작]');
  await cleanOldPosts();
  await cleanInactiveUsers();
  console.log('🏁 [정리 작업 완료]');
};

// 🔹 자동 실행: 매일 오전 7시 (서버에서 import된 경우에만 작동)
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('0 7 * * *', async () => {
    console.log('⏰ [CRON] 오전 7시 자동 클린업 시작');
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.MONGO_URI);
      }
      await runCleanup();
    } catch (err) {
      console.error('❌ [CRON] 클린업 실패:', err.message);
    }
  });
}

// 🔹 수동 실행
if (require.main === module) {
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('✅ [수동] DB 연결 성공');
      await runCleanup();
      mongoose.disconnect();
    })
    .catch((err) => {
      console.error('❌ [수동] DB 연결 실패:', err.message);
    });
}

module.exports = {
  cleanOldPosts,
  cleanInactiveUsers,
  runCleanup
};