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
export default function Card({ title, handler, img, socialRating, apyW, apyM }) {
	return (
		<div className={styles.card}>
			<div className={styles.info}>
				<img src={img} alt={title} />
				<h2>{title}</h2>
				<h3>{handler}</h3>
				<p>
					Social Rating:{" "}
					<strong>
						<u>{socialRating}</u>
					</strong>
				</p>
			</div>
			<div className={styles.stats}>
                <p>r</p>
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
