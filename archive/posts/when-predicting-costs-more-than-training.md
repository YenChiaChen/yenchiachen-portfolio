---
title: 59 Seconds to Avoid 47 Seconds
date: 2026-08-15
tags: [Machine Learning, MLOps, Research, Cost]
excerpt: My master's thesis predicts a CNN's final accuracy without training it. Then I measured what the prediction costs, and on CIFAR-10 it was slower than just training the model.
---

On CIFAR-10, my framework spends 59.0 seconds predicting what a CNN's accuracy will be without training it. Training that CNN takes 47.1 seconds.

If you are building anything that promises to skip training, that gap is the number you have to publish and almost nobody does. Being training-free is not the same as being cheap, and the point where it starts paying is different for every dataset you point it at.

## What the thing actually does

Train 5,184 CNN variants for 40 epochs across five image datasets and one pattern shows up before any of the others: the architecture you pick moves final accuracy far less than the dataset you picked it for. MNIST forgives almost any reasonable design. CIFAR-100 punishes most of them.

So each dataset behaves as if it has its own accuracy band. Easy datasets get a narrow, high band. Hard datasets get a wide, lower one. The architecture decides where inside the band you land, not which band you are in.

The framework is that observation turned into two models. Stage 1 samples about 10% of a dataset, computes fifteen data complexity measures on the sample, and feeds them to a Random Forest that predicts a baseline accuracy for the dataset. Stage 2 takes the CNN's architecture parameters and hyperparameters plus that baseline, and a Gradient Boosting model predicts an offset. The prediction is baseline plus offset, and no CNN is ever trained.

Predicting converged accuracy directly, in one shot, was the obvious alternative. Splitting it into baseline and offset cut mean squared error by more than 90%. That is the strongest single result in the thesis and it came from a failure.

## The experiment that did not work

I wanted to show that data complexity explains accuracy inside a dataset, not just between datasets.

The setup was clean. Take CIFAR-10, generate variants with deliberately varied Variance Mean and deliberately varied Covariance Mean, train on each, plot accuracy against the metric. Between datasets these two measures behave beautifully. Tiny ImageNet sits at high Variance Mean and low accuracy. Fashion-MNIST sits at low Variance Mean and high accuracy. Covariance Mean tracks accuracy so tightly across datasets that I ran a separate batch normalization ablation to check whether the mechanism was what I thought it was, and it was: batch norm helped exactly where the correlation predicted it would.

Inside one dataset, both plots came out as noise. Two scatter plots, no trend in either, and no amount of squinting produced one.

That result is why the pipeline has two stages instead of one. If these measures had explained within-dataset variation, a single model taking complexity and architecture together would have been the right design, and simpler. They do not. They are good at placing a dataset relative to other datasets and bad at explaining why one CNN beat another on the same data, where the architecture is doing the work. I would have taken the single-model design if the data had offered it. It did not.

I still find this slightly unsatisfying. Variance Mean around 0.09 was the most favourable training distribution I observed, which sounds like something that should hold within a dataset too, and it does not appear to.

## What one prediction costs

The framework's cost is dominated by Stage 1. Computing complexity measures on a 10% sample is the whole bill; the two trained predictors run in about 0.3 milliseconds per architecture, which rounds to nothing.

That bill scales with how hard the data is to describe, and training time does not scale the same way. Below, `train_median` is the median training run I am trying to avoid, `framework` is what one prediction costs, and `break-even K` is how many candidate models you have to screen before running the framework beats just training them.

| dataset | train_median | framework | break-even K | speedup at K=1 | speedup at K=100 |
| :-- | --: | --: | --: | --: | --: |
| cifar10 | 47.1s | 59.0s | 1.25 | 0.80x | 79.8x |
| cifar100 | 46.7s | 159.3s | 3.41 | 0.29x | 29.3x |
| fashion_mnist | 40.9s | 1.9s | 0.048 | 21.0x | 2071.9x |
| mnist | 42.1s | 1.7s | 0.041 | 24.4x | 2401.1x |

Read the CIFAR-100 row first. Training a model there takes 46.7 seconds, essentially the same as CIFAR-10, but describing the dataset takes 159.3 seconds, nearly three times as long. Training cost is set by image size, epochs, and hardware. Complexity measurement cost is set by class count and how tangled the classes are, and CIFAR-100 has a hundred of them. The two costs are driven by different things, so they come apart, and CIFAR-100 is where they come apart hardest.

On MNIST and Fashion-MNIST the break-even is below one. Screening a single candidate is already worth it, because the DCM pass costs under two seconds against a forty-second training run. On CIFAR-10 you need two candidates. On CIFAR-100 you need four.

