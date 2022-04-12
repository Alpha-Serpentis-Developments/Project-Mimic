import React, { useState } from "react";
import styles from "../../styles/Calculator.module.scss";

export default function Calculator() {
	const [amount, setAmount] = useState(0);
	const [method, setMethod] = useState(1);
	// TODO: Work on the Functionality of the Calculator
	return (
		<div className={styles.calculator}>
			<div className={styles.methods}>
				<div
					style={{ borderBottom: `${method === 1 ? "white" : "transparent"} 3px solid` }}
					onClick={() => setMethod(1)}
				>
					Withdraw
				</div>
				<div
					style={{ borderBottom: `${method === 2 ? "white" : "transparent"} 3px solid` }}
					onClick={() => setMethod(2)}
				>
					Deposit
				</div>
			</div>
			<div className={styles.function}>
				<div className={styles.inputWrapper}>
					<label htmlFor="amount">Amount</label>
					<div className={styles.input}>
						<input type="number" name="amount" id="amount" defaultValue={0} />
						<span>OPT-VENUS</span>
					</div>
				<p className={styles.estimate}>Est. Output: 0 ETH</p>
				</div>
				<button>Confirm</button>
			</div>
		</div>
	);
}
