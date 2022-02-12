import styles from "./../../styles/Footer.module.scss"
export default function Footer(){
    // https://discord.gg/u9wMgBY
    // https://twitter.com/AlphaSerpentis_
    // https://twitter.com/OptionalFinance
    return(
        <div className={styles.footer}>
            <a className={styles.img} href="https://discord.gg/u9wMgBY">
                <img className={styles.img} src="/discord.svg" alt="Optional Finance Discord"/>
            </a>
            <a className={styles.img} href="https://twitter.com/OptionalFinance">
                <img className={styles.img} src="/twitter.svg" alt="Optional Finance Twitter" href="https://twitter.com/OptionalFinance"/>                
            </a>
        </div>
    )
}