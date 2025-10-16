import { useState } from 'react';
import axios from '../api/axios';
import styles from '../css/Posts.module.css';
import ShippingForm from './ShippingForm';
import TrackingStatus from './TrackingStatus';

export default function SellerDispatchForm({ post, updatePost, isAdmin }) {
  const token = localStorage.getItem('token');
  const sellerStatus = post.sellerStatus;
  const inspectionResult = post.inspectionResult;

  const [courier, setCourier] = useState(post.shipping?.courier || '');
  const [tracking, setTracking] = useState(post.shipping?.tracking || '');
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [bank, setBank] = useState(post.settlementAccount?.bank || '');
  const [account, setAccount] = useState(post.settlementAccount?.account || '');
  const isAccountSubmitted = !!post.settlementAccount?.bank;

  // ✅ 상태 분기
  const canInputShipping = sellerStatus === '진행 전';
  const canModifyShipping = sellerStatus === '발송';
  const isWaitingForInspection = ['입고', '물품확인'].includes(sellerStatus) && inspectionResult === null;
  const canSubmitAccount = sellerStatus === '물품확인' && inspectionResult === '정상' && !isAccountSubmitted;
  const canSubmitErr = sellerStatus === '물품확인' && inspectionResult === '이상' && !isAccountSubmitted;
  const canFinalize = sellerStatus === '정산';

  // ✅ 발송 처리
  const handleDispatch = async () => {
    if (!courier || !tracking) {
      alert('택배사와 운송장 번호를 모두 입력해주세요.');
      return;
    }

    try {
      await updatePost({
        sellerStatus: '발송',
        shipping: {
          courier,
          tracking,
          dispatchedAt: new Date()
        }
      });
      alert('📦 발송 처리 완료');
    } catch (err) {
      alert('송장 등록 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  // ✅ 송장 수정
  const handleTrackingUpdate = async () => {
    if (!courier || !tracking) {
      alert('송장 수정 시 택배사와 운송장 번호가 필요합니다.');
      return;
    }

    try {
      await updatePost({ shipping: { courier, tracking } });
      alert('✏️ 송장 정보가 수정되었습니다.');
      setIsEditing(false);
    } catch (err) {
      alert('송장 수정 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  // ✅ 배송 추적
  const fetchTracking = async () => {
    if (!courier || !tracking) {
      alert('배송 추적을 위해 택배사와 운송장 번호를 입력해주세요.');
      return;
    }

    try {
      const res = await axios.get(`/tracking?code=${courier}&invoice=${tracking}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrackingInfo(res.data);
    } catch (err) {
      alert('배송 추적 실패: ' + (err.response?.data?.message || 'API 오류'));
    }
  };

  // ✅ 정산 계좌 등록
  const handleAccountSubmit = async () => {
    if (!bank || !account) {
      alert('은행명과 계좌번호를 모두 입력해주세요.');
      return;
    }

    try {
      await updatePost({
        settlementAccount: { bank, account },
        sellerStatus: '정산'
      });
      alert('💰 정산 계좌가 등록되었습니다.');
    } catch (err) {
      alert('계좌 등록 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  return (
    <div className={styles.dispatchBox}>
      <h4>📦 판매자</h4>

      {/* 📦 송장 입력 */}
      {canInputShipping && (
        <>
          <ShippingForm
            courier={courier}
            tracking={tracking}
            setCourier={setCourier}
            setTracking={setTracking}
          />
          <button onClick={handleDispatch} className={styles.confirmBtn}>
            📦 발송 처리
          </button>
        </>
      )}

      {/* ✏️ 송장 수정 & 배송 추적 */}
      {canModifyShipping && (
        <>
          {!isEditing ? (
            <div className={styles.buttonGroup}>
              <button onClick={() => setIsEditing(true)}>✏️ 송장 수정</button>
              <button onClick={fetchTracking}>🔍 배송 추적</button>
            </div>
          ) : (
            <>
              <ShippingForm
                courier={courier}
                tracking={tracking}
                setCourier={setCourier}
                setTracking={setTracking}
              />
              <div className={styles.buttonGroup}>
                <button onClick={handleTrackingUpdate}>✅ 수정 완료</button>
                <button onClick={() => setIsEditing(false)}>❌ 취소</button>
              </div>
            </>
          )}
        </>
      )}

      {/* 🔍 배송 추적 결과 */}
      {canModifyShipping && trackingInfo && (
        <TrackingStatus trackingInfo={trackingInfo} />
      )}

      {/* ⏳ 검사 결과 대기 */}
      {isWaitingForInspection && (
        <div className={styles.notice}>
          ⏳ 관리자가 물품을 확인 중입니다.
        </div>
      )}
      {canSubmitErr && (
        <div className={styles.small_noti}>
          ■ 물품에 이상이 발견되었습니다. 구매자와 연락을 권합니다.
        </div>
      )}

      {/* 💰 정산 계좌 입력 */}
      {canSubmitAccount && (
        <div className={styles.notice}>
          <h5>💰 판매 대금을 받으실 계좌를 입력해 주세요</h5>
          <input
            type="text"
            placeholder="은행명"
            value={bank}
            onChange={(e) => setBank(e.target.value)}
            className={styles.input}
          />
          <input
            type="text"
            placeholder="계좌번호"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className={styles.input}
          />
          <button onClick={handleAccountSubmit} className={styles.confirmBtn}>
            ✅ 계좌 입력
          </button>
        </div>
      )}

      {/* 💳 정산 정보 표시 */}
      {sellerStatus === '정산' && (
        <div className={styles.notice}>
          <p>💳 결제 방식: {post.paymentMethod === 'card' ? '카드 결제' : '무통장입금'}</p>
          {post.settlementAccount?.bank && (
            <p>💰 정산 계좌: {post.settlementAccount.bank} / {post.settlementAccount.account}</p>
          )}
        </div>
      )}

      {/* 🎉 정산 확인 */}
      {canFinalize && (
        <button
          onClick={() => updatePost({ sellerStatus: '완료' })}
          className={styles.confirmBtn}
        >
          🎉 정산 확인
        </button>
      )}
    </div>
  );
}