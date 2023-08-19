---
title: 算法思想-回溯
author: Ping
math: true
date: 2023-04-01 14:33:00 +0800
categories: [数据结构与算法]
tags: [数据结构，算法]
---

## 什么是回溯
回溯算法是一种通过尝试不同的选择来解决问题的算法，它通常用于在问题的解空间中搜索所有可能的解，并找到满足特定条件的路径；

是的，我们可以单纯把回溯看成是对多条路径的尝试，在对某些路径的尝试过程中，会遇到一些特征，这些特征告诉我们，这条路你走错了，不必再找下去，回头吧，看看另一条路径的选择；
- 回溯启发我们的是，有些选择一旦你做错了，那么久没有必要再错下去，除非，我们对错误的判断出现了偏差，也就是说，这不是错误，当然这是另外一个话题了；

正是因为回溯本身是对路径的选择，因此我们往往会用`回溯树`或者叫`搜索树`去模拟回溯的选择过程，因为树本身的多个孩子就类似结点的多个选择，一个选择决定了一条路径；

## 回溯的一般思想和步骤

回溯实质上就是一种暴力算法，但这种暴力算法通常可以成为解决许多实际问题的通用思想，因此回溯的思想本身有着其普遍的应用场景；

下面是回溯算法的一般思想和步骤：
1. **定义问题的解空间**：明确定义问题的解空间，即问题的可能解的集合。
- 结合上述所讲，就是回溯树中某个结点的孩子个数，预示了后续可以选择的路径条数；
2. **选择路径**：从解空间中选择一条路径，即选择一个可能的解或下一步的决策，这个选择可能会基于特定的规则、约束或目标。
- 基于特定的规则就是说，也许在某些情况下，有些选择没有进行的必要；
3. **判断路径的有效性**：检查所选择的路径是否满足问题的约束条件或目标，如果路径无效，回溯到上一步并选择另一条路径。
- 就是上面说的，遇到了错误的选择，需要回头了；
4. **探索路径**：如果路径是有效的，继续探索这条路径，可能进一步选择下一步的决策。
- 这个过程就是递归的，每个被选择的结点成为了新的结点，通过不断选择路径并进行判断、探索，直到找到解或达到问题的结束条件。
5. **完成搜索**：重复以上步骤，直到搜索完整个解空间，找到所有满足条件的解，或者达到问题的结束条件。
- 我们一般不建议在走到最后才发现自己错了，这个时候即便回头也浪费了太多步骤了，这就是我们在回溯过程中<font color=red>剪枝</font>的意义；
- 剪枝剪的是什么，就是回溯树中一些不必要的枝叶；

总之，回溯算法的关键是在解空间中进行选择、判断和探索。它通常通过递归的方式实现，可以使用递归函数来模拟选择路径和回溯的过程。

回溯算法由于需要遍历大量的解空间，因此在实际应用中，我们通常会使用一些剪枝策略来减少不必要的搜索，提高算法的效率。

## 回溯的运用

这部分会结合许多实际运用的例子介绍，不仅仅是实践回溯思想本身，更多的是需要理解剪枝在解决实际问题中的意义；

### 子集问题

先从最简单的子集问题介绍：
```
题目：
- 给你一个整数数组nums，数组中的元素互不相同。返回该数组所有可能的子集(包括空集)。

要求：
- 解集不能包含重复的子集。
- 可以按任意顺序返回解集。
```
基于上面的思想，我们来对这个问题进行分析，假设给定数组为`{1, 3, 5, 7}`：
- 我们需要从给定数组集合的第一个位置开始去处理元素，直到处理完所有元素；
- 第一个位置的1，选不选，选这个数，接下来有一个方向，不选这个数，接下来同样有一个方向；
- 第二个位置的2，选不选，选这个数，接下来有一个方向，不选这个数，接下来同样有一个方向；
- ...
- 依次处理，直到处理完数组中所有数的选择；

上面每个索引`index`上数的选择，就是每个结点要面临的选择，这个选择不多，仅有两种；

由于集合中元素的个数并不固定，同时题目保证了数组中数据并不重复，因此，无需剪枝策略，因为没有哪种情况是<font color=red>我们不需要选择的</font>；

