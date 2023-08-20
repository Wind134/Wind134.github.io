---
title: 算法思想-动态规划
author: Ping
math: true
date: 2023-04-10 14:33:00 +0800
categories: [数据结构与算法]
tags: [数据结构，算法]
---

## 动态规划的介绍

我理解的动态规划就是数学上的找规律，对于一个等差数列`{1, 3, 5, 7, 9,...}`，我们可以很清晰的确认通项公式为：

$$
a_n = 2 * n - 1
$$

而在我看来，动态规划本质上的思想，与找数列的通项公式别无二致；

动态规划的官方定义：动态规划是一种解决复杂问题的算法设计技术，通常用于优化问题，通过将问题分解为子问题并解决子问题来求解整体问题。

动态规划的核心思想是将大问题划分为一系列重叠的子问题，并通过解决子问题来构建最优解。关键在于将问题的解决过程转化为一个递推的形式，通过保存中间计算结果，避免重复计算，提高算法效率。

这个*递推*，就是我们上面提及的通项公式；

动态规划的核心层面就是找到这么一个递推式，在动态规划里面这叫**状态转移方程**；

动态规划的基本步骤：
- 定义状态
- 确定状态转移方程
- 初始化边界条件
- 按顺序计算状态值
- 通过迭代计算和保存中间结果，最终得到问题的最优解

接下来我将通过一系列例子来对动态规划的思想进行阐述；

## 动态规划的实际应用-背包问题

背包问题分很多种类型，主要是这么三种：01背包问题、完全背包问题、多重背包问题；

### 01背包问题

首先，请看问题：
```
题目：
- 一共有N件物品，第i(i从1开始)件物品的重量为w[i]，价值为v[i]。
- 在总重量不超过背包承载上限W的情况下，能够装入背包的最大价值是多少？
```

基于这个例子，先解释一下为什么这个问题叫背包问题，每件物品只面临两种选择，不放或者放，对应着0和1，因此取名`01背包问题`；

题外话，看到这个不放或者放，想到了什么？没错，**回溯**，也就是说，这个问题回溯亦可以解决(需要剪枝)，当然，这个问题的回溯方法不在讨论的范围内；

动态规划的核心在于设定一种状态，这个状态可以让我们找到通项公式，也就是状态转移方程，这是动态规划最难的，但找到之后这题就能直接结束的办法；

这个问题需要解决的是，在某个限重之下的条件下，一个背包的物品能装进的最大价值，每件物品的价值和最大的限重都是给定的信息，因此我们不妨试试：
```
一个dp[i][j]，表示前面i个物品，在限重为j的条件下，所能获得的最大价值，0 <= i <= N, 0 <= j <= W
```

那么只要我们知道`dp[N - 1][W]`，这个问题就解决了；

对于`dp[i][j]`，处理前`i`个物品无非就面临两种可能，第`i`个物品到底是放，还是不放；
- 不放，那么显然`dp[i][j] = dp[i - 1][j]`，这是极其显然可以确定的一个关系；
- 放，那么关系式就需要做一个处理了：`dp[i][j] = dp[i - 1][j - w[i]] + v[i]  -------- j >= w[i]`
- 我们要求的是前i件，那么只需要取这两种可能中的较大值即可；

先看二维数组版本的代码：
```cpp
int knapsack_problem1(const vector<int>& values, const vector<int>& weights, int max_weight) {
    if (values.size() == 0) return 0;
    int row = values.size();
    vector<vector<int>> dp(row, vector<int>(max_weight + 1));  // 下标从0开始
    
    for (int j = 0; j <= max_weight; ++j)   if (j >= weights[j]) dp[0][j] = values[0];
    for(int i = 1; i < row; ++i) {
        for(int j = 1; j <= max_weight; ++j) {
            if (j < weights[i])  dp[i][j] = dp[i - 1][j];
            else  dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - weights[i]] + values[i]);
        }
    }

    return dp[row - 1][max_weight];
}
```

