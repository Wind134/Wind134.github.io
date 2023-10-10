---
title: 12-C++标准库之泛型算法
author: Ping
date: 2022-11-02 10:34:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

标准库容器定义的操作集合惊人的小。标准库并未给每个容器添加大量功能，而是提供了一组算法，这些算法中的大多数都独立于任何特定容器。

**这些算法是通用的(generic, 或称泛型的)**。可用于不同类型的容器和不同类型的元素。

大多数算法都定义在头文件`algorithm`中。

标准库还在头文件`numeric`中定义了一组**数值泛型算法**。

通过一些查找元素匹配的案例我们可以明显看到，迭代器令算法不依赖于容器，**但是容器中的元素类型会影响到算法的设计**。

## 初识泛型算法

标准库提供了超过100个算法，这些算法全部进行记忆是很不现实的一件事，然而与容器类似，这些算法具有一致的数据结构，理解这些结构可以更好的学习和使用这些算法。初步而言，这些算法大致上来说有这些特点：

- 除少数例外，标准库算法都对一个范围内的元素进行操作。范围形如：`[begin, end);`
- 即便大多算法遍历输入范围的方式相似，但它们使用范围中元素的方式不同。理解算法最基本的方法就是了解它们是否读取元素、改变元素或是重排元素顺序。

### 只读算法

该类型下算法的基本特点：

- 一些算法只会读取其输入范围内的元素，而从不改变元素，如`find`函数；

- 另一个只读算法是`accumulate`，它定义在头文件`numeric`中。`accumulate`函数接受三个参数，前两个指出了需要求和的元素范围，第三个参数是和的初值。

  ```c++
  int sum = accumulate(vec.cbegin(), vec.cend(), 0);
  ```

通过上述代码，我们需要进一步展开讨论的是**算法和元素类型**之间的关系，以`accumulate`为例，元素类型加到和的类型上的操作必须是可行的。即，序列中元素的类型必须与第三个参数匹配，或者能够转换为第三个参数的类型。我们列举一个`string`的案例：

```c++
// 这一行代码将v中的每一个元素连接到了string上，该string初始为空串
string sum = accumulate(v.cbegin(), v.cend(), string(""));

// 这种写法是错误的，""默认为const char*类型，没有定义这种类型的+运算符
string sum = accumulate(v.cbegin(), v.cend(), "");
```

**Notes:** 要注意区分字符串字面值和字符串的区别！

- 又一个只读算法是`equal`，用于确定两个序列是否保存相同的值。若是则`true`，否则`false`。

  ```c++
  equal(roster1.cbegin(), roster2.cend(), roster2.cbegin());    //前两个参数表示第一个序列中的元素范围，第三个参数表示第二个序列的首元素。
  ```

  这里有一点需要说的是，**因为利用迭代器完成操作，可以利用`equal`来比较两个不同类型的容器中的元素，甚至，元素类型也不必一样。**

### 写容器元素的算法

一些算法将新值赋予序列中的元素。当我们使用这类算法时，必须注意确保序列原大小至少不小于我们要求算法写入的元素数目。

- 记住，**算法不会执行容器操作，因此它们自身不可能改变容器的大小**。

- 算法`fill`：接受一对迭代器范围，再接受一个值作为第三个参数。

  ```c++
  fill(vec.begin(), vec.end(), 0);    // 将每个元素重置为0
  fill(vec.begin(), vec.begin() + vec.size() / 2, 10);    // 将一个子序列重置为10
  ```

- 函数`fill_n(dest, n, val)`：从`dest`指向的那个位置将`n`个`val`写入。

  ```c++
  vector<int> vec;    // 空vector
  fill_n(vec.begin(), vec.size(), 0);    // 将所有元素重置为0
  ```

*算法不检查写操作，它会假定一切的写入都是安全的，这就要求程序员需要有自我检错纠错的能力。*

**插入迭代器(insert iterator)**

插入迭代器保证算法有足够元素空间来容纳输出数据，插入迭代器是一种向容器中添加元素的迭代器。

当我们通过一个迭代器向容器元素赋值时，值被赋予迭代器指向的元素。当我们通过一个插入迭代器赋值时，一个与赋值号右侧值相等的元素被添加到容器中。

通过`back_inserter`展示如何用算法向容器写入数据，该函数定义在头文件`iterator`中。

```c++
vector<int> vec;              // 空向量
auto it = back_inserter(vec); // 通过它赋值会将元素添加到vec中
*it = 42;                     // vec中现在有一个元素，42
```

<font color = "red">之所以能保证有足够空间是不是因为会先通过迭代器创建一定空间，然后插入元素，这样就避免了空间不足的问题？</font>
- 不是先通过迭代器创建一定空间，而是`vector`的机制一般会预留一段空间；

