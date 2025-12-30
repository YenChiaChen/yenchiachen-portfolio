
---
title: Data Complexity-aware Deep Model Performance
Forecasting
category: AI
type: MLOps
achievement: 碩士論文
tags: [	Performance Prediction, Data Complexity, Deep Learning, MLOps, Explainable AI]
description: 基於資料特性分析的深度模型效能預測。
imageUrl: xxx
---

## 1. 研究動機 (Motivation)

這項研究的起點，來自於 **MLOps** 領域中一個核心的痛點。

目前在開發深度學習模型時，我們往往需要經歷冗長的流程，包含架構設計、超參數調整，以及不斷的試錯 (Trial and Error)。這樣的過程不僅耗時，更消耗大量的運算資源。



因此，如果能在**開始訓練前 (Pre-training)** 就準確預測模型的效能，將極具研究價值。

雖然現有的預測方法（如 Learning Curve Extrapolation）可以透過小規模訓練來推估收斂結果，或者使用複雜的代理模型 (Proxy Model) 來預測，但這些方法通常計算成本依然很高，有時甚至比實際訓練還慢。此外，大多數方法如同「黑箱」，缺乏可解釋性。

因此，本研究的核心問題是：
**我們是否有機會只透過「資料本身的可量測特徵」，建立一個輕量化且具備可解釋性的預測框架，來精準預估模型的最終準確率？**

---


## 2. 方法論 (Methodology)

為了達成上述目標，我們設計了一個兩階段的預測框架：


* **第一階段 (Stage 1)**：專注於資料本身。我們透過資料複雜度指標，利用一個線性模型來預測該資料集的 **Baseline Accuracy**。您可以將其理解為給定資料集一個「難度基準分數」。
* **第二階段 (Stage 2)**：結合模型架構資訊。我們探討特定的模型選擇在該資料難度下，會產生什麼樣的效能 **偏移量 (Offset)**。

最終的預測公式為：**預測準確率 = Baseline Accuracy + Offset**。


### 2.1 第一階段：Baseline Accuracy 預測

為什麼第一階段使用線性模型？請看這張圖。



我們收集了 7 種不同影像辨識資料集，每種資料集使用約 2000 組不同參數訓練。結果顯示，約 50% 的模型效能其實都落在圖中的一條弧線上。這條弧線就是我們定義的 **Baseline Accuracy**。這意味著，只要我們能找到足夠好的資料複雜度指標 (DCMs) 作為輸入，線性模型就足以預測出這 50% 的基礎準確率區間。

### 2.2 第二階段：Offset 預測

第二階段我們使用 XGBoost 來預測 **Offset**。輸入特徵包含了：
1.  資料複雜度 (DCMs)
2.  模型參數 (Model Parameters)
3.  第一階段輸出的 Baseline Accuracy

這裡必須再次放入「資料複雜度」的原因在於：**模型參數對效能的影響，高度取決於資料的難度**。例如，深層模型在複雜圖片上表現較好，但在簡單任務上卻容易 Overfitting。我們需要非線性的 XGBoost 來學習這種交互關係，判斷模型設定會讓準確率往上或往下偏移多少。


### 2.3 資料複雜度指標 (Data Complexity Measures, DCMs)

為了讓模型能準確學習，我們選用了五個面向的 DCMs：



1.  **Neighborhood-based**：觀察樣本與鄰居的關係。
    * 例如 `NN Distance Ratio` 計算同類與異類距離差異；`NN Non-linearity` 則測試線性內插新樣本是否會導致錯誤分類。
2.  **Feature-based**：評估特徵的有效性。
    * `Variance Mean` 看整體變異程度；`Max Fisher's Ratio` 找尋區分能力最強的特徵。
3.  **Linearity**：直接測試資料是否線性可分。
4.  **Dimensionality**：資訊密度視角。
    * `PCA Components` 分析需要多少主成分才能解釋 95% 變異量；`PCA Retention Ratio` 看保留了多少資訊。
5.  **Class Balance**：類別平衡性。
    * `Class Entropy` 和 `Imbalance Ratio` 用來衡量資料分佈的不平衡程度。

