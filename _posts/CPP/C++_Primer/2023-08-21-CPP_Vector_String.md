---
title: 特别介绍-vector与string
author: Ping
date: 2022-10-23 10:33:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

之所以将`string`与`vector`单独拉出来作为一部分，主要还是因为这俩标准库在刷题以及实际应用中出现的频率非常高，因此作为一个单独的笔记模块；

## vector容器

向量`vector`是一个封装了动态大小数组的顺序容器(还是习惯称呼为数组)，跟任意其它类型容器一样，它能够存放各种类型的对象。可以简单的认为，向量是一个能够存放任意类型的动态数组。因为`vector`容纳着其他对象，所以它也常被称作**容器(container)**。后续针对容器会有更详细的介绍。

```c++
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        int n = nums.size();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                if (nums[i] + nums[j] == target)
                    return {i, j};	// 这种返回方式来源于LeetCode
            }
        }
        return { };
    }
};
```

### 初始化的细节

主要想要描述的是，括号类型不同，初始化的意义可能也就相应不同！

```c++
vector<int> v1(10);     // v1有10个元素，每个元素默认为0
vector<int> v2{10};     // v2有一个元素，该元素的值为10
vector<int> v3(10,1)    // v3有10个元素，每个元素为1
vector<int> v4{10,1}    // v4有2个元素，值分别为10和1
```

如果用的是圆括号，可以说提供的值是用来构造`vector`对象的；

如果用的是花括号，可以表述成我们想列表初始化该`vector`对象，也就是说，初始化过程会尽可能地把花括号内的值当成元素初始值的列表来处理。

下面需要考虑一个初始化过程中元素类型的问题：
- 这里主要是要考虑容器中元素的类型；
- 平时注意这个细节即可；

```c++
vector<string> v5{"hi"};	// 正常的列表初始化，因为花括号内的"hi"就是string类型
vector<string> v6("hi");	// 报错，构造函数中不能有字符串字面值
vector<string> v7{10};		// 10是int类型，因此v7的含义是有10个默认初始化的元素
vector<string> v8{10， "hi"};	// v8有10个值为"hi"的元素
```

书中提到的一个比较细节的点就是：随着对`vector`的更多使用，我们还会逐渐了解到其他的一些隐含的要求，其中一条是如果在循环体内部包含有向`vector`对象添加元素的语句，则不能使用范围for循环。

使用`size_type`，需首先指定它是由哪种类型定义的。`vector`对象的类型总是包含着元素的类型，像

`vector::size_type`就是错误的方式，因为不知道`vector`的类型。

在使用`vector`数组时，一定要注意与C语言的区分，C语言一般是定义了一定的空间，而`vector`在未初始化之时，其实是一个空`vector`，不包含任何元素，所以刚初始化后万万不能用下标去访问。

也正是因此有一个小tip，确保下标合法的一种有效手段就是尽可能使用`范围for语句`；其次在`for`循环最好少用`<=`，而更多的用`!=`.

### 迭代器操作

**vector对象迭代器**

主要是新增两个概念，`iterator`与`const_iterator`，前者可读可写，后者只可读。

**解引用和成员访问操作**

在**解引用**之时要考虑运算符的优先级，举例：`(*it).empty()`与`*it.empty()`的意义是完全不同的！

为了减缓这种复杂性，C++语言定义了箭头运算符`->`，箭头运算符把解引用和成员访问两个操作结合在一起；

***Notes:*** 但凡使用了迭代器的循环体，都不要向迭代器所属的容器添加元素；

- 因为对元素的插入和删除操作会使得迭代器失效；

- 以代码举例：

  ```c++
  vector<int> vec = {1, 2, 3, 4, 5};
  for(auto it = vec.begin(); it != vec.end(); it++)
  {
      vec.push_back();      // 我们加了这个之后，vec.end()的内容就变化了，即迭代器发生了变化
      cout << *it << endl;  // 本意就是想输出其中的每个元素
  }
  ```

### 常用成员函数

日常用到的主要是以下几类：

- 构造函数和析构函数：

    ```cpp
    vector<T> v;        // 默认构造函数，创建一个空的向量。
    vector<T> v(size);  // 创建一个包含 size 个默认构造的元素的向量。
    vector<T> v(size, value);   // 创建一个包含 size 个值为 value 的元素的向量。
    vector<T> v(otherVector);   // 复制构造函数，创建一个与 otherVector 一样的向量。
    ~vector();  // 析构函数，释放向量的资源。
    ```

- 元素访问：

    ```cpp
    v[index];       // 返回索引为 index 的元素的引用。
    v.at(index);    // 返回索引为 index 的元素的引用，提供了边界检查。
    v.front();      // 返回第一个元素的引用。
    v.back();       // 返回最后一个元素的引用。
    ```

