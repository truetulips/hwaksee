import { useEffect, useState } from 'react';
import styles from '../css/Form.module.css';

export default function TrackingModal({ courier, tracking, onClose }) {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
        const apiKey = process.env.REACT_APP_SWEETTRACKER_API_KEY;

        if (!apiKey) {
            setError('API Key가 설정되지 않았습니다.');
            return;
        }

        try {
            const res = await fetch(
            `https://info.sweettracker.co.kr/api/v1/trackingInfo?t_key=${apiKey}&t_code=${courier}&t_invoice=${tracking}`
            );
            const data = await res.json();

            if (data.status && data.invoiceNo) {
            setStatus(data);
            } else {
            setError('배송 정보를 찾을 수 없습니다.');
            }
        } catch (err) {
            setError('배송 정보를 불러오는 중 오류가 발생했습니다.');
        }
        };

        fetchStatus();
    }, [courier, tracking]);

    return (
        <div className={styles.overlay}>
        <div className={styles.modal}>
            <button onClick={onClose} className={styles.closeBtn}>✖</button>
            <h4>📦 배송 추적</h4>

            {error && <p className={styles.error}>{error}</p>}

            {!error && !status && (
            <p>⏳ 배송 정보를 불러오는 중입니다...</p>
            )}

            {status && (
            <div className={styles.statusBox}>
                <p>🚚 택배사: {status.courierName}</p>
                <p>📄 송장번호: {status.invoiceNo}</p>
                <p>📍 현재 상태: <strong>{status.status}</strong></p>
                <p>🕒 최근 위치: {status.lastDetail?.location} ({status.lastDetail?.time})</p>
            </div>
            )}
        </div>
        </div>
    );
}