`back_inserter`接受一个<font color = "red">指向容器的引用(怎么理解这个引用)</font>，返回一个与该容器绑定的插入迭代器。

经常使用`back_inserter`来创建一个迭代器，作为算法的目的位置来使用，此外，该函数的功能也比较直观，返回其参数容器中的末尾位置，通常情况下，它与算法函数`copy`结合使用，以便将元素从一个容器复制到另一个容器的末尾。

```c++
vector<int> vec;    // 空向量

// 因为返回的是迭代器，因此每次赋值都会在vec上调用push_back，一个一个依次进行元素添加。
fill_n(back_inserter(vec), 10, 0);
```

与之类似的迭代器函数还有`front_inserter`，该函数的功能是在容器头部位置插入元素；

**拷贝算法**

拷贝算法本质上也是写入数据一种算法：向目的位置迭代器指向的输出序列中的元素写入数据的算法。接受三个迭代器，前两个表范围，第三个表示目的序列的起始位置。同样，类似于前面所述诸多函数，传递给copy的目的序列至少要包含与输入序列一样多的元素，这一点很重要。

```c++
int a1[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

// 这个处理还是很棒的，a1数组的总大小/a1数组单个元素的大小=a1数组元素数量
int a2[sizeof(a1)/sizeof(*a1)];

// 把a1的内容拷贝给a2
auto ret = copy(begin(a1), end(a1), a2);
```

`copy`函数的返回值：返回的是其目的位置迭代器(递增后)的值，即上述`ret`恰好指向拷贝到`a2`尾元素之后的位置。

多个算法都提供所谓的拷贝版本。这些算法计算新元素的值，但不会将它们放置在输入序列的末尾，而是创建一个新序列保存这些结果。

- `replace`算法：读入一个序列，将其中所有等于给定值的元素都改为另一个值。4个参数-前两个迭代器-搜索值-新值。

  ```c++
  // 将所有0改为42，最后ilst变成了一个新序列
  replace(ilst.begin(), ilst.end(), 0, 42);
  ```

如果我们希望原序列保持不变，这时候可以调用replace_copy。该算法接受额外第三个迭代器参数，指出调整后序列的保存位置：

- `replace_copy`算法：保留原序列不变，类似深拷贝，改变的是拷贝后的版本。

  ```c++
  replace_copy(ilst.cbegin(), ilst.cend(),
              back_inserter(ivec), 0, 42);
  ```

  上述调用后，`ilst`并未改变，`ivec`包含`ilst`的一份拷贝，不过原来在`ilst`中值为0的元素在`ivec`中都变为42。

### 重排元素的算法

某些算法会重排容器中元素的顺序，一个明显的例子是`sort`。

此外，假设给定一段文本，我们用来消除重复的单词：为了消除重复单词，首先将`vector`进行排序，使得重复的单词都相邻出现。在`vector`排序完毕之后，使用`unique`的标准库算法来重排`vector`，使得不重复的元素出现在`vector`的开始部分。

```c++
void elimDups(vector<string> &words)
{
    // 按字典序排序words，以便查找重复单词
    sort(words.begin(), words.end());    // 返回words的引用？
    // unique重排输入范围，使得每个单词只出现一次
    // 排列在范围的前部，返回指向不重复区域之后一个位置的迭代器
    auto end_unique = unique(words.begin(), words.end());
    // 使用向量操作erase删除重复单词
    words.erase(end_unique, words.end());
}
```

- `unique`的作用是消除容器中所有重复的元素(仅仅保留一个)，最后它所指向(返回)的就是处理过的不重复区域之后位置的迭代器；
- 但是`unique`的作用仅仅是消除了那些重复的元素，这里的消除其实更底层来说是覆盖；
- 因为`unique`只是指向不重复区域后的那个位置，不代表那个位置就没有元素了，这个位置的元素依然存在，但我们不知道元素是什么，也没有知道的必要，但是最终我们需要消除这些，所以需要调用`erase`去真正作用于容器。(即真正删除多余信息)

## 定制操作

很多算法都会比较输入序列中的元素。默认情况下使用元素类型的`<`或`==`运算符完成比较，但是标准库还为这些算法定义了额外的版本，允许我们提供自己定义的操作来代替默认运算符。

上述额外版本存在的原因之一也是因为一些元素类型(如上述的`Sales_data`)并未定义`<`运算符，这种情况下，需要重载`sort`的默认行为。

### 向算法传递函数

假如我们希望在调用上述`elimDups`后打印`vector`的内容。此外还假定希望单词按其长度排序，大小相同的再按字典序。

为了按长度重排`vector`，我们使用`sort`的第二个版本，此版本是重载过的，它接受第三个参数，此参数是一个**谓词(predicate)**。

**谓词：**一个可调用的表达式，其返回结果是一个能用作条件的值(即`bool`类型)。