- 容量操作：

    ```cpp
    v.size();       // 返回向量中元素的数量。
    v.empty();      // 返回向量是否为空。
    v.capacity();   // 返回向量当前分配的内存容量。
    v.reserve(newCapacity); // 请求分配至少newCapacity大小的内存容量，不动元素。
    v.resize(new_num);      // 将数组大小设定为new_num，长了分配(默认初始化)，短了截断。
    v.shrink_to_fit();      // 释放多余的内存。
    ```

    这里要稍微区分一下`resize`和`reserve`，`resize`会对容器内元素产生作用。
    - 对于`resize`，如果新的大小比当前大小大，会在容器尾部添加默认构造的元素；
    - 如果新的大小比当前小，会截断容器中多余的元素；
    - `resize()`函数会改变容器的实际大小，并调整容器的内部存储。

    而`reserve`的行为则不一样：
    - 如果预留的容量比当前容器的容量大，会分配更大的内存空间；
    - 分配更大空间的过程中要将之前的对象通过拷贝构造复制过来，销毁之前的内存；
    - 如果预留的容量比当前容器的容量小或相等，则不会进行任何操作。
    - `reserve()`函数不会改变容器的元素数量，只是调整容器的内部存储空间；

- 修改操作：

    ```cpp
    v.push_back(value);     // 在向量末尾添加一个元素。
    v.pop_back();           // 删除向量末尾的元素。
    v.insert(pos, value);   // 在pos处插入一个元素。
    v.erase(pos);           // 删除位于pos处的元素。
    v.clear();              // 清空向量中的所有元素。
    ```

- 其他操作：

    ~~~cpp
    v.swap(otherVector);    // 交换两个向量的内容。
    v.assign(count, value); // 将向量重置为包含 count 个值为 value 的元素。
    v.resize(newSize);      // 调整向量的大小为 newSize，并在需要时进行插入或删除操作。
    ~~~

### 内存管理

**`vector`对象的增长策略**

预先分配足够大的内存空间，从而避免频繁的空间移动以及添加新元素后，旧存储空间的释放操作。在实际应用中性能表现足够好。

**管理容量的成员函数**

这些函数针对的是`vector`以及`string`类型，允许我们与它的实现中内存分配部分互动。

```c++
c.shrink_to_fit();	// 将capacity减少到与size相同大小(vector、string、deque特有)，不一定保证退回内存空间。
c.capacity();		// 不重新分配内存空间的情况下c可以保存的元素数量
c.reserve(n);		// 分配至少能容纳n个元素的内存空间(不改变容器中元素的数量)	
```

`reserve`常与`resize`进行比较：`reserve`不会减少容器占用的内存空间；`resize`也只改变容器中元素的数目。

`capacity`常与`size`进行比较：向`vector`中添加元素时，`size`与添加的元素数目相等，而`capacity`至少与`size`一样大，具体分配多少取决于标准库具体实现。

### 衔接C语言

考虑到一些C++程序在标准库出现之前就被写好了，因此肯定没用到`string`或者`vector`类型。

同时有一些C++程序事实上是与C语言或者其他语言的接口程序，当然也无法使用C++标准库。

因此现代的C++程序不得不与那些充满了数组和C风格字符串的代码衔接，为了使这一工作简单易行，C++专门提供了一组功能，后续要介绍的两组功能是衔接C风格数组以及衔接C风格字符串的内容；

**使用数组初始化`vector`对象**

允许使用数组来初始化`vector`对象，只要指明要拷贝区域的首元素地址和尾后地址即可；

```c++
int int_arr[] = {0, 1, 2, 3, 4, 5};
vector<int> ivec(begin(int_arr), end(int_arr));
```

现代的C++程序应当尽量使用`vector`和迭代器，避免使用内置数组和指针；应该尽量使用`string`，避免使用C风格的基于数组的字符串；

## string字符串

### 补充信息

这一段是第二次看时自己加的，可以略过；

关于string的加法运算看到一些细节，特此记录：

```c++
string s1 = "hello", s2 = "world";
```

上述是很正常的`string`定义，但下列涉及到`string`的加法会有一些细节需要我们注意：当把`string`对象和字符字面值及字符串字面值混在一条语句中使用时，必须确保每个加法运算符(+)的两侧的运算对象至少有一个是`string`：

```c++
string s4 = s1 + ", ";              // 合法：string加字面值常量
string s5 = "hello" + ", ";         // 非法：两个运算对象都不是string
string s6 = s1 + ", " + "world";    // 合法：string加字面值常量之后称为新的string
string s7 = "hello" + ", " + s2;    // 非法，主要问题出在("hello" + ", ")
```

上述信息在初读确实遇到了一些困惑，因为`"hello"`显然是一个字符串形式啊，但经过书中说明，得知这种字面值`"hello"`并不是标准库类型`string`的对象。主要是因为一些历史原因以及为了保证与C语言的兼容性而导致的。接下来会在**C风格字符串**做进一步描述。

