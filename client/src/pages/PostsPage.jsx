import { useEffect, useState } from 'react';
import PostList from '../components/PostList';
import axios from '../api/axios';
import styles from '../css/Posts.module.css';

export default function PostsPage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('❌ 글 목록 조회 실패:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading || !user || !user._id || !user.role) {
    return <div className={styles.main}>글 목록을 불러오는 중...</div>;
  }

  return (
    <div className={styles.main}>
      <h2>전체 매칭글</h2>
      <PostList
        posts={posts}
        currentUserId={user._id}
        userRole={user.role}
        onRefresh={fetchPosts}
      />
    </div>
  );
}