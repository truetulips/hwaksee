import express from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { createSmartstoreProduct } from '../jobs/naverStore.js';

const router = express.Router();

// 🔧 에러 처리 유틸
const handleError = (res, err, fallback = '서버 오류') => {
  console.error('🔥 에러:', err);
  res.status(500).json({
    message: fallback,
    detail: err?.message || '에러 메시지 없음'
  });
};

// 1️⃣ 글 등록
router.post('/', auth, async (req, res) => {
  const {
    title, price, link, type, matchCode,
    feeResponsibility, paymentMethod,
    buyerAmount, sellerAmount, totalAmount, feeAmount,
    smartstoreProductId // ✅ 추가 필드
  } = req.body;

  const user = await User.findById(req.user._id);
  if (user.inactiveSince) {
    user.inactiveSince = null;
    await user.save();
  }

  if (!title || !price || !type || !matchCode) {
    return res.status(400).json({ message: '제목, 금액, 역할, 매칭코드는 필수입니다.' });
  }

  if (!['cash', 'pay'].includes(paymentMethod)) {
    return res.status(400).json({ message: '유효하지 않은 결제 방식입니다.' });
  }

  try {
    const newPost = new Post({
      title,
      price,
      link,
      type,
      matchCode,
      author: req.user._id,
      feeResponsibility: feeResponsibility || 'buyer',
      paymentMethod,
      buyerAmount,
      sellerAmount,
      totalAmount,
      feeAmount,
      smartstoreProductId, // ✅ 반영
      status: '등록'
    });

    // ✅ 전자결제일 경우 스마트스토어 상품 자동 등록
    if (paymentMethod === 'pay') {
      const productId = await createSmartstoreProduct({
        title,
        price,
        matchCode
      });
      newPost.smartstoreProductId = productId;
    }

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    handleError(res, err, '등록 실패');
  }
});

// 2️⃣ 내 글 조회
router.get('/my', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    handleError(res, err, '조회 실패');
  }
});

// 3️⃣ 전체 글 조회
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    handleError(res, err, '조회 실패');
  }
});

// 4️⃣ 개별 글 조회
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: '유효하지 않은 글 ID입니다.' });
  }

  const post = await Post.findById(id);
  if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });
  res.json(post);
});

// 5️⃣ 글 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

    const isAuthor = post.author?.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await post.deleteOne();
    res.json({ message: '삭제 완료' });
  } catch (err) {
    handleError(res, err, '삭제 실패');
  }
});

// ✏️ 글 수정
router.patch('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

    const patch = req.body;
    const isAuthor = post.author?.equals(req.user._id);
    const isMatcher = post.matcher?.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    const isBuyer = (isMatcher && post.matcherRole === 'buyer') || (post.type === 'buyer' && isAuthor);
    const isSeller = (isMatcher && post.matcherRole === 'seller') || (post.type === 'seller' && isAuthor);

    const permissionMap = {
      buyerStatus: isAdmin || isBuyer,
      sellerStatus: isAdmin || isSeller,
      shipping: isAdmin || isAuthor || (isMatcher && post.matcherRole === 'seller'),
      paymentMethod: isAdmin || isBuyer,
      inspectionResult: isAdmin,
      title: isAuthor || isAdmin,
      price: isAuthor || isAdmin,
      link: isAuthor || isAdmin,
      smartstoreProductId: isAuthor || isAdmin // ✅ 추가
    };

    for (const key of Object.keys(patch)) {
      if (key in permissionMap && !permissionMap[key]) {
        return res.status(403).json({ message: `${key} 수정 권한이 없습니다.` });
      }
    }

    if (patch.buyerStatus === '완료' && post.buyerStatus !== '출고') {
      return res.status(400).json({ message: '구매자는 출고 이후에만 완료 처리 가능합니다.' });
    }

    if (patch.sellerStatus === '완료' && post.sellerStatus !== '정산') {
      return res.status(400).json({ message: '판매자는 정산 이후에만 완료 처리 가능합니다.' });
    }

    Object.assign(post, patch);

    if (post.buyerStatus === '완료' && post.sellerStatus === '완료') {
      post.status = '완료';
    }

    await post.save();
    res.json(post);
  } catch (err) {
    handleError(res, err, '수정 실패');
  }
});

