# IgnisCore Visual & Schematic Assets Directory (`assets/`)

This directory houses the vector brand marks, architectural floorplans, process flow diagrams, and capability badges for **IgnisCore — Intelligent Fire Hazard Monitoring System**.

All assets are implemented as standalone, scalable SVG (Scalable Vector Graphics) files with dark-mode aesthetic tokens compatible with GitHub documentation, academic slide decks, and the React Command Center web interface.

---

## Asset Index

### 1. Brand Identity & Header Banners
- **[`igniscore_logo.svg`](igniscore_logo.svg)** (500×500 px): Official project emblem featuring glowing fire hazard crest, inner cyber-shield, and sensor network circuit nodes.
- **[`igniscore_banner.svg`](igniscore_banner.svg)** (1200×380 px): Wide hero banner for the primary GitHub README and technical presentations, detailing project classification and technical differentiators.

### 2. 2D Architectural Spatial Floorplans
These vector layouts correspond 1:1 with the topological coordinate systems and zone models in [`configs/facility_topology.json`](../configs/facility_topology.json) and [`backend/src/config/buildingTopology.js`](../backend/src/config/buildingTopology.js):
- **[`building_a_floorplan.svg`](building_a_floorplan.svg)** (680×480 px): **Building A — Advanced Research Facility (BLDG-A)**. Contains Electrical Room (`bldg_a_elec`), Chemical Lab 1 (`bldg_a_lab1`), Optics Lab 2 (`bldg_a_lab2`), Central Corridor (`bldg_a_corridor`), Chemical Storage (`bldg_a_storage`), Exit A West Stairwell, and Exit B East Concourse.
- **[`building_b_floorplan.svg`](building_b_floorplan.svg)** (680×480 px): **Building B — Academic & Compute Complex (BLDG-B)**. Contains High-Density Server Room (`bldg_b_server`), Auditorium Classroom 1, Lecture Hall Classroom 2, Main Promenade Corridor, Facilities Storage, Exit A South Atrium, and Exit B North Concourse.
- **[`building_c_floorplan.svg`](building_c_floorplan.svg)** (680×480 px): **Building C — Operations & Logistics Center (BLDG-C)**. Contains Commercial Kitchen (`bldg_c_kitchen`), Administrative Offices (`bldg_c_office`), Central Service Hall, Dry Goods Storage, Exit A Loading Bay, and Exit B Staff Gate.

### 3. Infographics & Algorithmic Diagrams
- **[`risk_matrix_chart.svg`](risk_matrix_chart.svg)** (900×520 px): 4-tier fire hazard escalation matrix detailing score ranges (LOW, MEDIUM, HIGH, CRITICAL), telemetry thresholds, and automated emergency dispatches.
- **[`evacuation_routing_diagram.svg`](evacuation_routing_diagram.svg)** (920×460 px): Technical comparison between naive static egress (which steers occupants into fire zones) versus IgnisCore's dynamic hazard-weighted Dijkstra router.

### 4. Documentation Badges (`assets/badges/`)
- **[`badges/accuracy_building.svg`](badges/accuracy_building.svg)**: Building ML Random Forest Accuracy (99.98%).
- **[`badges/accuracy_forest.svg`](badges/accuracy_forest.svg)**: Forest FWI Random Forest Accuracy (92.83%).
- **[`badges/cloud_aws.svg`](badges/cloud_aws.svg)**: AWS Cloud Native IaC Specification.
- **[`badges/local_first.svg`](badges/local_first.svg)**: 100% Local-First Autonomous Runtime.
- **[`badges/license.svg`](badges/license.svg)**: MIT Open Source License.

---

## Embedding in Markdown Documents

To display these assets within markdown files, use standard markdown image syntax:

```markdown
<!-- Project Banner -->
![IgnisCore Banner](assets/igniscore_banner.svg)

<!-- Building A Floorplan -->
![Building A Floorplan](assets/building_a_floorplan.svg)

<!-- Risk Matrix -->
![Risk Matrix Chart](assets/risk_matrix_chart.svg)
```
