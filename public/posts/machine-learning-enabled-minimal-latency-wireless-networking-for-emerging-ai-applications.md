---
title: Machine Learning Enabled Minimal Latency Wireless Networking for Emerging AI Applications
category: INFRA
type: Course Notes
achievement: 課程筆記
tags: [Networked AI, Wireless Networking, Multi-Agent Systems, Edge AI, Cyber-Physical Systems]
excerpt: 課程筆記整理，介紹 Cyber–Physical Systems 中感測器的角色、Networked AI 與多智能體系統（MRS），以及 AI 計算與無線網路在低延遲應用上的挑戰。
---

# Cyber World and Physical World

在 Cyber–Physical Systems（CPS）中，**感測器（Sensors）是連結 Cyber World 與 Physical World 的關鍵元件**。透過感測器蒐集來自實體世界的資料，系統得以在數位空間中建立對應的 **Digital Twin（數位分身）**，作為後續推論與決策的基礎。

在 XR（Extended Reality）或多智能體系統中，每一個 agent 都可能擁有各自的 cyber observations，並根據自身觀測建立對環境的 belief。由於觀測資訊有限且可能存在不一致性，這樣的系統本質上屬於 **部分可觀測（partially observable）** 的環境。

Agent 在 cyber world 中進行決策，並透過實體致動器（physical actuators）將行為映射回 physical world，形成一個持續閉環的感知—決策—行動流程。

---

# Networked AI

Networked AI 強調多個具備 AI 能力的 agent，透過網路進行協作以完成共同目標。在 MRS（Multi-Robot Systems）或 JMAS（Joint Multi-Agent Systems）中，每個 robot 皆具備獨立的推論與行動能力，同時能透過 **Machine-to-Machine（M2M） communication** 交換關鍵資訊。

這些交換的資訊可能包含：
- 行動策略與狀態
- Reward 或任務回饋
- 定位資訊（localization）
- 感測資料與環境觀測
- 對環境的 belief 或中間推論結果

MRS 廣泛應用於多種場景，例如自駕車協作、智慧工廠、無線機器人系統與分散式 AI 應用等。

---

# Challenges in AI Computing and Wireless Networking

## Wireless Networking

在多智能體系統中，無線通訊架構是影響整體效能的關鍵因素，常見挑戰包括：

- **Agent-to-Agent ad hoc networking**  
  具有高度彈性，但在 agent 數量增加時，通訊可擴展性（scalability）成為主要瓶頸。

- **Agent-to-Infrastructure-to-Agent networking**  
  透過基地台或邊緣節點進行中繼，可提升穩定性，但同時引入延遲與頻寬競爭問題。

- **環境感測資訊的蒐集與傳輸**  
  大量即時感測資料對低延遲與高可靠性網路提出極高要求。

## Agent Computing

每個 agent 需根據自身觀測資料，以及透過無線網路取得的環境資訊進行機器學習與決策。這類問題通常屬於 **部分可觀測的機器學習或 AI 問題**，使得模型設計與訓練更加困難。

## Edge AI Computing

Edge AI 的核心概念在於將部分推論與學習能力下放至邊緣節點，以加速 agent 對環境互動的理解，並降低對雲端的依賴。這對於低延遲、即時反應的 AI 應用尤其重要。

---

# 課程心得與反思

我非常喜歡今天陳教授所分享的主題。雖然我的實驗室同樣從事機器學習相關研究，但主要聚焦在文字探勘、GAN 類型的影像辨識，以及聯邦學習等方向。相較之下，教授所介紹的 Networked AI 與無線網路結合的研究，對我而言是一個相當新的研究面向。

也正因為如此，目前我仍無法明確判斷自己是否適合投入這樣的研究方向。不過，這堂課讓我意識到機器學習的應用範疇遠比我原先想像得更加廣泛，也促使我願意花時間進一步探索不同 AI 應用的可能性。

我非常珍惜能夠參與這次課程的機會，對我而言，這不僅是一堂技術導向的課程，更是一個重新思考研究方向的契機。
