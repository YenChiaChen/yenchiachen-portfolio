---
title: Adaptive Zero Trust Architecture via Deep Learning–Based Log Analysis
category: AI / Cybersecurity
type: 產學合作專案
achievement: 產學合作
tags: [Cybersecurity, Zero Trust, RBAC, Anomaly Detection, Deep Learning, Wazuh]
imageUrl: https://res.cloudinary.com/dcpzacz9d/image/upload/v1767486942/13mar2018-deeplog-architecture_i8dx6g.png
description: 基於深度學習系統日誌分析之自適應零信任存取控制架構
---

## Abstract

本產學合作專案旨在回應企業實務中，**傳統靜態 RBAC（Role-Based Access Control）模型在面對現代資安威脅時所暴露的結構性限制**。在既有模型中，權限一旦被授予，往往僅依賴帳號與角色進行判斷，缺乏對「授權後行為」的持續監測與風險評估。

本專案成功設計並實作一套 **結合深度學習異常偵測與 Zero Trust 理念的動態存取控制系統**。系統核心基於 DeepLog 行為序列建模方法，並整合 Wazuh 開源資安平台，透過擴展其 API 與 Active Response 機制，建立一條從「行為偵測 → 風險評估 → 權限調整」的自動化資安控制迴路（SOAR）。

在不揭露實際營運數據的前提下，本系統展示了 **AI 驅動資安治理（AI-driven Security Governance）** 在企業環境中的可行性與工程實踐價值。

---

## Background and Motivation

在傳統 **RBAC** 模型中，權限控管的核心假設為：「使用者一旦通過身分驗證，其行為即被視為可信」。然而，實務上的資安事件顯示，**多數高風險行為往往發生在合法帳號之下**，包括：

- 非預期時間的系統登入  
- 與職責不符的資源存取  
- 行為模式的漸進式偏移（behavior drift）  

另一方面，**Zero Trust Architecture** 所強調的「Never Trust, Always Verify」，要求系統不再僅依賴身分，而必須將「行為」納入持續驗證的核心。

本專案聚焦於以下三個關鍵技術問題：

1. **系統日誌的行為理解問題**  
   系統日誌具高度非結構化與動態性，傳統 rule-based 或 signature-based 方法難以涵蓋未知攻擊樣態。
2. **異常偵測與權限控制之間的落差**  
   多數 anomaly detection 僅停留在告警層級，無法即時轉化為具體的存取控制行為。
3. **自動化與誤報的平衡**  
   如何在維持系統可用性的前提下，進行即時、可回復的自動化資安處置。

---

## System Architecture Overview

本系統採用 **分層式微服務架構**，以 **Wazuh** 作為底層資安事件收集與回應平台，上層則部署基於 **LSTM（Long Short-Term Memory）** 的行為建模與推論模組。

整體架構可概分為三個層次：

- **Data Collection Layer**：Wazuh Agent 負責蒐集端點與系統層級日誌  
- **Behavior Modeling Layer**：DeepLog 行為序列模型負責異常判斷  
- **Control & Response Layer**：Wazuh Manager 依推論結果執行即時控管  

---

## DeepLog-Based Anomaly Detection

### 行為序列建模

本專案實作並調整 *Du et al.* 所提出之 **DeepLog** 架構，將系統日誌視為時間序列資料，而非獨立事件。

經過日誌解析（Log Parsing）後，每筆日誌被映射為對應的 **Log Key**，模型學習正常系統行為下的執行序列關係：

$$
P(k_t \mid k_{t-1}, k_{t-2}, \dots, k_{t-h})
$$

當實際發生的日誌事件未落在模型所預期的高機率範圍內，即被視為潛在異常。

---

### 參數層級異常分析

除序列結構外，系統亦針對日誌中之數值型參數（如存取頻率、操作間隔、檔案大小等）建立統計分佈模型，用以補捉效能或行為層級的偏移，避免僅依賴序列結構所造成的盲點。

---

## Wazuh API 擴展與即時回應設計

為達成細粒度且可自動化的控管，本專案未直接使用 Wazuh 既有規則模組，而是：

- 擴展其 **RESTful API**  
- 建立即時 Log Ingestion Pipeline  
- 客製化 Active Response 腳本  

使 DeepLog 的推論結果可直接觸發系統層級行為，包括但不限於：

- 存取權限調整  
- 特定操作封鎖  
- 強制登出或流程終止  

---

## 行為感知與動態 Bracket 分級機制

### Behavioral Profiling

本系統引入 **UEBA（User and Entity Behavior Analytics）** 概念，將 RBAC 從靜態角色對應，升級為具行為感知能力的動態控管模型。

系統持續分析使用者的數位足跡，包括：

- 上線時段與連線持續時間  
- 系統與檔案資源的使用模式  
- 操作指令與行為序列結構  

---

### Dynamic Bracket Tagging

根據行為風險評估結果，系統自動為使用者套用不同層級的 **Bracket（權責標籤）**，例如：

- **Tier-1：Normal / Trusted**
- **Tier-2：Observed / Watchlist**
- **Tier-3：Restricted / High Risk**

當異常分數超過門檻時，系統即時更新使用者標籤，並同步調整其可執行行為範圍。

---

## Automated Control Loop

整體資安控制流程形成一個閉環（Control Loop）：

1. 行為資料即時收集  
2. DeepLog 模型進行異常推論  
3. 風險評估結果轉換為 Bracket 標籤  
4. Wazuh 執行對應的自動化回應  
5. 異常事件回饋至 IT 管理端進行監控與審核  

此設計使資安反應從「事後分析」轉為「行為發生當下的即時介入」。

---

## Project Value and Positioning

在不揭露實驗結果的前提下，本專案所展現的核心價值包括：

- **Zero Trust 的工程落地實踐**：將理念轉化為可執行的系統設計  
- **降低資安維運負擔**：減少大量人工規則撰寫與維護成本  
- **提升回應即時性**：建立可擴充的 AI × SOAR 協作架構  
- **研究與實務的整合**：將學術模型嵌入企業級資安流程  

---

## Conclusion

本產學合作專案展示了 **Deep Learning 行為建模在企業資安治理中的實際應用潛力**。  
透過結合 DeepLog、Wazuh 與動態權責分級機制，本系統成功構建一套具備行為感知、自動回應與 Zero Trust 思維的次世代存取控制架構。

此經驗亦為後續在 **AI for Security、Enterprise Trust Modeling、Security MLOps** 等方向奠定紮實的工程與研究基礎。
