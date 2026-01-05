---
title:  Kubernetes Migration Strategy & HPA Latency Analysis
category: AI / Cloud Native
type: Architecture Proposal
achievement: 產學合作
tags: [Kubernetes, HPA, KEDA, Autoscaling, SRE, Observability, Capacity Planning]
description: 以企業級導入視角評估 Kubernetes 效益，並針對 HPA 在流量爆炸時的應對手段。
imageUrl: https://res.cloudinary.com/dcpzacz9d/image/upload/v1767487918/Gemini_Generated_Image_fula6xfula6xfula_hrvl72.webp
---

## 1. 摘要

本計畫聚焦於將既有應用服務遷移至 Kubernetes（K8s）之可行性評估與落地策略。透過 SWOT 分析、壓力測試（Stress Testing）與極限情境演練，我們驗證 Kubernetes 在宣告式治理、自我修復與雲原生生態整合上的系統性優勢。

然而，在對 **水平自動擴展（HPA, Horizontal Pod Autoscaler）** 進行瞬時尖峰（Flash Crowds / Micro-bursts）測試時，我們辨識出一個不可忽視的架構特性：**HPA 由於指標採樣窗口與 Pod 啟動冷卻期的存在，會產生可量化的擴展延遲（Scaling Latency）**。此延遲在短時間內可能放大為「服務可用性缺口」，並引發級聯故障（Cascading Failure）。

本報告以可推導的方式拆解延遲來源，並提出以 **KEDA 事件驅動擴展 + 預留緩衝產能 + HPA 行為調校 + 預測性擴展** 組成的混合式架構作為緩解策略。

---

## 2. Kubernetes 架構導入評估

### 2.1 核心優勢（Pros）

- **宣告式組態（Declarative Configuration）**  
  以 YAML 描述期望狀態（Desired State），可降低 configuration drift，並提升變更可追溯性（Auditability）。

- **自我修復（Self-healing）**  
  透過 Liveness / Readiness Probes 與控制器迴路（Controller Reconciliation）自動修復故障容器，提升服務可用性（Availability）。

- **雲原生生態整合（Cloud-native Ecosystem）**  
  可直接整合 Prometheus/Alertmanager、Grafana、Ingress Controller、Service Mesh（如 Istio）等標準組件，建立一致的可觀測性與流量治理能力。

### 2.2 潛在挑戰與成本（Cons）

- **網路複雜度**  
  CNI 覆蓋網路帶來封包封裝與除錯成本，並提高跨節點網路故障排查難度。

- **Day-2 Operations 成本**  
  叢集升級、憑證輪替、Secret 管理、CSI 儲存編排與 RBAC 治理屬於長期維運負擔，需要 SRE 能力與制度化流程支撐。

---

## 3. 關鍵發現：HPA 擴展延遲與微爆量風險

### 3.1 實驗場景（Impulse Traffic）

我們模擬脈衝式流量（Impulse Traffic）：在極短時間內（< 10 秒）將 RPS 提升至基線的 500%，用以測試 HPA 在微爆量下的反應能力與服務穩定性邊界。

### 3.2 HPA 運作機制與盲點

Kubernetes HPA 控制器預設以 Metrics Server 輪詢資源指標，常見同步週期為：

- `--horizontal-pod-autoscaler-sync-period = 15s`

其擴展決策近似可表示為：

$$
DesiredReplicas = \left\lceil CurrentReplicas \times \frac{CurrentMetricValue}{DesiredMetricValue} \right\rceil
$$

此設計本質上依賴 **後見指標（Lagging Metrics）**（例如 CPU/Memory utilization），因此對「突發且短促」的負載型態天然不敏感。

### 3.3 崩潰根因：Time-to-Ready Gap

在微爆量情境下，服務早期出現 503/timeout 的主要原因並非 HPA 計算錯誤，而是 **擴展完成前的可用容量缺口**。延遲可拆解為兩段：

#### (A) 指標盲區（Blind Spot）

若尖峰發生於兩次 polling 之間，HPA 最早只能在下一個週期才感知負載：

$$
T_{detect} \in (0, 15]\ \text{s}
$$

尖峰越靠近週期起點，盲區越長。

#### (B) 反應滯後（Reaction Lag）

即使 HPA 取得指標並完成決策，實際能提供服務的時間仍受到多個冷啟動步驟影響：

- Scheduler 調度
- Image pulling（含 registry latency）
- Container start
- Readiness probe pass
- Service endpoint propagation

其可抽象表示為：

$$
T_{ready} = T_{schedule} + T_{pull} + T_{start} + T_{probe} + T_{propagate}
$$

因此總擴展延遲為：

$$
T_{scaling} = T_{detect} + T_{ready}
$$

### 3.4 風險結論：擴展延遲與容量崩潰條件

當尖峰負載下，現有 pods 的可承受時間（由排隊、CPU throttling、OOM、GC、連線耗盡等因素決定）滿足：

$$
T_{exhaust} < T_{scaling}
$$

則在新副本 Ready 之前，現有副本已發生資源耗盡，進一步引發：

- retry storm
- connection pile-up
- backpressure failure
- cascading failure

此為 HPA 在 micro-bursts 下的結構性限制，而非參數調整即可完全消除。

---

## 4. 緩解策略與建議架構（Advanced Mitigation Strategies）

本專案提出的方向不是「期待 HPA 無延遲」，而是承認其物理限制，改採混合式擴展策略，將風險封裝在可控範圍。

### 4.1 導入 KEDA：以領先指標驅動擴展

HPA 依賴 CPU/Memory 等 lagging metrics。對微爆量更有效的做法是使用 **領先指標（Leading Metrics）**：在資源飆高前即觸發擴容。

建議採用 KEDA（Kubernetes Event-driven Autoscaling）監聽例如：

- Kafka topic lag
- HTTP request queue length
- message backlog / consumer lag

核心概念：**以 queue 的堆積作為負載訊號，而非等 CPU 先爆。**

### 4.2 預留緩衝產能：用空間換時間（Over-provisioning）

在微爆量前幾秒，唯一能吸收衝擊的是「已經存在」的容量。因此需以策略性冗餘承接第一波：

- **Proportional baseline**：設定 `minReplicas = N + k`，確保可吸收 initial burst
- **Pause Pods / Buffer Pods**：預先佔用資源的低優先級 pods，當高優先級擴展時被驅逐，以避免等待 node scale-up

此策略可縮短「實際可用容量到位」的時間，而非僅縮短決策時間。

### 4.3 優化 HPA Behavior：更激進的 scale-up 策略

Kubernetes 1.18+ 支援 `behavior`，可調整擴容策略以降低 stabilization 帶來的延遲：

```yaml
behavior:
  scaleUp:
    stabilizationWindowSeconds: 0
    policies:
    - type: Percent
      value: 100
      periodSeconds: 15
