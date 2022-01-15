import React from "react";
import Calculator from "../components/Calculator/Calculator";
import styles from "../styles/Vault.module.scss";

export default function Vault() {
	return (
		<div className={styles.vaultPage}>
			<div className={styles.left}>
				<div className={styles.information}>
					<h1>
						Social Trader Earth <span>0xBA5ED...</span>
					</h1>
					<p>
						The social trader token is managed by @OptionalFinance, a social trading platform designed for
						social traders
					</p>
				</div>
				<div className={styles.table}>
					<table>
						<tr className={styles.heading}>
							<td>Token</td>
							<td>Quantity</td>
							<td>Price</td>
							<td>Δ%</td>
							<td>Value</td>
						</tr>
						<tr className={styles.heading}>
							<td>Eth</td>
							<td>9854</td>
							<td>$69</td>
							<td>45%</td>
							<td>43958794759740</td>
						</tr>
					</table>
				</div>
			</div>
			<Calculator />
		</div>
	);
}
