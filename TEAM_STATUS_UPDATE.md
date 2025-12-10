# Team Status Update (10-Dec-2025)

## 🔹 GitHub Repository
**Link:** [https://github.com/Akeem1955/StemTrust](https://github.com/Akeem1955/StemTrust)

---

## 🔹 Current Blockers
The following issues are preventing us from considering the project "Production Ready":

1.  **Deployment Verification:**
    *   We have containerized the app (Docker) and created a deployment guide, but we have not yet verified the deployment on a live Azure VM. We need to confirm that the Nginx reverse proxy handles traffic correctly in a real cloud environment.

2.  **Smart Contract Implementation:**
    *   We are currently using a **hybrid/simulated approach** for the hackathon prototype. The full decentralized logic (locking funds => milestone voting => auto-release) needs to be fully written in **Aiken/Plutus** and integrated. Currently, we rely on a trusted backend wallet for some operations.

3.  **Evidence Storage:**
    *   Evidence is currently stored in our backend/database. For true decentralization, we need to finish the integration with **IPFS/Arweave** so that evidence handling is censorship-resistant.

---

## 🔹 Support Needed from Mentors/Organizers

1.  **Smart Contract Consultation:**
    *   We need guidance on optimizing our Aiken contracts for transaction fee efficiency, specifically for the "milestone voting" mechanism which requires multiple signatures.

2.  **Azure Compatibility:**
    *   If we encounter specific port blocking or "allow-origin" issues on the Azure VM despite our Nginx config, we may request a quick debugging session with a DevOps mentor.

3.  **Mock Data Strategy:**
    *   Advice on how best to seed the blockchain with "rich" test data for the demo without manually clicking through 20+ transactions.
