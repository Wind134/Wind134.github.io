---
title: 12-C++标准库之关联容器
author: Ping
date: 2022-11-02 10:34:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

关联容器和顺序容器有着根本的不同：关联容器的元素是按**关键字**来保存和访问的。而与之相对的是，顺序容器中的元素是按照它们在容器中的位置来顺序保存和访问的。

关联容器支持高效的关键字查找和访问。两个主要的**关联容器(associative-container)**类型是`map`和`set`类型。

**map类型：**`map`中的元素是一些关键字-值`key-value`对：关键字(key)起到索引的作用，值(value)则表示与索引相关联的数据。

**set类型：**每个元素只包含一个关键字；支持高效的查询操作——检查一个给定关键字是否在`set`中。

文本处理过程中，可以用一个`set`来保存想要忽略的单词；字典则是一个很好的使用`map`的例子：将单词作为关键字，将单词释义作为值。

关联容器中要么是`set`要么是`map`，区分点就在于是否有序，是否允许重复。无序容器使用**哈希函数**来组织元素。

- 按关键字有序保存元素
  - `map`——关联数组，保存<font color="orange">关键字</font>——值对。
  - `set`——关键字即值，即只保存关键字的容器。
  - `multimap`——<font color="orange">关键字</font>可重复出现的map。
  - `multiset`——关键字可重复出现的set。
- 无序集合
  - `unordered_map`——用哈希函数组织的map。
  - `unordered_set`——用哈希函数组织的set。
  - `unordered_multimap`——哈希组织的map，且关键字可以重复出现。
  - `unordered_multiset`——哈希组织的set，且关键字可以重复出现。

## 使用关联容器

即便熟悉诸如`vector`和`list`这样的数据结构，但是关联数据结构同样重要，以`map`为例，我们将一个人的名字作为关键字，将其电话号码作为值，称这样的数据结构为"将名字映射到电话号码"。

`map`类型通常被称为**关联数组(associative array)**。类似"正常"数组，不同之处在于其下标不必是整数。*我们通过一个关键字而不是位置来查找值*。

与之相对的，`set`就是关键字的简单集合。当只是想知道一个值是否存在，`set`是最有用的。

### 使用map

```c++
// 使用关联数组实现单词计数程序
map<string, size_t> word_count;    // string到size_t的空map
sring word;
while (cin >> word)
    ++word_count[word];
for (const auto &w : word_count)    // 对map中的每个元素，那么问题来了，这里为啥要引用啊
    // 打印结果
    cout << w.first << " occurs " << w.second
        << ((w.second > 1) ? " times" : " time") << endl;
```

类似顺序容器，关联容器也是模板，定义一个`map`。我们必须指定关键字和值的类型，在上述代码中，关键字是`string`类型，值是`size_t`类型。

当对`word_count`进行下标操作时，我们使用一个`string`作为下标，获得与此`string`相关联的`size_t`类型的计数器。

### 使用set

还是基于上述场景，我们进行合理拓展：忽略常见单词，如`the、and、or`等。我们用`set`保存想忽略的单词，只对不在集合中的单词统计出现次数：

```c++
// 按需统计每个单词出现的次数
map<string, size_t> word_count;    // string到size_t的空map
set<string> exclude = {"The", "But", "And", "Or", "An", "A",
                      "the", "but", "and", "or", "an", "a"};    // 列表初始化
string word;
while (cin >> word)
    if (exclude.find(word) == exclude.end())
        ++word_count[word];        // 获取并递增word的计数器
```

类似顺序容器，`set`容器也是模板，定义一个`set`。我们必须指定元素类型，在上述代码中，元素类型是`string`。

与顺序容器类似，可以对一个关联容器的元素进行列表初始化。

## 关联容器概述

关联容器(包括有序和无序)同样支持支持顺序容器中的介绍的相关操作。但无法支持顺序容器中的位置相关的操作，如`push_front、push_back`。同时也无法支持接受一个元素值和一个数量值的构造函数以及插入操作。

关联容器的独特之处就是还支持一些顺序容器不支持的操作和类型别名，以及提供一些用来调整哈希性能的操作。

### 定义关联容器

每个关联容器都定义了一个默认构造函数，它创建一个指定类型的空容器。也可以将之初始化为另一个同类型的容器拷贝。

