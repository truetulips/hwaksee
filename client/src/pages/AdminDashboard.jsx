import DashboardStats from './DashboardStats';
import MatchList from './MatchList';
import UserList from './UserList';
import styles from '../css/Dashboard.module.css';

export default function AdminDashboard({ user }) {
  return (
    <section className={styles.dashboard}>
      <h2 className={styles.tit}>관리자 페이지</h2>
      <DashboardStats />
      <MatchList user={user} />
      <UserList user={user} />
    </section>
  );
}