- **一元谓词(unary predicate)：**只接受单一参数的谓词。
- **二元谓词(binary predicate)：**有两个参数的谓词。

接受一个二元谓词参数的`sort`版本用这个谓词代替`<`来比较元素，提供给`sort`的谓词需要满足一定条件。

结合所介绍的谓词，我们自定义一种大小比较：

```c++
// 接受两个参数的谓词
// 这里定义的就是基于string的长度去决定大小，而不是默认的字典序
bool isShorter(const string &s1, const string &s2)
{
    return s1.size() < s2.size();
}    
sort(words.begin(), words.end(), isShorter);  // 基于长度按短到长排序words
```

**上述几处都涉及到排序算法，针对排序算法进行介绍：**

一般的`sort`排序并未考虑`稳定`这一特点，正如之前在数据结构中所学过的，就是两个相等的元素并不需要我们去改变它的顺序，即为`稳定`。此算法我们称为`stable_sort`算法。

```c++
elimDups(words);    // 将words按字典序重排，并消除重复单词
// 按长度重新排序，长度相同的单词维持字典序
stable_sort(words.begin(), words.end(), isShorter);
for (const auto &s : words)    // 无须拷贝字符串
    cout << s << " ";
cout << endl;
```

(说好的介绍，就这两句.....pass)

### lambda表达式

根据算法接受一元谓词还是二元谓词，传递给算法的谓词必须严格接受一个或者两个参数。而有时候的参数需要更多，从而超出了算法对谓词的限制。

**举一个例子来说明这个问题**：我们需要在`string`中指出是否有5个及以上的字符

**用一个例子来引出对`lambda`表达式的使用**：我们需要在一串句子中求大于等于一个给定长度的单词有多少，且打印出大于等于给定长度的单词：

```c++
// 将函数命名为biggies
void biggies(vector<string> &words, vector<string>::size_type sz)
{
    elimDups(words);    // 将words按字典序排序，删除重复单词
    stable_sort(words.begin(), words.end(), isShorter);
    // ....这部分代码暂时省略，主要内容有：
    // 获取一个迭代器，指向第一个满足size() >= sz的元素
    // 计算符合要求的数目
    // 打印满足要求的单词，且留空格
}
```

上述省略部分可以调用`find_if`函数，但是该函数只能接受一个参数(一元谓词)。为了更好的解决这个问题，需要使用另外一些语言特性。

**引入lambda**

我们可以向一个算法传递任何类别的**可调用对象(callable object)**。

**可调用：**如果一个对象或一个表达式，如果可以对其使用调用运算符，则称它为可调用的。

**四种可调用对象：**函数、函数指针、重载了函数调用运算符的类、`lambda`表达式。

```c++
// 假设e是一个可调用的表达式，则我们可以编写代码e(args)
// 其中args是一个逗号分隔的一个或多个参数的列表
// 目前所学两种可调用对象：函数和函数指针

// [capture list]是一个lambda所在函数中定义的局部变量的列表(通常为空)
[capture list] (parameter list) -> return type { function body}

auto f = [] { return 42; };        // 一个范例，注意写法，忽略了括号和参数列表

// lambda的调用，即在后面增加一个"()"
cout << f() << endl;    // 将42进行打印

// 一个带参数的lambda例子，我们可以编写一个与isShorter函数相同功能的lambda
// []表明此lambda不使用它所在函数中的任何局部变量
[] (const string &a, const string &b)
    { return a.size() < b.size(); }

// 结合lambda与排序与谓词，最终代码
stable_sort(words.begin(), words.end(),
[] (const string &a, const string &b) { return a.size() < b.size(); });
```

一个`lambda`表达式表示一个可调用的代码单元。

- 我们可以理解为一个未命名的**内联函数**。

`lambda`有如下特点：

- 一个`lambda`具有一个返回类型、一个参数列表和一个函数体，与函数不同的是`lambda`可以定义在函数内部；

- **对于`lambda`而言，可以忽略括号和参数列表，甚至可以忽略返回类型；**但如果忽略返回类型，`lambda`也可以根据函数体中的代码推断出返回类型；

  - 但必须**永远包含捕获列表和函数体**；
  - 如果函数体只有一个`return`语句，则返回类型从返回的表达式的类型推断而来，否则，返回类型为`void`；

- `lambda`不能有**默认参数**；

- 我们也可以从一个函数返回`lambda`。函数可以直接返回一个可调用对象，或者一个类对象，该类含有可调用的数据成员；

**使用捕获列表**

解决上述遗留的问题，更好的结合`lambda`的使用，上面提到对于lambda的`[]`的作用是**使用所在函数中的局部变量**(`lambda`本身还是可以使用定义在当前函数之外的名字)，这个列表称之为**捕获列表**，通过该列表来指出将会使用这些变量(<font color="red">捕获列表还是只能使用所在函数的局部变量</font>)。

