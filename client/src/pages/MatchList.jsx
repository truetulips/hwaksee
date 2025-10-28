import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from '../css/Dashboard.module.css';

const ITEMS_PER_PAGE = 20;

export default function MatchList({ user }) {
  const [posts, setPosts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      setError('관리자만 거래글을 볼 수 있습니다.');
      return;
    }

    axios
      .get('/admin/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPosts(sorted);
      })
      .catch((err) => {
        console.error('거래글 불러오기 실패:', err);
        setError('거래글을 불러올 수 없습니다.');
      });
  }, [isAdmin]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelected(paginated.map((post) => post._id));
    } else {
      setSelected([]);
    }
  };

  const deleteSelected = async () => {
    try {
      await axios.post(
        '/admin/posts/bulk-delete',
        { ids: selected },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setPosts(posts.filter((p) => !selected.includes(p._id)));
      setSelected([]);
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');

  const sortBy = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);

    setPosts((prev) =>
      [...prev].sort((a, b) => {
        const valA = a[field] || '';
        const valB = b[field] || '';
        return newOrder === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      })
    );
  };

  const paginated = posts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.card}>
      <div className={styles.listHeader}>
        <h3>거래글 리스트</h3>
        {isAdmin && <button onClick={deleteSelected}>선택 삭제</button>}
      </div>

      {error ? (
        <p className={styles.error}>⚠️ {error}</p>
      ) : (
        <>
          <div className={styles.listContainer}>
            <div className={styles.listRowHeader}>
              <div>
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={
                    paginated.length > 0 &&
                    selected.length === paginated.length
                  }
                />
              </div>
              <div className={styles.list_title}>제목</div>
              <div
                className={styles.list_title}
                onClick={() => sortBy('sellerStatus')}
                style={{ cursor: 'pointer' }}
              >
                판매자 단계 ⬍
              </div>
              <div
                className={styles.list_title}
                onClick={() => sortBy('buyerStatus')}
                style={{ cursor: 'pointer' }}
              >
                구매자 단계 ⬍
              </div>
            </div>

            {paginated.map((post) => (
              <div
                key={post._id}
                className={styles.listRow}
                onClick={() => navigate(`/admin/posts/${post._id}`)}
              >
                <div>
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={selected.includes(post._id)}
                      onChange={() => toggleSelect(post._id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
                <div className={styles.list_tt}>{post.title}</div>
                <div className={styles.list_td}>{post.sellerStatus || ''}</div>
                <div className={styles.list_td}>{post.buyerStatus || ''}</div>
              </div>
            ))}
          </div>

          <div className={styles.pagination}>
            {Array.from(
              { length: Math.ceil(posts.length / ITEMS_PER_PAGE) },
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
        </>
      )}
    </div>
  );
}