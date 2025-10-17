import { getFeeRate } from '../utils/fee';

export default function FeeNotice({ post }) {  
  const base = post.price;
  const rate = getFeeRate(base);
  const fee = Math.floor(base * rate);
  const vatPrice = Math.floor(base * 1.1);
  const sellerFixed = base - fee;
  const sellerSplit = base - Math.floor(fee / 2);

  const isCard = post.paymentMethod === 'card';
  const buyerFee = isCard ? Math.floor(((base + fee) * 1.1) - base) : fee;
  const halfBuyerFee = isCard ? Math.floor((base + (fee / 2)) * 1.1 - base) : Math.floor(fee / 2);

  let result = '';
  switch (post.feeResponsibility) {
    case 'seller':
      result = `수수료: ${fee.toLocaleString()}원
      구매자 ${isCard ? '카드 결제' : '현금 입금'} 금액: ${isCard ? vatPrice.toLocaleString() : base.toLocaleString()}원
      판매자 정산 금액: ${sellerFixed.toLocaleString()}원
      총 거래 금액: ${base.toLocaleString()}원`;
      break;
    case 'buyer':
      result = `수수료: ${fee.toLocaleString()}원
      구매자 ${isCard ? '카드 결제' : '현금 입금'} 금액: ${(base + buyerFee).toLocaleString()}원
      판매자 정산 금액: ${base.toLocaleString()}원
      총 거래 금액: ${(base + buyerFee).toLocaleString()}원`;
      break;
    case 'split':
      result = `총 수수료: ${fee.toLocaleString()}원
      구매자 ${isCard ? '카드 결제' : '현금 입금'} 금액: ${(base + halfBuyerFee).toLocaleString()}원
      판매자 정산 금액: ${sellerSplit.toLocaleString()}원
      총 거래 금액: ${(base + halfBuyerFee).toLocaleString()}원`;
      break;
    default:
      result = null;
  }

  return <pre>{result}</pre>;
  
}