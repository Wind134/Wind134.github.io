---
title: 02-基础知识
author: Ping
date: 2022-10-21 11:33:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

## 常规知识补充

- **关于include**

  ```cpp
  #include "xx.h"	//代表在当前目录寻找头文件，没找到再去特定目录，针对不属于标准库的头文件
  #include <xx.h>	//代表在特定目录寻找头文件，针对来自标准库的头文件
  ```

- **关于空间分配**

  以main函数为例，在进入大括号之前就会准备分配空间，以变量为例，在定义变量之前就会为之分配空间。(<font color="blue">后面会有更具体的学习</font>)

- **for循环变量定义范围**：

  for循环中定义的变量只作用在大括号内！

- **C语言的宏定义**

  ```cpp
  #define f(a) (a)+(a)	//实现了类似函数的功能
  ```

- **一些泛化的转义序列**

  在C语言中，只有少数转义序列可以表示非ASCII字符，如`\n`表示换行，`\t`表示制表符，这些转义序列在各种编码下的含义是相同的；

  而在C++中，introduced一种泛化的转义序列的概念，可以表示任意的非ASCII字符；

  ```cpp
  /* 空格字符举例 */ 
  char c1 = '\ ';     // 字符字面量,包含一个空格字符 
  char c2 = '\x20';   // 同上
  char c3 = '\u0020'; // 同上
  
  std::string s1 = "Hello\ World"; // 字符串包含一个空格
  std::string s2 = "Hello\x20World"; 
  std::string s3 = "Hello\u0020World";
  ```

  列举一些：`\007`-响铃、`\12`-换页符、`\32`-空格、`\0`-空字符、`\115`-字符s、`\x4d`-字符M

  如果反斜线`\`后面跟着的八进制数字超过3个，只有前3个数字与`\`构成转义序列。

  但是`\x`(十六进制)要用到后面跟着的所有数字。

- **声明和定义**

  声明和定义的的区别看起来也许微不足道，但事实上很重要，**如果要在多个文件中使用同一个变量，就必须将声明和定义分离**；

  此时，变量的<font color=red>定义必须出现在且只能出现在一个文件中</font>，而其他<font color=red>用到该变量的文件必须对其进行声明</font>，却绝对<font color=red>不能重复定义</font>；

- **调用全局作用域的变量的方式**

  ```cpp
  #include <iostream>
  int reused = 42;
  int main ()
  {
      // ....
      std::cout << ::reused << " " << unique << std::endl;	// 调用了全局变量reused(不用是不是也可以)
      // ...
  }
  ```

- **求值顺序的问题**

  ```cpp
  int i = 0;
  cout << i << " " << ++i << endl;	//因为未定义顺序，这一步的执行结果是未知的，在此特别记录！
  ```

  有4种运算符明确规定了运算对象的求值顺序：`&&`、`||`、`?:`-条件运算符、`,`。

  对于一个运算对象而言，运算对象本身可以按任意顺序求值，在赋值运算符左右两端的运算对象都有某一变量的情况下，会出现不可预知的下一步，我们必须要避免这种情况的出现。(==程序的异步性==)

  形如：`a=b!=c`的意义等价于`a=(b!=c)`，先计算关系运算符。

  形如：`(a=b)!=c`的意义等价于先将b的值赋给a，然后判断a与c是否相等，最后总体而言是一个关系表达式的形式。

- **sizeof运算符**

  运算符的运算对象有两种形式：

  - `sizeof (type)`

  - `sizeof expr`

  一个小应用：

  - 因为sizeof运算能得到整个数组的大小，所以可用数组的大小除以单个元素的大小得到数组中元素的个数：

    ```cpp
    constexpr size_t sz = sizeof(ia) / sizeof(*ia);
    int arr2[sz];
    ```

- **逗号运算符**

  对于逗号运算符而言，首先对左侧的表达式求值，然后将求值结果丢弃掉；

  逗号运算符真正的结果是右侧表达式的值；

  如果右侧运行对象是左值，那么最终的求值结果也是左值；

  ```cpp
  vector<int>::size_type cnt = ivec.size();
  for (vector<int>::size_type ix = 0;
      	ix != ivec.size(); ++ix, --cnt)	// (++ix, --cnt)的最终结果是右侧表达式的cnt的值
      ivec[ix] = cnt;
  ```

- **左值、右值**

  - 左值就是在赋值中可以放在赋值操作符左边的值，一切变量都是左值；

  - 而右值则是只可以放在赋值操作符右边的值，比如一切常数、字符和字符串。

- **自动对象**

  我们把只存在于块执行期间的对象称为**自动对象(automatic object)**。当块的执行结束之后，块中创建的自动对象的值就变成未定义的了，形参就是一种自动对象。

- **局部静态对象**

  某些时候有必要令局部变量的生命周期贯穿函数调用及之后的时间，可以将局部变量定义成static类型从而获得这样的对象。局部静态对象在程序执行路径第一次经过对象定义语句初始化，并且直到程序终止才被销毁，不受对象所在函数执行的影响。

- **函数声明**

  函数声明也称作函数原型(**function prototype**)，函数的三要素(<font color="blue">返回</font>类型、函数名、形参类型)描述函数的接口，说明调用该函数所需的全部信息。

  因为函数声明不包含函数体，因此，形参的名字也**是可以省去的**，但写上可以帮助使用者更好地理解函数的功能。

- **分离式编译**

  将程序的各个部分分别存储在不同文件之中，以实现编写程序时按照逻辑关系将其划分开来，分离式编译允许我们把程序分割到几个文件中去，每个文件独立编译。

  *具体来说可以结合编译器使用*

- **const实参和形参**

  当形参有顶层const时，传给它常量或者非常量对象都是可以的，因为当用实参初始化形参时会忽略掉顶层const。

  也正因此而引入一个细节：C++本身是允许我们定义若干具有相同名字的函数，不过前提是不同函数的形参列表应该有明显区别，像涉及到const这种。

  - 因为顶层const被函数忽略掉了，如果定义了两个同名函数，一个有`const`一个没有，这样就会导致混淆，出现错误；

- **字典序**

  针对string类型，有种排序方式称为字典序，按照26个字母的顺序进行排列，a>b>c...由于字符串有多个字符，如果第一个字符相等，则比较第二个字符，依此类推！

- **黑盒测试**

  定义：系统后台准备若干组输入数据，然后让提交的程序去运行这些数据，如果输出的结果与正确答案完全相同（字符串意义上的比较），那么就称通过了这道题的黑盒测试。

  根据黑盒测试的种类又分为单点测试与多点测试：

  - 单点测试是指对每组测试数据单独测试；
  - 多点测试是指一次性测试所有的测试数据；

- **C++访问对象的三种方式**

  - 直接掌握对象；
  - 通过指针访问对象；
  - 通过引用访问对象。 

- **预处理->编译->汇编->链接**

  - `预处理`: 一个已经写好的程序文本hello.c，预处理器根据#开头的命令，修改原始的程序，生成一个经过预处理的源文件；
  - `编译`: 编译器将预处理后的源文件翻译成汇编语言，在这个阶段，编译器将源码翻译成特定的目标机器语言，生成汇编代码文件；
    - 汇编代码下还存在一系列字符；
  - `汇编`: 汇编器将汇编代码转换为机器指令，将汇编代码中每条指令转换为二进制表示，并生成一个包含机器指令的目标文件(.obj或.o)；
    - 机器指令下，全是0101010101等二进制信息，不存在任何字符；
  - `链接`: 链接器将目标文件和库文件合并，并解析他们之间的引用关系，最终生成可执行文件；
    - 以`printf`为例，它是每个编译器都会提供的标准C函数，这个函数存在于一个名叫printf.o的已经编译好的目标文件中；
    - 而后该文件将以某种方式合并到hello.o中，链接就是干这活儿；

- **静态编译与动态编译**

  **静态编译:** 静态编译在编译可执行文件时，把需要用到的对应动态链接库中的部分提取出来，连接到可执行文件中去，使得可执行文件在运行时不需要依赖于动态链接库；

  **动态编译:** 可执行程序的运行需要附带一个动态链接库，在执行时，需要调用其对应动态链接库的命令，在移植性方面显得不太行，需要平台的库版本保持高度兼容，但是加快了编译速度，节省了系统资源；

- **静态链接库与动态链接库**

  `静态链接库`—将lib文件中用到的函数代码直接链接进目标程序，程序运行时不需要其他的库文件；

  `动态链接库`—把调用的函数所在文件模块和调用函数在文件中的位置等信息链接进目标程序，程序运行的时候根据这些信息寻找相应的函数代码；

  那么链接库是怎么来的呢？我们以printf函数为例：

  - 将这个函数编译成一个静态的链接库，然后后续如果有程序需要链接这个函数时，通过这个静态库文件，会直接将printf的代码嵌入到程序当中，相当于拷贝了一个副本；
    - 衍生的问题是，一旦我这个printf发生改变，我得重新编译这个静态链接库；
  - 将这个函数编译成一个动态的链接库，然后后续如果有程序需要链接这个函数时，动态链接库文件会提供printf的位置信息，通过这个地址将printf的代码链接到程序当中；
    - 函数发生改变，我可以不需要重新编译这个函数；
    - 但带来的一个问题是，如果这个函数发生更改后接口不再兼容这个程序，那么程序就无法运行；
  - 一句话总结就是，静态库可以将之前能够运行的版本链接到程序中，动态库一定是实时链接最新版本的函数，前者保证兼容性，后者保证灵活性；

## 命名的强制类型转换

一个命名的强制类型转换具有如下形式：

`cast-name<type>(expression);`

cast-name存在4种：

- `static_cast`：任何具有明确定义的类型转换，只要不包含底层const，都可以使用`static_cast`；
- `const_cast`：只能改变运算对象的底层const属性，而不能转化成其他类型，可以用到这一形式；

    ```cpp
    const char *pc;                     // 底层const指针
    char *p = const_cast<char*>(pc);    // 正确，去掉了const
    char *q = static_cast<char*>(pc);   // 错误，static_cast不能仅仅转换掉类型的const性质
    static_cast<string>(pc);            // 正确，可以将(const char*)转化为string类型，即类型实现了转换
    const_cast<string>(pc);             // 错误，const_cast无法转化为其他类型
    ```

- `reinterpret_cast`：reinterpret_cast通常为运算对象的位模式提供较低层次上的重新解释。假如存在这么一个转换：

    ```cpp
    int *ip;

    // 为运算对象的位模式提供较低层次上的重新解释(啥意思？)
    char *pc = reinterpret_cast<char*>(ip);	
    ```

我们必须注意pc所指的真是对象是一个int而非字符，如果真的把pc当成普通的字符指针使用就可能在运行时发生错误。

- `dynamic_cast`：用于在具有继承关系的指针或引用之间进行安全的向下转型-派生类到基类的转换。
    
    动态转换在运行时进行类型检查，如果转换不安全，则返回空指针(对于指针类型)或抛出`std::bad_cast`异常(对于引用类型)；

    - `type-id`必须是类指针、类引用或者`void*`；

    - 向下造型本身不一定安全，但是`dynamic_cast`可以安全的实现，可以保证这一步通过编译器的检查，只是根据转换的性质会返回不一样的结果；

<font color=red>Tips：尽量避免强制类型转换；</font>

- 它干扰了正常的类型检查。
- 旧式版本的强制类型转换(函数形式、C语言风格)从表现形式上来说不那么清晰明了，容易看漏，追踪起来也更麻烦！

## <font color="red">预处理器概述</font>

预处理器是在编译之前执行的一段程序，可以部分地改变我们所写的程序；

以常用的预处理功能`#include`为例，当预处理器看到该标记时就会用指定的头文件内容代替`#include`；

