#include <bits/stdc++.h>
using namespace std;

const int mod = 1000000007;

int dfs(const vector<vector<int>>& tree, const vector<int>& color, int index) {
    if (tree[index].size() == 0)    return 1;

    int res = 1;

    int left_res;
    int right_res;

    left_res = dfs(tree, color, tree[index][0]) % mod;
    right_res = dfs(tree, color, tree[index][1]) % mod;

    if (color[index] == 1)  res = (left_res + right_res) % mod;
    else res = (left_res * right_res) % mod;

    return res;
}

int main() {
    int n;
    cin >> n;
    vector<vector<int>> tree(n + 1);    // 该矩阵用来存储每个结点的子结点信息，以后得学会啊...
    vector<int> color(n + 1);       // 存储每个结点的颜色，将下标序号与结点信息对应，多分配一位空间
    for (int i = 2; i <= n; ++i) {  // 代表的是每个结点的序号
        int x;
        cin >> x;   // 输入的x是什么呢？是父节点的信息

        // 因此下面这个操作就比较显然了，x是父节点，而每个序号的信息正好代表的是子结点的序号
        // 因此，相同父节点的两个子结点就能通过push_back操作压进去
        tree[x].push_back(i);
    }

    // 至此，上面的输入操作成功的获取了每个父节点的子结点信息
    for (int i = 1; i <= n; ++i) {
        cin >> color[i];
    }

    cout << dfs(tree, color, 1) << endl;

    return 0;
}