```c++
map<string, size_t> word_count;    // 空容器
// 列表初始化
set<string> exclude = {"The", "But", "And", "Or", "An", "A",
                      "the", "but", "and", "or", "an", "a"};
// 三个元素；authors将姓映射为名
map<string, string> authors = { {"Joyce", "James"}, 
                               {"Austen", "Jane"}, 
                               {"Dickens", "Charles"} };
```

**初始化`multimap`或`multiset`**

展示具有**唯一关键字的容器与允许重复关键字**的容器之间的区别：

```c++
// 定义一个有20个元素的vector，保存0到9每个整数的两个拷贝
vector<int> ivec;
for (vector<int>::size_t i = 0; i != 10; ++i) {
    ivec.push_back(i);
    ivec.push_back(i);    // 存两次
}
// iset包含来自ivec的不重复的元素；miset包含所有20个元素
set<int> iset(ivec.cbegin(), ivec.cend());      // 不重复
multiset<int> miset(ivec.cbegin(), ivec.cend());// 重复
cout << ivec.size() << endl;
cout << ivec.iset() << endl;
cout << ivec.miset() << endl;
```

<font color=red>那么问题来了：</font>

- 在`multimap`的使用场景中，通过下标的方式去访问`key`会作何处理呢？毕竟存在重复的情形；
  - 在`mutilmap`下，存在特有的方式去访问元素，而不能直接通过下标的方式去访问元素；

### 关键字类型的要求

关联容器对关键字类型有一些限制。无序容器有无序容器的要求，<font color="red">后续涉及....</font>

对于有序容器——`map、multimap、set`以及`multiset`，关键字类型必须定义元素比较的方法。默认情况下**标准库使用关键字类型的<运算符来比较两个关键字**。

**有序容器的关键字(key)类型**

可以向一个算法提供我们自己定义的比较操作，与之类似，也可以提供自己定义的操作来代替关键字上的`<`运算符。

所提供的操作必须在关键字类型上定义一个**严格弱序(strict weak ordering)**，当然严格弱序本身可能是一个比较复杂的函数，但一定要遵循严格弱序的规则。

*Note: 在实际编程中，如果一个类型定义了行为正常的<运算符，则它可以用作关键字(key)类型*。

**使用关键字类型的比较函数**

用来组织一个容器中元素的操作的类型也是该容器类型的一部分。为了指定使用自定义的操作，必须在定义关联容器类型时提供此操作的类型。

在尖括号中出现的每个类型，就仅仅是一个类型而已。当我们创建一个容器(对象)时，才会以构造函数参数的形式提供真正的比较操作(类型需要与尖括号中指定的类型相吻合)。

以`Sales_data`为例，我们无法直接定义一个`Sales_data`的`multiset`，因为`Sales_data`没有`<`运算符。但是可以自我定义一个类似`<`功能的函数：

```c++
bool compareIsbn(const Sales_data &lhs, const Sales_data &rhs)
{
    return lhs.isbn() < rhs.isbn();
}
```

为了使用自定义的操作，在定义`multiset`时我们必须提供两个类型：关键字类型`Sales_data`，以及比较操作类型——函数指针类型，可以指向`compareIsbn`。

***当定义此容器类型的对象时，需要提供想要使用的操作的指针***。(这里可以跟**谓词**区分开来，这是两者的主要差别)

```c++
// bookstore中多条记录可以有相同的ISBN，以ISBN的顺序进行排列
multiset<Sales_data, decltype(compareIsbn)*> bookstore(compareIsbn);    // 定义了一个可重复set

// 我是不是也可以理解为bookstore这么一个set容器，已经有了一个比较大小的方式代替'<'，该方式就是函数compareIsbn
```

使用`decltype`来获得函数指针的类型，即是一个指向`compareIsbn`函数的指针，同时使用`compareIsbn`来初始化`bookstore`对象，即通过调用`compareIsbn`来为这些元素排序。

<font color=red>问题：</font>

- 这里`compareIsbn`函数是通过指针传入构造函数的参数中吗？
  - 理论上来说应该是的；

### pair类型

`pair`类型定义在头文件`utility`中，一个`pair`保存两个数据成员。**类似容器，`pair`是一个用来生成特定类型的模板**。

当创建一个`pair`时，我们必须提供两个类型名，两个类型并不要求一样，`pair`的数据成员将具有对应的类型：

```c++
pair<string, string> anon;          // 保存两个string
pair<string, size_t> word_count;    // 保存一个string和一个size_t
pair<string, vector<int>> line;     // 保存string和vector<int>
```

