import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PostRegister from '../components/PostRegister';
import PostList from '../components/PostList';
import axios from '../api/axios';
import styles from '../css/Posts.module.css';

export default function MyPosts({ user }) {
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [matchCodeInput, setMatchCodeInput] = useState('');
  const [availablePosts, setAvailablePosts] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // ✅ 글 조회
  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get('/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allPosts = res.data;

      const myPosts = allPosts.filter(post =>
        post.author === user._id ||
        post.matcher === user._id ||
        user.role === 'admin'
      );

      const matchablePosts = allPosts.filter(post =>
        post.author !== user._id && !post.matcher
      );

      setPosts(myPosts);
      setAvailablePosts(matchablePosts);
    } catch (err) {
      console.error('글 불러오기 실패:', err.message);
    }
  }, [user._id, user.role, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ✅ 글 등록
  const handlePostCreated = newPost => {
    setPosts(prev => [newPost, ...prev]);
    setShowForm(false);
  };

  // ✅ 글 수정
  const handleUpdate = updatedPost => {
    setPosts(prev =>
      prev.map(post => post._id === updatedPost._id ? updatedPost : post)
    );
  };

  const handleRefresh = () => {
    fetchPosts();
  };

  // ✅ 매칭코드 입력
  const handleMatchCode = async (code) => {
    if (!code || code.length < 4) {
      alert('매칭코드를 정확히 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post('/posts/match', { matchCode: code }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('매칭 성공!');
      navigate(`/posts/${res.data.post._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || '서버 오류';
      alert(`매칭 실패: ${msg}`);
    }
  };

  return (
    <section>
      <div className={styles.container}>
        <h2 className={styles.tit}>My Posts</h2>

        {/* 등록 버튼 */}
        <button
          onClick={() => setShowForm(prev => !prev)}
          className={styles.registerBtn}
        >
          {showForm ? '등록취소' : '물품등록'}
        </button>

        {/* 글 등록 폼 */}
        {showForm && (
          <PostRegister
            onPostCreated={handlePostCreated}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* 내 글 목록 */}
        {posts.length > 0 && (
          <PostList
            posts={posts}
            currentUserId={user._id}
            userRole={user.role}
            onRefresh={handleRefresh}
            onUpdate={handleUpdate}
          />
        )}

        {/* 매칭코드 입력 */}
        <div className={styles.matchBox}>
          <h3><i className={styles.matchButton} style={{ color: '#000', marginTop: '12px' }}></i>매칭코드로 연결하기</h3>
          <input
            type="text"
            value={matchCodeInput}
            onChange={e => setMatchCodeInput(e.target.value.toUpperCase())}
            placeholder="매칭코드를 입력하세요"
            className={styles.input}
          />
          <button onClick={() => handleMatchCode(matchCodeInput)}>
            <i className={styles.matchButton}></i>매칭하기
          </button>
        </div>

        {/* 관리자 테스트용 매칭글 */}
        {user.role === 'admin' && (
          <>
            <h3>🧪 매칭 가능한 글 (테스트용)</h3>
            {availablePosts.length === 0 ? (
              <p>현재 매칭 가능한 글이 없습니다.</p>
            ) : (
              <div className={styles.matchList}>
                {availablePosts.map(post => (
                  <div key={post._id} className={styles.card}>
                    <h4>{post.title}</h4>
                    <p>금액: {post.price.toLocaleString()}원</p>
                    <p>매칭코드: <strong>{post.matchCode}</strong></p>
                    <button onClick={() => handleMatchCode(post.matchCode)}>
                      🤝 매칭하기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}