import React from "react";
import Card from "../components/Card/Card";
import styles from "./../styles/Trade.module.scss";

export default function trade() {
	return (
		<div className={styles.trade}>
			<h1>Your Following</h1>
			<div className={styles.cardCarosel}>
				<span>{"<"}</span>
				<Card
					title="Bitcoin"
					handler="@bitcoin"
					img="/venus.svg"
					coins={[
						{
							alt: "bitcoin",
							imageURL: "/bitcoin.png",
						},
						{
							alt: "ethereum",
							imageURL: "/ethereum.svg",
						},
					]}
					socialRating="A"
					apyM={69}
					apyW={420}
				/>
				{/* <Card
					title="Bitcoin"
					handler="@bitcoin"
					img="/venus.svg"
					coins={[
						{
							alt: "bitcoin",
							imageURL: "/bitcoin.png",
						},
					]}
					socialRating="A"
					apyM={69}
					apyW={420}
				/>
				<Card
					title="Bitcoin"
					handler="@bitcoin"
					img="/venus.svg"
					coins={[
						{
							alt: "bitcoin",
							imageURL: "/bitcoin.png",
						},
					]}
					socialRating="A"
					apyM={69}
					apyW={420}
				/> */}
				<span>{">"}</span>
			</div>
		</div>
	);
}