`pair`的默认构造函数对数据成员进行值初始化。`size_t`初始化为0值，其余容器类型初始化为空。

我们也可以为每个成员提供初始化器：

~~~c++
// 上述两个成员分别初始化为"James"和"Joyce"
pair<string, string> author{"James", "Joyce"};
~~~

与其他标准库类型不同，`pair`的数据成员是`public`的，两个成员分别命名为`first`和`second`。我们用普通的成员访问符号来访问它们：

```c++
cout << w.first << " occurs " << w.second
    << ((w.second > 1) ? " times" : " time") << endl;
```

w是指向**map中某个元素的引用**(这部分前面代码已经展示了)；

**map的元素是pair**(`pair`是什么，就是一对，我们可以认为`map`的元素是`pair`)；

pair上的一些操作：

- `pair<T1, T2> p;`——默认的值初始化。
- `pair<T1, T2> p(v1, v2);`——`first`和`second`成员分别用v1和v2进行初始化。
- `pair<T1, T2> p = {v1, v2};`——等价于`p(v1, v2)`。
- `make_pair (v1, v2);`——返回一个用v1和v2初始化的`pair`。`pair`的类型从v1和v2的类型推断出来。
- `p.first与p.second`——分别返回相应的数据成员。
- `p1` `relop` `p2`——关系运算符按字典序定义，需要`p1.first < p2.first&&p1.second < p2.second`成立，才能说`p1 < p2`。
- `p1 == p2;`——`first`与`second`分别相等，则两`pair`相等。

**创建pair对象的函数**

想象有一个函数需要返回一个`pair`。在新标准下，我们可以对返回值进行列表初始化：

```c++
pair<string, int> 
process (vector<string> &v)
{
    if (!v.empty())
        return {v.back(), v.back().size()};    // 列表初始化，较早的版本不支持这种写法.......
        // return make_pair(v.back(), v.back().size());
    else
        return pair<string, int> ();    // 隐式构造返回值
}
```

## 关联容器操作

关联容器定义了一系列类型，其中，这些类型表示容器关键字类型(key_type)和值类型(value_type)，以及每个关键字关联的那个的类型(只适用于map的mapped_type)。

对于`map`而言，其<font color="red">value_type类型</font>为`pair<const key_type, mapped_type>`。

对于`set`类型而言，**key_type**与**value_type**是一样的；set中保存的值就是关键字，在一个`map`中，元素是<font color="blue">关键字——值</font>对。即每个元素是一个pair对象，包含一个关键字和关联的值。

<font color=red>由于我们不能改变一个元素的关键字，因此这些pair的关键字部分就是const的。</font>

```c++
set<string>::value_type v1;         // v1的类型是string，因为在set中key_type与value_type等价
set<string>::key_value v2;          // v2的类型也是string，理由同上
map<string, int>::value_type v3;    // map的value_type是pair<const string, int>，即v3是这么一个类型
map<string, int>::key_type v4;      // v4是一个是string，即key_type对应的类型
map<string, int>::mapped_type v5;   // v5是一个int
```

*Notes:所以其实在`map`中，关键字类型和值类型并不是定义当中的简单对应，对于映射类型`map`而言，他的`value_type`是`pair`，`mapped_type`是与关键字关联的那个类型。*

### 关联容器迭代器

当解引用一个关联容器迭代器时，我们会得到一个类型为容器的`value_type`的值的引用。对于`map`而言，`value_type`是一个`pair`类型，其`first`成员保存`const`的关键字，`second`保存值。

```c++
auto map_it = word_count.begin();   // 获得指向map中的一个元素的迭代器
// *map_it是指向一个pair<const string, size_t>对象的引用
cout << map_it->first;  // 打印此元素的关键字
cout << " " << map_it->second;  // 打印此元素的值
map_it->first = "new key";      // map中的关键字是const的
```

*Notes：一个`map`的`value_type`是一个`pair`，我们可以改变`pair`的值，但不能改变关键字成员的值。*

**`set`的迭代器是`const`的**

虽然`set`类型同时定义了`iterator`和`const_iterator`类型，但两种类型都只允许只读访问`set`中的元素。

**关联容器的遍历**

输出是按**字典序排列**的，当使用一个迭代器遍历一个`map、multimap、set`或者`multiset`时，迭代器按**关键字升序**遍历元素。

**关联容器和算法**

我们通常不对关联容器使用泛型算法。

- 关键字是`const`这一特性意味着不能将关联容器传递给修改或者重排容器元素的算法。