我們將這些指標進行 PCA 降維，取前 7 個主成分作為 Stage 1 的輸入。

而在模型參數部分，我們選用了 **Filters, DenseUnit, Dropout, Learning Rate** 等超參數，並挑選 **LeNet, VGG, ResNet** 三種模型來模擬淺、中、深不同深度的架構差異。

---

## 3. 實驗結果 (Result)

我們使用 7 種不同領域的圖像資料集（涵蓋醫療、手寫、物體辨識等），結合上述模型與參數，建立了超過 **10 萬筆** 的模型訓練資料庫進行驗證。

### 3.1 驗證兩階段設計的合理性

首先，我們觀察模型深度與準確率的關係。



從圖中可以看到，無論模型深淺（左至右），最佳表現差異不大。模型架構與最終準確率最大的關聯反映在「標準差」上。這證實了**資料集難度才是主導因素**，不存在 "One-size-fits-all" 的模型，這與我們的框架設計理念相符。

接著我們對特徵進行主成分分析 (PCA)：



* **PC1 (第一主成分)**：主要由 `NN Classifier` 相關特徵組成，描述**非線性特徵**與類別邊界的複雜度。數值越高，幾何結構越複雜。
* **PC2 (第二主成分)**：由 `Error Rate of Linear Classifier` 和 `Variance Mean` 組成，描述**線性可分性**與特徵分佈寬度。

有趣的發現是：**PC2 對應我們的 Stage 1 (Baseline 線性預測)，而 PC1 對應 Stage 2 (Offset 非線性預測)**。這從側面證明了我們兩階段拆解是合理的。

### 3.2 框架效能驗證

我們採用 **Leave-One-Dataset-Out (LODO)** 進行驗證，即測試資料集完全不在訓練資料中。



* **Baseline 預測**：僅使用資料複雜度，我們就能精準預測出 Baseline 區間（圖中長條狀分佈），即使是極端值也能抓到。
* **最終預測**：加入 Stage 2 的偏移量後，無論是在分佈內 (In-Distribution) 或分佈外 (Out-of-Distribution/LODO) 的測試，MSE (均方誤差) 都極低（LODO MSE < 0.012）。
* **跨領域測試 (LODM)**：即使跨越不同 Domain，MSE 也能維持在 0.008 以下，驗證了框架的泛化能力。

### 3.3 單階段 vs. 雙階段比較



比較結果顯示，加入 Baseline Accuracy 的雙階段模型，在 R-Square、MSE 和 MAE 上都大幅優於單階段模型。這再次證實了利用資料複雜度的線性關係建立 Baseline 是非常關鍵的步驟。

### 3.4 可解釋性與模型選擇

我們發現 `Variance Mean` 是與模型架構最相關的特徵。



* **模型選擇指引**：`Variance Mean` 與 Offset 的 PCA Loading 高達 -0.8。這意味著當 `Variance Mean` 較低時（特徵變異小），模型參數設定必須更精確，通常需要較深的模型架構。

* **誤差診斷**：我們分析了預測誤差 (MSE) 與輸入主成分的關係，發現 **PC6** 扮演關鍵角色。PC6 反映了 `Class Entropy` 和 `Variance Mean`。
    * PC6 與 MSE 呈現雙尾 (Double-tailed) 關係。
    * **PC6 過高**：類別分佈混亂 (Variance Instability)。
    * **PC6 過低**：類別間模糊 (Class Bias)。
    * 因此，PC6 可以作為預測準確率時的「風險指標」。

---

## 4. 結論 (Conclusion)

最後，我總結本研究的貢獻：

1.  **證實可行性**：我們證明了不需要實際訓練，只要能區分「資料難度」與「模型設計」的影響，就能準確預測模型表現。
2.  **DCMs 的有效性**：證實資料複雜度指標能有效作為預測特徵，且透過 PCA 分析提供了高度的可解釋性。
3.  **泛化能力**：在跨資料集與跨領域 (LODO/LODM) 測試中，本框架展現了精準的預測能力。
4.  **實務應用**：DCMs 不僅能預測準確率，還能輔助 **模型選擇**（如依據 Variance Mean 選擇深度）與 **誤差診斷**（利用 PC6 作為風險指標）。

