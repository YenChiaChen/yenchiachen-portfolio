---
title: Flight Route Network Analysis via Link Prediction and Optimization
category: Network Science
type: Research Project
role: Graph Modeling, Optimization, Data Analysis
tags: [Social Network Analysis, Graph Theory, Link Prediction, Transportation Networks, Convex Optimization]
---

## Overview

This project studies **global airline route networks** from a graph-theoretic perspective, focusing on **link prediction and alliance-level optimization**.  
Airlines and airports are modeled as nodes and edges in a large-scale network, and structural metrics are used to quantify how the inclusion or exclusion of airlines affects the overall connectivity and efficiency of airline alliances.

The core contribution is a **feature-weighted optimization framework**, solved via convex optimization, to recommend candidate airlines whose integration maximally improves alliance-level network properties.

---

## Dataset

Data are sourced from the **OpenFlights** dataset :contentReference[oaicite:0]{index=0}, consisting of:

| Component  | Description                              | Size  |
|------------|------------------------------------------|-------|
| Routes     | Airline route connections                | 59,036 |
| Airports   | Airport nodes                            | 3,209 |
| Airlines   | Airline entities                         | 531   |

### Route Schema (`routes.dat`)

| Field        | Description |
|-------------|-------------|
| Airline / AID | Airline name and ID |
| Source / SID | Source airport and ID |
| Destination / DID | Destination airport and ID |
| Codeshare   | Codeshare indicator |
| Stops       | Number of stops |
| Equipment   | Aircraft type |

The resulting graph is **directed, sparse, and highly clustered**, exhibiting hub-and-spoke characteristics common in transportation networks.

---

## Network Modeling

- **Nodes**: Airports (or airlines under alliance abstraction)
- **Edges**: Direct flight routes
- **Graph Type**: Directed graph
- **Alliance View**: Airlines aggregated into alliance-specific subgraphs

This abstraction enables **meso-scale analysis** of airline alliances as cooperative subnetworks embedded within the global aviation graph.

---

## Airline-Level Metrics

For each airline, we quantify its marginal impact on alliance structure using the following metrics:

| Metric | Description |
|------|-------------|
| Number of edges | Total routes contributed |
| Effective diameter change | Impact on network reachability |
| Clustering coefficient change | Effect on local connectivity |
| Node count change | Airport coverage expansion |
| Modularity | Community structure variation |
| Average closeness centrality change | Global accessibility impact |

These metrics jointly characterize **connectivity, efficiency, and structural cohesion**.

---

## Optimization Formulation

A **feature-weighted linear model** is used to score candidate airlines.

### Feature Matrix Construction

Let:
- $A = \{A_1, \dots, A_N\}$ be candidate airlines
- $F \in \mathbb{R}^{N \times 6}$ be the normalized feature matrix

Each row corresponds to the metric changes induced by adding airline \( A_i \).

---

### Convex Optimization Objective

We solve the following optimization problem using **CVX**:

$$
\text{Find } \mathbf{c} = (c_1, \dots, c_6)
$$

subject to:

- $F \mathbf{c} > 0$
- $\sum_{i=1}^{6} c_i = 1$

This formulation yields an interpretable **importance weighting over structural metrics**, avoiding heuristic tuning.

---

## Results

### OneWorld Alliance

**Optimized coefficients:**

| Metric | Weight |
|------|--------|
| \( c_1 \) | -0.001 |
| \( c_2 \) | -0.002 |
| \( c_3 \) | -0.133 |
| \( c_4 \) | **1.161** |
| \( c_5 \) | 0.005 |
| \( c_6 \) | -0.029 |

**Top-5 recommended airlines:**

| Code | Airline |
|-----|---------|
| 7R | BRA Transportes Aéreos |
| BE | Flybe |
| IG | Meridiana |
| 9E | Pinnacle Airlines |
| 9R | SATENA |

---

### SkyTeam Alliance

**Optimized coefficients:**

| Metric | Weight |
|------|--------|
| \( c_1 \) | 0.001 |
| \( c_2 \) | -0.003 |
| \( c_3 \) | 0.148 |
| \( c_4 \) | **0.842** |
| \( c_5 \) | -0.005 |
| \( c_6 \) | 0.018 |

**Top-5 recommended airlines:**

| Code | Airline |
|-----|---------|
| AA | American Airlines |
| FR | Ryanair |
| US | US Airways |
| UA | United Airlines |
| CZ | China Southern Airlines |

---

### Star Alliance

**Optimized coefficients:**

| Metric | Weight |
|------|--------|
| \( c_1 \) | 0.000 |
| \( c_2 \) | 0.000 |
| \( c_3 \) | **1.000** |
| \( c_4 \) | 0.000 |
| \( c_5 \) | 0.000 |
| \( c_6 \) | 0.000 |

**Top-5 recommended airlines:**

| Code | Airline |
|-----|---------|
| AB | Air Berlin |
| GQ | Big Sky Airlines |
| A2 | Cielos Airlines |
| AD | Azul |
| FR | Ryanair |

---

## Observations

- Each alliance produces a **sparse, low-magnitude coefficient vector**, indicating selective metric dominance.
- Different alliances emphasize **distinct structural objectives** (e.g., modularity vs. coverage).
- Fewer than half of evaluated airlines negatively impact alliance performance, suggesting **high redundancy tolerance**.

---

## Key Contributions

- Alliance-aware modeling of airline route networks  
- Multi-metric structural impact analysis  
- Convex optimization–based feature weighting  
- Data-driven airline recommendation for network enhancement  

---