C++程序还会用到的一项预处理功能是头文件保护符。

- `#define`指令把一个名字设定为预处理变量；
- `#ifdef`当且仅当变量已定义时为真，`#ifndef`当且仅当变量未定义时为真。<font color="red">一旦检查结果为真</font>，则执行后续操作直至遇到`#endif`指令为止；

组合使用就能有效防止重复包含的发生：

```cpp
#ifndef SALES_DATA_H	// 如果没有定义过，则
#define SALES_DATA_H
struct Sales_data {
    std::string bookNo;
    unsigned units_sold = 0;
    double revenue = 0.0;
};
#endif
```

(有点像Python中的`if __name == __main__`)

预处理变量的特点：

- 无视C++语言中关于作用域的规则；
- 整个程序中的预处理变量包括头文件保护符必须唯一；

- 通常基于头文件中类的名字来构建保护符的名字，以确保其唯一性。
- 为了避免与程序中的其他实体发生名字冲突，一般把预处理变量的名字全部大写。

## 基于范围的for语句

这种语句遍历给定序列中的每个元素并对序列中的每个值执行某种操作，语法形式：

```shell
for (declaration : expression)
	statement
```

- `expresssion`部分是一个对象，用于表示一个序列。
- `declaration`部分负责定义一个变量，该变量将被用于访问序列中的基础元素。
- 每次迭代，`declaration`部分的变量会被初始化为`expression`部分的下一个元素值。

