# FireGuard AI - Documentation Index

This directory contains the formal research, architectural specifications, cloud integration runbooks, and implementation guides for the **SmartCity Cloud Governance Project 2026** (FireGuard AI).

---

## 1. Research & Academic Deliverables

- **[Abstract](Abstract.md)**: Executive and academic abstract detailing the problem statement, remediation attribution hypothesis, compliance state machine, and evaluation metrics.
- **[Objectives](Objectives.md)**: Six core technical and research objectives defining the regulation-conditioned compliance system, evidence sufficiency validation, and evaluation framework.
- **[Research Gap](Research_Gap.md)**: Paper-by-paper critical analysis of the 15 surveyed literature works, identifying the absence of post-remediation evidence attribution and closed-loop compliance tracking.
- **[Literature Survey Table](Literature_Survey_Table.md)**: Comparative matrix of 15 foundation papers covering methods, datasets, advantages, limitations, and specific research gaps.
- **[Novelty and Prior-Art Position](Novelty.md)**: Conservative, hostile prior-art evaluation, patent claim landscape, failure mode analysis, and technical differentiation of the remediation-attribution mechanism.
- **[Project Report](Project_Report.md)**: Comprehensive repository-based technical and academic report.

---

## 2. Cloud Architecture & Infrastructure

- **[AWS Services Overview](AWS_Services.md)**: Breakdown of mapped AWS services (S3, CloudFront, EC2, SNS, Lambda, CloudWatch, IAM).
- **[AWS Deployment Guide](aws-deployment.md)**: Step-by-step runbook for deploying the frontend, backend, and ML services to AWS.
- **[AWS Integration Guide](aws-integration-guide.md)**: Deep-dive architecture, IAM policies, and cloud integration blueprints.
- **[CloudFormation Template](../infra/fireguard-infra.yaml)**: Infrastructure-as-Code (IaC) template provisioning S3 buckets, CloudFront OAC, SNS topics, and IAM roles.
- **[Lambda Architecture](lambda.md)**: Architecture and event payloads for serverless asynchronous report generation.

---

## 3. System Design & Data Engineering

- **[API Specification](api.md)**: REST endpoints for Node.js Express backend and FastAPI ML engine.
- **[Database Architecture](database.md)**: MongoDB Atlas schemas, models, indexes, and in-memory repository fallbacks.
- **[Data Sources & Provenance](data-sources.md)**: Meteorological (FWI), building telemetry, and sample dataset descriptions.
- **[Systemd Services](systemd-services.md)**: Linux service daemon configurations for production host deployment.

---

## 4. Testing & Verification

- **[Testing Runbook](testing.md)**: Instructions for running unit, integration, and build verification test suites.
- **[Demo Checklist](demo-checklist.md)**: Operational verification steps for demonstration scenarios and live presentations.
- **[Presentation Outline](presentation.md)**: Slide deck structure and talking points for project presentations.
