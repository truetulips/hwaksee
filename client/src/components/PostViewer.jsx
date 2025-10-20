import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from '../css/Posts.module.css';

import BuyerActions from './BuyerActions';
import SellerDispatchForm from './SellerDispatchForm';
import AdminActions from './AdminActions';
import MatchButton from './MatchButton';
import TransactionNotice from './TransactionNotice';

export default function PostViewer({ userRole, currentUserId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const token = localStorage.getItem('token');

  // ✅ 글 조회
  useEffect(() => {
    if (!id || id === 'admin') {
      navigate('/admin/posts'); // 잘못된 접근 방어
      return;
    }

    axios.get(`/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(() => navigate('/posts'));
  }, [id, navigate]);

  // ✅ 글 업데이트
  const updatePost = async (patchData) => {
    try {
      const res = await axios.patch(`/posts/${id}`, patchData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(res.data);
    } catch (err) {
      alert('업데이트 실패');
    }
  };

  // ✅ 매칭 처리
  const handleMatchCode = async () => {
    try {
      const res = await axios.post('/posts/match', { matchCode: post.matchCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPost(res.data.post);
      alert('매칭이 완료되었습니다!');
    } catch (err) {
      alert('매칭 실패: ' + (err.response?.data?.message || '서버 오류'));
    }
  };

  if (!post) return null;

  // ✅ 권한 및 역할 분기
  const isAuthor = post.author?.toString() === currentUserId;
  const isMatcher = post.matcher?.toString() === currentUserId;
  const isAdmin = userRole === 'admin';
  const canView = isAuthor || isMatcher || isAdmin;
  const canMatch = !post.matcher && !isAuthor && userRole === 'user';

  const isBuyer = (isAuthor && post.type === 'buyer') || (isMatcher && post.matcherRole === 'buyer');
  const isSeller = (isAuthor && post.type === 'seller') || (isMatcher && post.matcherRole === 'seller');
  const canCopyMatchCode = post.status === '등록' && post.matchCode;

  // ✅ 거래 완료 조건
  const isFullyCompleted =
    post.buyerStatus === '완료' &&
    post.sellerStatus === '완료' &&
    !!post.settlementAccount?.bank;

  // ✅ 배송 정보 노출 조건
  const shouldShowShippingInfo =
    isBuyer &&
    ['출고', '완료'].includes(post.buyerStatus) &&
    post.shipping?.courier &&
    post.shipping?.tracking &&
    post.sellerStatus === '발송';

  if (!canView) {
    return <div className={styles.main}>🚫 이 글에 접근할 수 없습니다.</div>;
  }

  // ✅ 상태 텍스트 및 색상 결정
  let statusText = '등록 중';
  let statusClass = styles.waiting;

  if (post.status === '매칭') {
    statusText = '거래 진행 중 >>';
    statusClass = styles.active;
  } else if (post.status === '완료') {
    statusText = '거래 완료';
    statusClass = styles.done;
  }

  return (
    <section>
      <div className={styles.card}>
        {/* 📄 글 정보 */}
        <h3>{post.title}</h3>
        <p>▶ 금액: {post.price.toLocaleString()}원</p>
        <a href={post.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
          🔗 물품 포스팅 보기
        </a>
        <p className={`${styles.status} ${statusClass}`}>{statusText}</p>

        {/* 🔗 매칭 코드 */}
        <div className={styles.matBox}>          
          {post.matchCode && (
            <p className={styles.codeBox}>
              ▶ 매칭 코드: <strong>{post.matchCode}</strong>
            </p>          
          )}

          {canCopyMatchCode && (
            <button className={styles.copyBtn} onClick={() => {
                if (navigator?.clipboard?.writeText) {
                  navigator.clipboard.writeText(post.matchCode)
                  .then(() => alert('📋 매칭코드가 복사되었습니다'))
                  .catch(() => alert('❌ 복사에 실패했습니다'));
                } else {
                  alert('❌ 이 브라우저에서는 복사 기능을 지원하지 않습니다');
                }
              }}
            >
              📋 코드 복사
            </button>
          )}
        </div>

        {/* 💰 수수료 안내 */}
        <pre className={styles.feeNotice}>
          <p>수수료: {post.feeAmount?.toLocaleString()}원</p>
          <p>구매자 결제 금액: {post.buyerAmount?.toLocaleString()}원</p>
          <p>판매자 정산 금액: {post.sellerAmount?.toLocaleString()}원</p>
          {/* <p>총 거래 금액: {post.totalAmount?.toLocaleString()}원</p> */}
        </pre>

        <TransactionNotice />

        {/* ✅ 거래 종료 안내 */}
        {isFullyCompleted && (
          <div className={styles.completeBanner}>
            🎉 거래가 완료되었습니다.
          </div>
        )}

        {/* 📊 상태 표시 */}
        {!isFullyCompleted && (
          <div className={styles.statusBox}>
            <p>🧾 구매자 상태: <strong>{post.buyerStatus || '진행 전'}</strong></p>
            <p>📦 판매자 상태: <strong>{post.sellerStatus || '진행 전'}</strong></p>

            {shouldShowShippingInfo && (
              <div className={styles.notice}>
                <p>🚚 배송 정보: {post.shipping.courier} / {post.shipping.tracking}</p>
              </div>
            )}
          </div>
        )}

        {/* 🎯 액션 영역 */}
        {!isFullyCompleted && (
          <div className={styles.actions}>
            {canMatch && <MatchButton onClick={handleMatchCode} />}

            {post.matcher && (
              <>
                {isAdmin && (
                  <AdminActions post={post} updatePost={updatePost} />
                )}

                {(isBuyer || isAdmin) && (
                  <BuyerActions post={post} updatePost={updatePost} />
                )}

                {(isSeller || isAdmin) && (
                  <SellerDispatchForm post={post} updatePost={updatePost} isAdmin={isAdmin} />
                )}
              </>
            )}
          </div>
        )}

        {/* ⬅️ 뒤로가기 */}
        <div className={styles.buttom_controll}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <i className={styles.arrowLeft}></i>뒤로가기
          </button>
        </div>
      </div>
    </section>
  );
}