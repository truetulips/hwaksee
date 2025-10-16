import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from '../css/Header.module.css';

export default function Header({ user, onLogout }) {
    const navigate = useNavigate();
    const [isNavOpen, setIsNavOpen] = useState(false);

    const maskedPhone = user?.phone?.slice(-4);
    const isAdmin = user?.role === 'admin';
    const isManager = user?.role === 'manager';

    // ✅ 로그인 후 0.5초 뒤 nav 자동 열림
    useEffect(() => {
        if (user) {
        const timer = setTimeout(() => setIsNavOpen(true), 0);
        return () => clearTimeout(timer);
        } else {
        setIsNavOpen(false);
        }
    }, [user]);

    return (
        <header className={styles.header}>
        {/* 🔝 상단 헤더 */}
        <div className={styles.topBar}>
            <button className={styles.home} onClick={() => navigate('/')}><i className={styles.homeIcon}></i></button>
            <h1 className={styles.brand}>확see</h1>
            <div className={styles.auth}>
            {!user ? (
                <Link to="/login">로그인</Link>
            ) : (
                <button onClick={onLogout}>로그아웃</button>
            )}
            </div>
        </div>

        {/* 📌 자동 슬라이드 nav */}
        {user && (
            <nav className={`${styles.navBar} ${isNavOpen ? styles.open : ''}`}>
                <div className={styles.navLeft}>
                    <span><i className={styles.user}></i>{maskedPhone} 님</span>
                </div>

                <div className={styles.navCenter}>
                    <Link to="/About">서비스 소개</Link>
                    <Link to="/Process">진행 안내</Link>
                    <Link to="/">MyPosts</Link>
                </div>

                <div className={styles.navRight}>
                    {(isAdmin || isManager) && (
                    <Link to="/admin">관리자</Link>
                    )}
                </div>
            </nav>
        )}
        </header>
    );
}