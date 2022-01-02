import Card from "../components/Card/Card";
import styles from "../styles/Manager.module.scss";
export default function Manager()
{
    return(
        <div className={styles.main}>
            <div>
                <h1 className={styles.title}>Social tokens you manage </h1>
            </div>
            <div>
                <div>
                    <div className={styles.div}>
                        <p> Portfolio: </p>
                        { "$10,000.00" }
                    </div>
                    <div className={styles.div}>
                        <p> Social Rating: </p>
                        { "A" }
                    </div>
                </div>
            </div>
            <div>
                
            </div>
        </div>
    );
}