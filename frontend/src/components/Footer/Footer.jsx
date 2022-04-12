import styles from "./../../styles/Footer.module.scss"
export default function Footer(){
    // https://discord.gg/u9wMgBY
    // https://twitter.com/AlphaSerpentis_
    // https://twitter.com/OptionalFinance
    return(
        <div className={styles.footer}>
            <a className={styles.img} href="https://discord.gg/u9wMgBY">
                <img className={styles.l} src="/discord.svg" alt="Optional Finance Discord"/>
            </a>
            <a className={styles.img} href="https://twitter.com/OptionalFinance">
                <img className={styles.l} src="/twitter.svg" alt="Optional Finance Twitter" href="https://twitter.com/OptionalFinance"/>                
            </a>
            <a className={styles.img} href="https://github.com/Alpha-Serpentis-Developments/Project-Mimic">
                <img className={styles.l} src="/GitHub-Mark-64px.svg" alt="Optional finance github" />
            </a>
            <a className={styles.img} href="https://medium.com/@OptionalFinance">
                <img className={styles.l} src="/Medium.svg" alt="Optional finance medium" />
            </a>
        </div>
    )
}