一个应该遵循的原则：范围for语句体内不应改变其所遍历序列的大小。

代码示例：

```c++
char arc[] = "www.baidu.com";
// for循环遍历普通数组
for (char ch : arc) 
{
	cout << ch;
}

vector<char>myvector(arc, arc + 23);
// for循环遍历 vector 容器
for (auto ch : myvector) 
{
	cout << ch;
}
```

## 内联(inline)函数

将函数所执行的功能代码嵌入到程序代码中去，但同时又保持着函数的独立性。在头文件与CPP源文件都需要注明该函数。类当中所定义的函数其实就可以看成是内联函数。一般而言，内联机制用于优化规模较小、流程直接、频繁调用的函数。内联说明只是向编译器发出的一个请求，编译器可以选择忽略这个请求。

## C++的指针

**存储的是某个对象的地址-牢牢把握这一点即可**

```c++
double dval;
double *pd = &dval;	// 获取了地址
double *pd_1 = pd;	// 同样指向了dval
```

指针可以无限嵌套，也就是可以定义指针的指针，指针的指针的指针.....

关于对指针的引用，用一串代码解释会更加直观：

```c++
#include <iostream>
int main ()
{
        int i = 42;
        int *p;
        int *&r = p;	// 定义对指针p的引用(写成int &(*r)不是更好理解吗？)
        r = &i;
        *r = 0;		// 这里会导致*p的值发生改变，因为改变引用即改变了引用的对象
    	// 打印出来的值分别是0  地址	0
        std::cout << *p << "\n" << r << "\t" << *r << std::endl;
        return 0;
}
```

