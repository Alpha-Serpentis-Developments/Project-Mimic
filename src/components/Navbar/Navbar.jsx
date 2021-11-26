import React from "react";
import styles from './../../styles/Navbar.module.scss'
import Link from 'next/link'

export default function Navbar() {
	return (
		<nav className={styles.navbar}>
			<img className={styles.icon} src="/optional.svg" width="50px" height="60px" />
			<div className={styles.links}>
				<Link href="/">
					<a>Home</a>
				</Link>
				<Link href="">
					<a>Trade</a>
				</Link>
				<Link href="">
					<a>Manager</a>
				</Link>
				<Link href="">
					<a>Docs</a>
				</Link>
			</div>
			<button className={styles.connectbtn}>Connect </button>
		</nav>
	);
}