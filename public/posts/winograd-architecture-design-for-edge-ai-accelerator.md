---
title: Winograd Architecture Design for Edge AI Accelerator
category: EDGE
type: Course Notes
achievement: 課程筆記
tags: [AI Accelerator, Winograd Algorithm, Edge AI, CNN Optimization, Hardware-Algorithm Co-design]
excerpt: 課程筆記整理，介紹 Winograd 演算法如何應用於 Edge AI Accelerator 設計，以降低 CNN 卷積運算的計算成本，並分析其在不同設定下的效能與限制。
---

# 課程背景與主題概述

繼上星期陳老師介紹以硬體架構加速邊緣 AI 運算後，本週講師則著重於**從演算法層面切入，以降低整體運算成本**。課程核心目標在於說明如何運用 **Winograd 演算法**，設計能適用於不同運算需求的 AI Accelerator 架構。

講師指出，對於不同的運算需求與 kernel size，往往需要對應不同的硬體設計，而 Winograd 演算法提供了一種在演算法層面降低乘法次數、進而節省運算資源的可能方向。

---

# Winograd 演算法基本概念

Winograd 演算法的核心思想在於，透過數學轉換將卷積運算重新表示，以**減少乘法次數，換取更多加法與前後處理（transform）運算**。其主要流程可概括為：

1. 將 input feature map 與 convolution kernel 透過 Winograd transform 轉換至中間表示  
2. 在轉換後的空間中進行 element-wise multiplication  
3. 再透過 inverse transform 將結果轉回輸出空間

當遇到不同的 input、filter 與 kernel size 時，Winograd 演算法可先對其進行規模正規化處理，再於輸出階段還原成對應格式，從而提高硬體設計的通用性。

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767152787/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.45.52_oebesq.png)

---

# 運算加速原理與計算成本分析

Winograd 演算法能加速卷積運算的關鍵，在於**有效降低乘法（multiplication）的次數**。以一維陣列乘法為例，傳統計算方式需要：

- 6 次乘法
- 4 次加減法

而透過 Winograd 分解後，可將運算轉換為：

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767152788/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.45.59_ncsxpj.png)

在此情況下，乘法次數可下降至 4 次，但相對地：

- 加法次數會增加  
- 需要額外的 transform 與 inverse transform 計算  
- 必須儲存 transform matrix，增加記憶體需求  

隨著 filter 尺寸增大，加法與 transform 的成本會變得更加顯著；同時，當 transform matrix 尺寸上升時，也可能對數值精準度造成影響。因此，Winograd 演算法通常**較適合應用於小尺寸 kernel 與 tile-based convolution**。

---

# 與 CNN Model 的效能比較

在與 CNN 模型（如 VGG16）的比較中，使用 Winograd 架構後：

- 所需 cycle 數約為原本 VGG16 的 **66%**
- 當 PE array size 增加時，cycle reduction 效果更為明顯

然而，在 **Stride = 2** 的設定下，當 filter 數量上升，Winograd 的效益會快速下降。在 24 filters 的情況下，cycle 數甚至上升至 **133%**，僅在 filter 數量較少時能維持加速效果。

考量實際應用場景中，多數 CNN 卷積操作仍以 **Stride = 1** 為主，因此 Winograd 演算法在現實 Edge AI 應用中仍具有相當高的實用價值。

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767152789/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.46.09_w4cmyg.png)

---

# 課程心得與反思

連續兩週的課程主題皆聚焦於 **AI Accelerator**，讓我對整體加速架構的理解有明顯進步。起初我認為，在演算法已相對成熟、且需處理大量資料的前提下，軟體層級的加速空間相當有限，但講師的研究顯示，在多種情境下仍能將運算成本降低接近 **50%**。

我認為這類研究最大的價值在於其**通用性**。相較於僅針對單一案例或特定系統進行的最佳化，Winograd-based 的設計能套用於多種 CNN 架構與應用場景，對 Edge AI 系統特別具有吸引力。

也希望未來在實際使用或實作 AI Accelerator 時，能親自驗證 Winograd 演算法所帶來的效益，進一步加深對硬體與演算法協同設計的理解。