针对上述的疑惑有一个解释，就是要理解r的类型究竟是什么，最简单的办法就是从右向左阅读r的含义，本质上就是就近原则。

**`a->b`和`(*a).b`的区别**：

- 两者并无具体区别，前面的写法只是为了简化后面的写法，毕竟还带着括号()，<font color=red>带括号的原因</font>：
  - `.`运算符的优先级高于`*`，所以要加括号；

## auto类型说明符

引入的`auto`类型说明符，能让编译器替我们去分析表达式所属的类型。

默认情况下`auto`会忽略掉顶层`const`，但会保留底层`const`；

如果需要保留顶层`const`的特性，则需要明确指出，即在前面加上`const`关键字。

一条声明语句只能有一个基本数据类型，所以该语句中所有变量的初始基本数据类型必须一样；

```c++
// 以下就是初始基本类型不一致的案例
auto i = 0, *p = &i;		// 都是整型：整数-整型指针
auto sz = 0, pi = 3.14;		// 错误，一个整型，一个double型
// -------------------------------------------------------------------
const int ci = i, &cr = ci;
auto &m = ci, *p = &ci;		// 正确，m是对整型常量(const)的引用，p是指向整型常量(const)的指针
auto &n = i, *p2 = &ci;		// 错误，i是整型(int)，而&ci的类型是const int
```

还有一个细节，auto不能为非常量引用绑定字面值：

```c++
auto &g = ci;	// right
auto &h = 42;	// 错误，无法为非常量引用绑定字面值
const auto &j = 42;		// 正确
```

其实就是因为`auto`本身并不会包含`const`属性；

## sscanf与sprintf

sscanf读取格式化的字符串中的数据，sprintf指的是字符串格式化命令，以指定形式写入格式化的数据，而sscanf()调用的返回值信息取决于成功读取的字符个数，以代码为例：

```c++
sscanf(str, "%d is greater than %d", &a, &b)
```

上述代码如果执行成功，那么返回值应该是2，即a，b都成功读入了str中的特定信息。

## 关键字volatile与extern

`volatile`：告诉编译器不要对变量进行优化，不需要编译器将变量存入缓存，而是每次使用都从内存中读取；

- 易变性：因为每次都需要在内存中重新读取，与缓存中的值相比可能会有变化；
- 不可优化性：不允许编译器优化，程序员在代码中的指令一定会被执行；
- 顺序性：保证volatile变量之间的执行顺序；

`extern`：用在变量或者函数的声明前，用来说明"此函数/变量"是在别处定义的，要在此处引用；

