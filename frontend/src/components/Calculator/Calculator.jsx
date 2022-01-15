import React, { useState } from "react";
import styles from '../../styles/Calculator.module.scss'

export default function Calculator() {
	const [amount, setAmount] = useState(0);
	return (
		<div className={styles.calculator}>
			<div>
                <div>Withdraw</div>
                <div>Deposit</div>
            </div>
            <div>
                <label htmlFor="amount">Amount</label>
                <input type="number" name="amount" id="amount" />
            </div>
            <div>
                <button>Confirm</button>
            </div>
		</div>
	);
}
