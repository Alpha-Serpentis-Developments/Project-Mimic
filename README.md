# Project Mimic (Optional)

Project Mimic (Optional) is a decentralized social trading platform that uses [Opyn v1](https://v1.opyn.co) and [Opyn v2](https://opyn.co) as the underlying on the Ethereum network. 

Optional allows option traders to become social traders or follow other social traders. Social traders on the platform can charge followers a fee to follow their moves whether by entry fee or a small profit cut.

Each social trading token has a unique style based on the trader's strategies. Followers can limit their risk to certain traders or tokens based on their predetermined moves.

# People Involved

**Amethyst C. (AlphaSerpentis)**
- Founder of Alpha Serpentis Developments
- Smart contract programmer of Mimic/Optional

**Yvonne**
- Frontend developer of Mimic/Optional

**Opyn**
- Decentralized options platform that built Convexity (v1) and Gamma (v2) powering Mimic/Optional.

# Using Optional via Frontend (optional.finance)

## As a Follower

1. Upon arriving at the website, clickt the "Start Trading" button at the center of the screen or "Trade" at the navbar on top.

2. On the right side, will be a list of available tokens to deposit to. Vaults marked with a red lock indicate you cannot withdraw your funds until the vault has settled or all the calls were burned. Vaults marked with a stopwatch indicates that the withdrawal window is open and allows any depositors to exit. Click the blue button on the respective vault you wish to interact with.

3. (OPTIONAL) When a new vault is created, it has no ratio set between the vault tokens and the asset tokens. As a result, it must be initialized. It can be initialized by anyone and will automatically be 1:1. Type in the amount of asset tokens (such as WETH) you want to deposit and confirm the approval and transaction.

4. On the right side, you'll see the option to the deposit the vault's asset token. Select the amount you want to deposit (be mindful of the units). Click Deposit and approve and confirm the transactions.

5. Congratulations! You've followed a user, now you 

## As a Social Trader / Manager

1. Instead of clicking the "Trade" button on the navbar, click the "Manager" button.

2. Under "Managed Tokens" will be a list of tokens that you currently manage. It will be blank if you have never deployed a token.

3. Below the list will be a button "New Token." Clicking it will prompt a list of fields to fill out such as the vault's name, vault's symbol, the max AUM you wish to manage, and the asset token address. Controller and Manager (your connected wallet) address is currently prefilled.

4. After filling out the fields, click "Deploy Token on [Network]" and confirm the transaction.

5. Congratulations! You are now under management of the vault and you bear the responsibility of depositor's assets.

6. (Continued) Under the "Manager" tab, select the vault that you are managing. Below, you can see three new options: "Write Call," "Sell Call," and "Settle Vault." Write Call enables you to write an X amount of calls, provided there's enough in the vault to collateralize them. Sell Call enables you to perform an AirSwap trade with premiums denominated in the asset token. Settle Vault is done at after the oToken has expired and the oracles have settled the vaults.

# Contributing

If you wish to contribute to the code, feel free to submit issues, pull requests, or reach out to me.

Discord: [Alpha Serpentis Developments Discord Server](https://discord.gg/M8Hs5Dg)

Twitter (Amethyst): [@AlphaSerpentis_](https://twitter.com/AlphaSerpentis_)

Twitter (Yvonne): [@LittleFish_Tech](https://twitter.com/LittleFish_Tech)

Twitter (Alpha Serpentis Developments): [@Official_ASDev](https://twitter.com/Official_ASDev)

# Notice

Project Mimic is in development, not currently audited, additional risks in the underlying code, and additional risks with the social trader.

**This is NOT investment advice! Options involve special risks and may not fit well for all investors. Do your own research!**