其次需要提及的是，在数据结构中，通常还涉及到对动态规划数组所占空间的优化，在这里其实我们本质上并没有必要用二维数组，因此尝试观察：
- 二维数组的更新是先更新一行，再更新一列；
- 因此我们可以尝试就动用一个行数组做dp；
- 首先初始状态就是上面题目中第一个循环的值；
- 由于二维数组中对列的循环是从左到右，但是在`0~weights[i]`列中的值是与上行相同的
- 主要是考虑`weights[i]`后面的列，后面的列的更新依赖于更左边的值
- 因此这个行数组更左边的值不能提前发生变化，因此优化后的滚动数组**必须要逆序**更新；

代码：
~~~cpp
int knapsack_problem1(const vector<int>& values, const vector<int>& weights, int max_weight) {
    if (values.size() == 0) return 0;
    int row = values.size();
    vector<int> dp(max_weight + 1);  // 下标从0开始
    
    for (int j = 0; j <= max_weight; ++j)   if (j >= weights[j]) dp[j] = values[0];   // 初始值
    for(int i = 1; i < row; ++i) {
        for(int j = max_weight j >= weights[i]; --j) {
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }

    return dp[max_weight];
}
~~~

至此，01背包问题得到了解决；

<a name="anchor-1"></a>
### 完全背包问题

请看题：
```
题目：
- 完全背包（unbounded knapsack problem）与01背包不同就是每种物品可以有无限多个；
- 一共有N种物品，每种物品有无限多个，第i（i从1开始）种物品的重量为w[i]，价值为v[i]；
- 在总重量不超过背包承载上限W的情况下，能够装入背包的最大价值是多少？
```

完全，最主要的就是体现在，每种背包再也不是选不选的问题了，而是选多少的问题，在这种情况下，就需要稍微调整思路了；

不妨假设：

```
一个dp[i][j]，表示前面i种物品，在限重为j的条件下，所能获得的最大价值，0 <= i <= N, 0 <= j <= W
```

那么同样，只要知道`dp[N - 1][W]`，这个问题就解决了；

对于`dp[i][j]`，处理前`i`种物品无非就面临两种可能，第`i`种物品到底是放，还是不放；

这时候可能会想，不考虑这种物品放几个吗？我的意思是，不需要考虑，请看下文：

- 不放第i种，那么显然`dp[i][j] = dp[i - 1][j]`，这是极其显然可以确定的一个关系；
- 放第i种，那么关系式就需要做一个处理了：`dp[i][j] = dp[i][j - w[i]] + v[i]  -------- j >= w[i]`
    - 可能会疑惑这个`dp[i][j - w[i]]`，其实没什么可疑惑的，处理这个dp的时候同样会向前推着处理，这就是递推式的意义；
    - 因此也在上面说不需要考虑放几件的事儿，因为这种向前递推就是在处理放几个的问题；
- 我们要求的是前i种，那么最终只需要取这两种可能中的较大值即可；

代码：
~~~cpp
int knapsack_problem2(const vector<int>& values, const vector<int>& weights, int max_weight) {
    if (values.size() == 0) return 0;
    int row = values.size();
    vector<vector<int>> dp(row, vector<int>(max_weight + 1));  // 下标从0开始
    
    for (int j = 0; j <= max_weight; ++j)   if (j >= weights[j]) dp[0][j] = dp[0][j - weights[i]] + values[0];
    for(int i = 1; i < row; ++i) {
        for(int j = 1; j <= max_weight; ++j) {
            if (j < weights[i])  dp[i][j] = dp[i - 1][j];
            else  dp[i][j] = max(dp[i - 1][j], dp[i][j - weights[i]] + values[i]);
        }
    }
    return dp[row - 1][max_weight];
}
~~~

同样，我们写一个滚动数组的优化版本：
- 注意这个滚动优化的不同，`max`部分的行索引已经从`i - 1`变成了`i`；
- 这也意味着在`weights[i]`后面的列，都是基于本行的变化，不能再逆序了；

因此，优化后的代码：
```cpp
int knapsack_problem2(const vector<int>& values, const vector<int>& weights, int max_weight) {
    if (values.size() == 0) return 0;
    int row = values.size();
    vector<int> dp(max_weight + 1);  // 下标从0开始
    
    for (int j = 0; j <= max_weight; ++j)   if (j >= weights[j]) dp[j] = dp[j - weights[i]] + values[0];   // 初始值
    for(int i = 1; i < row; ++i) {
        for(int j = weights[i]; j <= max_weight; ++j) {
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i]);
        }
    }

    return dp[max_weight];
}
```

至此，完全背包问题的讲解已结束；

### 多重背包问题

请看题：
```
题目：
- 多重背包(bounded knapsack problem)与前面不同就是每种物品是有限个：
- 一共有N种物品，第i（i从1开始）种物品的数量为n[i]，重量为w[i]，价值为v[i]；
- 在总重量不超过背包承载上限W的情况下，能够装入背包的最大价值是多少？
```

第一眼可能会想，怎么开始限制每种物品的数量之后反而成了一个**多重**的问题呢？
- 在完全背包的状态下，我们只管取，如果某种背包取多了，设计的动态规划方程会自动处理这个问题；
- 而多重背包由于加上了某种物品的数目限制，需要多考虑的一种情况是，背包限重5，每种物品限重1；
- 但这种物品只有3件，不够用，这样就限制了动态规划方程的运行，使问题变复杂了，因为还需要考虑数目的问题；

其实看到这里，从直接上来讲，我们感觉上应该是采用一种介于**01背包问题**和**完全背包问题**之间的解法去处理这个问题；

多出来的`k`就是我们要考虑的关键，老规矩，先设置动态规划数组：

```
一个dp[i][j]，表示前面i种物品，在限重为j的条件下，所能获得的最大价值，0 <= i <= N, 0 <= j <= W
```

那么在考虑某种的时候，我们此刻不能让某种物品被随意选取，必须受到件数的限制，显然件数

$$k <= min(n[i], i / w[i])$$

我们在这个过程中，只聚焦于`k`的变化，不在乎选不选这一种了，因为`k = 0`就意味着不考虑这一种，就把这个情况考虑进去了，而选择其他种数的话，可以有这么一个转移方程来概括：
```
// k为装入第i种物品的件数, k <= min(n[i], j/w[i])
dp[i][j] = max{(dp[i-1][j − k * w[i]] + k * v[i]) for every k}
```

那么，<font color=red>看到这里有没有什么想法？</font>应该是要有点想法的；

是的，[完全背包](#anchor-1)也可以用这个方式解决，但是这样难以避免要新增一个循环，因此完全背包问题我们还是采用之前的策略；

接下来上代码：
```cpp
int knapsack_problem3(const vector<int>& values, const vector<int>& weights, const vector<int>& nums, int max_weight) {
    if (values.size() == 0) return 0;
    int row = values.size();
    vector<int> dp(max_weight + 1);  // 下标从0开始
    
    for (int j = 0; j <= max_weight; ++j) {
        dp[0][j] = j / weights[0] * values[0];   
    }
    for(int i = 1; i < row; ++i) {
        for(int j = 1; j <= max_weight; ++j) {
            for (int k = 0; k <= j / weights[i]; ++k)
             dp[i][j] = max(dp[i - 1][j], dp[i - 1][j - k * weights[i]] + k * values[i]);
        }
    }
    return dp[row - 1][max_weight];
}
```

接下来做滚动数组的优化，仿照0-1背包的思路即可，即逆序更新；

```cpp
int knapsack_problem3(const vector<int>& values, const vector<int>& weights, const vector<int>& nums, int max_weight) {
    if (values.size() == 0) return 0;
    int row = values.size();
    vector<vector<int>> dp(row, vector<int>(max_weight + 1));  // 下标从0开始
    
    for (int j = 0; j <= max_weight; ++j) {
        dp[j] = j / weights[0] * values[0];   
    }
    for(int i = 1; i < row; ++i) {
        for(int j = max_weight j >= weights[i]; --j) {
            for (int k = 0; k <= j / weights[i]; ++k)
             dp[j] = max(dp[j], dp[j - k * weights[i]] + k * values[i]);
        }
    }
    return dp[row - 1][max_weight];
}
```

至此，这三种背包问题的框架性例题基本就讲解完毕了；

(未完待续，这只是动态规划中的背包问题而已)