*Notes：要捕获变量它所在函数中的局部变量，才能在函数体中使用变量。*

```c++
// 函数体用到了sz，因此捕获列表必须有该参数
[sz] (const string &a) { return a.size() >= sz; }

// 结合find_if，查找第一个长度大于等于sz的元素：
auto wc = find_if(words.begin(), words.end(),
[sz](const string &a) { return a.size() >= sz; });

// 计算满足size >= sz的元素的数目
auto count = words.end() - wc;  // 获取符合要求的数目(之所以直接减，是因为已经有序了)

// make_plural作用是返回单词复数形式(这语法也太严谨了)，如果符合要求的大于1个单词，就复数形式
cout << count << " " << make_plural(count, "word", "s")
<< " of length " << sz << " or longer" << endl;
```

**`for_each`算法**

```c++
// 打印单词
for_each(wc, words.end(), [](const string &s) {cout << s << " ";});
cout << endl;
```

#### lambda捕获和返回

定义一个`lambda`时，编译器生成一个与`lambda`对应的新的(未命名)类类型，当使用auto定义一个用`lambda`初始化的变量时，定义了一个从`lambda`生成的类型的对象。

以下再介绍几种构造捕获列表的方式：

- **值捕获**：拷贝`lambda`返回的值，正因为是拷贝，所以对其修改不会影响到`lambda`内对应的值。

- **引用捕获**：保存对`lambda`返回值的引用，所以如果引用的那个变量的值发生了变化，那么对应保存的值也发生变化。下面是一个运用：

  ```c++
  void biggies(vector<string> &words, vector<string>::size_type sz,
  ostream &os = cout, char c = ' ')
  {
      // 与之前例子一样的重排words的代码
      // 打印count的语句改为打印到os
      // for_each后面是需要冒号的(一个函数)
      for_each(words.begin(), words.end(),
      [&os, c](const string &s) { os << s << c;});
  }
  ```

  *上面一个小细节：*因为我们不能拷贝`ostream`对象，因此捕获`os`的唯一方法就是捕获其引用。

- **隐式捕获**：让编译器根据`lambda`体中的代码来推断我们要使用哪些变量。为了指示编译器推断捕获列表，应在捕获列表中写一个`&`或`=`(分别告诉编译器采用引用和值捕获)。

  ```c++
  wc = find_if(words.begin(), words.end(), [=](const string &s)
               { return s.size() >= sz; });    // sz即为隐式捕获，值捕获方式
  
  // 还可以实现对一部分变量采用值捕获，对其他变量采用引用捕获，即混合使用
  void biggies(vector<string> &words, vector<string>::size_type sz,
  ostream &os = cout, char c = ' ')
  {
      // 与之前例子一样的重排words的代码
      // 打印count的语句改为打印到os
      for_each(words.begin(), words.end(),
      [&, c](const string &s) { os << s << c;});    // os引用隐式捕获
      for_each(words.begin(), words.end(),
      [=, &os](const string &s) { os << s << c;});  // c的值隐式捕获
  }
  ```

  **上述的代码也体现出这么几点：**

  - 捕获列表中的第一个元素必须是一个`&`或`=`，此符号指定了默认捕获方式为引用或值；
  - 混合使用时，多个参数中显式捕获的那个必须采用不同的方式。(隐式采用引用，则其余的参数显式捕获必须采用值捕获，其余同理)；
    - 这个好理解，不然编译器就不好猜了；

**可变`lambda`**

默认情况下，对于一个值被拷贝的变量，`lambda`不会改变其值，如果希望改变这么一个现状，就必须在参数列表后加上关键字`mutable`。

```cpp
auto f1 = [v1] () mutable { return ++v1; };        // 更改后的值被f捕获
```

然而一个引用捕获的变量是否可以修改**依赖于此引用指向的是一个const还是非const类型变量**。

```c++
void fcn()
{
    size_t v1 = 42;    // 局部变量
    // 下面v1是一个非const变量的引用
    auto f2 = [&v1] { return ++v1; };    // 返回的是一个引用类型，f2保存v1的引用。
    v1 = 0;           // v1改变了
    auto j = f2();    // 保存的是引用，自然也变了
}
```

**指定`lambda`的返回类型**

默认情况下，**如果一个`lambda`体包含`return`之外的任何语句，则编译器假定此`lambda`返回`void`**，`void`是不能返回值的，举一个代码的范例：

```c++
transform(vi.begin(), vi.end(), v1_new.rbegin(),
[] (int i) { return i < 0 ? -i : i; });    // 一行return,可以推断。

// 下面是同样意图的一类写法，但由于编译器无法推断出返回类型，因此就报错了

transform(vi.begin(), vi.end(), v1_new.rbegin(),
[] (int i) { if (i < 0 ) return -i; else return i; });    // 多个return,无法推断。

// 针对此种情况，必须使用尾置返回类型
transform(vi.begin(), vi.end(), back_inserter(v1_new),
[] (int i) -> int { if (i < 0 ) return -i; else return i; });
```

