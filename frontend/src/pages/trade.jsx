import React, { useRef } from "react";
import Card from "../components/Card/Card";
import { dummy } from "../components/Carosel/dummy";
import styles from "./../styles/Trade.module.scss";

export default function Trade() {
	const tradeRef = useRef(null);

	const scrollLeft = () => {
		if (tradeRef.current) {
			tradeRef.current.scrollBy({
				top: 0,
				left: 480,
				behavior: "smooth",
			});
		}
	};
	const scrollRight = () => {
		if (tradeRef.current) {
			tradeRef.current.scrollBy({
				top: 0,
				left: -480,
				behavior: "smooth",
			});
			console.log(tradeRef.current);
		}
	};
	return (
		<div className={styles.trade}>
			<div className={styles.following}>
				<h1>Your Following</h1>
				<div className={styles.cardCarosel}>
					<button className={styles.controls} onClick={() => scrollRight()}>
						<i className={"fa-solid fa-angle-left"} />
					</button>
					<div className={styles.cards} ref={tradeRef}>
						{dummy.map((card, index) => (
							<div className={styles.followCard} key={index}>
								<Card key={index} {...card} />
							</div>
						))}
					</div>
					<button className={styles.controls} onClick={() => scrollLeft()} disabled={false}>
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
