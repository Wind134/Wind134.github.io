---
title: Q K V的理解
author: Ping
math: true
date: 2023-11-16 22:58:00 +0800
categories: [科研笔记, 模型理解]
tags: [科研, 深度学习]
---

## 概念意义

首先从概念层面来理解，我们从信息检索系统中去类比，我们要在知乎搜索一篇关于自注意力的文章；

> 我们输入进去所要搜索的信息，即为Q，理解为查询Query。  
> 知乎的搜索系统会给我们返回一系列结果，这些结果可能是文章的标题，可能是文章的内容，又或者是文章的分类标签信息，我们把这些称之为K，即关键字Key。  
> 综合这些信息，推荐算法最终会给出最佳匹配的结果，该结果即为V，即Value。  
> 但是这个结果一定是我们真正要的吗？这是整个问题的关键。

是的，要搜索出我们想要的结果，以上三步，哪一步都很重要，包括返回的值`V`；

我们不能随便定一个`Q`、`K`、`V`，这三者哪一个都会对我们最终想要的最终信息产生影响，我们理想化来说，就是希望通过上面三个参数得到我们最期待的搜索结果，而在这个过程中，`Q`、`K`、`V`中不论哪个都对我们的结果有很重要的意义；

因此我们需要不断地学习`Q`、`K`、`V`，对不；

这是注意力机制的开局！

## 核心思想

注意力机制，说白了就这么一个公式：

$$
\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

该公式所计算出的信息，是一个考虑了全局任务的权重，接下来我们针对该公式做全面的拆解：

- 有一个输入[$a_1$, $a_2$, $a_3$, $a_4$]，我们把这个输入看成一个矩阵$A$，接下来要干嘛，就是要去不断的迭代生成我们最佳的$Q$、$K$、$V$；
- 首先我们得到一个$Q$，$W^q$是一个要在学习过程中不断更新的权重，以便在最终获取到最合适的那个$Q$，公式如下所示：

$$
Q = {W^q} \cdot A
$$

- 然后我们要得到一个$K$，$W^k$是一个要在学习过程中不断更新的权重，以便在最终获取到最合适的那个$K$，公式如下所示：

$$
K = {W^k} \cdot A
$$

- 最后我们要得到一个$V$，$W^v$是一个要在学习过程中不断更新的权重，以便在最终获取到最合适的那个$V$，公式如下所示：

$$
V = {W^v} \cdot A
$$

- 这三步很清晰的展示了$Q$、$K$、$V$的诞生过程，我们可以很明确的看到，这三个参数一来都会有其对应的权重${W^q}$、${W^k}$、${W^v}$，通过相应权重在学习过程中不断的更新，从而生成最佳的$Q$、$K$、$V$；其次就是$Q$、$K$、$V$皆考虑了全局信息，因为都是与矩阵$A$做点积，矩阵$A$是包括了四个向量的全局信息的，这就是考虑了全局特征的三个矩阵；
- 到此为止，基本可以明确了以上三个参数的由来，好的，现在我们得到了三个考虑了全局信息的参数；
- 接下来就是对参数的使用了：
    - 得到的$Q$，深度学习中一般会默认为列向量此处为了便于说明，直接使用行向量，后续在公式处理环节会加以说明的，会对应四个向量[$q^1$、$q^2$、$q^3$、$q^4$]，这四个向量分别对应[$a_1$, $a_2$, $a_3$, $a_4$]的$q$向量，其中对于$q^1$而言，得到的这个参数是综合考虑了[$a_1$, $a_2$, $a_3$, $a_4$]全局信息的；
    - 得到的$K$，会对应四个向量[$k^1$、$k^2$、$k^3$、$k^4$]，这四个向量分别对应[$a_1$, $a_2$, $a_3$, $a_4$]的$k$向量，其中对于$k^1$而言，得到的这个参数是综合考虑了[$a_1$, $a_2$, $a_3$, $a_4$]全局信息的；
    - 得到的$V$，会对应四个向量[$v^1$、$v^2$、$v^3$、$v^4$]，这四个向量分别对应[$a_1$, $a_2$, $a_3$, $a_4$]的$v$向量，其中对于$v^1$而言，得到的这个参数是综合考虑了[$a_1$, $a_2$, $a_3$, $a_4$]全局信息的；

