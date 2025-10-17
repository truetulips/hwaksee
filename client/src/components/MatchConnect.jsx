import { useState } from 'react';
import axios from '../api/axios';
import styles from '../css/Posts.module.css';

export default function MatchConnect({ onMatched }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = localStorage.getItem('token');

  const handleConnect = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('⚠️ 매칭 코드를 입력해주세요.');
      return;
    }

    try {
      await axios.post('/match', { matchCode: trimmed }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setError('');
      setSuccess(true);
      setCode('');
      onMatched(); // ✅ 연결 성공 후 상태 반영
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'Invalid code') {
        setError('❌ 유효하지 않은 매칭 코드입니다.');
      } else {
        setError('🚫 매칭 실패. 다시 시도해주세요.');
      }
      setSuccess(false);
    }
  };

  return (
    <div>
      <h3>🔗 매칭 코드 입력</h3>

      <input
        type="text"
        placeholder="매칭 코드"
        value={code}
        onChange={e => setCode(e.target.value.toUpperCase())}
        className={styles.input}
      />

      <button onClick={handleConnect} className={styles.registerBtn}>
        연결하기
      </button>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>✅ 연결되었습니다!</p>}
    </div>
  );
}