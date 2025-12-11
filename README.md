# FS Application Example FE

### Part 1

Implement a NestJS application that:

- Using [Alchemy Webhooks](https://www.alchemy.com/docs/reference/webhooks-overview) to listen for ERC20 Transfer events and notify via HTTP our NestJS application
- NestJS application to store the received data in a DB(MongoDB, PostgreSQL, etc)
- Implement GET endpoint that returns transaction history with the following filters:
    - Symbol
    - Sender
    - Receiver
    - Timeframe
    - Pagination
- Implement and endpoint that is returning information about the token per address:
    - Filter: contract address
    - Response: token symbol, token decimals, total supply(parsed)

Use the following ERC20 tokens:

- [Sepolia USDC](https://sepolia.etherscan.io/token/0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238)
- [Sepolia EURC](https://sepolia.etherscan.io/token/0x08210f9170f89ab7658f0b5e3ff39b0e03c594d4)