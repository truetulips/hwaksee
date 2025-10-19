import styles from '../css/Posts.module.css';
import { courierList } from '../data/couriers';

export default function ShippingForm({ courier, tracking, setCourier, setTracking }) {
  return (
    <div className={styles.shippingForm}>
      <div className={styles.formGroup}>
        <label htmlFor="courier">택배사 선택</label>
        <select
          id="courier"
          value={courier}
          onChange={(e) => setCourier(e.target.value)}
          className={styles.input}
        >
          <option value="">택배사를 선택하세요</option>
          {courierList.map(({ code, name }) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="tracking">운송장 번호</label>
        <input
          id="tracking"
          type="text"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="운송장 번호 입력"
          className={styles.input}
          maxLength={20}
        />
      </div>
    </div>
  );
}