## 参数绑定

如果只是少数场景使用的简单操作，`lambda`是最有用的，但如果需要在很多地方使用相同的操作，通常应该定义一个函数。

但因为参数问题，**有时候函数的参数量不符合要求，比如某算法接受一元谓词，但是该函数使用了两个形参，就会出错！**这个时候就准备引入了一个新的函数：标准库`bind`函数。

一般形式：
```cpp
auto *newCallable = bind(*callable, arg_list*);
```

`arg_list`对应给定的`callable`的参数，当我们调用`newCallable`时，`newCallable`会调用`callable`，并传递给它`arg_list`中的参数。

关于`arg_list`中的参数知识点记录：

- 参数中可能包含形如`_n`的名字，其中`n`是一个整数，称为占位符，表示`newCallable`中的参数位置。
- `_n`表示`newCallable`参数中的第`n`个参数。

```c++
// 先定义一个bool类型的函数
bool check_size(const string &s, string::size_type sz)
{
    return s.size() >= sz;
}

// 由于该函数需要两个参数，不满足一元谓词的要求，因此使用标准库中的bind函数
// 下面的check6是一个可调用对象，自己本身接受一个string类型的参数
// 并用此string和值6来调用check_size
// 仅有一个占位符，表明check6只接受单一参数。(_1, 6)参数传递给check_size。
auto check6 = bind(check_size, _1, 6);

// check6的使用
string s = "hello";
bool b1 = check6(s);    // check6(s)会调用check_size(s, 6)

// 最终替换为如下使用check_size的版本：
auto wc = find_if(words.begin(), words.end(), bind(check_size, _1, sz));
```

**一些思考&总结：(针对谓词)**

- 正如书中所看到的，对谓词的要求来源于算法本身，`find_if`只接受一元谓词，所以我们需要符合一元谓词的要求。

- 此外，再分析代码的写法：

  ```c++
  bool isShorter(const string &s1, const string &s2)
  {
      return s1.size() < s2.size();
  }

  // sort接受二元谓词
  sort(words.begin(), words.end(), isShorter);
  
  // for_each接受一元谓词
  for_each(wc, words.end(), [](const string &s) {cout << s << " ";});
  
  // find_if接受一元谓词
  auto wc = find_if(words.begin(), words.end(), bind(check_size, _1, sz));
  ```

  在写法方面，我们发现的一个特点是：如果谓词是函数形式，不带`()`(因为是一个可调用对象)。

  - `isShorter`是函数，不带`()`。
  - `[](const string &s) {cout << s << " ";}`整体是一个函数(`auto f2 = ...`)，不额外再`()`。
  - `bind(check_size, _1, sz)`整体是可调用对象(`auto check6 = ...`)，也不额外再带`()`。

**使用`placeholders`名字**

名字`_n`再一个名为`placeholders`的命名空间中(定义在头文件`functional`中)，而这个命名空间本身又定义在`std`命名空间。为了使用这些名字，两个命名空间都要写上。

```c++
using std::placeholders::_1;    // 声明
```

对于每个**占位符**名字，我们都必须提供一个单独的`using`声明。

而一个一个定义太麻烦：

```c++
using namespace std::placeholders    // 这样就使得placeholders定义的所有名字都可用
```

**`bind`参数的进一步介绍**

```c++
auto g = bind(f, a, b, _2, c, _1);    // 代表g是有两个参数的可迭代对象

// 对于g而言，即

g(_1, _2);    // 映射为了

f(a, b, _2, c, _1);

// 那么对g(X, Y)的调用等价于
f(a, b, Y, c, X);
```

我们通过上述例子，可以用bind实现参数顺序的重排：

```c++
sort(words.begin(), words.end(), isShorter);

// 排序顺序实现了调换(佩服sort这个函数的容纳性啊，不愧是标准库函数)
sort(words.begin(), words.end(), bind(isShorter, _2, _1));
```

**bind参数与引用的结合使用**

这部分会介绍到标准库`ref`(cref，多了`const`)函数。考虑到对有些绑定参数我们希望以引用方式传递，或者要绑定参数的类型无法拷贝。

```c++
// os是一个局部变量，引用一个输出流
// c是一个局部变量，类型为char
for_each(words.begin(), words.end(), [&os, c](const string &s) { os << s << c; });

ostream &print(ostream &os, const string &s, char c)
{
    return os << s << c;
}

// 在使用bind代替对os的捕获的时候，则会出现问题。

// 错误用法
for_each(words.begin(), words.end(), bind(print, os, _1, ' '));

// 不能普通引用，但可以通过ref引用
for_each(words.begin(), words.end(), bind(print, ref(os), _1, ' '));
```