- 由于注意力机制的核心就是为了获取到注意力权重，权重这个概念我们会习惯性联想到(0, 1)之间的某个权重值，因此接下来要去处理权重的计算；
- 针对$a_1$，我们分别获取$a_1$与$a_1$、$a_2$、$a_3$、$a_4$之间的注意力权重，注意单位的区分，注意$a$与$\alpha$：

$$
\begin{align}
{\alpha}_{1,1} = {k^1} \cdot {q^1}\\  
{\alpha}_{1,2} = {k^2} \cdot {q^1}\\  
{\alpha}_{1,3} = {k^3} \cdot {q^1}\\  
{\alpha}_{1,4} = {k^4} \cdot {q^1}
\end{align}
$$

- 注意到一个细节，由于这是向量之间的点积，因此$q$显然要经过转置，不然不满足向量之间的相乘规律，这是一个很重要的点；
这只是针对$a_1$的注意力权重的计算，对于其他的$a_2$、$a_3$、$a_4$同理；
- 那么接下来就是数学层面的转换计算了，我们把所有的向量归为矩阵进行运算；

$$
\begin{align}
\begin{bmatrix}
{\alpha}_{1,1} \\ {\alpha}_{1,2} \\ {\alpha}_{1,3} \\ {\alpha}_{1,4} \end{bmatrix} = {\begin{bmatrix} {k^1} \\ {k^2} \\ {k^3} \\ {k^4} \end{bmatrix}} \cdot {q^1}
\end{align}
$$

$$
\begin{align}
\begin{bmatrix}
{\alpha}_{2,1} \\ {\alpha}_{2,2} \\ {\alpha}_{2,3} \\ {\alpha}_{2,4} \end{bmatrix} = {\begin{bmatrix} {k^1} \\ {k^2} \\ {k^3} \\ {k^4} \end{bmatrix}} \cdot {q^2}
\end{align}
$$

$$
\begin{align}
\begin{bmatrix}
{\alpha}_{3,1} \\ {\alpha}_{3,2} \\ {\alpha}_{3,3} \\ {\alpha}_{3,4} \end{bmatrix} = {\begin{bmatrix} {k^1} \\ {k^2} \\ {k^3} \\ {k^4} \end{bmatrix}} \cdot {q^3}
\end{align}
$$

$$
\begin{align}
\begin{bmatrix}
{\alpha}_{4,1} \\ {\alpha}_{4,2} \\ {\alpha}_{4,3} \\ {\alpha}_{4,4} \end{bmatrix} = {\begin{bmatrix} {k^1} \\ {k^2} \\ {k^3} \\ {k^4} \end{bmatrix}} \cdot {q^4}
\end{align}
$$

- 将$a_i$所得的注意力值全部拼接，那么就得到了注意力权重矩阵$A$；

$$
\begin{align}
\begin{bmatrix}
{\alpha}_{1,1} \space {\alpha}_{2,1} \space {\alpha}_{3,1} \space {\alpha}_{4,1} \\ {\alpha}_{1,2} \space {\alpha}_{2,2} \space {\alpha}_{3,2} \space {\alpha}_{4,2} \\ {\alpha}_{1,3} \space {\alpha}_{2,3} \space {\alpha}_{3,3} \space {\alpha}_{4,3} \\ {\alpha}_{1,4} \space {\alpha}_{2,4} \space {\alpha}_{3,4} \space {\alpha}_{4,4}\end{bmatrix} = {\begin{bmatrix} {k^1} \\ {k^2} \\ {k^3} \\ {k^4} \end{bmatrix}} \cdot {[q^1, q^2, q^3, q^4]}
\end{align}
$$

