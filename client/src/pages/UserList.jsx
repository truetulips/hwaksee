import { useState, useEffect } from 'react';
import axios from '../api/axios';
import styles from '../css/Dashboard.module.css';

const ITEMS_PER_PAGE = 20;

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatPhone = (phone) => phone?.slice(-8) || '정보 없음';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('/user/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          setError(res.data.message || '사용자 정보를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('사용자 불러오기 실패:', err);
        setError('사용자 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    formatPhone(user.phone).includes(searchTerm)
  );

  const paginated = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.card}>
      <div className={styles.listHeader}>
        <h3>사용자 리스트</h3>
        <input
          type="text"
          placeholder="전화번호 끝자리로 검색"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      {loading ? (
        <p>⏳ 사용자 정보를 불러오는 중입니다...</p>
      ) : error ? (
        <p className={styles.error}>⚠️ {error}</p>
      ) : paginated.length === 0 ? (
        <p>📭 사용자 정보가 없습니다.</p>
      ) : (
        <>
          <div className={styles.listContainer}>
            <div className={styles.listRowHeader}>
              <div></div>
              <div className={styles.list_tt}>ID</div>
              <div className={styles.list_td}>활동일</div>
              <div className={styles.list_td}>작성글 수</div>
            </div>

            {paginated.map((user) => (
              <div key={user._id} className={styles.listRow}>
                <div></div>
                <div className={styles.list_tt}>{formatPhone(user.phone)}</div>
                <div className={styles.list_td}>
                  {user.inactiveSince
                    ? new Date(user.inactiveSince).toLocaleDateString('ko-KR')
                    : '정보 없음'}
                </div>
                <div className={styles.list_td}>{user.postCount ?? 0}건</div>
              </div>
            ))}
          </div>

          {filteredUsers.length > ITEMS_PER_PAGE && (
            <div className={styles.pagination}>
              {Array.from(
                { length: Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? styles.activePage : ''}
                  >
                    {i + 1}
                  </button>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}