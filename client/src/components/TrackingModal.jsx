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
            console.log('📦 SweetTracker 응답:', data);

            if (data.invoiceNo && data.lastDetail) {
            setStatus(data);
            } else {
            setError(data.msg || '배송 정보를 찾을 수 없습니다.');
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
            <button onClick={onClose} className={styles.closeBtn}>❌</button>
            <h4>📦 배송 추적</h4>

            {error && <p className={styles.error}>{error}</p>}

            {!error && !status && (
            <p>⏳ 배송 정보를 불러오는 중입니다...</p>
            )}

            {status && (
            <div className={styles.statusBox}>
                {/* <p>택배사: {status.courierName}</p> */}
                <p>송장번호: {status.invoiceNo}</p>
                <p>배송물품: {status.itemName}</p>
                {status.lastDetail && (
                <div className={styles.trackdetail}>
                    <p>최근 위치: {status.lastDetail.where}</p>
                    <p>처리 내용: {status.lastDetail.kind}</p>
                    <p>처리 시각: {status.lastDetail.timeString}</p>
                </div>
                )}
            </div>
            )}
        </div>
        </div>
    );
}