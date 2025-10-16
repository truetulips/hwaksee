import imageLibrary from '../data/images';
import styles from '../css/Info.module.css';

export default function About() {

    return (
        <section>
            <div className={styles.container}>
                <h3 style={{ margin: '3rem auto 0' }}>“사기꾼? 완전 차단!”</h3>
                <div>             
                    <img
                        src={imageLibrary.find(img => img.id === 1).src}
                        alt={imageLibrary.find(img => img.id === 1).alt}
                        style={{ width: '200px' }}
                    />
                </div>

                <h3><strong style={{color: "var(--color-notice)"}}>C2B2C</strong><em style={{color: "#888"}}>(Consumer to Business to Consumer)</em></h3>
                <p style={{marginTop:"-37px", color: "#999"}}>소비자-기업-소비자 의 구조를 가진 서비스</p>

                {/* <div className={styles.info}>
                    <p><span>One by One</span> 연결을 위한</p>
                    <p>최소한의 요소만을 구성합니다.</p>
                </div> */}

                <h3>“필요한 만큼만 존재한다”</h3>

                <div className={styles.info}>
                    <p>개인정보는 요구도 보관도 하지 않으며,</p>
                    <p>매칭되지 않은 글은 <span>7일 후</span> 삭제됩니다.</p>
                </div>

                <div className={styles.info}>
                    <p>거래가 완료된 글 또한 <span>7일 후</span> 사라지며,</p>
                    <p>활동(작성 글)이 없는 계정도 <span>7일 후</span> 정리됩니다.</p>
                    <p style={{ color: 'var(--color-notice)' }}><span>매쳐</span>는 작성 글로 취합되지 않습니다.</p>
                </div>

                <div className={styles.info}>
                    <p>해킹이 되어도 개인 정보가 없고, 기록도 남지 않아 안전하며,</p>
                    <p>필요할 때 다시 만드시면 됩니다.</p>
                </div>

                <h3 className={styles.beforeSunrise}>앞으로의 계획</h3>
                <ul className={styles.riseInfo}>
                    <li><strong>판매자 무료 택배 서비스 /</strong> 택배 수량이 충족되어 택배사와의 금액 조정이 원할해 진다면 판매자의 발송 택배비를 없애고 싶습니다.</li>
                    <li><strong>상세 점검 서비스 /</strong> 사진의 구성뿐만이 아닌, 상태<em>(전자기기라면 동작여부)</em> 점검까지도 진행하려고 합니다. - 구매자 요청시 진행하며 시간경과 예상</li>
                    <li><strong>크리닝 서비스 /</strong> 가능한 물품에 한해 유료 크리닝 서비스를 도입하고자 합니다.</li>
                    <li><strong>수리 서비스 /</strong> 최종 단계로 상시 수리 전문가를 분야별 배치하여 단순 물품 거래가 아닌 재생 활용의 단계까지 진행하고자 합니다.</li>
                </ul>
            </div>
        </section>
    );
}