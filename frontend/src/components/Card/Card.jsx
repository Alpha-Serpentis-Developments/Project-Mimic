import React from "react";
import styles from "./../../styles/Card.module.scss";
import propTypes from "prop-types";

/**
 * Stonks Card
 *
 * @param {object} Props - Props for the card.
 * @param {string} Props.title - Title/Name of the Card.
 * @param {string} Props.handler - Handler for the Card.
 * @param {string} Props.socialRating - Social Rating for the Card.
 * @param {number} Props.apyW - APY in one Week.
 * @param {number} Props.apyM - APY in one Month.
 * @param {string} Props.img - ICON/Image
 * @param {string[]} Props.coins - ICON/Image
 *
 */
export default function Card({ title, handler, img, socialRating, apyW, apyM, coins }) {
	return (
		<div className={styles.card}>
			<div className={styles.info}>
				<div className={styles.top}>
					<img className={styles.img} src={img} alt={title} />
					<div className={styles.reference}>
						<h2>{title}</h2>
						<h3>{handler}</h3>
					</div>
				</div>
				<p className={styles.socialRating}>
					Social Rating:{" "}
					<strong>
						<u>{socialRating}</u>
					</strong>
				</p>
			</div>
			<div className={styles.statsContainer}>
				<div className={styles.stats}>
					<div className={styles.coins}>
						{coins.map((coin, index) => (
							<img className={styles.coin} src={coin.imageURL} key={index} alt={coin.name} />
						))}
					</div>
					<p className={styles.time}>
						1-Week: <strong className={styles.apy}>{apyW} APY</strong>
					</p>
					<p className={styles.time}>
						1-Month:{" "}
						<strong className={styles.apy}>
							{apyM} APY
						</strong>
					</p>
				</div>
			</div>
			<div className={styles.buttons}>
				<button>Trade</button>
				<button>Info</button>
			</div>
		</div>
	);
}

Card.propTypes = {
	title: propTypes.string,
	img: propTypes.string,
	handler: propTypes.string,
	socialRating: propTypes.string,
	apyW: propTypes.number,	
	apyM: propTypes.number,
	coins: propTypes.arrayOf(propTypes.string),
};
