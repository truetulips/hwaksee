import styles from '../css/Posts.module.css';

export default function TransactionNotice() {
  return (
    <ul className={styles.noticeBox}>
      <li>현금 영수증은 등록 된 전화번호(ID) 기준으로 요청시 발행됩니다.</li>
      <li>거래 불발 시 수수료는 취소 사유를 발생 시킨 쪽이 부담합니다.</li>
      <li>물품의 반송은 입금 후 처리됩니다.<br/><span className={styles.trans_fn}>(7일 이내 처리 진행되지 않을 시 거래 물품이 폐기될 수 있습니다.)</span></li>
      <li>전자 결제 시 결제 플렛폼 이용료 등으로 수수료가 붙습니다.</li>
      <li>전자 결제 시 판매자에 대한 정산 입금은 플렛폼으로부터 정산(평균 3일) 후 이루어집니다.</li>
    </ul>
  );
}