所以代码很简单：
```cpp
vector<vector<int>> result; // 结果集
vector<int> vec_of_result;  // 每个选择下的临时子集

void backtrace(const vector<int>& nums, int index)
{
    if (index == nums.size())   // 回溯到底了
    {
        result.push_back(vec_of_result);
        return;
    }

    vec_of_result.push_back(nums[index]);   // 选中当前index
    backtrace(nums, index + 1);             // 此种情况下的回溯
    vec_of_result.pop_back();               // 回溯完成，恢复回溯之前子集的状态
    
    backtrace(nums, index + 1);             // 不选中当前index下的回溯
}
```
这个例子比较简单，也没有体现出剪枝的应用，接下来同样看子集问题，但是该问题我们就需要好好考虑剪枝了：
```
题目：
- 给你一个整数数组nums，其中可能包含重复元素，请你返回该数组所有可能的子集(幂集)

要求：
- 不能包含相同的的子集
```
不能包含相同的子集意味着我们不能不考虑剪枝了，比如`{1, 1, 2, 3}`，如果按照他正常的回溯过程，会得到两个`1, 2, 3`子集；

这个时候需要怎么解决这个问题呢？
- 我们要使得，当在对第一个1回溯之后，不必再对第二个1回溯了，且这个`不必再回溯`不会影响到结果；
- 因此我们考虑将整个数组内容排序，排序之后，所以相同的元素挨在一起，处理完第一个相同元素，不再处理后续相同的元素并不影响后续的操作；
- 这个不必再对第二个1回溯的操作，即为一种剪枝策略；

    ```cpp
    vector<vector<int>> result_set;
    vector<int> vec_of_result;

    // nums已经排序好
    void backtrace(const vector<int>& nums, int index)
    {
        result_set.push_back(vec_of_result);    // 直接插入子集，正对应了不选择该索引位置的元素的情况；

        if (index >= nums.size())   return;
        
        for (int i = index; i < nums.size(); ++i) {
            if (i > index && nums[i] == nums[i - 1])    continue;   // 针对相同元素的处理已经进行过，因此不必再进行重复的处理了
            vec_of_result.push_back(nums[i]);   // push_back操作表明选择该元素
            backtrace(nums, i + 1);     // 选择该位置的元素后进行回溯处理
            vec_of_result.pop_back();   // 求完之后弹出，恢复回溯之前的状态，开始遍历循环的下一个结点
        }
    }
    ```

- 上面这个案例剪枝还是比较有技巧性的，在每次回溯的开头，都会将其中某个子集加入结果集，这个子集的一个特点就是没有选择插入当前的元素；
- 也就是说，在回溯的开头就处理了不选择该元素的情况；
- 之后进入循环，从遍历到的索引位置处开始，选择对元素进行插入，之后基于这个插入该位置元素的子集做回溯；
- 然后对该元素<font color=red>回溯完成之后，</font>将刚刚，对，理解为刚刚，将刚刚插入的元素弹出，继续在上一层递归中处理循环中的下一个元素；
- 如果下一个元素跟我们刚刚回溯处理过的元素相同，同时此时面临的子集状态也相同，那么还有什么必要在对这个元素进行回溯处理呢？这就是`continue`的由来；
- 这也是一种极其巧妙的剪枝方式；

像上述这种剪枝方式就是比较巧妙的一种处理方式了，我们再来看看另一种写法：
- 另一种写法：
 
    ```cpp
    vector<vector<int>> result_set;
    vector<int> vec_of_result;

    void backtrace(bool process, int index, const vector<int>& nums)
    {
        if (index == nums.size())
        {
            result_set.push_back(vec_of_result);
            return;
        }
        
        // 以1 2 2 2 3 5为例，假设index为2(处理第二个2)，那么这个回溯做的就是在不加入那个2的时候寻找2 3 5的子集；
        backtrace(false, index + 1, nums);  // 不加入当前的元素，去找index + 1开始的那些元素的子集；

        // 考虑上述子集中第二个2，如果第一个2已经插入进去，那么显然，后面的{2 2 3 5}子集需要妥善处理
        // 如果第1个2并未使用过，那就是在这种情况下求{2 2 3 5}的子集
        if (!process && index > 0 && nums[index] == nums[index - 1])    return; // 直接返回，不需要处理下一个了

        vec_of_result.push_back(nums[index]);
        backtrace(true, index + 1, nums);   // 这个回溯做的就是，求取加入当前元素之后，后续的子集，这个回溯保证了与上面那个回溯一定不会重复；
        vec_of_result.pop_back();   // 不管哪一轮回溯，最后的vec_of_result状态都跟回溯之初是完全一致的；
    }
    ```

