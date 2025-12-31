---
title: A Reconfigurable Process Element Design for Edge AI: Concepts and Structures
category: EDGE
type: Course Note
achievement: 課程筆記
tags: [Edge AI, AI Accelerator, Reconfigurable PE, Quantization, CNN]
description: 探討 Edge AI 加速器設計、Bit Fusion 與 Hierarchical PE 架構，以及 Depthwise Separable Convolutions 原理。
---

# Edge AI 的可重構處理單元設計：概念與架構

## 1. 機器學習的三種視角與分類

陳老師首先以三個場景（向同學、學弟妹、非本科系解釋）來定義機器學習，並將其技術大致分為三類：

* **Supervised Learning (監督式學習)**
* **Unsupervised Learning (非監督式學習)**
* **Reinforcement Learning (增強式學習)** 
    * 老師特別舉例：建構一個 Robot，透過與環境資料互動，不斷變化並更新自己。這類似於馬可夫鏈 (Markov Chain) 改變狀態的過程，直到 Robot 的行為趨於穩定收斂。

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767151274/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.20.49_yjn5ze.png)

---

## 2. Edge AI 的挑戰與優化策略

**Edge AI (邊緣運算 AI)** 的核心目標是讓機器學習運算能在本機（如手機、IoT 裝置）完成，因此必須解決運算資源有限及算力不足的問題。

### Software Side (軟體層面)
* **簡化資料**：將訓練資料進行降維，在可接受範圍內降低不重要部分的準確度。
* **Quantization (量化)** ：改變資料儲存形式，例如將 **32-bit float 轉為 8-bit int**。這能大幅降低記憶體佔用與運算時間。

### Hardware Side (硬體層面)
* **AI Accelerator (AI 加速器)**：專為神經網路運算設計的硬體。

---

## 3. 加速器架構：從 Bit Fusion 到 Hierarchical PE

### Bit Fusion Accelerator
由於軟體端進行了 Quantization，資料的 Bit 長度可能是不固定的。如果傳入傳統硬體，固定的運算單元會造成 Bit 資源浪費。
* **優點**：Bit Fusion 透過可彈性使用空間的 PE (Processing Element) 結構，減少資源浪費。
* **缺點**：使用了過多的 Shift Register，且缺乏階層式 (Hierarchical) 架構。當需要更大的不同輸入空間時，依然會產生浪費。

### Hierarchical PE (階層式處理單元)
這是陳老師著重的設計重點。
* **核心概念**：實現階層式架構，讓不同尺寸的運算（如 4x4、8x8）能夠共用架構，最大化資源利用率。

---

## 4. 卷積運算的優化：Depthwise Separable Convolutions

為了減少標準 CNN 龐大的計算量，引入了 **Depthwise Separable Convolutions** ，將標準卷積拆解為兩個步驟：

### (1) Depthwise Convolutions
* 針對輸入層的 **每個 Channel** 建立一個 $D_k \times D_k \times 1$ 的 Kernel。
* **運算方式**：若輸入層有 $M$ 個 Channel，則建立 $M$ 個 Kernel ($K_1, K_2, \dots, K_M$)，分別對應 Channel 進行運算，產出中間層特徵圖。

### (2) Pointwise Convolutions
* **運算方式**：利用 $1 \times 1 \times M$ 的 Kernel 對中間層進行運算。
* **目的**：將 Depthwise 分開處理的資訊進行融合 (Merge)，最終得到與標準 CNN 輸出層相同的結構，但計算量大幅降低。

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767151274/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.21.00_aviu5x.png)

---

## 5. 心得與反思

這堂課讓我看到了與資料科學截然不同的加速視角。
* **我的研究方向 (Data Science)**：通常透過優化演算法、資料前處理（降維、正規化）來減少運算次數。
* **硬體設計方向 (Hardware Design)**：陳老師則是透過優化 PE 架構，從物理層面的資源分配來加速。

Hierarchical PE 的設計讓硬體能適應不同精度的運算需求，這對於資源受限的 Edge Devices 發展至關重要，也是未來 AI 落地應用的關鍵技術。