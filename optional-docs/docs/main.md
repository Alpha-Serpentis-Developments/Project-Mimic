---
id: home
slug: /
---
# Optional Finance

Optional is a decentralized social trading platform utilizing Opyn's Gamma protocol to serve social traders European-style options on the Ethereum network.

Optional allows option traders to become social traders or follow other social traders. Social traders on the platform can charge followers fees via deposit, withdrawal, and performance fees.

# Products

## Mercury (v0.1)

Mercury is Optional's preliminary run of the platform. Mercury only had the ability to write covered calls and was unable to charge fees at both the protocol and social token-level. The design is agnostic to use any collateral asset to write covered calls with (provided Opyn supported it).

**Mercury will not be covered in the documentation.**

## Venus (v0.2)

Venus is the latest version of our platform that supports both covered calls and put selling. It addresses various UX issues + security enhancements from what we learned about Mercury. In addition, it is able to charge fees at both the protocol and social token-level from deposits, withdrawals, and performance.

Venus uses EIP1167 (minimal proxies) to allow for cheaper deployments for social traders. With minimal proxies, Optional is not allowed to upgrade vaults, but we are able to change the implementation in which new proxies use.

# Socials

Twitter: [@OptionalFinance](https://twitter.com/OptionalFinance)

Discord: [discord.optional.finance](https://discord.optional.finance)