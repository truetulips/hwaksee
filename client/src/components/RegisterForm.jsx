import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from '../css/AuthForm.module.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [phoneExists, setPhoneExists] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [loading, setLoading] = useState(false);

  const formatPhone = value => {
    const onlyNums = value.replace(/\D/g, '').slice(0, 11);
    if (onlyNums.length < 4) return onlyNums;
    if (onlyNums.length < 8) return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`;
    return `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7)}`;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    const updated = name === 'phone' ? formatPhone(value) : value;
    setForm(prev => ({ ...prev, [name]: updated }));
  };

  useEffect(() => {
    const rawPhone = form.phone.replace(/\D/g, '');
    if (rawPhone.length !== 11) return;

    axios.get(`/auth/check-phone?phone=${rawPhone}`)
      .then(res => setPhoneExists(res.data.exists))
      .catch(() => console.error('전화번호 중복 확인 실패'));
  }, [form.phone]);

  useEffect(() => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    setPasswordValid(regex.test(form.password));
    setPasswordsMatch(form.password === form.confirmPassword);
  }, [form.password, form.confirmPassword]);

  const handleSubmit = async e => {
    e.preventDefault();
    const rawPhone = form.phone.replace(/\D/g, '');

    if (!passwordValid || !passwordsMatch || phoneExists || rawPhone.length !== 11) {
      alert('입력값을 다시 확인해주세요.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/auth/register', {
        phone: rawPhone,
        password: form.password
      });
      alert('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (err) {
      alert('회원가입 실패: ' + (err.response?.data?.message || '서버 오류'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section>
        <h2>회원가입</h2>

        <div className={styles.regFormbox}> 
          <label>전화번호</label>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="010-1234-5678"
            className={phoneExists ? styles.invalid : ''}
          />
          {phoneExists && <p className={styles.warn}>이미 등록된 번호입니다.</p>}

          <label>비밀번호</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="영문+숫자 6자 이상"
            className={form.password ? (passwordValid ? styles.valid : styles.invalid) : ''}
          />

          <label>비밀번호 확인</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            className={form.confirmPassword ? (passwordsMatch ? styles.valid : styles.invalid) : ''}
          />
          {!passwordsMatch && <p className={styles.warn}>비밀번호가 일치하지 않습니다.</p>}

          <button type="submit" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </div>
      </section>
    </form>
  );
}