# IgnisCore — Intelligent Fire Hazard Monitoring System - Documentation Index

This directory contains the formal research deliverables, architectural specifications, cloud integration runbooks, and implementation guides for **IgnisCore — Intelligent Fire Hazard Monitoring System** (**SmartCity Cloud Governance Project 2026**).

---

## 1. Research & Academic Deliverables

- **[Abstract](Abstract.md)**: Formal academic and executive abstract detailing the project problem statement, software-only virtual telemetry paradigm, dual-domain machine learning engines, graph hazard propagation cascade, and dynamic Dijkstra evacuation routing.
- **[Objectives](Objectives.md)**: Eight core technical and research objectives defining the virtual telemetry simulator, dual-domain ML classifiers, risk fusion engine, graph cascade model, dynamic evacuation pathfinding, interactive What-If simulation, AWS cloud architecture, and web command center.
- **[Novelty & Prior-Art Analysis](Novelty.md)**: Rigorous comparative analysis contrasting IgnisCore — Intelligent Fire Hazard Monitoring System against conventional GitHub projects (`GrumpyKit10`, `FireShield360`, `boldmonk89`, `Forest-Sentinel`), formalizing the paradigm shift from reactive hardware alarms to predictive cloud intelligence, and detailing six core technical innovations.
- **[Research Gaps](Research_Gap.md)**: Detailed examination of seven fundamental research and engineering gaps in current fire safety literature and open-source systems, showing how IgnisCore — Intelligent Fire Hazard Monitoring System resolves each gap.
- **[Literature Survey Table](Literature_Survey_Table.md)**: Comparative matrix of 15 foundation research papers and open-source projects covering methods, platforms, advantages, limitations, and identified research gaps.
- **[Project Report](Project_Report.md)**: Comprehensive repository-based technical and academic report detailing executive summary, system architecture, ML models, algorithmic propagation and routing, What-If simulation, AWS cloud integration, and verification results.

---

## 2. Cloud Architecture & Infrastructure

- **[AWS Services Overview](AWS_Services.md)**: Detailed architectural breakdown of AWS IoT Core, AWS Lambda, Amazon DynamoDB, Amazon S3, Amazon CloudFront, Amazon SNS, Amazon API Gateway, CloudWatch, and local-first abstraction mapping.
- **[AWS Deployment Runbook](aws-deployment.md)**: Step-by-step production runbook for deploying the frontend, Express backend, and FastAPI ML service to AWS.
- **[AWS Integration Guide](aws-integration-guide.md)**: Deep-dive architecture, IAM least-privilege security policies, and cloud integration blueprints.
- **[CloudFormation Infrastructure Template](../infra/fireguard-infra.yaml)**: Production-ready Infrastructure-as-Code (IaC) provisioning S3 buckets, CloudFront CDN with OAC, SNS emergency topics, Security Groups, and IAM roles.
- **[Lambda Report Generator](lambda.md)**: Serverless asynchronous incident report generation architecture and event payload schemas.

---

## 3. System Design & Data Engineering

- **[API Specification](api.md)**: REST endpoints for Node.js Express backend and FastAPI ML engine.
- **[Database Architecture](database.md)**: MongoDB Atlas schemas, models, indexes, and in-memory repository fallbacks.
- **[Data Sources & Provenance](data-sources.md)**: Meteorological (Canadian FWI), building structural telemetry, and synthetic dataset generation methodologies.
- **[Systemd Services](systemd-services.md)**: Linux service daemon configurations for production host deployment.

---

## 4. Testing & Verification

- **[Testing Runbook](testing.md)**: Instructions for running unit, integration, and build verification test suites.
- **[Demo Checklist](demo-checklist.md)**: Operational verification steps for demonstration scenarios and live presentations.
- **[Presentation Outline](presentation.md)**: Slide deck structure and talking points for project presentations.
