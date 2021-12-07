/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @next/next/no-html-link-for-pages */
import Head from "next/head";
import styles from "../styles/Home.module.scss";

export default function Home() {
	return (
		<div>
			<main className={styles.main}>
				<h1 className={styles.title}>
					Decentralized Social<br/>Trading for Options
				</h1>
				<div className={styles.tagline}>
					<p className={`${styles.inline} ${styles.desc}`}>
						<span>You Deposit. They Trade.</span> <span className={styles.purp}>You Earn.</span>
					</p>
				</div>
				<button className={styles.launchbtn}>Launch App</button>
				<div className={styles.cardscontainer}>
					<div className={styles.cards}>
						<div className={styles.venusicon}>
							<img className={styles.venus} src="/venus_square 1.png"></img>
						</div>
						<div>
							<p className={styles.cardname}>Venus</p>
							<p className={styles.cardat}>@Venus</p>
						</div>
						<p>
							Social Rating:{" "}
							<strong>
								<u>B</u>
							</strong>
						</p>
					</div>
				</div>
				<p className={styles.title}>About Optional</p>
				<div>
					<div className={styles.optionsdesc}>
						<div>
							<p className={styles.optionstitle}> Exposure to Options</p>
							<p>
								Optional allows both social traders and their followers to expose themselves to the
								options market utilizing decentralized option protocols like Opyn.
							</p>
						</div>
						<div className={styles.optionsicon}>
							<img className={styles.opyn} src="/image 5.png"></img>
						</div>
					</div>
					<div className={styles.earndesc}>
						<div className={styles.earnicon}>
							<img className={styles.earn} src="/Vector.png"></img>
						</div>
						<div>
							<p className={styles.optionstitle}>
								{" "}
								Earn Yield for Followers,<br></br> Earn Fees for Yourself
							</p>
							<p>
								Social traders can earn fees for themselves in a variety of ways, especially if their
								performance is exceptional!
							</p>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
