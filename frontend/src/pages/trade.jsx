import React from "react";
import Card from "../components/Card/Card";
import { dummy } from "../components/Carosel/dummy";
import styles from "./../styles/Trade.module.scss";

export default function trade() {
	return (
		<div className={styles.trade}>
			<div className={styles.following}>
				<h1>Your Following</h1>
				<div className={styles.cardCarosel}>
					<button className={styles.controls}>
						<i className={"fa-solid fa-angle-left"} />
					</button>
					{dummy.map((card, index) => (
						<Card key={index} {...card} />
					))}
					<button className={styles.controls}>
						<i className={"fa-solid fa-angle-right"} />
					</button>
				</div>
			</div>
			<div className={styles.avaliable}>
				<h1>Avaliable Social Trades</h1>
				<div className={styles.cards}>
					<Card
						title="Venus"
						handler="@Venus"
						apyM="43"
						apyW="32"
						socialRating="B"
						coins={[
							{
								name: "Bitcoin",
								imageURL: "/bitcoin.png",
							},
						]}
						img={"venus.svg"}
						key={1}
					/>
					<Card
						title="Venus"
						handler="@Venus"
						apyM={43}
						apyW={32}
						socialRating="B"
						coins={[
							{
								name: "Ethereum",
								imageURL: "/ethereum.svg",
							},
							{
								name: "Bitcoin",
								imageURL: "/bitcoin.svg",
							},
						]}
						img={"venus.svg"}
						key={2}
					/>
					<Card
						title="Venus"
						handler="@Venus"
						apyM="43"
						apyW="32"
						socialRating="B"
						coins={[
							{
								name: "Bitcoin",
								imageURL: "/bitcoin.png",
							},
						]}
						img={"venus.svg"}
						key={3}
					/>
					<Card
						title="Venus"
						handler="@Venus"
						apyM="43"
						apyW="32"
						socialRating="B"
						coins={[
							{
								name: "Bitcoin",
								imageURL: "/bitcoin.png",
							},
						]}
						img={"venus.svg"}
						key={3}
					/>
					<Card
						title="Venus"
						handler="@Venus"
						apyM="43"
						apyW="32"
						socialRating="B"
						coins={[
							{
								name: "Bitcoin",
								imageURL: "/bitcoin.png",
							},
						]}
						img={"venus.svg"}
						key={3}
					/>
					<Card
						title="Venus"
						handler="@Venus"
						apyM="43"
						apyW="32"
						socialRating="B"
						coins={[
							{
								name: "Bitcoin",
								imageURL: "/bitcoin.png",
							},
						]}
						img={"venus.svg"}
						key={3}
					/>
					
				</div>
			</div>
		</div>
	);
}
