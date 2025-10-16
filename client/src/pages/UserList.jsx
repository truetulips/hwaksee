import { useState, useEffect } from 'react';
import axios from '../api/axios';
import styles from '../css/Dashboard.module.css';

const ITEMS_PER_PAGE = 20;

export default function UserList({ isAdmin }) {
  const [users, setUsers] = useState([]);
  // const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const formatPhone = phone => phone?.slice(-8) || '정보 없음';

  useEffect(() => {
    axios.get('/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    .then(res => setUsers(res.data))
    .catch(err => console.error('사용자 불러오기 실패:', err));
  }, []);

  // const toggleSelect = id => {
  //   setSelected(prev =>
  //     prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  //   );
  // };

  const paginated = users.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className={styles.card}>
      <div className={styles.listHeader}>
        <h3>사용자 리스트</h3>
      </div>

      <div className={styles.listContainer}>
        <div className={styles.listRowHeader}>
          <div></div>
          <div className={styles.list_tt}>ID</div>
          <div className={styles.list_td}>활동일</div>
          <div className={styles.list_td}>작성글 수</div>
        </div>

        {paginated.map(user => (
          <div key={user._id.$oid} className={styles.listRow}>
            <div>
              {/* {isAdmin && (
                <input
                  type="checkbox"
                  checked={selected.includes(user._id.$oid)}
                  onChange={() => toggleSelect(user._id.$oid)}
                />
              )} */}
            </div>
            <div className={styles.list_tt}>{formatPhone(user.phone)}</div>
            <div className={styles.list_td}>{user.inactiveSince ? new Date(user.inactiveSince).toLocaleDateString('ko-KR') : '정보 없음'}</div>
            <div className={styles.list_td}>{user.postCount ?? 0}건</div>
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        {Array.from({ length: Math.ceil(users.length / ITEMS_PER_PAGE) }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? styles.activePage : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}