- 但是extern也受限于作用域，如果定义在main函数中，在其他函数中不能调用；
- 同时如果要调用其他文件中的函数或者变量，直接include即可，那么问题来了，为啥要用extern关键字呢？
- 主要原因就在于extern会加速程序的编译过程，从而节省时间；
- 最后在C++中extern还有另外一个作用：用于指示C或者C++函数的调用规范，在C++中用该关键字，就是告知编译器在链接的时候要用C函数规范来链接；

## 输入输出基础知识

分为两方面介绍：

- **cin输入知识**

  做题目的时候遇到了无限循环输入的情况，不知道如何终止这个过程

  给定了一段话，采用二维字符型数组进行存储；

  ```c++
  while (scanf("%s", sentence[word_num]) != EOF)		// 只要不接收到EOF字符就可以无限输入
  /*
  cin的输入同理：
  */
  while (std::cin >> value)	//只要不会接收到文件结束符，循环就会一直执行
  ```

  在做题的的时候遇到了困惑，退出输入的办法是，Linux下按Ctrl D,windows下按Ctrl Z，就可以终止上述代码的循环，看到这里也发现了一个比较有意思的知识点就是，`%s`<font color=red>控制符以回车、空格符或者制表符作为结束标记。因此空格及后面的部分不会被读入。</font>

- **cout输出知识**

  C++内容输出主要包括以下几个方面：

  - **对数组的输出**
    - 以字符串字面量初始化的字符数组cout数组名可以输出整个数组；
    - 其他的需要看iostream对象中有没有定义相应数组的成员；
    - 列表初始化的字符数组必须加上字符串结束符`\0`才能`cout`数组名才能正确输出整个数组，因为`cout`不知道什么时候结束；


    - 其他类型的数组，比如`int`, `cout`数组名输出的是这个数组的16进制地址，后面会验证这一点；

  此外在刷题过程中，有时候需要控制输出内容的格式，相比之下`cout`对这方面的控制与`printf`是不同的；

  `stream`对象中主要用`setprecision`方法来控制输出格式，该方法定义在头文件`iomanip`当中；

  - 解决计算浮点数时输出的精度、小数点后几位的问题；

    `setprecision(n)`可以控制输出(<= n - 1)位小数，配合使用可以控制小数的输出精度：

    ```c++
    #include <iostream>
    #include <iomanip>
    using namespace std;
    
    int main(){
        cout << "下面两行为setprecision的效果，效果为3和9" <<endl;
        double pi=3.1415926;
        cout << setprecision(3);	// 设置数字个数，即保留两位小数
        cout << pi <<endl;
    
        cout <<setprecision(9);
        cout << pi << endl;
        return 0;
    }
    ```

    <font color="red">Tips：上面的格式设定会生效于源文件全局，因此如果不需要了可以取消该设定：</font>

    ```c++
    cout.unsetf(ios::fixed|ios::hex); 	// 取消所有的格式设定
    ```

  - 实现头部字符填充：

    ```c++
    cout << "下面两行作为对比setfill和setw的效果范围:" << endl;
    cout << setfill('*') << setw(8);
    cout << 100 << endl;
    cout << 100 << endl;
    ```

  - 实现进制转换，以十进制向十六进制转化：

    ```c++
    // .....省略
    cout << "使用cout << hex 和 setiosflags(ios::showbase|ios::uppercase)" <<endl;
    cout << hex;   //代表十六进制
    cout << setiosflags(ios::showbase | ios::uppercase);   //需要前缀并且要大写
    cout << 100 <<endl;
    ```

## 浮点数的比较

主要是考虑到浮点型数据在计算机中的存储因素，比如3.14可能会存储为了3.140000000000001,也可能是3.139999999999999,这样子会对比较操作带来比较大的困扰，因此需要引进一个极小数eps来对这类误差进行修正。

```c++
const double eps = 1e-8;
#define Equ(a,b) ((fabs((a)-(b))<(eps))
// 这样子就能将1e-8之内的误差忽略
```

大于运算符(>)

```c++
#define More(a, b) (((a) - (b)) > (eps))
```

小于运算符(<)

```c++
#define Less(a, b) (((a) - (b)) < (-eps))
```

大于等于运算符(>=)

```c++
#define MoreEqu(a, b) (((a) - (b)) > (-eps))    // 画个数轴就很容易理解了
```

小于等于运算符(<=)

```c++
#define LessEqu(a, b) (((a) - (b)) < (eps))
```

## 结构体

一个结构体的基本定义：

