

---
title: Addressing Imbalance in UNSW-NB15 Dataset
category: AI
type: Generative Model
achievement: 資安
tags: [Cybersecurity, Imbalanced Data, UNSW-NB15, GAN, ctGAN, SMOTE]
description: 解決網路入侵偵測資料不平衡：基於 Generative Models 的應用。
---

## 1. 前言：資安資料的「大海撈針」難題


在網路安全領域，我們經常面臨一個棘手的情況：**正常的流量數據極其龐大，而真正的攻擊行為（異常數據）卻少之又少。**
以我們使用的 **UNSW-NB15** 資料集為例，雖然它包含了 9 種不同類型的攻擊行為，但絕大多數的樣本都屬於 Normal 或 Generic 類別。像 Analysis、Backdoor、Worms 這類高風險攻擊，其樣本數在數萬筆資料中可能僅有幾百筆，甚至是幾十筆。

這種極端的 **資料不平衡 (Data Imbalance)** 會導致模型傾向於預測多數類別（因為這樣準確率最高），卻忽略了我們真正想抓到的攻擊行為。

本研究的目標很明確：**如何透過生成模型（Generative Models）來「補齊」這些稀有攻擊樣本，進而提升入侵偵測系統的偵測率？**


## 2. 嘗試與挑戰：從 SMOTE 到 GAN 的跌跌撞撞

為了解決不平衡問題，我們經歷了三個階段的嘗試，這也是本研究最核心的探索過程。

### Phase 1: 傳統方法 SMOTE (Synthetic Minority Over-sampling Technique)
一開始，我們使用了最經典的 SMOTE 演算法。它的原理是在少數類別樣本之間進行插值 (Interpolation) 來產生新樣本。
* **結果：** 雖然 Recall (召回率) 提升了，但在複雜模型上的整體表現並不理想。
* **原因：** 我們發現 SMOTE 容易產生過多的雜訊 (Noise)，導致模型 **Overfitting**。它生成的樣本與原始樣本太過相似，且在處理 UNSW-NB15 這種高維度（49個特徵）且包含複雜特徵的資料時，單純的近鄰插值效果有限。

### Phase 2: 基礎 GAN 與 CGAN (Conditional GAN)
既然傳統方法無效，我們轉向了深度學習的生成對抗網路 (GAN)。我們嘗試用 GAN 和 CGAN 來生成特定類別的攻擊數據。
* **結果：** 失敗。生成的資料品質不佳，甚至導致分類器效能下降。
* **原因：**
    1.  **Mode Collapse (模式崩塌)：** Generator 發現騙過 Discriminator 的捷徑，開始不斷生成重複的單一資料。
    2.  **表格資料的複雜性：** 我們的資料不是圖片，而是包含連續數值與離散類別的「表格數據 (Tabular Data)」。傳統 GAN 在處理這種混合型資料時非常吃力。

### Phase 3: 最終解法 ctGAN (Conditional Tabular GAN)
最後，我們採用了專為表格資料設計的 **ctGAN**。
* **特點：**
    * 針對連續變數使用高斯混合模型 (Gaussian Mixture) 建模。
    * 針對離散變數使用 Variational Categorical Distribution。
    * 引入了更有效的 Conditional Generator 機制，避免了 Mode Collapse。

---

## 3. 方法論 (Methodology)：類別導向的資料增強

我們設計了一套 **Class-based Data Augmentation** 的流程來整合 ctGAN：

1.  **Baseline 建立：** 使用 Random Forest 對原始不平衡資料進行訓練，作為基準。
2.  **迭代生成 (Iterative Generation)：**
    * 針對每一個稀有攻擊類別（如 Worms, Shellcode），利用 ctGAN 生成 500 筆合成資料。
    * 將合成資料加入訓練集 (Training Set)。
    * **評估 (Evaluate)：** 測試模型效能是否提升。如果提升 (Positive AP)，則保留這批資料；否則丟棄並重新生成。
3.  **平衡終止條件：** 持續生成直到該類別數量達到多數類別的水準。

![圖2：ctGAN 架構與流程圖](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767148901/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8810.39.39_zi5sxv.png)


---

## 4. 實驗結果 (Results)

我們將 Random Forest 作為分類器，比較了 Baseline、SMOTE、以及我們提出的 ctGAN 方法。實驗數據顯示 ctGAN 在處理稀有類別上具有顯著優勢。

### A. 關鍵類別的精確度提升
對於極度稀缺的攻擊類型，ctGAN 帶來的改善最為明顯。
* **Worms (蠕蟲攻擊)：** Precision 提升了 **13%** (從 0.56 提升至 0.69)。
* **Exploits (漏洞利用)：** 也有顯著的效能增長。

### B. 整體效能比較
下表展示了不同方法在 Macro-average 下的表現：

| Method | Accuracy | Recall | F1 Score |
| :--- | :--- | :--- | :--- |
| **Baseline (Original)** | 0.81 | 0.64 | 0.69 |
| **Ours (ctGAN)** | **0.83** | **0.67** | **0.72** |

可以看到，相較於 Baseline，使用 ctGAN 增強後的資料集在各項指標上都有所提升，且沒有出現 SMOTE 那樣 Precision 大幅下降的副作用。

![圖3：各類別效能比較圖](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767149089/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8810.40.00_bwgnsm.png)

---

## 5. 結論與心得 (Conclusion)

這項研究讓我們對「如何處理不平衡資料」有了更深的體悟：

1.  **生成模型的選擇至關重要：** 在處理資安這類包含大量特徵（數值/類別混合）的表格資料時，直接套用處理圖片的 GAN 效果很差。**ctGAN** 透過對表格資料特性的專門設計，證明了其優越性。
2.  **質重於量：** 盲目地增加合成資料（如 SMOTE）可能會引入雜訊。透過 Conditional 的生成方式，我們可以更有針對性地補強模型「學不好」的那些類別。
3.  **未來展望：** 雖然我們嘗試結合 SMOTE + ctGAN 但效果不彰，未來可以探討如何優化 Generator 的特徵提取機制，讓生成的攻擊流量更具備真實世界的隱蔽特徵。

感謝您的閱讀，這份專案展示了 Generative AI 在 Cybersecurity 領域的潛力，不僅是產生圖片，更能用來防禦網路攻擊。
