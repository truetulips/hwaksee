import { useParams, useNavigate } from 'react-router-dom';
import PostViewer from '../components/PostViewer';

export default function PostDetailPage({ user }) {
  const { id } = useParams(); // URL에서 글 ID 추출
  const navigate = useNavigate();

  // 사용자 정보가 없거나 잘못된 경우 방어 처리
  if (!user || !user._id || !user.role) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>🚫 사용자 정보가 확인되지 않았습니다.</h2>
        <p>로그인 후 다시 시도해주세요.</p>
      </div>
    );
  }

  // 잘못된 ID가 들어왔을 경우 (예: 'admin' 같은 문자열)
  const isInvalidId = !id || id.length < 12 || id === 'admin'; // ObjectId는 최소 12자
  if (isInvalidId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>⚠️ 잘못된 글 ID입니다.</h2>
        <p>글을 찾을 수 없습니다. <button onClick={() => navigate('/')}>홈으로</button></p>
      </div>
    );
  }

  return (
    <section>
      <h2 style={{ marginBottom: '20px' }}>글 상세보기</h2>
      <PostViewer
        postId={id}                // 글 ID 전달
        userRole={user.role}       // 'user' 또는 'admin'
        currentUserId={user._id}   // 로그인한 사용자 ID
      />
    </section>
  );
}
