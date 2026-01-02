---
title: Vision Transformer: Image Recognition with Pure Attention
category: AI
achievement: Vision Transformer
type: Research Project
role: Model Analysis, Experimental Review
tags: [Vision Transformer, Transformer, Image Classification, Attention Mechanism, Representation Learning]
---

## Overview

This project provides a **systematic analysis of Vision Transformer (ViT)**, a pure attention-based architecture for large-scale image recognition proposed by Google Research.  
Unlike convolutional neural networks (CNNs), ViT directly applies the standard Transformer encoder to sequences of image patches, demonstrating that **convolution is not a strict prerequisite for strong visual representation learning**, given sufficient data and scale.

---


## Motivation and Background

- Transformers have achieved state-of-the-art performance in NLP due to global self-attention.
- In computer vision, CNNs dominate due to inductive biases such as locality and translation equivariance.
- Prior hybrid approaches (CNN + attention) showed limited gains.
- Pure attention models historically underperformed CNNs on standard-scale datasets.

**Key Question:**  
Can a Transformer-based architecture outperform CNNs in vision tasks when trained at sufficient scale?

---

## Model Architecture

### Patch Tokenization

Given an input image:

$$
x \in \mathbb{R}^{H \times W \times C}
$$

The image is divided into fixed-size patches of size $P \times P$:

- Number of patches:

$$
N = \frac{HW}{P^2}
$$

Each patch is flattened and linearly projected into a latent embedding. The input sequence to the Transformer encoder is:

$$
z_0 = [x_{\text{CLS}}; x_1E; x_2E; \dots; x_NE] + E_{\text{pos}}
$$

where:

- $x_{\text{CLS}}$ is a learnable classification token  
- $E$ is the patch embedding matrix  
- $E_{\text{pos}}$ denotes positional embeddings  

---

### Transformer Encoder

Each Transformer encoder block consists of:

1. Multi-Head Self-Attention (MHSA)
2. Feed-Forward Network (MLP)
3. Residual connections with Layer Normalization

The computation in the $$l$$-th encoder block is defined as:

$$
z'_l = \text{MHSA}(\text{LN}(z_{l-1})) + z_{l-1}
$$

$$
z_l = \text{MLP}(\text{LN}(z'_l)) + z'_l
$$

The encoder is stacked for $L$ layers.

---

### Classification Head

- The final hidden representation corresponding to the **[CLS] token** is used as the global image representation.
- An MLP head maps this representation to class logits.

---

## Model Variants

| Model | Layers | Hidden Dim | MLP Dim | Heads | Params |
|------|--------|------------|---------|-------|--------|
| ViT-B | 12 | 768 | 3072 | 12 | 86M |
| ViT-L | 24 | 1024 | 4096 | 16 | 307M |
| ViT-H | 32 | 1280 | 5120 | 16 | 632M |

Patch size notation (e.g., ViT-L/16) indicates a $16 \times 16$ input patch.

---

## Training Strategy

### Pretraining Datasets

| Dataset | Images | Classes |
|-------|--------|---------|
| ImageNet-1k | 1.3M | 1,000 |
| ImageNet-21k | 14M | 21,000 |
| JFT-300M | 303M | 18,000 |

Large-scale pretraining is **critical** to ViT performance.

---

### Optimization

- Optimizers evaluated: SGD, Momentum, Adagrad, Adam
- Fine-tuning consistently improves convergence stability
- Adam-based optimizers show faster initial convergence for ViT

---

## Experimental Results

### Image Classification Performance

| Dataset | ViT-H/14 (JFT) | ViT-L/16 (JFT) | ViT-L/16 (IN21k) | BiT-L | Noisy Student |
|-------|---------------|---------------|------------------|-------|---------------|
| ImageNet | 88.55 ± 0.04 | 87.76 ± 0.03 | 85.30 ± 0.02 | 87.54 ± 0.02 | 88.4 |
| ImageNet ReaL | 90.72 ± 0.05 | 90.54 ± 0.03 | 88.62 ± 0.05 | 90.54 | 90.55 |
| CIFAR-10 | 99.50 ± 0.06 | 99.42 ± 0.03 | 99.15 ± 0.03 | 99.37 ± 0.06 | – |
| CIFAR-100 | 94.55 ± 0.04 | 93.90 ± 0.05 | 93.25 ± 0.05 | 93.51 ± 0.08 | – |
| VTAB (19 tasks) | 77.63 ± 0.23 | 76.28 ± 0.46 | 72.72 ± 0.21 | 76.29 ± 1.70 | – |

---

### Compute Cost

| Model | TPUv3 Core-Days |
|-----|------------------|
| ViT-H/14 (JFT) | 2.5k |
| ViT-L/16 (JFT) | 0.68k |
| ViT-L/16 (IN21k) | 0.23k |
| BiT-L | 9.9k |
| Noisy Student | 12.3k |

ViT achieves competitive or superior performance with **significantly lower pretraining cost**.

---

## VTAB Generalization Analysis

ViT demonstrates strong transfer learning performance across:

- Natural tasks
- Specialized tasks
- Structured tasks

This indicates that **global self-attention learns general-purpose visual representations**.

---

## Key Observations

- ViT matches or exceeds CNN-based state-of-the-art under large-scale pretraining.
- The absence of strong inductive bias increases data dependency but improves model flexibility.
- Self-supervised and large-scale pretraining are critical for performance.
- Attention-based models scale more predictably than convolutional architectures.

---

## Contributions

- End-to-end architectural analysis of Vision Transformer
- Quantitative comparison with CNN-based baselines
- Evaluation across diverse datasets and transfer benchmarks
- Empirical validation of attention-only vision models

---
