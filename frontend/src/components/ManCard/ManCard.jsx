import React from "react";
import styles from "./../../styles/ManCard.module.scss";
import propTypes from "prop-types";

/**
 * Stonks Card
 *
 * @param {object} Props - Props for the card.
 * @param {string} Props.title - Title/Name of the Card.
 * @param {string} Props.socialRating - Social Rating for the Card.
 * @param {string} Props.nExp - Nearest expirtation
 * @param {string} Props.uncFees - Uncollected fees
 * @param {string[]} Props.coins - ICON/Image
 * @param {string} Props.Inflow - Inflow
 * @param {string} Props.Outflow - Outflow
 * @param {string} Props.TVL - TVL
 */
export default function Card({ title, socialRating, nExp, uncFees, coins, inflow, outflow, tvl }) {
	return (
		<div className={styles.card}>

			<div className={styles.top}>
				<div className={styles.reference}>
					<h2>{title}</h2>
				</div>
			</div>
			<div className={styles.info}>
				<div className={styles.stats}>
					<div>
						<p className={styles.socialRating}>
							Social Rating:{" "}
							<strong>
								<u>{socialRating}</u>
							</strong>
						</p>
						<p className={styles.time}>
							Nearest Expiration: <strong className={styles.apy}>{nExp}</strong>
						</p>
						<p className={styles.time}>
							Uncollected Fees:{" "}
							<strong className={styles.apy}>
								{uncFees} 
							</strong>
						</p>
					</div>
					<div>
						Inflow:{" "}
						<strong className={styles.apy}>
							{inflow} 
						</strong>
					</div>
				</div>

			</div>
				
			<div className={styles.coins}>
				{coins.map((coin) => (
					<img className={styles.coin} src={coin.imageURL} alt={coin.name} />
				))}
			</div>
			<div className={styles.buttons}>
				<button>Manage</button>
				<button>Info</button>
			</div>
		</div>
	);
}

Card.propTypes = {
	title: propTypes.string,
	handler: propTypes.string,
	socialRating: propTypes.string,
	apyW: propTypes.number,
	apyM: propTypes.number,
	coins: propTypes.arrayOf(propTypes.string),
	inflow: propTypes.string,
	outflow: propTypes.string,
	tvl: propTypes.string
};
