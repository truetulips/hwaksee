const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['seller', 'buyer'],
        required: true
    },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 50000 },
    link: { type: String, required: true },
    imageUrl: { type: String, default: 'NO_IMAGE' },

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

    buyerAmount: { type: Number, required: true },
    sellerAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    feeAmount: { type: Number, required: true },

    shipping: {
        courier: { type: String, default: '' },
        tracking: { type: String, default: '' },
        dispatchedAt: { type: Date }
    },

    matchCode: { type: String, unique: true, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matcher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    matcherRole: {
        type: String,
        enum: ['buyer', 'seller'],
        default: null
    },

    status: {
        type: String,
        enum: ['등록', '매칭', '완료'],
        default: '등록'
    },
    buyerStatus: {
        type: String,
        enum: ['진행 전', '입금', '입금확인', '물품확인', '구매', '취소', '출고', '완료'],
        default: '진행 전'
    },
    sellerStatus: {
        type: String,
        enum: ['진행 전', '발송', '입고', '물품확인', '정산', '완료'],
        default: '진행 전'
    },

    inspectionResult: {
        type: String,
        enum: ['정상', '이상'],
        default: null
    },
    inspectionDescription: {
        type: String,
        default: ''
    },

    settlementAccount: {
        bank: String,
        account: String
    }
    }, {
    timestamps: true,
    versionKey: false
});

module.exports = mongoose.model('Post', postSchema);