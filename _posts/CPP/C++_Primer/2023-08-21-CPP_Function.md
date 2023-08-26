---
title: 06-函数的全面介绍
author: Ping
date: 2022-10-21 11:37:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

## 函数引用的返回值

### **函数返回注意事项**

最核心的一点：<font color = 'red'>对于函数引用而言，不要返回局部对象的引用或指针。</font>

函数完成后，它所占用的存储空间也随之被释放掉。因此，函数终止意味着局部变量的引用将指向不再有效的内存区域：

```cpp
// 返回的是const string的引用类型
const string &manip()
{
    string ret;
    // 以某种方式改变一下ret的代码
    if (!ret.empty())
        return ret;	// 返回了局部对象的引用，错误
    else
        return "Empty";	// 返回了局部临时量"Empty"的引用，错误
}
```

指针与引用同理，不多赘述。

***Notes：***之前以为是对**任意函数**不能返回中间量，现在知道是**针对函数引用**不能返回中间量。

### **引用返回左值**

函数的返回类型决定函数调用是否是左值。

- 调用一个返回引用的函数得到左值，左值就意味着可修改；
- 其他返回类型得到右值；

因此，我们能为返回类型是非常量引用的函数的结果赋值：

```c++
char &get_val(string &str, string::size_type ix)
{
    return str[ix];	// 函数确保索引值有效
}
int main()
{
    string s("a value");
    cout << s << endl;	// 正常输出s
    get_val(s, 0) = 'A';
    cout << s << endl;	// 输出修改后的s
}
```

***Notes：***如果返回类型是常量引用，那我们不能给调用的结果赋值。

## 参数传递

### 数组形参

数组的两个特殊性质：

- 不允许拷贝数组，<font color="blue">因为我们无法以值传递的方式使用数组参数。</font>
- 使用数组时通常会将其转化成指针，因此传递的是指向数组首元素的指针。

```c++
// 加const是因为传递的是数组，且我们无意于去改变这一数组，以下三行等价！
void print(const int*);		// 传入数组首址，const表示无意于改变指针指向的对象内容
void print(const int[]);
void print(const int[10]);	// 表示我们所期望的数组的元素
```

也可以使用**标准库规范**管理数组实参，即传递指向数组首元素和尾后元素的指针，这种技术受到了标准库技术的启发。

```c++
void print(const int *beg, const int *end)
{
    while (beg != end)
        cout << *beg++ << endl;
}
```

**指针与数组之间括号处理**

```c++
int *matrix[10];    // 10个指针构成的数组，元素是指向数组每一个元素的指针
int (*matrix)[10];  // 是一个指向含有10个整数的数组的指针，有点像数组名为matrix的数组
int main(int argc, char *argv[]) {...}	// 函数声明：argv是一个数组，元素是指向C风格字符串的指针
```

通过这部分我们所需要总结出的一个信息是，如果我们想定义一个返回数组指针的函数，则数组的维度必须跟在函数名字之后。然而，函数的形参列表也跟在函数名字后面且形参列表应该先于数组的维度，因此，返回数组指针的函数形式：

`Type (*function(parameter_list))[dimension]`

最外层的那面括号不能去除，否则函数的返回类型将是指针的数组。

### 可变形参

有时我们无法提前预知应该向函数传递几个实参。例如，我们想要编写代码输出程序产生的错误信息，此时我们最好用同一个函数实现该功能，然而因为错误的种类不同，所以调用错误输出函数时传递的实参也各不相同。

涉及到**可变参数模板**，联系可变参数模板章节；

