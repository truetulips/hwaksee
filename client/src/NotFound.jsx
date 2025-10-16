import { useNavigate } from 'react-router-dom';
import styles from './css/Posts.module.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h2>🚫 연결되지 않은 경로입니다</h2>
      <p>이 페이지는 존재하지 않거나, 연결이 종료되었습니다.</p>
      <button onClick={() => navigate('/')} className={styles.submit}>
        🔙 홈으로 돌아가기
      </button>
    </div>
  );
}