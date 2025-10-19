import styles from '../css/Form.module.css';

export default function TrackingModal({ courier, tracking, onClose }) {
    const url = `https://info.sweettracker.co.kr/tracking/${courier}/${tracking}`;

    return (
        <div className={styles.overlay}>
        <div className={styles.modal}>
            <button onClick={onClose} className={styles.closeBtn}>✖</button>
            <iframe
            src={url}
            title="배송 추적"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
            />
        </div>
        </div>
    );
}