import Card from "../components/Card/Card";
import styles from "../styles/Manager.module.scss";
export default function Manager()
{
    return(
        <div className={styles.main}>
        
            <h1 className={styles.title}>Social tokens you manage </h1>
            <div className={styles.container}>
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

                <div className={styles.managediv}>
                    <div className={styles.flex}>
                        <p className={styles.bold}>Time</p>
                        <p> 1-WK </p>
                        <p> 3-WK </p>
                        <p> 3-MO </p>
                    </div>
                    <div className={styles.flex}>
                        <p className={styles.bold}> Inflow </p>
                        <p> $500.00 </p>
                        <p> $500.00 </p>
                        <p> $500.00 </p>
                    </div>
                    <div className={styles.flex}>
                        <p className={styles.bold}> Outflow </p>
                        <p> $230.00 </p>
                        <p> $230.00 </p>
                        <p> $230.00 </p>
                    </div>
                    <div className={styles.flex}>
                        <p className={styles.bold}> Fees </p>
                        <p> $230.00 </p>
                        <p> $230.00 </p>
                        <p> $230.00 </p>
                    </div>
                </div>
            </div>
        </div>
    );
}