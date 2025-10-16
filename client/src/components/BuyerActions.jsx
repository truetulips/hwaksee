import { useState } from 'react';
import styles from '../css/Posts.module.css';
import TrackingStatus from './TrackingStatus';
import imageLibrary from '../data/images';

export default function BuyerActions({ post, updatePost }) {
  const [paymentMethod, setPaymentMethod] = useState(post.paymentMethod || '');
  const [trackingInfo, setTrackingInfo] = useState(null);

  const { buyerStatus, inspectionResult, shipping } = post;

  // ✅ 상태 분기
  const canRequestDeposit = !buyerStatus || buyerStatus === '진행 전';
  const isWaitingForInspection = ['입금확인', '물품확인'].includes(buyerStatus) && inspectionResult === null;
  const canDecisionOnInspection = buyerStatus === '물품확인' && inspectionResult !== null;
  const canTrackShipping = buyerStatus === '출고' && shipping?.courier && shipping?.tracking;
  const canFinalize = buyerStatus === '출고';

  // ✅ 현금 입금 처리
  const handleDepositRequest = () => {
    if (!paymentMethod) {
      alert('결제 방식을 선택해주세요.');
      return;
    }
    updatePost({ buyerStatus: '입금', paymentMethod: 'cash' });
  };

  // ✅ 구매 / 취소 결정
  const handlePurchaseConfirm = () => updatePost({ buyerStatus: '구매' });
  const handleCancelPurchase = () => updatePost({ buyerStatus: '취소' });

  // ✅ 거래 완료
  const handleFinalize = () => updatePost({ buyerStatus: '완료' });

  // ✅ 배송 추적
  const fetchTracking = async () => {
    try {
      const res = await fetch(`/tracking?code=${shipping.courier}&invoice=${shipping.tracking}`);
      const data = await res.json();
      setTrackingInfo(data);
    } catch (err) {
      alert('배송 추적 실패: ' + (err.message || 'API 오류'));
    }
  };

  return (
    <div className={styles.actionBox}>
      <h4>🧾 구매자</h4>

      {/* ✅ 결제 방식 선택 및 입금 요청 */}
      {canRequestDeposit && (
        <>
          {/* <select
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value)}
            className={styles.input}
          >
            <option value="">결제 방식 선택</option>
            <option value="cash">현금 입금</option>
            <option value="pay">네이버페이</option>
          </select> */}

          {paymentMethod === 'cash' && (
            <div className={styles.notice}>
              <p><img
                  src={imageLibrary.find(img => img.id === 2).src}
                  alt={imageLibrary.find(img => img.id === 2).alt}
                  className={styles.notiBank}
                />
                <span onClick={() => {navigator.clipboard.writeText("100041715312");alert('📋 입금계좌가 복사되었습니다');
              }}> 1000-4171-5312</span> 이현
              </p>
              <p style={{ color: "#d65c5cff", marginLeft: "16px", marginBottom: "5px" }}><span style={{ fontSize: "12px" }}>📌</span>입금 후 "입금완료"를 꼭 눌러주세요!</p>{' '}
              <button onClick={handleDepositRequest} className={styles.confirmBtn}>입금완료</button>
            </div>
          )}

          {post.paymentMethod === 'pay' && post.smartstoreProductId && (
            <a
              href={`https://smartstore.naver.com/grinform/products/${post.smartstoreProductId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.confirmBtn}
            >
              결제하기
            </a>
          )}
        </>
      )}

      {/* ✅ 검사 결과 대기 중 */}
      {isWaitingForInspection && (
        <div className={styles.notice}>
          ⏳ 관리자가 물품을 확인 중입니다.
        </div>
      )}

      {/* ✅ 검사 결과 기반 구매 결정 */}
      {canDecisionOnInspection && (
        <div className={styles.notice}>
          <p>🔍 관리자 검사 결과: <strong>{inspectionResult}</strong></p>
          {post.inspectionDescription && (
            <p className={styles.descriptionBox}>
              <strong>설명:</strong> {post.inspectionDescription} <br />
              <span className={styles.small_noti}> ■ 판매자와 연락을 권합니다.</span>
            </p>
          )}
          <div className={styles.buttonGroup}>
            <button onClick={handlePurchaseConfirm} className={styles.confirmBtn}>✅ 구매</button>
            <button onClick={handleCancelPurchase} className={styles.confirmBtn}>❌ 취소</button>
          </div>
        </div>
      )}

      {/* ✅ 배송 추적 */}
      {canTrackShipping && (
        <div className={styles.buttonGroup}>
          <button onClick={fetchTracking}>🔍 배송 추적</button>
        </div>
      )}

      {/* ✅ 배송 추적 결과 */}
      {trackingInfo && <TrackingStatus trackingInfo={trackingInfo} />}

      {/* ✅ 거래 완료 */}
      {canFinalize && (
        <button onClick={handleFinalize} className={styles.confirmBtn}>
          🎉 물품수령
        </button>
      )}
    </div>
  );
}