关联容器可用于只读取元素的算法，但是很多这类算法都要搜索序列；

但关联容器又非顺序排列，如果我们使用泛型`find`算法，跟关联容器定义的专用的`find`成员的实现速度相比，会慢得多。

- 因此建议使用关联容器专用的`find`成员去做查找；

### 关联容器添加元素

关联容器的`insert`成员向容器添加一个元素或一个元素范围。由于`map`和`set`包含不重复的关键字，因此插入一个已存在的元素对容器没有任何影响。

关联容器的`insert`有两个版本，分别**接受一对迭代器**，**或者是一个初始化器列表**——对于一个给定的关键字，只有第一个带此关键字的元素才被插入到容器中。

**向map添加元素**

元素类型必须是`pair`，若没有`pair`，创建一个`pair`。

```c++
// 向word_count插入word的4种方法
word_count.insert({word, 1});
word_count.insert(make_pair(word, 1));
word_count.insert(pair<string, size_t>(word, 1));
word_count.insert(map<string, size_t>::value_type(word, 1));
```

**关联容器的insert操作：**

- `c.insert(v);`——v是`value_type`类型的对象；
- `c.emplace(args);`——`args`用来构造一个元素；函数<font color="blue"><font color="blue">返回</font>一个pair</font>，该pair包含一个迭代器，指向具有指定关键字的元素，以及一个指示插入是否成功的bool值；
- `c.insert(b, e);`——插入某迭代器范围的元素；
- `c.insert(il);`——代表插入花括号列表中的元素；
- `c.insert(p, v);`——p是一个迭代器，指出从哪里开始搜索新元素应该存储的位置，v是要插入的value_type类型的对象；
- `c.emplace(p, args);`——同上；

**检测insert的<font color="blue">返回</font>值：**

上面已经说到，`emplace`的返回类型，对于`insert`而言，与`emplace`的返回类型一样。

**针对这个返回的pair，需要做更进一步的具体说明：**

- pair的first成员是一个**迭代器(指针)**，指向具有给定关键字的元素；second是一个bool值，指出元素是插入成功还是<font color="blue">已经存在于容器中。</font>

```c++
// 统计每个单词在输入中出现次数的一种更繁琐的方法：
map<string, size_t> word_count;        // 从string到size_t的空map
string word;
while (cin >> word) {
    // 插入一个元素，关键字等于word，值为1；
    // 若word已在word_count中，insert什么也不做
    auto ret = word_count.insert({word, 1});    // 返回包含迭代器的pair
    if (!ret.second)    // 如果插入失败
        ++ret.first->second;    // 代表已经有元素了，+1
        //++((ret.first)->second);    // 应该等价
        //++(*(ret.first)->second);    // 应该等价
}
```

**向`multiset`或`multimap`添加元素：**

- 之前我们的依据是一个给定的关键字只能出现一次，但是有时候会有一个关键字出现多次的需求，因此产生了`mutimap`，在这种类型上调用`insert`无须返回`bool`值，*因为总是会向这类容器中加入一个新元素*。

### 关联容器删除元素

关联容器定义了三个版本的`erase`，同顺序容器比较，我们也可以通过传递给`erase`一个迭代器或一个迭代器范围来删除一个元素或者一个元素范围，返回被删除元素的下一个元素的迭代器。

关联容器提供一个额外的`erase`操作，接受一个`key_type`参数。此版本删除所有匹配给定关键字的元素，<font color="blue">返回</font>实际删除的元素的数量。

```c++
// 下面调用的是关联容器中的erase操作，而不是泛型算法
// 删除一个关键字，返回删除的元素数量
if (word_count.erase(removal_word))
    cout << "ok: " << removal_word << " removed\n";
else cout << "oops: " << removal_word << " not found!\n";
```

*对允许重复关键字的容器，删除元素的数量可能大于1*。

从关联容器中删除元素的操作类型：

- `c.erase(k);`—从c中删除每个<font color=red>关键字为k</font>的元素。返回一个`size_type`值，指出删除的元素的数量。
- `c.erase(p);`—从c中删除迭代器p指定的元素，p必须指向c中一个真实元素，返回一个指向p之后元素的迭代器，若删除的是尾元素，则返回`c.end()`；
- `c.erase(b, e);`—删除迭代器对(b, e)所表示的范围中的元素，返回迭代器e，因为[b, e)。

### map的下标操作

