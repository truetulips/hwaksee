import styles from '../css/Posts.module.css';

export default function TrackingStatus({ trackingInfo }) {
  if (!trackingInfo) return null;

  const { lastStateDetail, complete } = trackingInfo;

  return (
    <div className={styles.trackingBox}>
      <h5>📦 배송 상태</h5>
      <p>현재 위치: {lastStateDetail?.where}</p>
      <p>상태: {lastStateDetail?.kind}</p>
      <p>시간: {lastStateDetail?.timeString}</p>
      <p>배송 완료 여부: {complete ? '✅ 완료' : '⏳ 진행 중'}</p>
    </div>
  );
}