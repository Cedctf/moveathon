# Asseta 🏡

**Reimagining assets by enabling real-world items to live, trade, and evolve on-chain through verifiable identity, one-time proof, and decentralized finance mechanics**

Asseta is a next-generation RWA infrastructure that brings physical assets into the digital world with trust and liquidity. Users begin by verifying their identity, anchoring it securely on-chain. Assets are then introduced with a unique, one-time proof mechanism—ensuring authenticity and preventing duplication.

Each asset becomes a living digital entity through NFT minting, and is instantly linked to a dynamic token economy that allows market exposure, and full tradability. Investors can engage in open liquidity pools, hedge their positions, or speculate via long/short strategies, all while retaining confidence in the origin and integrity of the underlying asset.

# How We Came Up With This Idea 💡

The inspiration behind Asseta came from a simple question: *"Why can't I trade a real-world asset the same way I trade a token?"*

While crypto markets offer instant liquidity, leveraged positions, and seamless swaps, real-world assets remain locked in legal frameworks, paper documents, and third-party approvals. Even when tokenized, they're often untradeable.

One of our friends wanted to short the real estate market not through a synthetic index, but by betting against a specific property backed token but the infrastructure wasn't there. There was no way to prove the asset was real, unique, or legally tied to a digital token—let alone to open a long/short position on it.

So we thought: *What if we could verify a real-world asset just once, mint it as an NFT, link it to a fungible token, and open a trading market around it?* A place where:

- Traders can long or short tokenized houses.
- Each asset is guaranteed to be unique using IOTA's One-Time Witness.
- Every participant is verified through on-chain KYC.
- Liquidity pools provide real-time pricing and capital efficiency.

# The Problem ⚠️

Real-world assets remain largely absent from decentralized finance not due to lack of demand, but because the infrastructure to bring them on-chain **tradably** does not exist.

Most attempts at asset tokenization fall short due to a combination of deep-rooted issues:

- **No verifiable uniqueness**: Anyone can mint a token claiming ownership of a physical item. Without a trustless proof of asset origin, duplication and fraud are inevitable.
- **No link between identity and asset ownership**: Anonymous wallets may hold asset tokens, but there's no on-chain tie to real-world individuals who own or control the underlying asset.
- **Lack of financial utility**: Even when tokenized, assets are static and users can't long/short, or dynamically interact with their value.
- **Over reliance on centralized validation**: Most platforms still depend on third parties to verify ownership, introducing trust assumptions.
- **Fragmented workflows**: KYC, verification, minting, trading, and liquidity provisioning are often spread across multiple systems with no unified flow.

These gaps make RWA integration into DeFi risky.

## How Our Project Works 🛠️

1. **User Onboarding via IOTA Wallet**
   - **Wallet Login:** Users begin by connecting their IOTA wallet to the platform.

2. **KYC Verification & Identity Minting**
   - **KYC Submission:** Users complete a Know Your Customer (KYC) process using a regulated identity provider to confirm their legal identity and ownership rights.
   - **On-Chain Identity (DID):** After passing KYC, a decentralized identifier (DID) is minted and permanently linked to the user's IOTA wallet, forming the root of all asset ownership and activity on the platform.

3. **Asset Listing & One-Time Verification**
   - **Asset Submission:** Users submit asset details, proof of ownership, and any supporting documentation.
   - **IOTA One-Time Witness:** Each asset undergoes one-time validation using IOTA's One-Time Witness mechanism, ensuring it can only be listed once.

4. **NFT Minting & Tokenization**
   - **NFT Creation:** A unique NFT is minted to represent the verified physical asset.
   - **Fungible Token Mapping:** The NFT is linked than to a fungible token allowing for broader participation and liquidity.

5. **Liquidity Pool Deployment & Trading Access**
   - **Pool Creation:** Users launch a liquidity pool pairing the asset token with a stable or volatile token (e.g., USDC, IOTA).
   - **Open Participation:** Anyone can supply liquidity or interact with the token, enabling active market engagement.

6. **Long/Short Trading Mechanics**
   - **Speculative Market Access:** Traders can take long or short positions on the asset token's value, unlocking hedging, leverage, and real-time market sentiment.
   - **Decentralized Price Discovery:** Asset prices are continuously updated using oracle feeds, providing real-time datas that reflect both on-chain activity and off-chain market data.

## System Architecture 🏗️

Below is the high-level architecture of the Asseta platform:

![Asseta System Architecture](/public/Architecture.png)

The architecture illustrates how all components of our platform work together - from KYC verification to asset tokenization and liquidity pool mechanics, all built on IOTA's secure foundation.

## Future Roadmap 🚀

### 1. **Expand Asset Categories**
   - **Action:** We will integrate support for a wider variety of real-world assets (e.g., commodities, fine art, intellectual property) and refine the IOTA One-Time Witness to accommodate these new asset types.
   - **Goal:** Ensure that Asseta can handle any type of physical asset.

### 2. **Enhanced Liquidity Solutions & AMM Pools**
   - **Action:** We plan to incentivize liquidity providers through rewards and lower fees for early participants.
   - **Goal:** Increase liquidity depth and volume on the platform, enabling more dynamic and efficient market trades.

### 3. **Improved Price Feeds & Market Stability**
   - **Action:** Introduce multiple decentralized oracle providers and employ dynamic price smoothing to ensure consistent and reliable price feeds for asset backed tokens.
   - **Goal:** Achieve more stable price discovery and reduce volatility in early stage markets.

## Team 👥

- **Cedric Chung**  
  - *Role:* Team Leader, Frontend Developer and Smart Contract Developer  
  - [LinkedIn](https://www.linkedin.com/in/cedric-chung-2756b4310/)

- **Phen Jing Yuan**  
  - *Role:* Backend Developer  
  - [LinkedIn](https://www.linkedin.com/in/jing-yuan-phen-b42266295/)  
  - [Twitter](https://x.com/ilovedahmo)

- **Liew Qi Jian**  
  - *Role:* Defi Integrator  
  - [LinkedIn](https://www.linkedin.com/in/derek2403/)  
  - [Twitter](https://x.com/derek2403)

- **Tan Zhi Wei**  
  - *Role:* Backend Developer & Oracle Specialist  
  - [LinkedIn](https://www.linkedin.com/in/tanzhiwei0328/)

- **Edwina Hon**  
  - *Role:* Backend Developer & Smart Contract Developer  
  - [LinkedIn](https://www.linkedin.com/in/edwina-hon-548189340/)