$$
A = K{Q^T}
$$

- 对得到的所有所有结果进行归一化处理，基本可以理解为`softmax`处理，随后转化成为了注意力权重$\hat{\alpha}_{i,j}$；
- 得到注意力权重之后，同样以$a_1$为例，我们就将$a_1$分别与$a_1$、$a_2$、$a_3$、$a_4$的注意力权重乘以对应的$v$向量得到输出$b_1$，其他输出同理；

$$
\begin{align}
    b_1
    &= \hat{\alpha}_{1,1} \cdot v^1 + \hat{\alpha}_{1,2} \cdot v^2 + \hat{\alpha}_{1,3} \cdot v^3 + \hat{\alpha}_{1,4} \cdot v^4
    \\ &= {[\hat{\alpha}_{1,1}, \hat{\alpha}_{1,2}, \hat{\alpha}_{1,3}, \hat{\alpha}_{1,4}]} \cdot \begin{bmatrix} v^1 \\ v^2 \\ v^3 \\ v^4 \end{bmatrix}
\end{align}
$$

$$
\begin{align}
    b_2
    &= \hat{\alpha}_{2,1} \cdot v^1 + \hat{\alpha}_{2,2} \cdot v^2 + \hat{\alpha}_{2,3} \cdot v^3 + \hat{\alpha}_{2,4} \cdot v^4
    \\ &= {[\hat{\alpha}_{2,1}, \hat{\alpha}_{2,2}, \hat{\alpha}_{2,3}, \hat{\alpha}_{2,4}]} \cdot \begin{bmatrix} v^1 \\ v^2 \\ v^3 \\ v^4 \end{bmatrix}
\end{align}
$$

$$
\begin{align}
    b_3
    &= \hat{\alpha}_{3,1} \cdot v^1 + \hat{\alpha}_{3,2} \cdot v^2 + \hat{\alpha}_{3,3} \cdot v^3 + \hat{\alpha}_{3,4} \cdot v^4
    \\ &= {[\hat{\alpha}_{3,1}, \hat{\alpha}_{3,2}, \hat{\alpha}_{3,3}, \hat{\alpha}_{3,4}]} \cdot \begin{bmatrix} v^1 \\ v^2 \\ v^3 \\ v^4 \end{bmatrix}
\end{align}
$$

$$
\begin{align}
    b_4
    &= \hat{\alpha}_{4,1} \cdot v^1 + \hat{\alpha}_{4,2} \cdot v^2 + \hat{\alpha}_{4,3} \cdot v^3 + \hat{\alpha}_{4,4} \cdot v^4
    \\ &= {[\hat{\alpha}_{4,1}, \hat{\alpha}_{4,2}, \hat{\alpha}_{4,3}, \hat{\alpha}_{4,4}]} \cdot \begin{bmatrix} v^1 \\ v^2 \\ v^3 \\ v^4 \end{bmatrix}
\end{align}
$$

- 就问，发现了什么！！我们将注意力权重矩阵转置一下，以该矩阵作为新的矩阵$A$之后，那么就能得到；

$$
A = Q{K^T}
$$

- 然后再`softmax`处理得到注意力权重矩阵：

$$
\hat{A} = \text{softmax}(Q{K^T})
$$

- 联系起注意力机制的最核心公式，这就正好对上了其中的一大部分；
- 回到上面，我们将注意力权重矩阵给转置了一下，之所以需要转置原因很简单，注意看我们的输出，我们需要保证矩阵相乘的运算法则，因此综合上面的结果我们得到了输出：

$$
Output = \text{softmax}({Q}{K}^{T})V
$$

- 对比初始时引入的注意力公式，我们基本做出了详细的推导，唯一的区别在于原核心公式引入了维度进行处理，以防止计算值太高而导致的梯度爆炸问题，我是这么猜测的，至此，注意力机制的底层结构已剖析完毕；