`map`和`unordered_map`容器提供了下标运算符和一个对应的`at`函数(**返回对应下标的元素的引用**)；`set`不支持下标；同时`multimap`或者一个`unordered_multimap`也<font color=red>无法支持下标</font>操作，因为可能有多个值相关联。

`map`下标运算符接受一个索引(关键字)，但是**如果关键字不存在，会为它创建一个元素并插入到`map`中，关联值将进行值初始化**。

同时因为上述原因，我们也只可以对非`const`的`map`使用下标操作。

```c++
c[k];       // 返回关键字为k的元素，若不在，则添加
c.at(k);    // 访问关键字为k的元素，带参数检查，若不在，抛出out_of_range异常
```

**下标操作的返回值：**对`map`进行下标操作，会获得一个`mapped_type`对象；但解引用一个`map`迭代器时，会得到一个`value_type`对象(即`pair`)。

### 访问元素

关联容器提供多种查找一个指定元素的方法，应该使用哪个操作依赖于我们要解决什么问题。

- `c.find(k);`——<font color="blue">返回</font>一个迭代器，指向第一个关键字为k的元素，若k不在容器中，则<font color="blue">返回</font>尾后迭代器。
- `c.count(k);`——<font color="blue">返回</font>关键字等于k的元素的数量，对于不允许重复关键字的容器，<font color="blue">返回</font>值只有0，1。
- `c.lower_bound(k);`——不适用于无序容器，<font color="blue">返回</font>一个迭代器，指向第一个关键字不小于(<font color="red">即大于等于</font>)k的元素。
- `c.upper_bound(k);`——不适用于无序容器，<font color="blue">返回</font>一个迭代器，指向第一个关键字大于k的元素。
- `c.equal_range(k);`——返回一个迭代器pair，表示关键字等于k的==元素范围==。若k不存在，那么pair的两个成员均为`c.end()`。

**对map使用find代替下标操作**

为了避免使用下标操作的副作用，比如说我们就是想单纯知道一个给定关键字是否在map中。

```c++
if (word_count.find("foobar") == word_count.end())
    cout << "foobar is not in the map" << endl;
```

**在multimap和multiset中查找元素**

这类容器中可能会有很多元素具有给定的关键字，有这么一个例子，{"作者", "图书"}是一个从作者到著作书目的映射，我们想打印一个特定作者的所有著作：

```c++
string search_item("Alain de Botton");        // 要查找的作者
auto entries = authors.count(search_item);    // 元素的数量(图书数量)
auto iter = authors.find(search_item);        // 此作者的第一本书
while(entries) {
    cout << iter->second << endl;            // 打印每个题目
    ++iter;                                    // 前进到下一本书
    --entries;                                // 已经打印了的书
}
```

上述问题的解决也可以通过`lower_bound`和`upper_bound`来实现，这两个操作接受一个关键字，返回一个迭代器，若关键字在容器中：

- `lower_bound`返回的迭代器将指向第一个具有给定关键字的元素。
- `upper_bound`返回的迭代器将指向最后一个具有给定关键字之后的元素。

*Notes：对于lower_bound而言，关键字不在容器中，它会返回关键字的第一个安全插入点——不影响容器中元素顺序的插入位置*。

使用上述两个操作重写程序：

```c++
for (auto beg = authors.lower_bound(search_item), 
    end = authors.upper_bound(search_item); 
    beg != end; ++beg)
    cout << beg->second << endl;    // 打印每个题目
```

上述问题的解决还可以通过`equal_range`函数来解决：接受一个关键字，返回一个迭代器`pair`，表示关键字等于k的元素范围。若k不存在，那么pair的两个成员均为`c.end()`。

```c++
for (auto pos = authors.equal_range(search_item);    // 这个pair两个都是迭代器
    pos.first != pos.second; ++pos.first)
    cout << pos.first->second << endl;                // 打印每个题目
```

## 无序容器

新标准定义了4个无序**关联容器(unordered associative container)**；这些容器不是使用比较运算符来组织元素，而是使用一个**哈希函数(hash function)**和关键字类型的`==`运算符。

某些应用中维护元素的序代价非常高昂，此时无序容器就很有用；然而虽然理论上哈希技术能获得更好的平均性能，但实际中想要达到很好的效果还需要一些性能测试和调优。

### 使用无序容器

在哈希管理操作之外，无序容器还提供了与有序容器相同的操作；通常可以用一个无序容器替换对应的有序容器，反之亦然，但输出顺序可能不同。