```c++
struct Name{
    //一些基本的数据结构或者一些自定义的数据类型
};

//比如，定义一个学生信息结构体
struct StudentInfo{
    int id;
    char gender;    //'F' or 'M'
    char name[20];  //名字长度限制在20以内
    char major[20];
}Alice, Bob, stu[1000];
//StudentInfo代表了结构体类型，Alice, Bob等代表了这个结构体的具体名。
//结构体内部一般不能定义自己本身，但是可以定义自身类型的指针变量。（比如链表.....）
```

访问结构体內的元素，我们定义这么一个结构体：

```c++
struct studentInfo{
    int id;
    char name[20];
    studentInfo *next;
}stu, *p;
//于是，访问stu中变量的写法如下：
stu.id
stu.name
stu.next
//访问p指针变量的写法：
(*p).id
(*p).name
(*p).next
//我们可以看到，结构体指针变量的写法有点怪怪的，于是在C中对写法进行优化：
p->id
p->name
p->next
```

结构体构造函数的展示，在记录这部分知识点的时候还没学到类，因此当时还是认真做了记录；

```c++
// 构造函数 ，是一种特殊的方法。主要用来在创建对象时初始化对象， 即为对象成员变量赋初始值，总与new运算符一起使用在创建对象的语句中。
// 普通的初始化步骤，先定义一个结构体，随后指定结构体中的变量进行初始化
// 优化的初始化步骤
struct studentInfo{         
    int id;
    char gender;
    studentInfo(){}     // 相当于一个空的初始化函数，也就是没有初始化，所以也没有';'
};
// 正规的初始化步骤
struct studentInfo{
    int id;
    char gender;
    //下面的参数用以对结构体内部变量进行赋值
    studentInfo(int _id, char _gender){
        id = _id;
        gender = _gender;
    }
};
// 简化一下写法(其实上面的写法更容易理解)
struct studentInfo{
    int id;
    char gender;
    studentInfo(int _id, char _gender): id(_id), gender(_gender){}  // 写法多少有些晦涩....
};
// 经过上述那么一个包含初始化的定义，我们可以直接对之进行赋值
studentInfo stu = studentInfo(10086, 'M')

// C++构造函数：初始化列表
class Test
{
    public:
        Test(int a):x(a),y(2){}
        int x;
        int y；
};
// 换种写法
class Test
{
    public:
        int x;
        int y;
        Test(int a){
            x = 2;
            y = a;
        }
};
```

<font color=red>有一个比较重要的点，如果结构体内部已经定义了构造函数，那么就必须进行对应的初始化，否则就不能定义结构体变量。解决的办法就是，可以定义任意多个构造函数，以代码为例。此外，构造函数是不能被主动调用的。</font> 

再看这段笔记真的是感慨万分，这一路走了挺远的。

```c++
struct studentInfo{
    int id;
    char gender;
    //用以不初始化就定义结构体变量
    studentInfo(){}
    //只初始化gender
    studentInfo(char _gender){
        gender = _gender;
    }
    //同时初始化id和gender
    studentInfo(int _id, char _gender){
        id = _id;
        gender = _gender;
    }
};
```

## 对象初始化方式

首先，先针对初始化和赋值进行区分：

```c++
Currency p =bucks; 		// 这叫初始化
Currency p; p = bucks;	// 这叫赋值
```

而且在C++中初始化变量用`=`号和`()`是等价的，基本可以默认这么认为，接下来我们详细介绍初始化的相关内容：

- **拷贝初始化**

  编译器把等号右侧的初始值拷贝到新创建的对象中去，也就是有一个创建临时对象的过程。

- **直接初始化**

  直接初始化**不一定**有创建新对象的过程。

  一般而言当初始值只有一个时，使用直接初始化或拷贝初始化都行；但如果有多个初始值，**一般而言**只能使用直接初始化的方式；

  ```c++
  int num_tries = 0;		// 源自C语言，拷贝初始化形式
  int num_right(0);		// 源自类的构造函数初始化，直接初始化形式
  string s5 = "hiya";		// 拷贝初始化
  string s6("hiya");		// 直接初始化
  ```

  我们接下来做一些总结：

  - 使用拷贝初始化时，只能提供一个初始值；
  - 如果提供的是一个类内初始值，则只能使用拷贝初始化或花括号形式的初始化；
  - 如果提供的是初始值元素的列表，则只能把初始值都放在花括号里进行列表初始化，而不能放在圆括号里；

  每个类各自决定其初始化对象的方式。而且是否允许不经初始化就定义对象也由类自己决定。绝大多数类都支持无须**显式初始化**而定义对象，<font color=red>这样的类提供了一个合适的默认值</font>。但如果要求对象显式初始化，则需要明确的初始化操作。

  直接初始化的两个优势：

  1. 解决多值初始化问题
  2. 使内置类型与class类型的初始化得到统一(我的理解是可以把这两种数据类型都当作函数的参数来处理)