同时也在做题时遇到了一个问题，要求将一个字符串倒序输出，比如`ni hao ma`要输出为`ma hao ni`，第一次做题卡在对字符串的理解不够深刻，无法将之与二维数组联系起来；后续尝试利用C++来实现，想到利用`vector`来实现，<font color='red'>但是思维卡在如何将一个单词处理成为字符串数组中的一个元素</font>，这一步思路记录如下，当作基础拓展：

```c++
string word;    // 某一个单词
vector <string> sentence;   // 二维数组，一条句子

// 类似我们在输入一个数组时候的处理，cin这个函数会自动识别空格...
while(cin >> word)	sentence.push_back(word);
```

这样就实现了我们的目的。

### 额外的string操作

这些额外的操作中的大部分要么是提供`string`类和C风格字符数组之间的相互转换，要么是增加了允许用下表代替迭代器的版本。

**string特有的构造函数**

- `string s(cp, n);`：s是cp指向的数组中前n个字符的拷贝。

- `string s(s2, pos2);`：s是`string s2`从下标`pos2`开始的字符的拷贝。

- `string s(s2, pos2, len2);`：s是`string s2`从下标`pos2`开始的字符的拷贝。

  ```c++
  const char *cp = "Hello World!!!";    // 以空字符结束的数组
  char noNull[] = {'H', 'i'};           // 不存在空字符的数组

  // 对应上述的string s(cp, n)
  string s1(noNull, 2);

  // 此行为是未定义的，因为noNull的类型并非字符类型，而是字符数组                 
  string s2(nuNull);
  // 通过上述代码，s构造函数的第二个参数n或pos2，
  // 若给定的是字符数组，需要给定一个参数，否则未定义
  ```

*注意事项*：

- 通常当我们从一个`const char*`创建`string`时，指针指向的数组必须以空字符结尾，拷贝操作遇到空字符时停止。
- 之所以需要这么做是因为在没有其他参数的情况下，`string`的构造函数不接受字符数组类型的参数
- 但我们一般也会通过构造函数的第二个参数去传递一个基数值，进行对应的操作。

  ```c++
  // 因此衍生出了一个疑问
  string s("hello world");  // 合法，因为"hello world"是字符(C语言的历史遗留)
  ```

**`string`中的`substr`操作**

`substr`操作返回一个`string`，它是原始`string`中的一部分或全部的拷贝。可以传递给`substr`一个可选的开始位置和计数值：

```c++
string s("hello world");
string s2 = s.substr(0, 5); // 截取了[0,5)的范围
string s3 = s.substr(6);    // 从6开始，默认截取到末尾
// 若是超范围则抛出out_of_range异常
```

**改变`string`的其他方法**

`string`提供了接受下标的版本：

```c++
s.insert(s.size(), 5, '!');	// 在s末尾插入5个感叹号
s.erase(s.size() - 5, 5);	// 从s最后删除5个字符
```

`string`还提供了接受C风格字符数组的`insert`和`assign`版本。

```c++
const char *cp = "Stately, plump Buck";
s.assign(cp, 7);                // 分配了前7个字符，s == "Stately"
s.insert(s.size(), cp + 7);     // 从s的末尾开始插入数值，插入的信息从(cp + 7)的位置开始
```

**`append`和`replace`函数**

`append`操作在末尾进行插入操作；

`replace`操作是同时调用`erase`和`insert`的一种简写形式，针对`replace`进行举例：

```c++
s = "C++ Primer Fifth Ed";
s.replace(11, 3, "Fifth");  // 在11的位置，删除3个字符，但会在其位置插入5个新字符。
```

**修改string的操作汇总**

- `s.insert(pos, args);`：在`pos`<font color="red">之前</font>插入`agrs`指定的字符。`pos`可以是一个下标或一个迭代器；接受下标的版本返回一个指向s的引用，接受迭代器的版本返回指向第一个插入字符的迭代器。
- `s.erase(pos, len);`：删除从`pos`<font color="red">开始</font>的`len`个字符；返回一个指向s的引用。
- `s.assign(args);`：将s中的字符替换为`args`指定的字符；返回一个指向s的引用。
- `s.append(args);`：将`args`追加到s；返回一个指向s的引用。
- `s.replace(range, args);`：删除s中范围`range`内的字符，替换为`agrs`指定的字符。`range`可以是一个下标或一个长度，或者是一对指向s的迭代器；返回一个指向s的引用。

*`args`的形式:*
- 字符串`str`；
- str中从pos开始最多len个字-`(str, pos, len)`；
- cp开始的前len字符-`(cp, len)`；
- n个字符c-`(n, c)`；
- 迭代器范围-`(b, e)`；
- 初始化列表；