There is a second asymmetry hiding in that table. The framework's cost is paid once per dataset, and the training cost is paid once per candidate, so K is the only lever that moves. Sampling more data raises the framework's cost and does not change the break-even shape; sampling less lowers it until the baseline model's predictions start throwing outliers, which happens below about 10%.

Those are small numbers. Anyone doing architecture search screens hundreds of candidates and the framework wins by one to three orders of magnitude. But the headline claim of every training-free predictor is that it is cheaper than training, and on CIFAR-10 at K=1 it comes out at 0.80x, meaning you spent 25% longer to learn something you could have measured directly. The claim holds only above a threshold, and the threshold is a property of your dataset rather than of the method.

## The energy numbers disagree with the clock

CIFAR-10 costs 0.223 Wh to predict against 2.88 to 4.19 Wh to train. That is a 12.9x to 18.8x energy win on the same dataset where the wall clock says you lost.

The reason is that the two workloads use the machine differently. Training saturates the accelerator. The complexity measures are mostly CPU-side linear algebra on a small sample. Across the full set, energy speedup runs from 4.7x to 6.9x on CIFAR-100 up to 394x to 573x on MNIST.

I trust the direction of those ratios more than their size, for two reasons. The training side is not measured at all. It applies the same 220 to 320 W band to every dataset, a stand-in for what an accelerator draws rather than a reading from one. The framework side is measured, and the measurement is suspect: idle came out at 14.36 W against 13.63 W under load, a net load of negative 0.73 W across a 40 second window on an ARM laptop, which means the platform's power reporting never resolved the workload. So the energy column tells you which of the two is the heavier job. It does not tell you by how much, and I would not quote its second digit at anyone.

## Break-even is an engineering target, not a constant

Timing every complexity measure separately on MNIST at n=500 turns the break-even number from a fact into a to-do list.

<figure class="bars">
<figcaption>Share of total DCM computation time per measure (MNIST, n=500)</figcaption>
<div class="bar"><span class="bar-label">Error rate of linear classifier</span><span class="bar-track"><span class="bar-fill" style="width:100%"></span></span><span class="bar-value">35.4%</span></div>
<div class="bar"><span class="bar-label">PCA dim / original dim</span><span class="bar-track"><span class="bar-fill" style="width:65.3%"></span></span><span class="bar-value">23.1%</span></div>
<div class="bar"><span class="bar-label">PCA dims per point</span><span class="bar-track"><span class="bar-fill" style="width:63.8%"></span></span><span class="bar-value">22.6%</span></div>
<div class="bar"><span class="bar-label">Intra/extra class NN distance</span><span class="bar-track"><span class="bar-fill" style="width:35.9%"></span></span><span class="bar-value">12.7%</span></div>
<div class="bar"><span class="bar-label">All eleven others combined</span><span class="bar-track"><span class="bar-fill" style="width:17.8%"></span></span><span class="bar-value">6.3%</span></div>
</figure>

Three measures out of fifteen account for about 81% of the time. Eleven measures together account for 6.3%.

Which means the break-even number in that table is not a property of the approach. It is a property of one implementation's three most expensive functions. Cache the two PCA measures against a single decomposition, or approximate the linear classifier's error rate instead of fitting it exactly, and CIFAR-10's break-even moves toward the MNIST end of the range. I did not do that work, and I am confident it is available, which is a different and more useful statement than "the framework is fast."

## How far it travels

Cost only matters if the prediction is worth having. On datasets the baseline model was trained on, predictions are accurate. On the same dataset with different classes held out, accuracy drops slightly, which says the model learned the distribution rather than the label set. On a similar but different dataset, training on CIFAR-100 and testing on CIFAR-10, the drop is clearer, so there is real dataset dependence in there. On something completely unfamiliar, a NIST X-ray set, the drop is largest, and the prediction is still usable as a rough band.

The full validation set behind all of this is 10,370 training runs over six datasets (MNIST, Fashion-MNIST, notMNIST, CIFAR-10, CIFAR-100, PathMNIST), three architecture families, and 324 distinct architecture and hyperparameter combinations. The 10% sampling ratio came out of that too: below roughly 10% the baseline model's error throws outliers, and above it they mostly stop.

## What I would tell the next person

The framework works, and the sentence I would put next to it is that it is slower than training on the first model you screen for two of the four datasets I measured properly. Both halves are true and only one of them usually gets written down.

If you are building a training-free predictor, measure your own cost before you claim the speedup, and report the break-even K per dataset instead of one number. It takes an afternoon, it is the first thing a reviewer should ask for, and in my case it turned the most quotable claim in the work into a conditional one.
