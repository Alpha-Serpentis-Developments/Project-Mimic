import React from "react";
import Head from "next/head";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer"

export default function Layout({ children }) {
	return (
		<>
			<Head>
				<title>Optional Finance</title>
				<meta name="description" content="Decentralized Vault Management for Options" />
				<meta content="Optional" property="og:title" />
				<meta content="Decentralized Vault Management for Options" property="og:description" />
				<meta content="https://optional.finance" property="og:url" />
				<meta content="/optional.png" property="og:image" />
				<meta content="#e1b0f2" data-react-helmet="true" name="theme-color" />
				<link rel="icon" href="/optional.svg" />
			</Head>
			<div className="container">
				<Navbar />
				{children}
				<Footer />
			</div>
		</>
	);
}
