const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  // 🧾 기본 정보
  type: {
    type: String,
    enum: ['seller', 'buyer'],
    required: true
  },
  title: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 50000 },
  link: { type: String, required: true },
  imageUrl: { type: String, default: 'NO_IMAGE' },

  // 💸 결제 및 수수료
  feeResponsibility: {
    type: String,
    enum: ['buyer', 'seller', 'split'],
    default: 'buyer'
  },
  paymentMethod: {
    type: String,
    enum: ['pay', 'cash'],
    default: 'cash'
  },
  smartstoreProductId: {
    type: String,
    default: null
  },

  // 💰 금액 정보
  buyerAmount: { type: Number, required: true },
  sellerAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  feeAmount: { type: Number, required: true },

  // 🚚 배송 정보
  shipping: {
    courier: { type: String, default: '' },
    tracking: { type: String, default: '' },
    dispatchedAt: { type: Date }
  },

  // 🔗 매칭 정보
  matchCode: { type: String, unique: true, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  matcherRole: {
    type: String,
    enum: ['buyer', 'seller'],
    required: true
  },

  // 📦 거래 상태
  status: {
    type: String,
    enum: ['등록', '매칭', '완료'],
    default: '등록'
  },
  buyerStatus: {
    type: String,
    enum: ['진행 전', '입금', '입금확인', '물품확인중', '구매', '취소', '출고', '완료'],
    default: '진행 전'
  },
  sellerStatus: {
    type: String,
    enum: ['진행 전', '발송', '입고', '물품확인중', '정산', '완료'],
    default: '진행 전'
  },

  // 🧪 검사 결과
  inspectionResult: {
    type: String,
    enum: ['확인전', '정상', '이상'],
    default: '확인전',
    required: true
  },
  inspectionDescription: {
    type: String,
    default: ''
  },

  // 💳 정산 계좌
  settlementAccount: {
    bank: String,
    account: String
  },

  // ✅ 구매자 배송 정보
  buyerInfo: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' }
  },

  // ✅ 구매 취소 사유
  cancelReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Post', postSchema, 'posts');