## 再探迭代器

除了为每个容器定义的迭代器之外，标准库在头文件`iterator`中还定义了额外几种迭代器：

- `插入迭代器(insert iterator)`：向容器插入元素。
- `流迭代器(stream iterator)`：绑定到输入或者输出流上，可用来遍历所关联的IO流。
- `反向迭代器(reverse iterator)`：向前移动的迭代器。
- `移动迭代器(move iterator)`：它们不是拷贝其中的元素，而是移动它们。

### 插入迭代器

接受一个容器，生成一个迭代器，实现向给定容器添加元素。

当我们通过一个插入迭代器进行赋值时，该迭代器调用容器操作向给定容器的指定位置插入一个元素。

```shell
# 举一个例子
it = t;
# 代表的意义是在it指定的当前位置插入值t，假设c是it所绑定的容器，根据绑定的迭代器的不同种类
# 这一赋值分别调用c.push_back(t)、c.push_front(t)、c.insert(t, p)
```

三种插入器的类型：

- `back_inserter`：创建一个使用`push_back`的迭代器。
- `front_inserter`：创建一个使用`push_front`的迭代器。
- `inserter`：创建一个使用`insert`的迭代器，该函数接受第二个参数，该参数指向给定容器的迭代器。

**Notes:** 容器支持`push_font`的情况下，我们才可以使用`front_inserter，back_inserter`。

理解插入器的工作过程：

以调用`inserter(c, iter)`为例，在这里，`c`应该是绑定的容器，插入到`iter`所指向的元素位置之前，最后生成一个迭代器。

```c++
// 通过代码理解，假设it是由inserter生成的迭代器，则下面这样的赋值语句
it = inserter(c, iter);
*it = val;  // 关于这行代码还是有一些值得关注的细节，"*"其实没起到作用。
it = val;   // 这一行代码等价于上一行，作用是将元素插入到iter原来所指向的元素之前的位置
// 等价于
it = c.insert(it, val);        // it指向新插入的元素
++it;    // 递增it使它指向原来的元素
```

基于上述的分析，我们需要注意到：对于`front_inserter`而言，它的行为与`inserter`会不一样，因为`front_inserter`总会往第一个元素之前插入元素，但是返回的迭代器永远是指向插入的那个元素，因此，顺序会颠倒。

### iostream迭代器

`iostream`类型本身并不是容器，*但标准库定义了可用于这些IO类型对象的迭代器*。`istream_iterator`向一个输入流读数据，`ostream_iterator`向一个输出流写数据。通过使用流迭代器，我们可以用**泛型算法**从流对象读取数据以及向其写入数据。

- `istream_iterator`操作

  创建一个流迭代器时，需要指定迭代器将要读写的对象类型；`istream_iterator`要读取的类型必须定义了输入运算符`>>`。

  ```c++
  istream_iterator<int> int_it(cin);    // 初始化，从cin读取int，cin为IO类型对象
  istream_iterator<int> int_eof;        // 尾后迭代器，默认初始化
  ifstream in("afile");                // 打开afile，创建文件流对象in
  istream_iterator<string> str_it(in)    // 从"afile"读取字符串
  
  // 用istream_iterator从标准输入读取数据，存入一个vector
  istream_iterator<int> in_iter(cin);    // 从cin读取int
  istream_iterator<int> eof;            // istream尾后迭代器(为什么要定义一个这样的尾后迭代器)
  while (in_iter != eof)                // 用处在于此，解决上述疑问
      // 后置递增运算读取流，返回迭代器的旧值，就是a++和++a的区别
      vec.push_back(*in_iter++);
  
  // 上述程序的重写形式
  istream_iterator<int> in_iter(cin), eof;
  vector<int> vec(in_iter, eof);    // 从迭代器范围构造vec(利用了容器的通用操作？因为vec内的迭代器类型并非是vector类型)
  ```

  <font color = "red">还涉及到一些具体的操作可以去教材上查表！</font>

  `istream_iterator`允许使用**懒惰求值**，就是说标准库并不保证迭代器立即从流中读取数据。因为对于大多数程序来说，立即读取和推迟读取没什么太多区别。

**使用算法操作流迭代器：**因为算法一般使用迭代器操作来处理数据，而流迭代器又至少支持某些迭代器操作，但是并非所有的算法都可以用于流迭代器。

```c++
istream_iterator<int> in(cin), eof;
cout << accumulate(in, eof, 0) << endl;    // 加和，初值为0
```

