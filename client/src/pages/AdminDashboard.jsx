import DashboardStats from './DashboardStats';
import MatchList from './MatchList';
import UserList from './UserList';
import styles from '../css/Dashboard.module.css';

export default function AdminDashboard({ user }) {
  const isAdmin = user?.role === 'admin';

  return (
    <section className={styles.dashboard}>
      <h2 className={styles.tit}>관리자 페이지</h2>
      <DashboardStats />
      <MatchList isAdmin={isAdmin} />
      <UserList isAdmin={isAdmin} />      
    </section>
  );
}