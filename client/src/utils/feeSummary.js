import { getFeeRate } from './fee';

export function getFeeSummary({ price, feeResponsibility, paymentMethod }) {
  const base = parseInt(price, 10);
  if (isNaN(base)) return null;

  const rate = getFeeRate(base);
  const feeAmount = Math.floor(base * rate);
  const isCard = paymentMethod === 'pay';

  let buyerAmount = base;
  let sellerAmount = base;
  let totalAmount = base;

  // 네이버페이 일반등급 수수료+부가세 3.6%
  if (feeResponsibility === 'seller') {
    sellerAmount = base - feeAmount;
    buyerAmount = isCard ? Math.floor(base * 1.036) : base;
    totalAmount = buyerAmount;
  } else if (feeResponsibility === 'buyer') {
    buyerAmount = isCard ? Math.floor((base + feeAmount) * 1.036) : base + feeAmount;
    sellerAmount = base;
    totalAmount = buyerAmount;
  } else if (feeResponsibility === 'split') {
    const halfFee = Math.floor(feeAmount / 2);
    buyerAmount = isCard ? Math.floor((base + halfFee) * 1.036) : base + halfFee;
    sellerAmount = base - halfFee;
    totalAmount = buyerAmount;
  }

  return { buyerAmount, sellerAmount, totalAmount, feeAmount };
}