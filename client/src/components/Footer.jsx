import React from 'react';
import '../css/Footer.css'; // 스타일 분리 추천

const Footer = () => {
    return (
        <footer className="footer">
        <div className="footer-content">
            <p>2025 Hwaksee All rights reserved.</p>
            <div className="footer-links">
                <p>사업자 : 742-35-00222</p>
                <p>통판증 : 2016-충북충주-241</p>
            </div>
            <a href="https://talk.naver.com/ct/W388KDO" target="_blank" rel="noopener noreferrer">네이버톡 문의</a>
        </div>
        </footer>
    );
};

export default Footer;