## 数组知识点补充

- **初始赋值**

  ```c++
  // 赋初值为0
  int a[10] = {0};
  int a[10] = {};
  ```

- **灵活引用数组**

  指针可以舍弃引用数组名称的方式访问数组，而是通过地址实现间接访问。

  ```c++
  string nums[] = {"one", "two", "three"};
  string *p = &nums[0]; // 等价于下一行
  string *p2 = nums;    // 很多用到数组名字的地方，编译器都会自动地将其替换为一个指向数组首元素的指针
  ```

  ***Note：***关于指针的一点标记，指针中`*`的位置放在数据类型之后或者变量名之前都是可以的，其中C语言习惯放在变量名之前，C++更习惯于放在数据类型之后。

- **非常规的下标运算符使用**

  vector和string的迭代器支持的运算，数组的指针全都支持。

  可以利用指针去比较元素，但是必须是两个相关的对象，如果分别指向不相关的对象，则不能比较。

  一般而言定义数组相关的指针都默认是数组的首地址，但是我们确实需要考虑，有时候不是首地址的情况！

  ```c++
  int *p = &ia[2];	// p指向索引为2的元素
  int j = p[1];		// p[1]等价于*(p + 1)，即ia[3]表示的那个元素
  int k = p[-2];		// 代表ia[0]的那个元素
  ```

  内置的下标运算符所用的索引值不是无符号类型，因此可以有负值，这一点与`vector`和`string`不一样。

- **<font color=red>多维数组的一些补充</font>**

    - 多维数组的初始化细节：

    ~~~cpp
    int ia[3][4] = { { 0 }, { 4 }, { 8 } };   // 初始化每行的第一个元素，ia为三行四列！
    int ix[3][4] = {0, 3, 6, 9};            // 这样就是初始化第一个数组的所有元素了！其他的执行默认初始化！
    ~~~

    - 多维数组的下标引用：
    ```c++
    // 用arr为首元素为ia最后一行的最后一个元素赋值
    ia[2][3] = arr[0][0][0];
    int (&row)[4] = ia[1];	// 把row绑定到ia的第二个四元素数组上，即引用
    ```

    - 使用范围for语句处理多维数组
    ```c++
    size_t cnt = 0;		//size_t是一个与机器相关的unsigned类型
    for (auto &row : ia)
    	for (auto &col : row){
    		col = cnt;
    		++cnt;
    	}
    ```
    我们发现在上面的例子中，我们选用了引用类型作为循环控制变量，*第一反应是认为要写入值的信息，所以自然而言应该要用到引用。*然而，还有一个深层的原因要求我们这么做。
    ```c++
    for (const auto &row : ia)  // 这里还是用到了引用，但为何是const auto？(因为代码的逻辑没有想去改变数组内容)
    	for (auto col : row)
    		cout << col << endl;
    // -------------------------------------------------------------------------------
    for (auto row : ia)         // 没有引用的版本
        	for (auto col : row)
    ```
    下面这个版本将无法通过编译，第一个循环我们的本意是遍历ia的所有元素，这些元素实际上是大小为4的数组。但<font color=red>由于row不是引用类型，所有编译器初始化row时会自动将这些数组形式的元素转换成指向该数组内首元素的指针</font>，这样`row`类型就是`int*`，下面这一行的循环就没什么意义了；

- **数组引用形参**

    即将形参变量定义成对数组的引用，这也是允许的；
    ```c++
    void print(int (&arr)[10])	// 维度是类型的一部分，这种写法表示的是对一个大小为10的数组的引用
    {
        for (auto elem : arr)
            cout << elem << endl;
    }
    ```

