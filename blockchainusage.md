# 🔗 Blockchain Usage & Smart Contract Logic

## 📌 Blockchain Usage Summary

We are using the Cardano blockchain to **secure research funding, verify milestone progress, and build trust** between funding organizations and researchers.

- Research grants are **locked in escrow** (smart contract) at the start of the project.
- Funds are **released incrementally** only after project milestones are verified.
- Release requires **consensus voting (>75%)** from the organization's members.
- This ensures **transparency, accountability, and proper utilization of funds.**

## 🧩 Pseudo Code (Smart Contract Logic)

### **▶ Project Onboarding & Funding**

When an organization funds a research project:
- Organization defines milestones, budget, and members.
- Smart contract is initialized with the project Datum (Org, Researcher, Members, Milestones).
- Total grant amount is locked in the contract address.

### ▶ Milestone Submission

When a researcher completes a project stage:
- Researcher submits evidence for the current milestone.
- The system triggers a voting session for organization members.

### ▶ Voting & Consensus

Organization members review the evidence:
- Members sign a transaction to approve the milestone.
- Smart contract counts valid signatures from the authorized member list.

### ▶ Fund Release Logic

To release funds for a milestone:
Require:
- Organization signature (Admin oversight).
- > 75% of Member signatures (Community consensus).
- Output to Researcher >= Milestone Percentage Amount.

```
If conditions met:
     Pay Researcher (Milestone Amount)
     If more milestones exist:
         Return remaining funds to Contract (Update Datum to next milestone)
     Else:
         Contract concludes
Else:
     Transaction fails (Funds remain locked)
```

### ▶ Dispute Handling

If the voting threshold is not met:
- Funds remain locked in the contract.
- Researcher must provide better evidence or address concerns.
- Organization can potentially reclaim funds (via admin intervention or refund logic).

### ▶ Short Summary

Project funded → Funds locked → Researcher completes milestone → Members vote (>75%) → Smart contract releases payment.