- 这种写法的思想上其实本质上就是上面一种写法的换皮，但理解起来确实更加困难，可以看作是对多维思维的训练；
    - 把握核心的一点，每一轮回溯完成之后，跟回溯完成之前，所面临的`vec_of_result`是一致的；
    - 也就是说处理`{2 2 2 3 5}`与处理`{2 2 3 5}`面临的`vec_of_result`是一致的；
    - 处理前者时已经包括了对后者的处理，那么后者还有什么重复处理的必要呢？
    - `!process`的作用正是保证后者是前一个2未插入的情况，也就是保证`vec_of_result`一致的必要条件；
    - 如果`!process`不成立，表明前一个2插入了，显然`vec_of_result`就不一致了，这个时候我们不能跳过；
- 所以说这种写法本质上也就是上面一种写法；

看完了子集问题，我们接下来拓展到排列问题。

### 排列问题

相比子集问题，排列问题多出来的就是需要考虑插入元素的位置了，因此思考问题的角度需要发生变化；

```
题目：
- 给定一个不含重复数字的数组nums，返回其所有可能的全排列，可以按任意顺序返回答案。
```

随着索引index的不断递进，索引位置处可供选择填充的元素会不断的变少，我们只需要把握这一点即可写出核心算法：

```cpp
vector<vector<int>> result;
vector<int> elem_of_result;

void backtrace(vector<int>& nums, int index)
{
    if (index == nums.size())
    {
        result.push_back(elem_of_result);
        return;
    }

    // 每个位置插入的元素的可能会逐步减小
    // index = 0的时候有n种可能，index = 1的时候有(n - 1)种可能，以此类推
    for (int j = index; j < nums.size(); j++) { 
        elem_of_result.push_back(nums[j]);  // 在循环中不断选择不同的nums[j]
        swap(nums[index], nums[j]);         // 与将选择的元素index处的元素交换位置，避免重复选择
        backtrace(nums, index + 1);         // 处理下一个索引位置，显然下一个索引位置选择减少
        swap(nums[index], nums[j]);         // 回溯完之后，换回来
        elem_of_result.pop_back();          // 把刚刚选择的nums[j]送回去，考虑选择下一个元素的情况
    }
}
```

该说不说，这种写法非常精炼，同时这个例子也展示了`回溯树`中，某种接下来的选择受到上一层中的选择制约的情况；

由于这是不重复情况下的例子，其实本身思路也不难，接下来看看含重复元素的情况：
```
题目：
- 给定一个含重复数字的数组nums，返回其所有可能的全排列，可以按任意顺序返回答案。
```

对于这个问题，解决方案之一就是记录每个元素出现的次数，但这样需要占据额外的存储空间，因此应该不会是比较优的选择；

此时可以考虑通过剪枝处理重复的情形：
- 我们可以把题目转换为这么一种形式：
    - 给定n个空位，一一填充空位，收集所有填充过的不一致的结果就是我们的目的；
    - 那么针对重复元素，比如说第二个位置面临诸多抉择，其中有一个抉择就是填充2，但是这个2我们假设有3个；
    - 显然，我们可以先选第一个2，但是选择之后，基于这么一个现状继续回溯，直到处理结束；
    - 回溯处理结束了，我们又回到了最初的那个状态，注意，我这里<font color=red>又一次提及了这个状态，回溯就是抓这个不变的状态；</font>
    - 我们又回到了第二个位置选哪个的状态，面对刚刚选择的2，我们已经选过了，还有选择的必要吗？没有！
    - 这里就是我们要剪枝的部分，怎么知道这是第二个2呢？只需要看前一个2有没有被填进去；
    - 没有被填进去，说明我们之前已经在这个位置填过这个2，只是2回溯完成了又恢复了这个状态而已；
    - 那既然填过，我们就不能再填了，不是吗？
    - 第三个2同理，也没有必要填，他也同样判断前一个2有没有被填过，显然这个2也会遇到一样的境况；
- 因此代码：
    ```cpp
    vector<vector<int>> result;
    vector<int> elem_of_result;
    vector<int> visited;

    // nums已经排过序
    void backtrace(const vector<int>& nums, int index)
    {
        if (index == nums.size())
        {
            result.push_back(elem_of_result);
            return;
        }

        for (int j = 0; j < (int)nums.size(); j++) {
            // 如果j已经加入了，或者该位置遇到了重复的元素，都可以继续执行循环，因为该位置不能加入这类值了
            if (visited[j] || (j > 0 && nums[j] == nums[j - 1] && !visited[j - 1])) continue;   // 重复项剪枝
        
            elem_of_result.push_back(nums[j]);
            visited[j] = 1;
            backtrace(nums, index + 1);
            elem_of_result.pop_back();
            visited[j] = 0;
        }
    }
    ```

至此，排列问题同样得到了解决；

### 组合问题

