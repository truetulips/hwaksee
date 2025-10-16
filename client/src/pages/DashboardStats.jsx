import { useEffect, useState } from 'react';
import axios from '../api/axios';
import styles from '../css/Dashboard.module.css';

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/admin/stats')
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ 관리자 통계 불러오기 실패:', err);
        setError('통계 데이터를 불러올 수 없습니다.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.statsBox}>📊 통계 데이터를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.statsBox}>🚨 {error}</div>;
  }

  return (
    <div className={styles.statsBox}>
      <ul className={styles.statsList}>
        <li>👥 유저: <strong>{stats.totalUsers}</strong></li>
        <li>📝 등록: <strong>{stats.totalPosts}</strong></li>
        <li>🤝 매칭: <strong>{stats.matchedPosts}</strong></li>
        <li>📦 발송: <strong>{stats.shippingInProgress}</strong></li>
        <li>✅ 완료: <strong>{stats.completedTransactions}</strong></li>
        {/* <li>🛑 정지된 사용자: <strong>{stats.bannedUsers}</strong></li> */}
      </ul>
    </div>
  );
}