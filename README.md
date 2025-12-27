**Attention Wallet** is a secure, intuitive, and scalable wallet platform structured as a client-server application.  
It provides users with a seamless experience to interact with blockchain networks, manage accounts, send/receive transactions, and view transaction history.

---

##  Features

###  Client (Frontend)
- Clean UI/UX for managing accounts & transactions
- Wallet creation / import using secure key handling
- View balances & transaction history
- Send & receive digital assets
- Responsive design for mobile & desktop  
 Located in: `/client`

###  Server (Backend)
- REST API for handling wallet operations
- Secure transaction broadcasting
- Integration with blockchain nodes / providers
- Account & session management  
 Located in: `/server`

---

##  Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React / Vue / HTML + CSS + JS |
| Backend | Node.js / Express |
| Blockchain Integration | web3 / ethers |
| Security | JWT, Encryption, Secure Storage |
| Tools | Git, npm / yarn |

> *(Update the exact frameworks / libraries based on your code.)*

---

##  Getting Started

### Prerequisites
Make sure you have installed:

- Node.js (v16+)
- npm or yarn
- A blockchain provider (e.g., Infura, Alchemy, Geth, Metamask)

---

##  Installation

### 1. Clone the repository

```bash
git clone https://github.com/Ramasaikiran/Attention-Wallet.git
cd Attention-Wallet
````

---

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file:

```env
PORT=5000
RPC_PROVIDER_URL=<YOUR_BLOCKCHAIN_RPC_ENDPOINT>
JWT_SECRET=<YOUR_SECRET_KEY>
```

Start the backend:

```bash
npm start
```

Server runs at: `http://localhost:5000`

---

### 3. Setup the Client

```bash
cd ../client
npm install
```

Update environment variables if needed:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Client runs at: `http://localhost:3000`

---

##  Development

To contribute or enhance features:

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit & push
4. Open a Pull Request

---

##  Security

* Never store private keys in plaintext.
* Use environment variables for sensitive config.
* Backup your seed phrases securely.

---

##  Future Plans

 Wallet creation & import
 Transaction history UI
 Send/receive tokens
 Multi-chain support
 Wallet encryption at rest
 Browser extension version

---

##  License

Distributed under the **MIT License**.