从两个简单问题类型开头，接下来我们要准备去处理组合问题了，请看题：
```
题目：
- 给你一个无重复元素的整数数组candidates和一个目标整数target；
- 找出candidates中可以使数字和为目标数target的所有不同组合，
- 并以列表形式返回，你可以按任意顺序返回这些组合。

注意：
- candidates中的同一个数字可以无限制重复被选取。
- 但如果至少一个数字的被选数量不同，则两种组合是不同的。
- 1 <= candidates.length <= 30
- 2 <= candidates[i] <= 40
```

具体思路：
- 这道题还是比较简单的，首先明确回溯的目标，选中某些数，使得这些数的和是target，一旦满足，就将这些数组成的集合仍进结果集；
- 由于回溯树的枝叶繁茂，对于它的多种路径而言，都有可能符合结果的要求，但是一定需要每条路径都搜索到底吗？
- 这就涉及到剪枝，搜索满足一定条件的时候，我们就可以知道，不必再向后递归了，因为没有意义了；
- 而这个剪枝，可以通过预排序来进行；
- 之所以能使用预排序进行，是因为题目已经明确告知所有元素都是正整数；

代码：
```cpp
vector<vector<int>> result;
vector<int> elem_of_result;
void traceback(const vector<int>& candidates, int target, int index)
{
    if(target == 0)
    {
        result.push_back(elem_of_result);   // 加入result的二维数组即可
        return;
    }

    for (int i = index; i < candidates.size() && target - candidates[i] >= 0; i++)
    {
        elem_of_result.push_back(candidates[i]);
        traceback(candidates, target - candidates[i], i);   // 发现了吗，索引没有改变
        elem_of_result.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int>& candidates, int target)
{
    // 预先排序，为了那个target - candidates[i] >= 0的条件；
    sort(candidates.begin(), candidates.end()); 
    traceback(candidates, target, 0);
    return result;
}
```

我们预先排序了数组，因此可以利用`target - candidates[i] >= 0`来剪枝，不符合这个条件说明回溯到底，可以返回了；

接下来再看看一道变种的题，相对上题也就是简单增加了一点限制：
```
题目：
- 给定一个候选人编号的集合candidates和一个目标数target；
- 找出candidates中所有可以使数字和为target的组合；
- candidates中的每个数字在每个组合中只能使用一次；
- 仍然全为正数；

注意：解集不能包含重复的组合。
```

这道题需要注意到的一个细节问题是：数组中可能存在多个相同的元素，这种情况下，要处理掉同样的元素，这一点直接类比子集问题去做就够了；

解决方案：
```cpp
vector<vector<int>> result;
vector<int> elem_of_result;
void traceback(const vector<int>& candidates, int target, int index)
{
    if(target == 0)
    {
        result.push_back(elem_of_result);   // 加入result的二维数组即可
        return;
    }

    for (int i = index; i < candidates.size() && target - candidates[i] >= 0; i++)
    {
        if (i > index && candidates[i] == candidates[i - 1])    continue;   // 剪枝
        elem_of_result.push_back(candidates[i]);
        traceback(candidates, target - candidates[i], i + 1);
        elem_of_result.pop_back();
    }
}

vector<vector<int>> combinationSum(vector<int>& candidates, int target)
{
    sort(candidates.begin(), candidates.end()); // 排序
    traceback(candidates, target, 0);
    return result;
}
```

