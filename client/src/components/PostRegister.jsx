import { useState } from 'react';
import axios from '../api/axios';
import { getFeeSummary } from '../utils/feeSummary';
import TransactionNotice from './TransactionNotice';
import styles from '../css/Posts.module.css';

export default function PostRegister({ onPostCreated, onCancel }) {
  const [type, setType] = useState('seller'); // 판매자 또는 구매자 선택
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [link, setLink] = useState('');
  const [feeResponsibility, setFeeResponsibility] = useState('buyer');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const generateMatchCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const normalizeLink = (url) => {
    if (!/^https?:\/\//i.test(url)) {
      return 'http://' + url;
    }
    return url;
  };

  const handleSubmit = async () => {
    if (!title || !price || !link) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    const normalizedLink = normalizeLink(link);

    try {
      const matchCode = generateMatchCode();
      const summary = getFeeSummary({ price, feeResponsibility, paymentMethod });

      const res = await axios.post('/posts', {
          type,
          matcherRole: type, // ✅ 역할을 명시적으로 전달
          title,
          price: parseInt(price, 10),
          link: normalizedLink,
          matchCode,
          feeResponsibility,
          paymentMethod,
          buyerAmount: summary.buyerAmount,
          sellerAmount: summary.sellerAmount,
          totalAmount: summary.totalAmount,
          feeAmount: summary.feeAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      onPostCreated(res.data);
      setTitle('');
      setPrice('');
      setLink('');
      setFeeResponsibility('buyer');
      setPaymentMethod('cash');
      setError('');
    } catch (err) {
      setError('등록 실패. 다시 시도해주세요.');
    }
  };

  const handleCancel = () => {
    setTitle('');
    setPrice('');
    setLink('');
    setFeeResponsibility('buyer');
    setPaymentMethod('cash');
    setError('');
    if (onCancel) onCancel();
  };

  const summary = getFeeSummary({ price, feeResponsibility, paymentMethod });

  return (
    <section>
      <div className={styles.card}>
        <h3>📝 물품 등록</h3>

        <p className={styles.small_noti}>
          ■ 입금(구매자)과 발송(판매자) 이후부터 수수료가 발생합니다.
        </p>
        <p className={styles.small_sub}>
          ■ 매칭되지 않는 글은 7일 후 삭제됩니다.
        </p>

        {/* 역할 선택 */}
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              value="seller"
              checked={type === 'seller'}
              onChange={() => setType('seller')}
            />{' '}
            판매자
          </label>
          <label>
            <input
              type="radio"
              value="buyer"
              checked={type === 'buyer'}
              onChange={() => setType('buyer')}
            />{' '}
            구매자
          </label>
        </div>

        {/* 제품 정보 입력 */}
        <input
          type="text"
          placeholder="제품명"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
        />
        <input
          type="number"
          min={50000}
          step={1000}
          placeholder="최하 거래가는 50,000원이며 1,000단위 조정됩니다."
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="물품 링크를 입력해주세요 (예: naver.com/item/123)"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className={styles.input}
        />

        {/* 수수료 부담 선택 */}
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              value="buyer"
              checked={feeResponsibility === 'buyer'}
              onChange={() => setFeeResponsibility('buyer')}
            />{' '}
            구매자 부담
          </label>
          <label>
            <input
              type="radio"
              value="seller"
              checked={feeResponsibility === 'seller'}
              onChange={() => setFeeResponsibility('seller')}
            />{' '}
            판매자 부담
          </label>
          <label>
            <input
              type="radio"
              value="split"
              checked={feeResponsibility === 'split'}
              onChange={() => setFeeResponsibility('split')}
            />{' '}
            반반 부담
          </label>
        </div>

        {/* 결제 방식 선택 */}
        <div className={styles.radioGroup}>
          <label>
            <input
              type="radio"
              value="cash"
              checked={paymentMethod === 'cash'}
              onChange={() => setPaymentMethod('cash')}
            />{' '}
            현금 입금
          </label>
          <label>
            <input
              type="radio"
              value="pay"
              checked={paymentMethod === 'pay'}
              onChange={() => setPaymentMethod('pay')}
            />{' '}
            전자 결제
          </label>
        </div>

        {/* 수수료 안내 */}
        {summary && (
          <pre className={styles.feeNotice}>
            <p>수수료: {summary.feeAmount.toLocaleString()}원</p>
            <p>구매자 결제 금액: {summary.buyerAmount.toLocaleString()}원</p>
            <p>판매자 정산 금액: {summary.sellerAmount.toLocaleString()}원</p>
          </pre>
        )}

        {/* 법적 문제소지 안내 */}
        <TransactionNotice />

        <div className={styles.buttonGroup}>
          <button onClick={handleSubmit} className={styles.registerBtn}>
            등록하기
          </button>
          <button onClick={handleCancel} className={styles.cancelBtn}>
            등록취소
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </section>
  );
}