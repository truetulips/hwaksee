import styles from '../css/Info.module.css';

export default function Process() {
    return (
        <section>
            <div className={styles.container}>
                <h3 className={styles.tit}>진행 안내</h3>
                <div>
                    <ul className={styles.process}>
                        <li>
                            <dl>
                                <dt>물품 검색<span style={{ fontSize: '12px', color: '#777' }}> : 다른 서비스에서</span></dt>
                                <dd>판매자, 구매자 모두 원하시는 물품을 원하시는 곳에서 찾는 과정</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>매칭</dt>
                                <dd>작성자가 역활을 선택하고 생성된 코드를 전달하며, 상대자가 코드로 매칭하여 반대 역활이 됩니다.</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>진행 전</dt>
                                <dd>매칭이 완료되어 각자 역활, 거래가, 수수료를 확인하는 단계</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>발송/입금</dt>
                                <dd>판매자는 물품을 발송, 구매자는 약속된 방식으로 결제를 진행합니다.</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>입고/입금확인</dt>
                                <dd>물품의 센터입고, 구매 금액의 입금 확인을 관리자가 처리합니다.</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>물품확인</dt>
                                <dd>링크된 게시글을 기준으로 관리자가 물품의 구성품과 상태를 확인합니다.</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>정산/출고</dt>
                                <dd>물품에 이상이 없고, 구매자가 구매를 확정지으면 정산과 출고가 이루어집니다.</dd>
                            </dl>
                        </li>
                        <li>
                            <dl>
                                <dt>완료</dt>
                                <dd>판매자에게 정산금 입금, 구매자에게 물품이 도착한 상태.</dd>
                                <dd>7일 후 글 삭제, 작성 글이 없을 시 계정도 삭제</dd>
                            </dl>
                        </li>
                    </ul>
                </div>
            </div>
        </section>
    );
}