- **initializer_list形参**

  即初始化列表，如果函数的实参数量未知但是全部实参的类型都相同，我们可以使用该类型的形参。与`vector`一样，`initializer_list`也是一种模板类型，**但不一样的是**，`initializer_list`对象中的元素永远是`const`常量值。

  下面是一个简单使用:

  ```c++
  // 这是一个输出错误信息的函数，实参数量未知但是都是string类型
  void error_msg(initializer_list<string> il)
  {
      for (auto beg = il.begin(); beg != il.end(); ++beg)
          cout << *beg << " ";
      cout << endl;
  }
  // 从这部分代码可以看出，定义了一个函数，里面参数数量是可变或者说未知的，但类型相同。
  // 下面这部分是该函数的的运用，两次传递的参数是不同的。
  if (expected != actual)
      error_msg({"functionX", expected, actual});
  else
      error_msg({"functionX", "okay"});
  ```

### 默认参数

注意规则，默认参数要**从最右边过来**；

```c++
int function(int m, int n, int i = 3);	// 也就是默认i为3

int function(int m, int n = 3, int i);	// 写法是错误的
```

一般而言，**默认参数都要写在头文件当中**，而且不能在cpp文件中重复，可以看成是C++的一个规则；

多次声明一个函数在语法上也是合法的，但是后续的声明只能为之前那些没有默认值的形参添加默认实参，而且该形参右侧的所有形参必须都有默认值。

```c++
string screen(sz, sz, char = ' ');      // 首次声明的高度宽度没有默认值
string screen(sz, sz, char = '*');      // 错误，已有默认值，无须重复声明
string screen(sz = 24, sz = 80, char);  // 正确，添加了默认实参
```

默认实参还有一个应用场景就是，比如我们使用string对象表示窗口的内容。一般情况下，我们希望该窗口的高、宽以及背景字符都使用默认值，同时我们也接纳用户的自行设置，那我们可以定义为：

```c++
typedef string::size_type sz;
string screen(sz ht = 24, sz wid = 80, char backgrnd = ' ');
```

与上面联系起来，我们发现的一个细节问题就是，一旦某个形参被赋予了默认值，它后面(右边)所有的形参都必须有默认值；

**因为默认参数要从最右往左走；**

*那我们怎么调用实参呢？*

```c++
string window;
window = screen();    // 等价于screen(24, 80, ' ')
window = screen(66);  // 等价于screen(66, 80, ' ')
window = screen(66, 256);       // screen(66, 256, ' ')
window = screen(66, 256, '#');  // screen(66, 256, '#')
```

函数调用时实参按其位置解析，默认实参负责填补函数调用缺少的尾部实参（靠右侧位置），这就意味着无法填补左侧位置，因此：

```c++
window = screen(, , '?');	// 这种写法是错误的，缺少了实参，因为缺少的部分在左侧
window = screen('?');		// 语法上没问题，但逻辑上有问题，会把char类型转化为string::size_type类型(short)
```

<font color=red>因此怎么合理设置形参的顺序也是个需要谨慎考虑的问题。</font>

**局部变量不能作为默认形参**，除此之外，只要表达式的类型可以转换成形参所需的类型，该表达式就能作为默认实参。

用作默认实参的名字在函数声明所在的作用域内解析，而这些名字的求值过程发生在函数调用时：

```c++
sz wd = 80;		char def = ' ';
sz ht();	string screen(sz = ht(), sz = wd, char = def);
string window = screen();	// 等价于调用screen(ht(), 80, ' ')
void f2()
{
    def = '*';		// def还是之前的def，改变了默认实参def的值，变成了'*'
    sz wd  = 100;	// 这是一个新定义的变量wd，不会改变之前传递给screen的wd的默认值
    window = screen();	// 等价于调用screen(ht(), 80, '*')
}
```

- **省略符形参**

  省略符形参是为了便于C++程序访问某些特殊的C代码而设置的，这些代码使用了名为varargs的C标准库功能。通常，省略符形参不应用于其他目的。

  - 大多数类类型的对象在传递给省略符形参时都无法正确拷贝；

  代码示例：

  ```c++
  void foo(parm_list, ...);		// 只能出现在形参列表的最后一个位置
  
  void foo(...);
  ```

  <font color=red>结合可变参数模板来理解这个省略符</font>