### string搜索操作

string类提供了6个不同的搜索函数，每个函数都有4个重载版本；

搜索操作返回一个`string::size_type`值，表示匹配发生位置的下标；

搜索失败，则**返回一个**名为`string::npos`的`static`成员；
- `npos`的类型为`const string::size_type`，初始化为-1；
- 无符号类型，所以表示的应该是无限大；

**find函数**

```c++
string name("AnnaBelle");
auto pos1 = name.find("Anna");  // 返回第一个匹配位置的下标
// 一个更复杂的问题是查找与给定字符串中任何一个字符匹配的位置
// 利用find_first_of()函数
string numbers("0123456789"), name("r2d2");
auto pos = name.find_first_of(numbers);
// 同理要搜索不在参数中的字符，应该调用find_first_not_of()函数
// 指定位置搜索的妙用
string::size_type = 0;
while ((pos = name.find_first_of(numbers, pos)) != string::npos) {
    cout << "found number at index: " << pos
    << " element is " << name[pos] << endl;
    ++pos;  // 移动到下一个字符
}
// 同时也衍生了出了逆向搜索的例子，返回值就变成了最后一个匹配了。
```

*`find`函数返回第一个匹配位置的下标位置。*

**`find_if`函数**

该函数接受一个迭代器范围，第三个参数是一个**谓词**，`find_if`对输入序列中的每个元素调用这个给定的谓词；

**返回第一个使谓词返回非0值的元素的迭代器**，如果不存在这样的元素，则返回**尾迭代器**。

### string的数值转换

新标准引入了多个函数，可以实现数值数据与标准库`string`之间的转换：

```c++
int i = 42;
string s = to_string(i);
double d = stod(s); // 将字符串s转换为浮点数
// 要转换为数值的string中第一个非空白符必须是数值中可能出现的字符：
string s2 = "pi = 3.14";    // 显然无法通过函数直接转换
d = stod(s2.find_first_of("+-.123456789")); // 这样就成功实现了浮点数的提取
```

*使用数值转换的注意事项:*
- `string`参数中第一个非空白符必须是符号(+或-)或数字。
- 可以以`0x`或`0X`开头来表示十六进制数。
- 对那些将字符串转换为浮点值的函数，`string`参数也可以以小数点`.`开头，并可以包含e或E来表示指数部分。
- 总之，根据基数不同，`string`参数可以包含字母字符，对应大于数字9的数。

### C风格字符串

与C++中定义的string类型不同的是，C++同时也继承了C语言标准库，具体导入方式：`#include <cstring>`

下面代码举例用到的这些函数都是C标准库带的函数，切记；

```c++
// 返回p的长度，空字符不计算在内
strlen(p);

// 比较p1和p2的相等性。如果p1==p2,返回0；如果p1>p2，返回一个正值，p1<p2，返回一个负值
strcmp(p1, p2);

// 将p2附加到p1之后，返回p1
strcat(p1, p2);

// 将p2拷贝给p1，返回p1
strcpy(p1, p2);
```

**传入此类函数的指针必须指向以空字符作为结束的数组**，否则C语言只将这种类型看作是字符数组；

```c++
// 没有空字符'\n'
char ca[] = {'C', '+', '+'};

// 严重错误，strlen可能会沿着ca在内存中位置不断向前寻找空字符
cout << strlen(ca) << endl;
```

**混用`string`对象和C风格字符串**

使用字符串字面值来初始化`string`对象：`string s("Hello World");`

如果程序的某处需要一个C风格字符串，无法直接用`string`对象来代替它；

**不能直接用`string`对象直接初始化指向字符的指针**；

为了完成该功能，`string`专门提供了一个名为`c_str`的成员函数：

```c++
const char* str = "Hello, World!";  // C风格字符串

// 下面两行举例与第一行无关
char *str = s;  // 错误，s是string类型

// 正确，c_str函数的返回值是一个C风格的字符串。
// 即函数的返回结果是一个指针，且返回的指针类型是:const char*
const char *str = s.c_str();
```

即，**在C++中，C风格字符串可以很容易转为`string`，但是`string`不能直接转为C风格字符串，需要通过内置函数`c_str()`操作**；

**比较字符串**

这一点与标准库`string`对象的时候不同，`string`直接比较字符串本身，而C风格字符串实际比较的是指针而非字符串本身：

```c++
const char ca1[] = "A string example";
const char ca2[] = "A different string";
if (ca1 < ca2)  // 这里试图比较两个无关地址，所以会得到未定义的结果
```

如果需要比较两个C风格字符串需要调用`strcmp`函数。

```c++
if (strcmp(ca1, ca2) < 0)	// 和两个string对象的比较效果一样
```

***Notes:*** 建议使用标准库`string`，更安全、更高效；

---

