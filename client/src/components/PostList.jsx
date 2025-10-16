import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import styles from '../css/Posts.module.css';

export default function PostList({ posts, currentUserId, userRole, onRefresh }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // ✅ 글 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  // ✅ 매칭 처리
  const handleMatch = async (id) => {
    try {
      await axios.patch(`/posts/${id}`, { matcher: currentUserId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      alert('매칭 실패');
    }
  };

  // ✅ 빈 리스트 처리
  if (!posts || posts.length === 0) {
    return <p className={styles.empty}>표시할 매칭글이 없습니다.</p>;
  }

  return (
    <div className={styles.grid}>
      {posts.map(post => {
        const isAuthor = post.author === currentUserId;
        const isAdmin = userRole === 'admin';
        const isMatched = !!post.matcher;

        const isDeletable = !isMatched && (isAuthor || isAdmin);
        const canMatch = !isMatched && !isAuthor && userRole === 'user';

        // ✅ 상태 텍스트 및 색상 결정
        let statusText = '등록 중';
        let statusClass = styles.waiting;

        if (post.status === '매칭') {
          statusText = '거래 진행 중 >>';
          statusClass = styles.active;
        } else if (post.status === '완료') {
          statusText = '거래 완료';
          statusClass = styles.done;
        }

        return (
          <div
            key={post._id}
            className={styles.card}
            onClick={() => navigate(`/posts/${post._id}`)}
          >
            {/* ❌ 삭제 버튼 */}
            {isDeletable && (
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(post._id);
                }}
              >
                ❌
              </button>
            )}

            {/* 📄 글 정보 */}
            <h3 className={styles.postT}>{post.title}</h3>
            <p>{post.price.toLocaleString()}원</p>
            <p className={`${styles.status} ${statusClass}`}>{statusText}</p>

            {/* 🤝 매칭 버튼 */}
            {canMatch && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMatch(post._id);
                }}
              >
                <i className={styles.matchButton}></i>매칭하기
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}