### 参数使用注意点

特别细节的一串代码：其实本质上就是涉及到**对常量的引用**，一定要求有const限定符。

从下面这两串代码也能看出來，**在参数引用上我们应该尽可能使用常量引用**。

```c++
#include <iostream>
using namespace std;

void f(const int & i)	// 不加const会发生报错，因为传入的i*3其实就是一个const变量
{
        cout << i << endl;
}

int main()
{
        int i = 3;
        f(i * 3);	// i * 3它并不是一个变量名，更准确来说，他是数字9，一个常量。 
        return 0;
}
```

让我们再看看一些负面案例：主要是我们需要知道，我们不能把const对象，字面值或者需要转换类型的对象传递给普通的引用形参；

```c++
string::size_type find_char(string &s, char c, string::size_type &occurs);
find_char("Hello World", 'o', ctr);	// 这个错误比较容易理解，Hello World是字面值常量！

// 下面这个错误隐藏更深，is_sentence使用的s是const string类型
bool is_sentence(const string &s)
{
    string::size_type ctr= 0;
    return find_char(s, '.', ctr) == s.size() - 1 && ctr == 1;
} // 因为find_char本身是非常量引用，这么一搞同样导致了编译错误，间接的解决方案就是再在内部定义一个string类型的变量。
```

## 返回数组指针

### <font color="red">声明一个返回数组指针的函数</font>

如果我们想定义一个返回数组指针的函数，则数组的维度必须跟在函数名字之后。然而，函数的形参列表也跟在函数名字后面且形参列表应该先于数组的维度，因此，返回数组指针的函数形式：

`Type (*function(parameter_list))[dimension];`

最外层的那面括号不能去除，否则函数的返回类型将是指针的数组。举一个例子：

`int (*func(int i))[10];`

可以按照以下的顺序来逐层理解该声明的含义：

- `func(int i)`表示调用func函数时需要一个int类型的实参。
- `(*func(int i))`意味着我们可以对函数调用的结果执行解引用操作
- `(*func(int i))[10]`表示解引用func的调用将得到一个大小是10的数组
- `int (*func(int i))[10]`表示数组中的元素是int类型。

### 使用尾置返回类型

出现于C++11新标准，可以简化上述func声明，尾置返回类型跟在形参列表后面并以一个->符号开头。为了表示函数真正的返回类型跟在形参列表之后，我们在本应出现返回类型的地方加一个auto：

`auto func(int i) -> int (*)[10];`

- `(*)`代表这是一个指针类型；
- `int (*)[10]`代表指针指向一个大小为10的int数组；

这样便可以清楚地看到`func`函数返回的是一个指针，并且该指针指向了含有10个整数的数组，`auto`就会接收到具体类型；

### 使用decltype推断

具体内容已经放到了[decltype部分](../CPP_Const)；

## 函数重载

主要产生的背景是不同类中定义的函数变量名相同，但是参数或者返回类型不同。

不允许两个函数除了返回类型外其他所有要素都相同，提到这一点，列举一个相对较为复杂的例子，涉及到`const_cast`和重载：

```c++
const string &shorterString(const string &s1, const string &s2)
{
    return s1.size() <= s2.size() ? s1 : s2;
}

// 参数和返回的类型都是const string的引用，那如果我们需要处理实参不是常量的情况呢？
string &shorterString(string &s1, string &s2)
{
    // 调用了const string类型引用的函数，加上const
    auto &r = shorterString(const_cast<const string&>(s1),
                           const_cast<const string&>(s2));
    return const_cast<string&>(r);
}
// 从这里也进一步加深理解了const_cast的功能，可以const->非const，也可以非const->const。
```

### 函数匹配

函数匹配指的是将函数调用与一组重载函数中的某一个关联起来的这么一个过程，编译器首先将调用的实参与重载集合中每一个函数的形参进行比较，根据比较的结果决定到底调用哪个函数。

