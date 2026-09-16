# Research Gaps

This document details the specific research gaps identified from the 15 surveyed papers in the field of Smart City Cloud Governance, IoT-based fire safety, automated compliance checking, and cloud policy enforcement.

For the complete survey matrix, see the [Literature Survey Table](file:///Users/adityaupadhye/SmartCityCloudGovernance_Cloud_Project_2026/docs/Literature_Survey_Table.md).

---

## Synthesized Problem Statement & Overarching Gap

While existing literature extensively addresses **physical fire detection**, **IoT sensor networks**, **simulation-based hazard estimation**, and **design-stage BIM compliance checking**, there is a significant critical gap:
> **Absence of an operational, auditable, and automated cloud governance layer** that translates continuous building IoT telemetry and compliance statuses into role-based, enforceable, and transparent governance decisions with verifiable audit trails.

Most existing cloud deployments treat cloud infrastructure simply as a passive storage or relay pipe rather than an active governance substrate with automated policy enforcement, IAM access control, violation lifecycle tracking, and inter-agency escalation.

---

## Paper-by-Paper Identified Research Gaps

### Paper 1: Digital-Twin-Based Fire Safety Management Framework for Smart Buildings
- **Identified Gap**: The proposed framework stops at visualization and decision-support (Detection / Prediction / Visualization). There is no mechanism to translate a detected fire-safety state into an enforceable governance action or a verified corrective outcome.

### Paper 2: AIoT-Powered Building Digital Twin for Smart Firefighting and Super Real-Time Fire Forecast
- **Identified Gap**: Provides an excellent detection, forecast, and visualization layer, but is purely physics- and sensor-driven. It does not extend into policy interpretation, continuous compliance-state tracking, or multi-agency administrative governance.

### Paper 3: Integration of Industry 4.0 Technologies in Fire and Safety Management
- **Identified Gap**: Surveys detection and monitoring technologies extensively under ISO/IEC and IEEE interoperability standards, but does not examine how fire-safety regulations are operationalised into enforceable, auditable governance workflows.

### Paper 4: Predicting Smoke Hazards and Burning Fuel via Smart Building Fire Sensor Network and Dual-Agent Deep Learning
- **Identified Gap**: Possesses strong real-time hazard-quantification capabilities, but lacks any mechanism connecting predicted risk levels to automated governance decisions, corrective-action deadlines, or an audit trail.

### Paper 5: Integration of Proactive Building Fire Risk Management in the Building Construction Sector: A Conceptual Framework to Understand the Existing Condition
- **Identified Gap**: Explicitly identifies that existing fire-risk management remains reactive and fragmented across regulatory bodies, but stops short of proposing an automated, cloud-based governance mechanism to resolve that fragmentation.

### Paper 6: An Automated Fire Code Compliance Checking Jointly Using Building Information Models and Natural Language Processing
- **Identified Gap**: Automated compliance is restricted to design-time BIM rule checking. No mechanism exists for ongoing operational compliance, evidence-based post-occupancy verification, or escalation once the building is inhabited.

### Paper 7: A BIM-Based Automated Code Compliance Checking System in Malaysian Fire Safety Regulations: A User-Friendly Approach
- **Identified Gap**: Demonstrates regulation-to-rule translation feasibility but confines it to design-stage review. It does not extend to runtime compliance state tracking, risk-adaptive enforcement, or automated escalation.

### Paper 8: Comprehensive Building Fire Risk Prediction Using Machine Learning and Stacking Ensemble Methods
- **Identified Gap**: Provides strong empirical risk-scoring capability, but the score is not operationalised into an enforceable, time-tracked governance decision (lacks deadlines, escalation paths, and tamper-proof audit trails).

### Paper 9: An Ontology-Based Approach of Automatic Compliance Checking for Structural Fire Safety Requirements
- **Identified Gap**: Provides the ontology and rule layer for a static compliance snapshot ("is this compliant now"), but lacks lifecycle tracking of violations, corrective deadlines, multi-department escalation, or audit accountability.

### Paper 10: A Knowledge Graph-Based Approach for Construction Safety Hazards Management and Rectification Measures Intelligent Recommendation
- **Identified Gap**: Recommends corrective actions using knowledge graphs and LLMs, but fails to close the loop with verification of whether the action was actually performed, nor does it escalate unresolved hazards automatically.

### Paper 11: Leveraging Large Language Models for BIM-Based Automated Compliance Checking
- **Identified Gap**: Offers state-of-the-art natural language regulation-to-rule interpretation, but remains purely a one-shot design-stage checker. It does not maintain a continuous compliance state, trigger enforcement decisions, or verify corrective evidence over time.

### Paper 12: Interpretable AI for Smart City Cloud Security: A Model Context Protocol Framework for Real-Time IoT Threat Detection
- **Identified Gap**: Demonstrates a working cloud-governance, audit-trail, and interpretability architecture (IAM-adjacent, SIEM-integrated) that is transferable to fire-safety cloud governance, but has not yet been applied to a compliance/enforcement domain such as building fire safety.

### Paper 13: Artificial Intelligence Assisted IoT-Fog Based Framework for Emergency Fire Response in Smart Buildings
- **Identified Gap**: Delivers low-latency edge/fog response for Indian urban fire-safety contexts, but does not address long-term compliance-state tracking, enforcement decisions, or accountability across multiple regulatory authorities.

### Paper 14: IoT-Based Cloud Monitoring System for Building Fires
- **Identified Gap**: Illustrates that most "cloud" fire-safety systems utilize the cloud purely as a data pipe, not as a governance substrate—reinforcing the gap around IAM, access controls, audit trails, and accountable cloud governance for municipal fire safety.

### Paper 15: Integrating IoT Technology for Fire Risk Monitoring and Assessment in Residential Building Design
- **Identified Gap**: Provides real-time risk-index and evacuation optimization, but the index operates purely as an operational safety metric rather than being integrated into a compliance/enforcement decision layer or regulatory audit trail.

---

## Literature Survey Matrix Summary

| No. | Paper | Advantages | Limitations | Research Gap |
| :---: | :--- | :--- | :--- | :--- |
| 1 | Digital-Twin-Based Fire Safety Management Framework for Smart Buildings | Maps DT application across evacuation & maintenance; industry-readiness roadmap. | Conceptual only; no automated policy-interpretation layer. | Stops at visualization; no enforceable governance action. |
| 2 | AIoT-powered building digital twin for smart firefighting and super real-time fire forecast | Super real-time reconstruction; full-scale live fire validation. | Sensor dependency; no regulatory or compliance reasoning. | Purely sensor-driven; lacks policy & compliance decision-making. |
| 3 | Integration of Industry 4.0 Technologies in Fire and Safety Management | Covers IoT/AI/BIM integration under ISO/IEC standards. | Review-only; no automated enforcement or escalation. | Surveys tech without operationalising regulations into workflows. |
| 4 | Predicting smoke hazards and burning fuel via smart building fire sensor network and dual-agent deep learning | Real-time hazard quantification from sparse sensors. | Simulation-only; no link to regulatory thresholds. | No mechanism linking hazard to governance action or audit trail. |
| 5 | Integration of Proactive Building Fire Risk Management in the Building Construction Sector | Systemic framing of fire risk as a multi-stakeholder problem. | Conceptual; no computational enforcement mechanism. | Highlights fragmentation but provides no cloud-based solution. |
| 6 | An Automated Fire Code Compliance Checking Jointly Using Building Information Models and NLP | Automates spatial-geometry checks; decomposes ACC into reusable tasks. | Limited to design-stage; no post-occupancy monitoring. | ACC stops at design-time; no operational compliance tracking. |
| 7 | A BIM-Based Automated Code Compliance Checking System in Malaysian Fire Safety Regulations | User-friendly semi-automated rule checking via visual programming. | Single-jurisdiction; no runtime monitoring or enforcement logic. | Design-stage only; lacks risk-adaptive runtime enforcement. |
| 8 | Comprehensive Building Fire Risk Prediction Using Machine Learning and Stacking Ensemble Methods | Empirically validated on real municipal fire records; 5 risk grades. | Static risk snapshot; no mandated corrective workflows. | Score is not operationalised into enforceable governance decisions. |
| 9 | An ontology-based approach of automatic compliance checking for structural fire safety requirements | Machine-readable schema for structural fire safety inference. | Covers limited requirements; static snapshot only. | Stops at single snapshot; no violation lifecycle tracking. |
| 10 | A Knowledge Graph-Based Approach for Construction Safety Hazards Management and Rectification Recommendation | Combines LLMs with KG reasoning to recommend corrective measures. | No verification that recommended rectification was executed. | Open loop; lacks evidence-based verification and escalation. |
| 11 | Leveraging large language models for BIM-based automated compliance checking | High accuracy (97% F1); auto-generates reasoning trace. | One-shot design stage check; single-jurisdiction test. | Does not maintain compliance state or verify corrective actions. |
| 12 | Interpretable AI for Smart City Cloud Security: An MCP Framework for Real-Time IoT Threat Detection | Sub-13ms detection; human-auditable reasoning trail; SIEM-integrated. | Evaluated on cloud control-plane data, not fire safety. | Proven audit/governance architecture not yet applied to fire safety. |
| 13 | AI assisted IoT-fog based framework for emergency fire response in smart buildings | Low-latency edge/fog processing tailored for Indian urban challenges. | Focuses on detection latency; no regulatory escalation. | Lacks compliance-state tracking across multiple municipal bodies. |
| 14 | IoT-based cloud monitoring system for building fires | Low-cost, >95% prediction accuracy; web route-planning interface. | Cloud used solely as storage pipe; no IAM or audit trails. | Emphasizes the need for cloud as a governance substrate. |
| 15 | Integrating IoT Technology for Fire Risk Monitoring and Assessment in Residential Building Design | Validated on 12-storey building; 30% faster detection; adaptive routing. | Focuses on operational evacuation, not regulatory compliance. | Risk index not connected to compliance enforcement workflows. |
