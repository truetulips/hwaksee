import { useState } from 'react';
import styles from '../css/Posts.module.css';

export default function AdminActions({ post, updatePost }) {
  const [inspectionResult, setInspectionResult] = useState(post.inspectionResult || '');
  const [description, setDescription] = useState(post.inspectionDescription || '');
  const [courier, setCourier] = useState(post.shipping?.courier || '');
  const [tracking, setTracking] = useState(post.shipping?.tracking || '');

  const { buyerStatus, sellerStatus, inspectionResult: savedResult } = post;

  // ✅ 상태 업데이트 핸들러
  const updateStatus = async (type, nextStatus, extra = {}) => {
    const patch = type === 'buyer'
      ? { buyerStatus: nextStatus }
      : { sellerStatus: nextStatus, ...extra };

    try {
      await updatePost(patch);
      alert(`${type === 'buyer' ? '🧾 구매자' : '📦 판매자'} 상태가 '${nextStatus}'로 변경되었습니다.`);
    } catch (err) {
      alert(`${type === 'buyer' ? '구매자' : '판매자'} 상태 변경 실패: ${err.response?.data?.message || '서버 오류'}`);
    }
  };

  // ✅ 검사 결과 저장
  const handleInspectionSubmit = async () => {
    if (!inspectionResult) return alert('검사 결과를 선택해주세요.');
    if (inspectionResult === '이상' && !description.trim()) {
      return alert('이상 내용 설명을 입력해주세요.');
    }

    try {
      await updatePost({
        inspectionResult,
        inspectionDescription: inspectionResult === '이상' ? description : ''
      });
      alert('🧪 검사 결과가 저장되었습니다.');
    } catch (err) {
      alert('검사 결과 저장 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  // ✅ 송장 입력 및 출고 처리
  const handleShippingSubmit = async () => {
    if (!courier.trim() || !tracking.trim()) {
      return alert('택배사와 송장번호를 모두 입력해주세요.');
    }

    try {
      await updatePost({
        shipping: {
          courier,
          tracking,
          dispatchedAt: new Date()
        },
        buyerStatus: '출고'
      });
      alert('🚚 출고 처리 완료');
    } catch (err) {
      alert('출고 처리 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div className={styles.adminBox}>
      <h4>🛠️ 관리자</h4>

      {/* 🧾 구매자 흐름 */}
      <div className={styles.subBox}>
        <h5>🧾 구매자</h5>
        {buyerStatus === '입금' && (
          <button onClick={() => updateStatus('buyer', '입금확인')}>✅ 입금 확인</button>
        )}
        {buyerStatus === '입금확인' && (
          <button onClick={() => updateStatus('buyer', '물품확인')}>🔍 물품 확인 처리</button>
        )}
        {buyerStatus === '물품확인' && savedResult !== null && (
          <button onClick={() => updateStatus('buyer', '구매')}>🛒 구매자 구매 선택</button>
        )}
        {buyerStatus === '구매' && (
          <div className={styles.subBox}>
            <h5>🚚 송장 입력</h5>
            <input
              type="text"
              placeholder="택배사"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="송장번호"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className={styles.input}
            />
            <button onClick={handleShippingSubmit}>🚚 출고 처리</button>
          </div>
        )}
        {buyerStatus === '출고' && (
          <button onClick={() => updateStatus('buyer', '완료')}>🎉 물품 수령</button>
        )}
      </div>

      {/* 📦 판매자 흐름 */}
      <div className={styles.subBox}>
        <h5>📦 판매자</h5>
        {sellerStatus === '발송' && (
          <button onClick={() => updateStatus('seller', '입고', {
            shipping: { courier: '', tracking: '', dispatchedAt: null }
          })}>
            📥 입고 확인 (송장 초기화)
          </button>
        )}
        {sellerStatus === '입고' && (
          <button onClick={() => updateStatus('seller', '물품확인')}>🔍 물품 확인 처리</button>
        )}
        {sellerStatus === '물품확인' && (
          <>
            <label>
              🧪 물품 이상 유무:
              <select
                value={inspectionResult}
                onChange={(e) => setInspectionResult(e.target.value)}
                className={styles.input}
              >
                <option value="">선택하세요</option>
                <option value="정상">판매 사진과 동일함</option>
                <option value="이상">판매 사진과 상태와 구성품이 일치하지 않움</option>
              </select>
            </label>

            {inspectionResult === '이상' && (
              <textarea
                placeholder="판매 포스팅의 내용과 어떻게 다른지 서술"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={styles.textarea}
              />
            )}

            <button onClick={handleInspectionSubmit} className={styles.confirmBtn}>
              ✅ 검사 결과 저장
            </button>

            {savedResult !== null && (
              <button onClick={() => updateStatus('seller', '정산')}>💰 정산 확인</button>
            )}
          </>
        )}
        {sellerStatus === '정산' && (
          <button onClick={() => updateStatus('seller', '완료')}>🎉 정산 완료</button>
        )}
      </div>
    </div>
  );
}