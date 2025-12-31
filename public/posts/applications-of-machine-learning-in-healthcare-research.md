---
title: Applications of Machine Learning in Healthcare Research
category: ML
type: Data Science
achievement: 課程筆記
tags: [Healthcare AI, Bio-informatics, Public Health, Machine Learning]
description: 探討機器學習在生物醫療領域的三個層級應用：分子、病患與公共衛生，並深入分析登革熱預測模型。
---

# 機器學習於生物醫療研究的應用：從分子到公共衛生

## 1. 生物醫療研究的三大層級 (Three Levels of Healthcare AI)

蘇老師的研究將機器學習在生物醫療的應用，系統性地分為三個層級：

### (1) 分子層級 (Molecular Level)
利用機器學習處理微觀的生物資訊。
* **預測定位**：預測分子在細胞內的位置，透過特徵的文本分析進行歸類以獲取訓練資料。
* **序列語言化**：將蛋白質序列視為「文章」，利用 **自然語言處理 (NLP)** 的技術找出蛋白質中具重要意義的序列。
* **資料縮減**：例如使用 **PLSA (Probabilistic Latent Semantic Analysis)** 將類似詞彙統整，達到降維與特徵萃取的效果。

### (2) 病患層級 (Individual Patient Level)
針對個人的健康風險進行評估。
* **風險預測**：透過機器學習計算病患發生併發症的機率，協助醫生與病患降低潛在的風險因子。

### (3) 公共衛生層級 (Population Level)
將 AI 帶入宏觀的社會生活環境。
* **流行病預測**：判斷登革熱熱區、Covid-19 傳染機率等。

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767150478/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.07.29_ppj8em.png)

---

## 2. 深入案例：公共衛生與登革熱預測

這是我最感興趣的部分，這與蔡老師提到的「金融視覺」有異曲同工之妙——**強調資工技術的跨域擴散價值**。

> 「資訊工程是有價值的技術，然而將以資工為基礎擴散到其他領域，便能擴大它的價值，將資工帶到每個人的生活周遭，它會成為普世價值。」

### 登革熱預測模型的建立流程
蘇老師以登革熱預防為例，展示了完整的資料科學流程：

1.  **資料收集 (Open Data)**：
    * 取得政府公開資料，包含：病例數、溫度、病媒蚊指數、空氣污染數據。
    * 計算每日病例的平均值。
2.  **統計分析 (Statistical Analysis)**：
    * 使用 **Spearman's correlation** 和 **T-test** 進行資料的初步探索與特徵篩選。
3.  **模型建立 (Model Building)**：
    * 老師的研究特色在於**多樣性**，通常會選擇四種以上不同性質的演算法來建立模型，例如：
        * Gradient Boosting (梯度提升)
        * Neural Network (神經網路)
        * Decision Tree (決策樹)
        * Logistic Regression (羅吉斯迴歸)

**心得：** 使用不同種類的機器學習方式來處理同一問題，對於增加預測的準確度與魯棒性非常有幫助。

![image](https://res.cloudinary.com/dcpzacz9d/image/upload/v1767150479/%E6%88%AA%E5%9C%96_2025-12-31_%E4%B8%8A%E5%8D%8811.07.41_occxxs.png)

---

## 3. 心得與展望：醫療資源的最佳化

這堂課讓我深刻理解到機器學習對衛生及社會的具體貢獻：

* **效率提升**：解決了傳統一對一診療與人工分析耗時的問題。
* **資源分配**：讓醫院能更有效地分配稀缺的醫療資源。
* **集體智慧**：透過神經網路的訓練，模型彷彿匯集了全台灣甚至全世界醫生的經驗，讓每位病人都能享有高水準的診斷輔助。

雖然我並非醫療專業出身，但這堂課提供了一個很好的視野。透過機器學習技術，我們能讓世界上各領域的資源不僅被更有效地應用，也能產出更優秀的成果。