```c++
// 重写单词计数程序
unordered_map<string, size_t> word_count;
string word;
while (cin >> word)
    ++word_count[word];
for (const auto &w : word_count)    // 对map中每个元素
    cout << w.first << " occurs " << w.second
        << ((w.second > 1) ? " times" : " time") << endl;
```

### 管理桶

**无序容器在存储上组织为一组桶，每个桶保存零个或多个元素。**

无序容器使用一个哈希函数将元素映射到桶。

- 容器将具有一个特定哈希值的所有元素都保存在相同的桶中。
- 如果容器允许重复关键字，那么所有具有相同关键字的元素也会在一个桶中。
- 无序容器的性能依赖于哈希函数的质量和桶的数量和大小。
- 将不同关键字的元素映射到相同的桶中也是允许的，再在桶中顺序搜索就好(<font color="blue">很快</font>)。

无序函数提供了一组管理桶的函数：

- 桶接口函数
  - `c.bucket_count()`——正在使用的桶的数目。
  - `c.max_bucket_count()`——容器能容纳的最多的桶的数量。
  - `c.bucket_size(n)`——第n个桶中有多少元素。
  - `c.bucket(k)`——关键字为k的元素在哪个桶中。
- 桶迭代
  - `local_iterator`——可以用来访问桶中元素的迭代器类型。
  - `const_local_iterator`——桶迭代器的const版本。
  - `c.begin(n), c.end(n)`——桶n的首元素迭代器和尾后迭代器。(const版本不写了)
- 哈希策略
  - `c.load_factor`——每个桶的平均元素数量，返回float。
  - `c.max_load_factor()`——c试图维护的平均桶大小，返回float值，c会在需要时添加新的桶。
  - `c.rehash(n)`——重组存储，使得`bucket_count>=n`且`bucket_count>size/max_load_factor`。
  - `c.reserve(n)`——重组存储，使得c可以保存n个元素且不必rehase。

这组函数较为底层，<font color=red>暂时还没有使用到这部分内容</font>；

### 对关键字类型的要求

无序容器使用关键字类型的`==`运算符来比较元素，它们还使用一个`hash<key_type>`类型的对象来生成每个元素的哈希值。

标准库为：

- 内置类型(包含指针)提供了`hash`模板；
- `string`以及后续的<font color="red">智能指针</font>类型定义了`hash`；

因此对于上述类型可以直接定义对应的无序容器。

但是针对自定义类类型，**必须要提供我们自己的hash模板版本**。

```c++
// 以Sales_data为例
size_t hasher(const Sales_data &sd)
{
    return hash<string> () (sd.isbn());
}
bool eqOp(const Sales_data &lhs, const Sales_data &rhs)
{
    return lhs.isbn() == rhs.isbn();
}

// 从上可以看出，我们的hasher函数使用一个标准库hash类型对象来计算ISBN成员的哈希值
// 该hash类型建立在string类型之上。
// 使用这些函数来定义一个unordered_multiset
using SD_multiset = unordered_multiset<Sales_data, decltype(hasher)*, decltype(eqOp)*>;
// 上面这行，参数是桶大小、哈希函数指针和相等性判断运算符指针

// 如果类定义了==运算符，则可以只重载哈希函数
SD_multiset bookstore(42, hasher, eqOp);
```

有关关联容器的使用源码展示，**[见Github](https://github.com/Wind134/CPP_Primier_SourceCodes/tree/main/%E5%85%B3%E8%81%94%E5%AE%B9%E5%99%A8%E7%9A%84%E7%94%A8%E6%B3%95-set-map/src)**；

## 总结对比

这部分主要描述`map`与`set`的区别所在：

- `map`与`set`都是C++的关联容器，底层都基于红黑树(RB-Tree)，几乎所有的`map`和`set`操作行为，都只是调转红黑数的操作行为；
- `map`的元素是`pair`类型，基于`<key, value>`，关键字当作索引，值则是与索引相互关联的数据，`set`则是关键字的简单集合；
- `map`与`set`的元素中的`key`都是`const`的，一旦插入除了删除，都不能修改，而`map`中`key`对应的`value`可以更改；
  - 因为`key`的存储是根据红黑树，如果可以修改，那么必然涉及到平衡性的再调节，从而迭代器失效；
- `map`支持下标操作，可用`key`作下标，但这种做法自己需要明白自己在做什么，因为对于不存在的`key`，使用下标会自动创建一个`key`，并默认附带一个`value`(如果类型有默认构造的话)；