讲完这两道题，有心人完全可以再看看这道题，基本一致的类型，请看[LeetCode 216](https://leetcode.cn/problems/combination-sum-iii/description/)；

组合问题解决完之后，其实对于回溯的思想基本有个比较全面的了解了，但是接下来还有两个类型的问题会进行拓展讲述，分别是**海岛问题**和**划分K个子集问题**，他们属于相对比较高阶的回溯思想(其实还有N皇后的问题)；

### 进阶一 海岛问题

海岛问题的一个大致描述是这样的：

```
题目：
- 给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。
- 岛屿总是被水包围，并且每座岛屿只能由水平方向和/或竖直方向上相邻的陆地连接形成。
- 举例：
  ["1","1","1","1","0"],
  ["1","1","0","1","0"],
  ["1","1","0","0","0"],
  ["0","0","0","0","0"]
- 像这种情况，岛屿数量为1，比较显然；
- 我们假设这个矩阵周围所围绕的都是水；
```

题目需要我们去计算海岛的个数，这是我们的目的，对于这个问题，自然而然的分析思路：
- 找到一个1，这个1必然是海岛的一部分，我们向这个1的上，下，左，右几个方向做搜索；
- 也就是说，一个结点，正常来说他有四个选择的方向，只要有一个方向有水，也就是0，代表这个点就是岛的某个边界；
- 那么边界这个位置方向，就不必再回溯了，因为回溯的目的就是不断延申岛屿的陆地部分，直到遇到了水，也就是0；
- 由于我们需要计算的是岛屿的个数，而回溯的作用在于，不断朝各个方向延申，直到延申完所有的岛屿；
- 而统计岛屿的个数的任务，交给处理这个问题的函数去做即可；

代码：
```cpp
void dfs(vector<vector<char>>& grid, int i, int j) {
    int row = grid.size();
    int col = grid[0].size();
    // (i, j)是一个点，我们要访问且访问过，将该点置为0；
    grid[i][j] = '0';
    if (i - 1 >= 0 && grid[i - 1][j] == '1')    dfs(grid, i - 1, j);    // 上
    if (i + 1 < row && grid[i + 1][j] == '1')  dfs(grid, i + 1, j);    // 下
    if (j - 1 >= 0 && grid[i][j - 1] == '1')    dfs(grid, i, j - 1);    // 左
    if (j + 1 < col && grid[i][j + 1] == '1')  dfs(grid, i, j + 1);    // 右
}

int numIslands(vector<vector<char>>& grid) {
    if(grid.empty())    return 0;
    int res = 0;
    for (int i = 0; i < grid.size(); i++)
    {
        for (int j = 0; j < grid[0].size(); j++)
        {
            if (grid[i][j] == '1') {
                ++res;
                dfs(grid, i, j);
            }
        }
    }
    return res;
}
```
函数只要遇到一个1，就会将岛屿数量增1，其后让回溯去不断拓展这个岛屿的范围，回溯的过程中，将所有处理过的结点置0，一来是为了避免重复回溯，二来则是将所有延展开来的岛屿都化为水，这样在主函数的循环中，属于一个岛屿范围的1不会再被统计进岛屿的数量当中；

### 进阶二 划分K个子集问题

划分K个子集的问题也是值得好好深思的一个问题：
```
题目：
 - 给定一个整数数组nums和一个正整数k，找出是否有可能把这个数组分成k个非空子集，其总和都相等。
```

预处理部分是比较常规的做法，先不讲了，我们回到后部分，假设每个子集要求的目标值是`target`，看看能否找到k个这样的子集，子集内元素之和为`target`；
- k个这样的子集，我们可以认为是有k个桶；
- 对于每个元素，他都有k个选择，也就是说每个回溯树的结点都有k条路径；
- 但是对于桶的选择，我们需要注意的是：加上该元素之后，桶中的元素之和大于目标值`target`，就只能选择另外的桶；
- 而对于另外的桶，同样遵循这个原则；
- 还有一个细节，比如说存在多个桶，多个桶此刻的元素和是相等的，那么显然，处理过桶1，就没有必要再处理桶2了，可以直接跳过，实现了剪枝；

因此，看代码：
```cpp
bool backtrace(const vector<int>& nums, int index, int k, int target, vector<int>& v) { // 数组传引用
    if (index == nums.size())   return true;    // 一定能放置，因为这个时候说明每个球都放进了对应的桶(都传到最后的索引了，说明桶放好了)
    for (int i = 0; i < k; i++) // 对每个桶做判断
    {
        if (i > 0 && v[i] == v[i - 1])  continue;   // 一些已经处理过的桶不必再放了，因此已经放过了，不必重复了
        if (v[i] + nums[index] > target)    continue;   // 看下一个桶

        v[i] += nums[index];    // 放进去

        // 在这个基础上去判断下一个位置的元素能否处理，能处理，皆大欢喜，直接返回信息
        // 如果不行，那就只能尝试看放下一个桶了，就继续循环
        // 如果放进每个桶都不行，那说明根本就无法满足题目的要求
        if (backtrace(nums, index + 1, k, target, v))   return true;

        v[i] -= nums[index];
    }
    
    return false;
}

bool canPartitionKSubsets(vector<int>& nums, int k) {
    int sum = 0;
    int maxValue = 0;
    for (int i = 0; i < nums.size(); ++i) {
        sum += nums[i];
        maxValue = max(maxValue, nums[i]);
    }
    if (sum % k)    return false;
    else if (maxValue > sum / k)    return false;
    
    int target_value = sum / k;

    // 上面是预处理，很简单
    vector<int> barrel(k);
    sort(nums.rbegin(), nums.rend());   // 为剪枝而增加的排序，这是数学层面的剪枝，大的在前，让回溯尽快返回；

    return backtrace(nums, 0, k, target_value, barrel);
}
```

以上就是针对回溯思想的一些个人总结，后续如果有更好的案例，会不断更新这篇文章；