这样衍生出的一个问题：<font color = 'red'>当两个重载函数参数数量相同且参数类型可以相互转换时编译器会如何处理？</font>(下面第三点已回答)

函数匹配的过程：

- 确定候选函数和可行函数，没找到可行函数，编译器将报告无匹配函数的错误。
- 寻找最佳匹配，在这部分精确匹配比需要类型转换的匹配更好。
- 处理含有多个形参的函数匹配，这部分编译器可能会报告二义性调用的信息，因为可能存在第一个形参调用函数1更好，第二个形参调用函数2更好....

*Notes:*调用重载函数时尽可能避免强制类型转换，如果确实需要强制类型转换，则说明我们设计的形参集合不合理。

### 重载与作用域

重载对作用域的一般性质并没有什么改变：

- 但如果我们在内层作用域中声明名字，它将隐藏外层作用域中的声明的同名实体(<font color=red>想到默认参数那部分章节</font>)；
- <font color=red>默认参数那部分章节跟这里的情况还是不一样的；</font>

在不同的作用域中无法重载函数名：

```c++
string read();
void print(const string&);
void print(double);	// 重载print函数
void fooBar(int ival)
{
    bool read = false;  // 新作用域：隐藏了外层的read
    string s = read();  // 这样处理就是错误的，因为read已经被转化为了bool类型
    // 警告：通常来说，在局部作用域中声明函数不是一个好的选择
    void print(int);  // 新作用域，隐藏了之前的两个print
    print("Value:");  // 错误，const string &这个参数对应的函数被隐藏
    print(ival);      // ival在此为int类型，正确
}
```

## 函数指针

首先明确函数指针，即一个指向函数的指针，但是这个指向函数的指针，与函数名有什么关系呢？

容易理解，函数指针指向的是函数而非对象。和其他指针一样，函数指针指向某种特定类型。函数的类型由它的返回类型和形参类型共同决定。

声明一个可以指向该函数的指针：

```c++
bool (*pf)(const string &, const string &);	// 未初始化的函数声明，这里的pf代表了指向该函数的指针

// pf是一个指针，该指针的作用是，指向一个函数，这个函数是什么样的呢？
// 它指向的这个函数具有两个string类型参数，返回值是bool类型
```

pf<font color="red">两端小括号有很大作用</font>，如果不用，则：

```c++
bool *pf(const string &, const string &);	// 该声明则表明pf是一个返回值为bool指针的函数，即等价于
bool* pf(const string &, const string &);	// 类似之前看过的数组部分
```

### 使用函数指针

我们先定义一个函数：

```c++
// 观察到这个函数的形参类型与函数指针是一致的
bool lengthCompare(const string &, const string &);
```

当我们把函数作为一个值使用时，该**函数将自动转化为指针**。

```c++
// pf上面已声明
pf = lengthCompare;   // pf指向名为lengthCompare的函数
pf = &lengthCompare;  // 两者等价
```

可以直接使用指向函数的指针调用该函数。

```c++
bool b1 = pf("hello", "goodbye");
bool b2 = (*pf)("hello", "goodbye");          // 等价调用，这里pf是指向函数的指针。
bool b1 = lengthCompare("hello", "goodbye");  // 等价调用。
```

不同返回类型的函数指针，不同形参类型的函数指针，都无法直接转换；

- 即在指向不同函数类型的指针间不存在转换规则。

但可以为函数指针赋一个nullptr或者值为0的整型常量表达式，表明该指针没有指向任何一个函数。

**重载函数的指针：**编译器通过指针类型决定选用哪个函数，指针类型必须与重载函数中的某一个精确匹配。

### 函数指针形参

类似数组，虽然不能定义函数类型的形参，但是形参可以是指向函数的指针。

