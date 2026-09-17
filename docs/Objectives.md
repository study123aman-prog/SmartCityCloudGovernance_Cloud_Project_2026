# Project Objectives

## Intelligent Cloud-Based Fire-Safety Compliance Verification

The primary objective of this project is to develop a cloud-based fire-safety compliance system that can verify whether reported corrective actions have actually restored the required physical safety condition before a violation is marked as resolved.

### 1. Develop a Regulation-Conditioned Compliance Verification System

Develop a system that converts selected fire-safety requirements into structured, machine-checkable compliance conditions associated with specific physical safety assets such as fire doors, emergency exits, fire extinguishers, and emergency equipment.

### 2. Evaluate the Sufficiency and Validity of Remediation Evidence

Design an evidence-verification mechanism that evaluates submitted evidence using factors such as:

* Physical asset identity
* Evidence timestamp
* Required physical condition
* Evidence completeness
* Evidence consistency
* Required remediation outcome

The system should distinguish between sufficient evidence, incomplete evidence, contradictory evidence, and invalid evidence.

### 3. Verify Remediation of the Correct Physical Safety Asset

Develop a remediation-attribution mechanism that determines whether the evidence submitted after a corrective action corresponds to the same physical safety asset associated with the original violation and whether it demonstrates the required remediation outcome.

### 4. Prevent Premature Compliance Closure

Implement a compliance-state mechanism in which a violation cannot automatically transition to `VERIFIED_RESOLVED` merely because evidence has been submitted.

The system should maintain states such as:

```text
VIOLATION_DETECTED
        ↓
REMEDIATION_REQUIRED
        ↓
CORRECTION_CLAIMED
        ↓
PROOF_PENDING
        ↓
VERIFICATION
        ↓
VERIFIED_RESOLVED
```

If the required proof is not established, the system should retain the violation as unresolved or initiate an appropriate escalation/verification process.

### 5. Implement Targeted Verification for Insufficient Evidence

When submitted evidence does not satisfy one or more required proof conditions, identify the missing verification requirement and initiate an appropriate verification action, such as:

* requesting additional photographic evidence;
* obtaining a sensor observation;
* performing a simulated functional test;
* requesting a re-inspection.

The objective is to obtain only the evidence required to resolve the outstanding proof condition rather than treating every case identically.

### 6. Evaluate the Effectiveness of the Proposed Verification Mechanism

Compare the proposed remediation-attributed verification approach with simpler compliance-closure approaches using measurable metrics such as:

* False-resolution rate
* Correct asset identification rate
* Remediation verification accuracy
* Time to verified closure
* Number of additional verification actions
* Human intervention rate
* Contradictory-evidence detection rate

The objective is to determine whether evidence-linked remediation verification can reduce incorrect compliance closure while maintaining practical verification effort.

---

## Expected Outcome

The project aims to demonstrate that a fire-safety violation should not be considered successfully resolved simply because a corrective action has been reported or evidence has been submitted.

Instead, the system should establish a verifiable relationship:

```text
Regulation
    ↓
Safety Requirement
    ↓
Specific Physical Asset
    ↓
Violation
    ↓
Remediation
    ↓
Expected Physical Change
    ↓
Evidence
    ↓
Verification
    ↓
Remediation Attribution
    ↓
Verified Resolution
```

The resulting prototype will demonstrate the feasibility of implementing this verification workflow using cloud-based infrastructure and simulated or controlled fire-safety data.
