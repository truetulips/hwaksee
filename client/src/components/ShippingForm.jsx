import styles from '../css/Posts.module.css';
import { courierList } from '../data/couriers';

export default function ShippingForm({ courier, tracking, setCourier, setTracking }) {
  return (
    <>
      <label>택배사 선택</label>
      <select value={courier} onChange={e => setCourier(e.target.value)} className={styles.input}>
        <option value="">택배사를 선택하세요</option>
        {courierList.map(({ code, name }) => (
          <option key={code} value={code}>{name}</option>
        ))}
      </select>

      <label>운송장 번호</label>
      <input
        type="text"
        value={tracking}
        onChange={e => setTracking(e.target.value)}
        placeholder="운송장 번호 입력"
        className={styles.input}
      />
    </>
  );
}