- `ostream_iterator`操作

  具体要求类似上述`istream_operator`，但是当创建一个`ostream_iterator`时，我们可以提供(可选的)第二参数，它是一个字符串，输出每个元素后会打印此字符串。使用`ostream_iterator`有两个要求：

  - **第二参数的字符串要求是一个C风格字符串**
  - **必须绑定到一个指定的流，不允许空的或表示尾后位置的ostream_iterator。**

  ```c++
  // 用ostream_iterator来输出值的序列：
  ostream_iterator<int> out_iter(cout, " ");    // 保证输出每个字符后带空格是吗？

  // 赋值语句实际上将元素写到cout上，去掉'*'无所谓
  // 只是为了保证写法一致，运算符'*' '++'不对迭代器对象做任何事？
  for (auto e : vec)
      *out_iter++ = e;
  cout << endl;
  
  // 用一种更妙的方式实现
  copy(vec.begin(), vec.end(), out_iter);    // 利用copy算法写到out_iter
  cout << endl;
  ```

- **使用流迭代器处理类类型**

  书中起初章节有一个`Sales_items`的类，查看了源文件，这个类定义了`>>`以及`<<`，因此可以为这个类定义`istream_iterator`以及`ostream_iterator`，我们将1.6节的书店程序改写：

  ```c++
  istream_iterator<Sales_item> item_iter(cin), eof;
  ostream_iterator<Sales_item> out_iter(cout, "\n");

  // 将第一笔交易记录存在sum中，并读取下一条记录
  Sales_item sum = *item_iter++;
  while (item_iter != eof ) {
      // 如果当前交易记录存在相同的ISBN
      if (item_iter->isbn() == sum.isbn())    sum += *item_iter++;
      else {
          out_iter = sum;            // 输出当前sum
          sum = *item_iter++;        // 去下一条记录
      }
  }
  out_iter = sum;        // 记得打印最后一组记录的和
  ```

### 反向迭代器

意义上理解起来没什么压力，只需要**注意`forward_list`不支持反向迭代器**。可以用于诸多层面，如，排序算法。

在实践这部分代码中遇到了一些疑惑，进行了总结：

```c++
// 反向寻找逗号
auto rcomma = find(line.crbegin(), line.crend(), ',');
// 逆序输出，不符合需求
cout << string(line.crbegin(), rcomma) << endl;
// 自作聪明，尝试将反向迭代器与正向迭代器混用，出错了

// 错误写法
std::cout << std::string(rcomma, line.cend()) << std::endl; 

// 同样不规范写法，可通过编译但程序无法运行，（方向反了）
std::cout << std::string(rcomma, line.rcbegin()) << std::endl;

// 正确做法是通过调用reverse_iterator的base成员函数来完成这一转换
std::cout << std::string(rcomma.base(), line.cend()) << std::endl;
```

*Notes：反向的迭代器与原迭代器指向的并不是相同的元素。*

