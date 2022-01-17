import React, { useState } from "react";
import styles from "../../styles/Calculator.module.scss";

export default function Calculator() {
	const [amount, setAmount] = useState(0);
	return (
		<div className={styles.calculator}>
			<div className={styles.methods}>
				<div style={{ borderBottom: "white 3px solid" }}>Withdraw</div>
				<div style={{ borderBottom: "white 3px solid" }}>Deposit</div>
			</div>
			<div className={styles.function}>
				<div>
					<label htmlFor="amount">Amount</label>
					<input type="number" name="amount" id="amount" />
                    <span></span>
				</div>
				<div>
					<button>Confirm</button>
				</div>
			</div>
		</div>
	);
}