- **指针和多维数组**

    多维数组实际上是数组的数组，因此由多维数组名转换而来的指针实际上是指向第一个内层数组的指针：

    ```c++
    int ia[3][4];
    int (*p)[4] = ia;	// p指向含有二维数组首地址，因为有4个元素，因此也是一个指向含有4个整数的数组
    p = &ia[2];		// p指向ia的尾元素(即二维数组的最后一个一维数组)
    ```

    **我们会发现，(*p)总是会有一个圆括号，这个圆括号很重要**。

    ```c++
    int *ip[4];     // 整型指针的数组，有些等价于： (int* ip)[4]，一个数组，保存了4个指针变量
    int (*ip)[4];   // 这样才是我们理解的指向含有4个整数的数组，(运算符左结合性)
    ```

    随着c++新标准的提出，通过使用auto或者decltype就能尽可能地避免在数组前面加上一个指针类型：

    ```c++
    for (auto p = ia; p != ia + 3; ++p)		// p是一个指针，指向二维数组的第一个变量
    {
        for (auto q = *p; q != *p + 4; ++q)	// *p代表一个具体的数组，q又是一个指针，指向该地址的首址
            cout << *q << ' ';
        cout << endl;
    }
    // 等价于
    for (auto p = begin(ia); p != end(ia); ++p)
    {
        for (auto q = begin(*p); q != end(*p); ++q)		// *p取p地址中的变量值
            cout << *q << ' ';
        cout << endl;
    }
    ```

    上述代码其实更能贴近我们的理解，相比于通过引用的形式来访问二维数组元素。

- **类型别名简化多维数组的指针**

    ```c++
    using int_array = int[4];
    typedef int int_array[4];	//一二行是等价替换
    //这样“4个整数组成的数组”就会被命名为int_array
    ```

    <font color = "red">关于typedef于using两者的区别还有待探明：</font>

    - 其实using就是C++11新标准提出的一个东西而已；

## 类型别名的使用介绍

在看<font color="blue">返回</font>指向函数的指针这一章节而衍生出了一些总结性的记录，会随时进行更新：

类型别名主要有两种：`typedef`与`using`

类型别名有诸多细节值得介绍，首先是针对常规的普通变量类型：

```c++
typedef double wages;	// 给double类型取名为wages
typedef wages base, *p;	// 这里直接把wages当double用了，后面的指针有意思
using p = double*	// using的替代代码
```

列举一下之前理解的思路，直观上想着是把wages类型用别名(\*p)替代，那么这么理解问题就来了，C++中有这么取变量名的吗？因此不能这么理解，显然(\*p)这里意思代表p是一个指针，且p是一个指向wages类型变量的指针，也就是说，这里将所有指向wages类型也就是double类型的指针的变量重新命名为了p。

```c++
p a;	// 因此这一句命令表明，a是指向double类型的指针，即等价于
double *p;
```

针对复合类型或const常量：

```c++
typdef char *pstring;	// pstring为指向字符char的指针
const pstring cstr = 0;	// cstr是指向char的常量指针，即指针是常量，不能变
const pstring *ps;	// ps是一个普通指针，它指向的对象是指向char的常量指针
```

关于

`const pstring cstr = 0;`

很多人去尝试改写，想得到它本来的样子，会错误的变成

`const char *cstr = 0;`

这样理解就出错了，因为char是基本数据类型，而pstring只是我们单独设置的别名，char这个基本数据类型与const联系在一起，就变成了`const char`的基本数据类型，那么`const char *cstr = 0;`中的`cstr`代表的则是一个指向`const char`变量的指针。

针对函数指针别名：

```c++
typedef bool (*FuncP)(const string&, const string&);	
//用using代替
using FuncP = bool(*)(const string&, const string&);
```

这部分代码的意思是：将一个指向某个函数的指针变量命名为FuncP,这个函数接受两个const string&类型而量作为函数的参数，并且该函数的<font color="blue">返回</font>值为bool类型。

因此：

```cpp
FuncP pf;	//等价于
bool (*pf)(const string&, const string&);	
```

using的用法更多的是C++11之后的标准。

## 元数据类型的介绍

在本书的学习内容中，我们已经接触到`ssize_t`、`size_t`等陌生的数据类型，这些即**元数据类型**，一般是由`typedef`声明定义，在已经有了基本数据类型的前提下为何还要使用这些新的呢？

- 随着操作系统以及硬件的不断发展，基本数据类型的表现形式也在不断地发生变化，以前`int`可能仅仅是16位，现在可能已经到32位了；
- 当在需要声明4字节数据类型之处使用了`size_t`或`ssize_t`，则将大大减少代码变动，只需要修改并编译`size_t`或者`ssize_t`的`typedef`声明即可；
