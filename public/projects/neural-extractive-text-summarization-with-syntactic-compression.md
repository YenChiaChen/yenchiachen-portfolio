---
title: Neural Extractive Text Summarization with Syntactic Compression
category: AI
type: Research Project
achievement: NLP
role: Model Design & Experiment
tags: [Text Summarization, NLP, Information Retrieval, Syntactic Parsing, Neural Networks]
---

## Overview

This project proposes a **joint extractive and compressive text summarization system** that integrates neural sentence extraction with **syntax-aware compression**.  
The objective is to improve summary information density while preserving grammaticality, addressing limitations of purely extractive or abstractive approaches.

---

## Problem Definition

- Extractive summarization is robust but often verbose  
- Abstractive summarization is flexible but hard to control and evaluate  
- Naïve compression risks ungrammatical outputs  

**Goal:**  
Design a controllable summarization framework that:
- Selects salient sentences
- Compresses them using syntactic constraints
- Maintains grammatical correctness and semantic integrity

---

## System Architecture

### Extractive Model

- **Sentence Encoder**: BiLSTM over word embeddings  
- **Document Encoder**: CNN over sentence representations  
- **Decoder**: Ranks sentences and selects top-*n* candidates  

Pipeline:

Word → Sentence Representation → Document Representation → Sentence Ranking

--

### Compressive Model

- **Contextualized Encoder** over extracted sentences  
- **Compression Encoder** generates deletion candidates  
- **FFNN Binary Classifier** predicts Keep / Delete  

Compression is applied post-extraction, enabling modular control and stable optimization.

---

## Syntactic Compression Rules

Compression candidates are generated via constituency parsing, including:

- Appositive noun phrases  
- Relative and adverbial clauses  
- Adjective phrases in noun phrases  
- Gerundive verb phrases  
- Selected prepositional phrases  
- Parenthetical expressions  

All deletions are linguistically constrained to reduce grammatical damage.

---

## Compression Trade-off

- Compression effectiveness depends on threshold selection  
- Moderate compression improves ROUGE scores  
- Aggressive compression degrades performance due to over-deletion  

This highlights a clear trade-off between **information density** and **grammaticality**.

---

## Experimental Setup

### Datasets

- CNN  
- CNN / DailyMail (CNNDM)  
- New York Times (NYT)  

These datasets exhibit different compressibility characteristics.

---

### Baselines

- Lead  
- LeadDedup  
- LeadComp  
- Extraction-only  
- Refresh  
- LatSum  
- BanditSum  

---

### Evaluation Metrics

- ROUGE-1 / ROUGE-2 / ROUGE-L  
- Human grammaticality evaluation (Amazon Mechanical Turk)  
- Manual error analysis  

---

## Results

### CNN Dataset

| Model           | ROUGE-1 | ROUGE-2 | ROUGE-L |
|-----------------|---------|---------|---------|
| Lead (Ours)     | 29.1    | 11.1    | 25.8    |
| Refresh         | 30.3    | 11.6    | 26.9    |
| LatSum          | 28.8    | 11.5    | 25.4    |
| BanditSum       | 30.7    | 11.6    | 27.4    |
| LeadDedup       | 29.7    | 10.9    | 26.2    |
| LeadComp        | 30.6    | 10.8    | 27.2    |
| Extraction      | 30.3    | 11.0    | 26.5    |
| ExtLSTMDEL      | 30.6    | 11.9    | 27.1    |
| **JECS**        | **32.7**| **12.2**| **29.0**|

---

### CNN / DailyMail Dataset (CNNDM)

| Model                  | ROUGE-1 | ROUGE-2 | ROUGE-L |
|------------------------|---------|---------|---------|
| Lead (Ours)            | 40.3    | 17.6    | 36.4    |
| Refresh                | 40.0    | 18.1    | 36.6    |
| NeuSum                 | 41.6    | 19.0    | 38.0    |
| LatSum                 | 41.0    | 18.8    | 37.4    |
| LatSum w/ Compression  | 36.7    | 15.4    | 34.3    |
| BanditSum              | 41.5    | 18.7    | 37.6    |
| CBDec                  | 40.7    | 17.9    | 37.1    |
| FARS                   | 40.9    | 17.8    | 38.5    |
| LeadDedup              | 40.5    | 17.4    | 36.5    |
| LeadComp               | 40.8    | 17.4    | 36.8    |
| Extraction              | 40.7    | 18.0    | 36.8    |
| **JECS**               | **41.7**| **18.5**| **37.9**|

---

### New York Times Dataset (NYT)

| Model      | ROUGE-1 | ROUGE-2 | ROUGE-L |
|------------|---------|---------|---------|
| Lead       | 41.8    | 22.6    | 35.0    |
| LeadDedup  | 42.0    | 22.8    | 35.0    |
| LeadComp   | 42.4    | 22.7    | 35.4    |
| Extraction | 44.3    | 25.5    | 37.1    |
| **JECS**   | **45.5**| **25.3**| **38.2**|

---

## Human Evaluation (Grammaticality)

Platform: Amazon Mechanical Turk

| Model        | Preference (%) ↑ | Error ↓ | ROUGE-1 ↑ |
|--------------|------------------|---------|-----------|
| Ext LEAD3    | –                | 22      | 29.1      |
| ExtDROP      | 12%              | 161     | 30.2      |
| ExtLSTMDEL   | 43%              | **24**  | 30.6      |
| **JECS**     | **45%**          | 31      | **32.7**  |

---

## Key Contributions

- Joint extractive–compressive neural summarization framework  
- Syntax-constrained compression via constituency parsing  
- Empirical analysis of compression thresholds  
- Human evaluation validating grammatical acceptability  
