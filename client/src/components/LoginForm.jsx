import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from '../css/Form.module.css';

export default function LoginForm({ onLogin }) {
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // ✅ 계정 정리 조건: 거래 완료된 글만 남아있을 때
  const checkUserPosts = async (token) => {
    try {
      const res = await axios.get('/posts/my', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const posts = res.data;

      const hasActivePost = posts.some(post => {
        const matched = post.matcher !== null;
        const buyerDone = post.buyerStatus === '완료';
        const sellerDone = post.sellerStatus === '완료';
        return matched && (!buyerDone || !sellerDone);
      });

      if (!hasActivePost) {
        await axios.patch('/users/mark-inactive', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('🕒 계정 정리 예약됨 (거래 완료된 글만 존재)');
      }
    } catch (err) {
      console.warn('⚠️ 계정 정리 확인 실패:', err.message);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', form);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      onLogin(user);
      navigate('/');

      await checkUserPosts(token);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === '존재하지 않는 사용자입니다.') {
        setError(msg); // 그대로 출력
      } else if (msg === '비밀번호가 틀렸습니다.') {
        setError(msg);
      } else {
        setError(msg || '로그인 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section>
        <h2>로그인</h2>

        <div className={styles.regFormbox}>
          <input
            type="text"
            name="phone"
            placeholder="전화번호"
            value={form.phone}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className={styles.toggle}
            >
              {showPassword ? '🙈 숨기기' : '👁️ 암호보기'}
            </button>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit">로그인</button>
        </div>
      </section>
    </form>
  );
}