有关迭代器的详细使用，见**[Github源码](https://github.com/Wind134/CPP_Primier_SourceCodes/tree/main/%E6%B5%81%E8%BF%AD%E4%BB%A3%E5%99%A8-%E6%8F%92%E5%85%A5%E8%BF%AD%E4%BB%A3%E5%99%A8-lambda%E8%A1%A8%E8%BE%BE%E5%BC%8F-%E4%BB%A5%E5%8F%8A%E4%B8%80%E4%BA%9B%E5%B8%B8%E7%94%A8%E7%AE%97%E6%B3%95/src)**；

## 泛型算法结构

任何算法的最基本的特性是它要求其迭代器提供哪些操作。算法所要求的迭代器操作可以分为5个**迭代器类别(iterator category)**，每个算法都会对它的每个迭代器参数指明需要提供的迭代器类型。

- 输入迭代器：只读，不写；单遍扫描，只能递增。
- 输出迭代器：只写，不读；单遍扫描，只能递增。
- 前向迭代器：可读写；多遍扫描，只能递增。
- 双向迭代器：可读写；多遍扫描，可递增递减。
- 随机访问迭代器：可读写，多遍扫描，支持全部迭代器运算。

当然，也有其他的分类方式。

### 迭代器的类型介绍

类似容器，迭代器也定义了一组公共操作。某些操作所有迭代器都支持，另一些只有特定类别的迭代器才支持。

迭代器是按它们所提供的操作来分类的，这种分类形成了一种层次；除了输出迭代器之外，一个==高层类别的迭代器支持低层类别迭代器==的所有操作。

**输入迭代器(input iterator)**

几个支持：

- 用于比较两个迭代器的相等和不相等运算符`==、!=`
- 用于推进迭代器的前置和后置递增运算`++`
- 用于读取元素的解引用运算符`*`
- 箭头运算符`->`，解引用迭代器，并提取对象的成员

输入迭代器只用于顺序访问，<font color="red">但是这一类迭代器的递增不能保证输入迭代器的状态可以保存下来并用来访问元素。因此，输入迭代器只能用于单遍扫描算法。</font>(似懂非懂)

**输出迭代器(output iterator)**

看作输入迭代器功能上的补集，需要支持：

- 用于推进迭代器的前置和后置递增运算`++`。
- 解引用运算符`*`，只出现在赋值运算符的左侧。(也就是赋值，写入元素)

**前向迭代器(forward iterator)**

可以读写元素，这类迭代器只能在序列中沿一个方向移动，支持输入和输出迭代器的所有操作，而且可以多次读写同一个元素，所以我们可以保存前向迭代器的状态。

**双向迭代器(bidirectional iterator)**

可以正向/反向读写序列中的元素，除了支持上层前向迭代器的所有操作之外，还支持前置和后置递减运算符。

**随机访问迭代器(random-access iterator)**

提供在常量时间内访问序列中任意元素的能力。此类迭代器支持双向迭代器的所有功能，还支持表3.7(99页)中的操作，算法`sort`要求随机访问迭代器。`array、deque、string`和`vector`的迭代器都是随机访问迭代器。

### 算法形参模式

在任何其他算法分类之上，还有一组参数规范。

大多数算法具有如下4种形式之一：

```cpp
alg(beg, end, *other args*);        // 输入范围

alg(beg, end, dest, *other args*);  // 输入范围和目的位置

// dest参数是一个表示算法可以写入的目的位置的迭代器。
// 算法假定：按其需要写入数据，不管写入多少个都是安全的。

alg(beg, end, beg2, *other args*);  // 输入范围和一个特定的开始位置，不指定后续的结束位

alg(beg, end, beg2, end2, *other args*);  // 输入范围1和输入范围2
```

### 算法命名规范

除了参数规范，算法还遵循一套命名和重载结构。如：*如何提供一个操作代替默认的<或==运算符，算法是将输出数据写入输入序列还是一个分离的目的位置*。

**使用重载形式传递一个谓词：**接受谓词参数来代替`<`或`==`运算符，以及不接受额外参数的算法，通常都是重载的函数。如`unqiue`算法，可接受`\==`，也可接受`comp`谓词。

**`_if`版本的算法：**

接受一个元素值的算法通常会有另一个不同名的版本，如`find`以及`find_if`：

```c++
find(beg, end, val);    // 在输入范围中查找val第一次出现的位置
find_if(beg, end, pred);    // pred是一个谓词
```

**区分拷贝元素和不拷贝元素的版本：**

默认情况下，重排元素的算法将重排后的元素写回给定的输入序列之中；但他们同时还提供另一个版本，将元素写到一个指定的输出目的位置。这类版本都会带一个_copy。

```c++
reverse(beg, end);            // 反转输入范围中元素的顺序
reverse_copy(beg, end, dest); // 将元素按逆序拷贝到dest
```

一些算法同时提供`_copy`和`_if`版本。这些版本接受一个目的位置迭代器和一个谓词：

```c++
remove_if(v1.begin(), v1.end(),
[](int i) { return i % 2; });   // 基于原序列remove

remove_copy_if(v1.begin(), v1.end(), back_inserter(v2),
[](int i) { return i % 2; };);  // 将偶数元素拷贝到v2，v1不变
```

## 特定容器算法

与其他容器不同，链表类型`list`和`forward_list`定义了几个成员函数形式的算法，他们定义了独有的`sort、merge、remove、reverse和unique`。(通用版的`sort`不能跑在链表上)。

链表类型定义的其他算法通用版本可以用于链表，但代价太高，链表有自身独有的特性。

一些用得多算法进行列举：

```c++
lst.merge(lst2);          // 将来自lst2的元素合并入lst.要求两链表都有序
lst.merge(lst2, comp);    // 元素将从lst2中删除，comp类似谓词的功能
lst.remove(val);          // 删除val的值，或者该参数也可以用谓词代替
lst.remove_if(pred);      // 如上
lst.sort();               // 排序或给定比较操作排序元素
lst.sort(comp);           // 如上
lst.unique();             // 调用erase删除同一个值的连续拷贝
lst.unique(pred);         // 或者给定谓词
```

**`splice`成员**

链表类型的`splice`算法是链表数据结构所独有的。(`splice`的意思是拼接)

```cpp
lst.splice(args);         // 双向链表

flst.splice_after(args);  // 单向链表
```

`args`参数一般有如下类型：

- `(p, lst2)`：`p`是一个指向`lst`中元素的迭代器，以及一个指向`flst`首前位置的迭代器；进行对应的拼接(插入)操作；*类型必须相同，且不能是同一个链表*。
- `(p, lst2, p2)`：`p2`是一个指向`lst2`中位置的有效的迭代器；针对双向链表，将`p2`指向的元素移动到`lst`中，针对单向链表，将p2之后的那个元素移动到`flst`中(`_after`)。
- `(p, lst2, b, e)`：`b`和`e`表示`lst2`中的合法范围；同样将元素进行移动。

*Notes：链表特有的操作会改变容器！*