// 🔗 매칭 요청
router.post('/match', auth, async (req, res) => {
  const { matchCode } = req.body;
  if (!matchCode) return res.status(400).json({ message: '매칭 코드가 필요합니다.' });

  try {
    const post = await Post.findOne({ matchCode });
    if (!post) return res.status(404).json({ message: '유효하지 않은 매칭 코드입니다.' });
    if (post.matcher) return res.status(409).json({ message: '이미 매칭된 글입니다.' });

    post.matcher = req.user._id;
    post.matcherRole = post.type === 'buyer' ? 'seller' : 'buyer';
    post.status = '매칭';
    post.buyerStatus = '진행 전';
    post.sellerStatus = '진행 전';

    await post.save();
    res.json({ message: '매칭 성공', post });
  } catch (err) {
    handleError(res, err, '매칭 실패');
  }
});

// 🧪 검사 결과 입력
router.post('/:id/inspection', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: '검사 결과 입력 권한이 없습니다.' });

    post.inspectionResult = req.body.result;
    post.buyerStatus = '물품확인';
    post.sellerStatus = '물품확인';

    await post.save();
    res.json({ message: '검사 결과 저장 완료', post });
  } catch (err) {
    handleError(res, err, '검사 결과 저장 실패');
  }
});

// 🛒 구매자 의사 전달
router.post('/:id/buyer-decision', auth, async (req, res) => {
  const { decision } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

    const isBuyer = post.matcher?.equals(req.user._id) && post.matcherRole === 'buyer';
    if (!isBuyer) return res.status(403).json({ message: '구매자만 의사 전달이 가능합니다.' });

    if (post.buyerStatus !== '물품확인') {
      return res.status(400).json({ message: '물품확인 단계에서만 구매/취소 선택이 가능합니다.' });
    }

    if (!['구매', '취소'].includes(decision)) {
      return res.status(400).json({ message: '유효하지 않은 선택입니다.' });
    }

    post.buyerStatus = decision;
    await post.save();
    res.json({ message: '구매자 의사 반영 완료', post });
  } catch (err) {
    handleError(res, err, '구매자 의사 반영 실패');
  }
});

// 🚚 출고 처리
router.post('/:id/shipping', auth, async (req, res) => {
  const { trackingNumber, courier } = req.body;
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '출고 처리 권한이 없습니다.' });
    }

    if (post.buyerStatus !== '구매') {
      return res.status(400).json({ message: '구매자가 구매를 선택한 경우에만 출고 가능합니다.' });
    }

    post.shipping = {
      courier: courier || '',
      tracking: trackingNumber || '',
      dispatchedAt: new Date()
    };
    post.buyerStatus = '출고';

    await post.save();
    res.json({ message: '출고 처리 완료', post });
  } catch (err) {
    handleError(res, err, '출고 처리 실패');
  }
});

// 💰 정산 계좌 등록
router.patch('/:id/settlement', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

    const isAuthor = post.author?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: '정산 정보 수정 권한이 없습니다.' });
    }

    const { settlementAccount } = req.body;
    if (!settlementAccount?.bank || !settlementAccount?.account) {
      return res.status(400).json({ message: '은행명과 계좌번호는 필수입니다.' });
    }

    post.settlementAccount = {
      bank: settlementAccount.bank,
      account: settlementAccount.account
    };

    post.sellerStatus = '정산';

    const savedPost = await post.save();
    res.json({ message: '정산 정보가 저장되었습니다.', post: savedPost });
  } catch (err) {
    handleError(res, err, '정산 정보 저장 실패');
  }
});

export default router;