```c++
void useBigger(const string &s1, const string &s2,
               bool pf(const string &, const string &));	// 第三个形参被自动地转换成指向函数的指针
void useBigger(const string &s1, const string &s2,
               bool (*pf)(const string &, const string &));	// 同上的等价声明

// 如果是已经声明过的函数，那么也可以直接使用，因为也会被自动转换成为指针
useBigger(s1, s2, lengthCompare);
```

**通过类型别名和decltype简化代码：**

```c++
typedef bool Func(const string&, const string&);  // 将lengthCompare函数名转为Func
typedef int arr[4];                               // 针对数组类型的转换，将含有4个整型变量的数组名定义为arr
typedef decltype(lengthCompare) Func2;            // 与Func等价的类型
// --------------------------------------------------------
// 下面两行同理，等价类型，指向函数的指针
typedef bool (*FuncP)(const string&, const string&);
typedef decltype(lengthCompare) *FuncP2;	// 等价的类型
```

*其实上面最后一行代码理解起来还是有点困惑，是约定俗成的写法？*

- decltype返回的只是函数类型而已；
- 需要我们自行加上指针符号；

### 返回指向函数的指针

声明一个返回函数指针的函数，最简单的办法是使用类型别名：

```c++
using F = int(int*, int);     // F是函数类型，形参为一个指针、一个普通变量
using PF = int(*)(int*, int); // PF是指针类型
PF f1(int); // 返回指向f1函数的指针
F *f1(int); // 等价类型，显式指定(是没有括号的嗷)
int (*f1(int))(int*, int);    // 直接声明，这里比较特殊，f1首先是个函数，所以注意区分
int (*f1)(int*, int);         // 这里f1只单纯是个变量，指向返回int的函数的指针
```

将auto和decltype用于函数指针类型

```c++
auto f1(int) -> int (*)(int *, int);	// 尾置返回类型

string::size_type sumLength(const string&, const string&);
string::size_type largerLength(const string&, const string&);

// 根据其形参的取值，getFcn函数返回指向sumLength或者largerLength的指针
decltype(sumLength) *getFcn(const string &);  // 这里getFcb函数返回的就是一个指针，因为没加括号
```

上面最后一行代码的运用与`typedef decltype(lengthCompare) *FuncP2;`类似；

decltype得到的只是返回函数类型而非指针类型，因此在后面显式加上`*`；

## constexpr函数

### 定义及使用

指的是能用于常量表达式的函数，定义constexpr函数的几项约定：

- 函数的返回类型及所有形参的类型都得是字面值类型；

- 函数体中必须有且只有一条return语句：

  ```c++
  constexpr int new_sz()	{	return 42;	}
  constexpr int foo = new_sz();	// foo是一个常量表达式
  ```

为了能在编译过程中随时展开，constexpr被隐式地指定为内联函数。

我们同时也允许constexpr函数的返回值并非一个常量：

`constexpr size_t scale(size_t cnt) { return new_sz() * cnt; }`

- 在上面这串代码中，对于`scale(arg)`而言，如果`arg`是常量表达式，则`scale(arg)`也是常量表达式；
- 如果`arg`并非常量表达式，**那么当把scale函数用在需要常量表达式的上下文中时，编译器会报错**；

constexpr函数有如下几个特点：

- **constexpr函数不一定返回常量表达式。**
- **内联函数与constexpr函数一般都放在头文件内**
- **一般都是隐式const的**

***Notes：***对于给定的内联函数或者constexpr函数来说，它的多个定义必须完全一致(不可重新定义)；

因此内联函数和constexpr函数通常定义在头文件中；



关于C++函数的相关内容的源码展示，**[见网站](https://github.com/Wind134/CPP_Primier_SourceCodes/tree/main/%E5%87%BD%E6%95%B0%E6%8C%87%E9%92%88-%E6%95%B0%E7%BB%84%E6%8C%87%E9%92%88-%E5%87%BD%E6%95%B0%E5%BC%95%E7%94%A8%E7%AD%89%E7%9A%84%E4%BD%BF%E7%94%A8/src)**；

---
