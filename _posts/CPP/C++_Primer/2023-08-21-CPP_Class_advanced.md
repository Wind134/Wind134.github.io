---
title: 08-类的进阶及运用
author: Ping
img_path: /assets/img/CPP/
date: 2022-10-21 11:41:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

## 拷贝控制

之前学到，每个类都定义了一个新类型和在此类型对象上可执行的操作，而这部分，教会我们：

- 类可以定义构造函数，用来控制创建此类型对象时做什么；

- 类如何控制该类型对象拷贝、赋值、移动或销毁时的行为；

  一个类定义五种特殊的成员函数来控制这些操作：

  - **拷贝构造函数(copy constructor)**：用同类型的另一个对象初始化本对象做什么。
  - **拷贝赋值运算符(copy-assignment operator)**：将一个对象赋予同类型的另一个对象做什么。
  - **移动构造函数(move constructor)**：用同类型的另一个对象初始化本对象做什么。
  - **移动赋值运算符(move-assignment)**：将一个对象赋予同类型的另一个对象做什么。
  - **析构函数(destructor)**：当此类型对象销毁时做什么。

  以上操作统称为**拷贝控制操作(copy control)**。

如果一个类没有定义这些拷贝控制成员，编译器会自动为它定义缺失的操作，但是对有些类而言，依赖默认操作会导致灾难性后果。

实现拷贝控制操作最困难的地方是：<font color="red">首先认识到什么时候需要定义这些操作。</font>


### 拷贝构造函数

**定义：**如果一个构造函数的第一个参数是自身类类型的引用，且额外参数都有默认值，则此函数为拷贝构造函数。

```c++
class Foo {
    public:
    	Foo();			// 默认构造函数，类自身的
    	Foo(const Foo&);// 拷贝构造函数，第一个参数是自身类类型的引用
    	// ...
};
```

我们可以定义一个接受非`const`引用的拷贝构造函数，但此参数几乎总是一个`const`的引用，可以定义一个非`const`引用的拷贝构造函数，但一定需要是引用(<font color="red">原因下面解释</font>)。

<font color="red">拷贝构造函数在几种情况下都会被隐式地使用。且拷贝构造函数通常都不是explicit(即可以隐式转换)。</font>

有一种理解方式：

- 拷贝构造之所以要求是引用的方式，是因为这种方式会告诉编译器，它并没有再制造出一个新的对象出来，只是把外面那个引用的对象传进了拷贝构造函数里面而已。

接下来介绍几种拷贝构造函数：

- **合成拷贝构造函数**

  不同于合成默认构造函数，即便我们定义了其他构造函数，编译器也会为我们合成一个拷贝构造函数。

  - 对某些类而言，合成拷贝构造函数用来阻止我们拷贝该类类型的对象；
    - <font color="red">具体是什么类呢？</font>

  - 一般情况下，合成的拷贝构造函数会将其参数的成员逐个**拷贝**到正在创建的对象之中；

  每个成员的类型决定了它如何拷贝：

  - 对类类型的成员，会使用其拷贝构造函数来拷贝；
  - 内置类型的成员直接拷贝；
  - 对于数组类型的成员，合成拷贝构造函数会逐元素地拷贝一个数组类型的成员；
    - 如果该数组元素是类类型，那么会使用元素的拷贝构造函数来进行拷贝；

  ```c++
  class Sales_data {
      public:
      	// 其他成员和构造函数的定义，如之前所定义
      	Sales_data(const Sales_data&);	// 与合成的拷贝构造函数等价的拷贝构造函数的声明
      private:
      	std::string bookNo;
      	int units_sold = 0;
      	double revenue = 0.0;
  };
  
  // 定义Sales_data的合成的拷贝构造函数
  Sales_data::Sales_data(const Sales_data &orig):
    bookNo(orig.bookNo),          // 使用string的拷贝构造函数
    units_sold(orig.units_sold),  // 总之是使用对应类型的拷贝构造函数
    revenue(orig.revenue)
    { }                           // 空函数体
  ```

  **理解拷贝初始化和直接初始化之间的差异：**

  ```c++
  string dots(10, '.'); // 直接初始化
  string s(dots);       // 直接初始化
  string s2 = dots;     // 拷贝初始化
  string null_book = "9-999-99999-9";	// 拷贝初始化
  ```

  - 直接初始化是要求编译器使用普通的函数匹配来选择与我们提供的参数最匹配的构造函数；
  - 拷贝初始化时我们要求编译器将右侧运算对象拷贝到正在创建的对象中，有时候还会进行类型转换(<font color="red">所以说不是explicit的</font>)；

  拷贝初始化不仅在用=变量时会发生，在下列情形同样发生: 

  - 将一个对象作为实参传递给一个非引用类型的形参；
  - 从一个返回类型为非引用类型的函数返回一个对象；
  - 用花括号列表初始化一个数组中的元素或一个聚合类中的成员；
  - 某些类类型还会对它们所分配的对象使用拷贝初始化，如调用其`insert`或`push`成员，与之相对，使用`emplace`成员创建的元素都进行直接初始化。

  **从参数和返回值看出一些东西：**

  - 如果拷贝构造函数的参数不是引用，则调用永远不会成功，因为会陷入无限拷贝构造的循环(<font color="red">解释上面说的为何形参需要引用</font>)。

    具体的理解方式呢，以代码为例：

    ```c++
    // 就以上述的Sales_data为例
    Sales_data a("test1");
    Sales_data b("test2");	
    b = a;  // 这里调用拷贝赋值运算符
    Sales_data c = a;	// (不会调用拷贝赋值运算符，不要看到等于号就下意识反应，而是调用了拷贝构造函数)
    // 接下来我们假设非引用传值的方式
    Sales_data c(a);	// 与上行等价，此时调用拷贝构造函数，因为
    Sales_data d(a);	// 要把上面的a传给d，由此陷入无限循环.....(假设d为拷贝构造函数的参数)
    // 如果使用引用的方式
    Sales_data c(a);	// a是引用形式，一步到位 
    ```

  **理解拷贝初始化的限制：**

  - 在构造函数是`explicit`的前提下，拷贝初始化会受到影响，因为`explicit`不接受隐式转换。

  **编译器可以绕过拷贝构造函数：**

  ​	通过几行代码展现：

  ```c++
  string null_book = "9-999-99999-9";	// 拷贝初始化
  string null_book("9-999-99999-9");	// 绕过了拷贝构造函数(通过构造函数)，直接创建对象
  ```

### 拷贝赋值运算符

与类控制其对象如何初始化一样，类也可以控制其对象如何赋值：

```c++
Sales_data trans, accum;
trans = accum;  // 使用Sales_data的拷贝赋值运算符
// 类似拷贝构造函数，如果类定义自己的拷贝赋值运算符，编译器会为它合成一个
```

***Notes：***一定要意识到初始化与赋值的区别！

关于拷贝赋值运算符的知识介绍，有如下内容：

- **重载赋值运算符预备知识**

  重载赋值运算符**本质上是函数**，其名字由`operator`关键字后接表示要定义的运算符的符合组成，因此赋值运算符就是**一个名为`operator`的函数**，类似于其他任何函数，运算符函数也有一个返回类型和一个参数列表。

  - 重载运算符的参数表示运算符的运算对象；
  - 某些运算符必须定义为成员函数；
    - 比如后面的`+=`运算符重载；

  - 如果运算符是一个成员函数，其左侧对象绑定到隐式的`this`参数(即指向对象的指针)；
  - 如果是一个二元运算符，比如赋值运算符，其右侧对象作为显式参数传递；

  为了与内置类型的赋值保持一致，赋值运算符通常返回一个指向其左侧运算对象的引用

  - 这样就可以当左值了，可以被赋值；

  标准库类型通常要求保存在容器中的类型要具有赋值运算符，且其返回值是左侧对象的引用。

- **合成拷贝赋值运算符**

  类似于处理拷贝构造函数，如果一个类未定义自己的拷贝赋值运算符，编译器会为它生成一个**合成拷贝赋值运算符(synthesized copy-assignment operator)**。类似拷贝构造函数，对于某些类，合成拷贝赋值运算符用来禁止该类型对象的赋值。

  如果并非用来禁止该类型对象的赋值：

  - 会将右侧运算对象的每个非`static`成员赋予左侧运算对象的对应成员；
  - 该工作是通过成员类型的拷贝赋值运算符来完成的；

以下代码等价于一个合成(默认的)拷贝赋值运算符：

```c++
Sales_data&
    Sales_data::operator=(const Sales_data &rhs)
{
    bookNo = rhs.bookNo;          // 调用string::operator=
    units_sold = rhs.units_sold;  // 使用内置的int赋值
    revenue = rhs.revenue;        // 使用内置的double对象赋值
    return *this;                 // 返回一个此对象的引用
}
```

***Notes：***上面这部分还涉及到空间的销毁问题，只是一个简单展示；

### 析构函数

析构函数本该放在上个章节，由于可以与拷贝控制联系起来，因此再在本节加以介绍；

析构函数的操作：

- 释放对象使用的资源，并销毁对象的**非`static`数据成员**；
- 一个类只会有一个析构函数，它不接受重载；
- 析构函数**首先执行自己的函数体**，然后销毁成员，释放对象在生存期分配的所有资源。成员按初始化顺序的逆序销毁；
- 在对象最后一次使用之后，析构函数的函数体可执行类设计者希望执行的任何收尾工作；
- 内置类型并没有自己的析构函数；
- 不同于普通指针，**智能指针是类类型，所以具有析构函数**，智能指针成员会析构阶段会被自动销毁。

何时会调用析构函数：

- 变量在离开其作用域时被销毁；
- 当一个对象被销毁，其成员被销毁；
- 容器被销毁时，其元素被销毁；
- 对于动态分配的对象，当对指向它的指针应用`delete`运算符时被销毁；
- 对于临时对象，当创建它的完整表达式结束时被销毁；

***Notes：***

- 当指向一个对象的引用或指针离开作用域时，析构函数不会执行；
- 合成的析构函数也不会`delete`一个指针数据成员；
- <font color=red>是不是因为指针是由编译器来管理的？</font>

类似拷贝构造函数以及拷贝赋值运算符，当一个类未定义自己的析构函数时，编译器会为它定义一个**合成析构函数(synthesized destructor)**。

需要认识到的是，析构函数体自身并不直接销毁成员，成员是在析构函数体之后隐含的析构阶段中被销毁的。在整个对象销毁过程中，析构函数体是作为成员销毁步骤之外的另一部分而进行的。

### 三/五法则

三个基本操作用来控制类的拷贝操作：

- 拷贝构造函数
- 拷贝赋值运算符
- 析构函数

在新标准下，还有：

- 移动构造函数
- 移动赋值运算符

C++并不要求我们定义所有这些操作：可以只定义其中一个或两个，而不必定义所有，但是这些操作应该被看作一个整体，通常而言，只需要其中一个操作，而不需要定义所有操作的情况是很少见的，一般而言：

- **需要析构函数的类也需要拷贝和赋值操作**

  一般我们首先会去确认一个类是否需要一个析构函数，对于析构函数的需求是比较明显的，而当我们确认了这个类需要析构函数，几乎也可以肯定它也需要一个拷贝构造函数和一个拷贝赋值运算符。

  提及上述这些点是因为还有一个比较重要的一点就是：**如果一个类需要自定义一个析构函数，则几乎可以肯定它也需要自定义拷贝赋值运算符和拷贝构造函数**。

  ```c++
  class HasPtr {	// 带有指针的类
      public:
      	HasPtr(const std::string &s = std::string()):
      		ps(new std::string(s)), i(0) { }  // i应该是私有成员
      	～HasPtr() { delete ps; }           // 自定义的析构函数，销毁掉ps指针
      // 而这样的定义是错误的，原因分析如下：
  };
  
  // 上例我们使用合成的拷贝构造函数以及拷贝赋值运算符，只是对指针成员做简单的拷贝
  HasPtr f(HasPtr hp)		// HasPtr是传值参数，所以将被拷贝
  {
      HasPtr ret = hp;  // 拷贝(默认的拷贝构造)
      // ...ret	  // 处理ret

      // f返回(离开作用域)后，ret和hp都被销毁，里面那个指向相同字符串的指针被delete两次
      return ret;
  } // delete两次显然是不合理且有问题的
  
  Hasptr p("some values");	// 定义了一个对象p
  f(p); // 在离开作用域时，类执行析构函数，p.ps指向的内存被释放
  HasPtr q(p);  // q，p都指向无效内存，因为在f的形参部分的析构函数把p指向的内存给干掉了
  ```

- **需要拷贝操作的类也需要赋值操作，反之亦然**

  很多类需要定义所有(或者不需要定义任何)拷贝控制成员，但某些类只需要拷贝或者赋值操作，不需要析构函数。

### 合成版本的拷贝控制

我们可以通过将拷贝控制成员定义为=default来显式地要求编译器生成合成的版本：

```c++
class Sales_data {
    public:
    	// 拷贝控制成员，使用default
    	Sales_data() = default;	// 默认构造函数
    	Sales_data(const Sales_data&) = default;	// 默认的拷贝构造
    	Sales_data& operator=(const Sales_data &);	// ...
    	~Sales_data() = default;
    	// 其他成员的定义
};

Sales_data& Sales_data::operator=(const Sales_data&) = default;	// 保证不内联
```

有两个细节：

- 在类内使用=default修饰成员的声明时，合成的函数将**隐式地声明为内联的**；
- 如果不希望为内联函数，**应该只对成员的类外定义使用=default**；

### 阻止拷贝的策略

`iostream`类就阻止了拷贝，以避免多个对象写入或读取相同的IO缓冲，但是我们通过不定义拷贝控制成员去阻止拷贝的策略通常来说是无效的，因为编译器会生成合成的版本。一般而言，我们会通过以下的方法来实现阻止拷贝：

- **定义删除的函数：虽然声明了该函数，但不能以任何方式来使用它们**

  新标准下，我们通过拷贝构造函数和拷贝赋值运算符定义为**删除的函数(deleted function)**来阻止拷贝(**参数列表后面加上`=delete`**)。

  ```c++
  struct NoCopy {
      NoCopy() = default;		// 使用合成的默认构造函数
      NoCopy(const NoCopy&) = delete;		// 阻止拷贝
      NoCopy &operator=(const NoCopy&) = delete;	// 阻止赋值
      ~NoCopy() = default;		// 使用合成的析构函数
      // 其他成员
  };
  ```

  与`=default`的几点不同：

  - `=delete`必须出现在函数第一次声明的时候；
  - 我们可以对任何函数指定`=delete`

  **此外，我们不能对析构函数使用`=delete`**，对于删除了析构函数的类型，我们也不能定义这种类型的变量或成员，虽然可以动态分配这种类型的对象，但不能释放。

  - **合成的拷贝控制成员可能是删除的**

    上面这条规则的本质含义是：**如果一个类有数据成员不能默认构造、拷贝、赋值或销毁，则对于的成员函数将被定义为删除的**。

    - 一个成员有删除的或不可访问的析构函数会导致该类合成的默认和拷贝构造函数被定义为删除的；
      - 没有这条规则，我们可能会创建出无法销毁的对象。

    - 对于具有引用成员或无法默认构造的`const`成员的类，编译器不会为其合成默认构造函数；
      - 这个好理解。

    - 对于具有引用成员的类，合成拷贝赋值运算符被定义为删除的；
      - 因为赋值后左侧运算对象仍然指向与赋值前一样的对象，而不会与右侧运算对象指向相同的对象。

  - **private拷贝控制(新标准之前)**

    在新标准发布之前，类是通过拷贝构造函数和拷贝赋值运算符声明为`private`的来阻止拷贝(代码就不写了)：

    - 拷贝构造函数和拷贝赋值运算符是`private`的，用户代码将不能拷贝这个类型的对象。
    - 友元和成员函数仍然可以拷贝对象，为了阻止拷贝，将这些控制成员声明为`private`的，但并不定义它们。
    - *声明但不定义一个成员函数是合法的(你保证不用到)——<font color="red">但存在例外，后面介绍。</font>*

    但这么做会有如下的问题：

    - 试图拷贝对象的用户代码将在编译阶段被标记为错误；
    - 成员函数或友元函数中的拷贝操作将会导致链接时错误。

***Notes：***拷贝赋值运算符通常执行拷贝构造函数和析构函数中也要做的工作，这种情况下，**公共操作应该放在private的工具函数中完成**。

### 拷贝控制和资源管理

通常，管理类外资源的类必须定义拷贝控制成员。而一般而言，一旦一个类需要析构函数，那么也可以几乎肯定也需要一个拷贝构造函数和一个拷贝赋值运算符。(<font color="red">上面已经解释原因</font>)

为了定义上述成员，我们需要遵循如下步骤：

1. 首先确定此类型对象的拷贝语义，这方面而言，有两种选择：

- 定义拷贝操作，使类的行为看起来像一个值，**像一个值则意味着它也应该有自己的状态，对他的拷贝不影响原对象的值**；
- 定义拷贝操作，使类的行为像一个指针，拷贝这种类的对象时，**改变副本也会改变原对象**；

#### 行为像值的类

为了提供类值的行为，对于类管理的资源，每个对象都应该拥有一份自己的拷贝，这意味着对于ps指向的string，每个HasPtr都要有自己的拷贝：

- 定义一个拷贝构造函数，完成string的拷贝，而并非指针；
- 定义一个析构函数来释放string；
- 定义一个拷贝赋值运算符来释放对象当前的string，并从右侧运算对象拷贝string；

```c++
class HasPtr {
    public:
    	HasPtr(const string &s = string()):
    		ps(new string(s)), i(0) {}	// 构造函数
    	// 对ps指向的string，每个HasPtr对象都有自己的拷贝，即都有一个指向string的指针
    	HasPtr(const HasPtr &p) : ps(new string(*(p.ps))), i(p.i) { }	// 完成了对值的拷贝
    	HasPtr& operator=(const HasPtr &);
    	~HasPtr() { delete ps; }	// 析构函数释放ps指向的那片空间
    private:
    	string *ps;		// 指向string变量的指针
    	int i;
};
```

上述代码就差赋值运算符没有进行定义，赋值运算符通常组合了析构函数和构造函数的操作：

- 类似析构函数，赋值操作会销毁左侧运算对象的资源；
- 类似拷贝构造函数，赋值操作会从右侧运算对象拷贝数据。

因此代码：

```c++
HasPtr& HasPtr::operator=(const HasPtr &rhs)
{
    auto newp = new string(*rhs.ps);	// 拷贝底层string，'.'运算符优先级更高
    delete ps;		// 释放指向的旧内存的内容(对于指针而言，这一步的意义重大)
    ps = newp;		// 从右侧对象拷贝数据到本对象
    i = rhs.i;		// 普通变量不存在这一操作
    return *this;	// 返回本对象
}
```

通过上述代码我们知晓的一个原则：

- 如果将一个对象赋予它自身，赋值运算符必须能正确工作；
- 大多数赋值运算符组合了析构函数和拷贝构造函数的工作；

#### 行为像指针的类

对于行为像指针的类(智能指针)，我们仍然需要以下几点：

- 需要为其定义拷贝构造函数和拷贝赋值运算符，来拷贝指针成员本身而不是它指向的`string`；
- 需要自己的析构函数来释放接受`string`参数的构造函数分配的内存；
- 在析构函数释放内存时，需要注意到只有当最后一个指向`string`的`HasPtr`销毁时，才可以释放`string`；
  - 从这一点上最容易联想到的则是`shared_ptr`了，该类自己记录有多少用户共享它指向的对象；
  - 没有使用对象时，`shared_ptr`类负责释放资源；
  - 若希望直接管理资源，可以使用**引用计数(reference count)**。

以下代码将重新定义`HasPtr`，令其行为像指针一样，但我们不使用`shared_ptr`的引用计数，而是自行设计：

- 构造函数创建引用计数，用来记录有多少对象与正在创建的对象共享状态，初始话为1，因为只有自己用嘛；
- 拷贝构造函数不分配新的计数器，而是拷贝给定对象的数据成员，包括计数器，拷贝构造函数递增共享的计数器；
- 析构函数递减计数器，指出共享状态的用户少了一个，当引用计数变为0，则析构函数释放状态；
- 拷贝赋值运算符递增右侧运算对象的计数器，递减左侧运算对象的计数器，如果左侧运算对象的计数器变为0，意味着它的共享状态没有用户了，则销毁状态；

**<font color="red">难点在于在哪存放引用计数？</font>**

- 参照下面的代码，则是存放于**堆内存**中；
- 已经手动实现过一遍，这一点应当没有任何疑问了；

为了不受对象的干扰，办法之一是将计数器保存在动态内存中，**当创建一个对象时，我们也跟着分配一个新的计数器**，当拷贝或者赋值对象时，我们拷贝指向计数器的指针。使用这种办法，副本和原对象都会指向相同的计数器。

先编写一个类指针的版本：

```c++
class HasPtr
{
    public:
    	// 构造函数分配新的string和新的计数器，将计数器置为1
    	HasPtr(const string &s = string()) : ps(new string(s)), i(0), use(new size_t(1)) {}
    	// 拷贝构造函数拷贝所有三个数据成员，并递增计数器
    	// 这里不需要new一个新的string类型的指针，而是直接初始化给ps
    	HasPtr(const HasPtr &p): ps(p.ps), i(p.i), use(p.use) { ++*use; }	// use递增，拷贝就会增1
    	HasPtr& operator=(const HasPtr&);
    	~HasPtr();
    private:
    	string *ps;
    	int i;
    	size_t *use;	// 这是一个指针，真正的对象存储在对应的动态内存中，因为"1"不属于这个类嘛
};
```

当拷贝或赋值一个`HasPtr`对象时，我们希望副本以及原对象都指向相同的`string`，即拷贝指针而非指针指向的对象，同时递增该`string`关联的计数器。

析构函数不能无条件`delete ps`——可能还有其他对象指向这块内存：

```c++
HasPtr::~HasPtr()
{
    if (--*use  0)  // 先减一次，如变为0
    {
        delete ps;  // 释放string内存
        delete use; // 释放计数器内存
    }
}
```

而针对拷贝赋值运算符处理，左侧运算对象的引用计数递减，右侧运算对象的引用计数递增：

```c++
HasPtr& HasPtr::operator=(const HasPtr &rhs)
{
    ++*rhs.use;     // 递增右侧运算对象的引用计数
    if (--*use  0)  // 递减自己的引用计数
    {
        delete ps;  // 如果没有其他用户，删除指向string的ps
        delete use; // 释放本对象分配的成员
    }
    ps = rhs.ps;    // 将数据拷贝
    i = rhs.i;
    use = rhs.use;
    return *this;   // 返回本对象
}
// 引用计数的原理在于：HasPtr h1与HasPtr h2，h1与h2是两个不一样的对象，明白吗？
```

<font color='red'>后面再看这段代码产生了一些疑惑：</font>

- <font color='red'>如果左边变量的引用计数为1，那岂不是赋值没法完成？</font>解释：
  - 根据这段代码，ps以及use所指向的空间会被释放，因为没有引用了(或者说引用计数为0)；
  - 只是指针指向的空间被释放而已，**又不是指针没了**，指针的管理由编译器自己来的；
  - if完成之后，下面的代码照样执行；
- <font color='red'>还有一个疑惑是啥来着？</font>
  - 占坑；


### 交换操作

#### 产生背景

除了定义拷贝控制成员之外，管理资源的类通常还定义一个名为swap的函数，对于那些重排元素顺序的算法，这类算法在需要交换两个元素时会调用swap。

涉及到交换我们会优先定义指针，这样效率更高：

```c++
class HasPtr {
    friend void swap(HasPtr&, HasPtr&);
};
inline
    void swap(HasPtr &lhs, HasPtr &rhs)
{
    using std::swap;		// 调用std标准库中的swap函数
    swap(lhs.ps, rhs.ps);	// 交换指针而不是string数据
    swap(lhs.i, rhs.i);
}

// 对swap的调用，如果类对象中有swap函数，其匹配程度会优于std中定义的版本
// 假设h为HasPtr类型
void swap(Foo &lhs, Foo &rhs)
{
    using std::swap;	// 如果类自己没有定义swap，则调用标准库的
    swap(lhs.h, rhs.h);	// 使用HasPtr版本的swap
	// ....
}
```

***Notes：***`using`声明可以用于将命名空间中定义的名称引入当前作用域；

#### 在赋值运算符中使用swap

定义了`swap`的类通常用`swap`来定义它们的赋值运算符，这些运算符使用了一种名为**拷贝并交换(copy and swap)**的技术：

```c++
// 下面的rhs是按值传递的，意味着HasPtr的拷贝构造函数将右侧对象中的string拷贝到rhs
HasPtr& HasPtr::operator=(HasPtr rhs)
{
    // 交换左侧运算对象和局部变量rhs的内容
    swap(*this, rhs);
    return *this;	// rhs被销毁，从而delete了rhs中的指针
}
```

这一技术的有趣之处在于它自动处理了自赋值情况且天然就是异常安全的，原因在于：

- 改变左侧运算对象之前拷贝了右侧运算对象`rhs`保证了自赋值的正确，这一点的理解在于：
  - 右侧对象`rhs`会执行拷贝构造函数，从而实现了自赋值的正确；
  - 在拷贝构造中如果`new`使用出现了异常，也会在我们改变运算对象之前发生；
- 在赋值运算符结束之后，`rhs`被销毁，`HasPtr`的析构函数被执行，会`delete`掉`rhs`现在指向的内存，即释放掉左侧运算对象中原来的内存。

### 动态内存管理类

某些类需要在运行时分配可变大小的内存空间，这种类一般可以使用标准库容器来保存它们的数据；

但是该策略并不适用于每个类：某些类需要自己进行内存分配，通过定义自己的拷贝控制成员来管理所分配的内存；

接下来将实现标准库`vector`类的一个简化版本，该类不使用模板，且只用于`string`，命名为`StrVec`。

#### StrVec类的设计

思考`vector`类的设计：

- 元素保存在连续内存中；
- 预先分配足够的内存来保存可能需要的更多元素；
- 每个添加元素的成员函数会检查是否有空间容纳更多的元素；
  - 有，在下一个可用位置构造一个对象；
  - 没有可用空间则重新分配空间；
- 没有足够空间则重新分配空间，将已有元素移动到新空间中，释放旧空间，并添加新元素；

基于上述特性，`StrVec`的策略便有了：

- 使用一个`allocator`来获得原始内存；
  - `allocator`分配的内存是未构造的，我们将在需要添加新元素时用`allocator`的`construct`成员在原始内存中创建对象；
  - 删除一个元素时，使用`destroy`成员来销毁元素；
- 每个`StrVec`有三个指针成员指向其元素所使用的内存：
  - `elements`，指向内存分配中的首元素
  - `first_free`，指向最后一个实际元素之后的位置
  - `cap`，指向分配的内存末尾之后的位置
- `StrVec`还会有一个名为`alloc`的静态成员，类型为`allocator<string>`。该成员会分配`StrVec`使用的内存；
- 同时还附带4个工具函数
  - `alloc_n_copy`分配内存，并拷贝一个给定范围中的元素；
  - `free`会销毁构造的元素并释放内存；
  - `chk_n_alloc`保证`StrVec`至少有容纳一个新元素的空间，如果没有空间添加新元素，`chk_n_alloc`会调用`reallocate`来分配更多内存；
  - `reallocate`在内存用完时为`StrVec`分配新内存；

#### StrVec类定义

```c++
class StrVec {
public:
	StrVec():	// 默认初始化
    	elements(nullptr), first_free(nullptr), cap(nullptr) { }
    StrVec(const StrVec&);		// 拷贝构造函数
    StrVec &operator=(const StrVec&);	// 拷贝赋值运算符
    ~StrVec();		// 析构函数
    void push_back(const std::string&);	// 拷贝元素
    size_t size() const { return first_free - elements; }
    size_t capacity() const { return cap - elements; }
    std::string *begin() const { return elements; }
    std::string *end() const { return first_free; }
    // ...
private:
    // 分配一段存储string的内存，为何采用static呢？
    static std::allocator<std::string> alloc;
    // 被添加元素的函数所使用
    void chk_n_alloc()
    { if (size()  capacity()) reallocate(); }
    // 工具函数，被拷贝构造、赋值运算符和析构函数所使用
    std::pair<std::string*, std::string*> alloc_n_copy
        (const std::string*, const std::string*);
    void free();	// 销毁元素并释放内存
    void reallocate();	// 获得更多内存并拷贝已有元素
    std::string *elements;	// 指向数组首元素的指针
    std::string *first_free;	// ...
    std::string *cap;	// ...
};
```

<font color="red">关于上述采用static关键字的原因解释：</font>

- 使用`static`关键字的原因是，分配器对象通常不需要为每个类实例单独存储。相反，所有实例都可以共享同一个分配器对象，以减少内存占用并提高效率。

#### StrVec成员函数的定义

- **使用construct**

  `push_back`负责调用`chk_n_alloc`确保有空间容纳新元素；若需要，`chk_n_alloc`会调用`reallocate`：

  ```c++
  void StrVec::push_back(const string& s)
  {
      chk_n_alloc();	// 确保空间足够
      // 在first_free指向的元素中构造s的副本
      alloc.construct(first_free++, s);	// 这里会调用s的拷贝构造函数
  }
  ```

- **alloc_n_copy成员**

  我们在拷贝或赋值`StrVec`时，可能会调用`alloc_n_copy`成员，同时，`StrVec`类必须有<font color=red>类值</font>的行为。

  ```c++
  pair<string*, string*>
      StrVec:alloc_n_copy(const string *b, const string *e)
      {
          // 分配空间保存给定范围中的元素
          auto data = alloc.allocate(e - b);
          // 初始化并返回一个pair，该pair由data和uninitialized_copy的返回值构成
          return {data, uninitialized_copy(b, e, data)};
      }
  ```

  - 我们需要注意到的是，上述代码中的`uninitialized_copy(b, e, data)`是STL标准库中的一个函数，调用construct函数，将输入区间`[b,e) `的每个对象生成一个复制品，然后放置于未初始化输出区间`[data, data + (e - b))`；

- **free成员**

  `free`成员有两个责任，首先是`destroy`元素，然后释放`StrVec`自己分配的内存空间；

  ```c++
  void StrVec::free()
  {
      // 不能传递给deallocate一个空指针，如果elements为0，函数什么也不做
      if (elements) 
      {
          for (auto p = first_free; p != elements;)
          {
              // 先减，再destory
              alloc.destory(--p);
          }
          // 释放从elements开始，长度为cap - elements的内存空间
          alloc.deallocate(elements, cap - elements);
      }
  }
  ```

#### StrVec的拷贝控制成员

- **拷贝构造函数**

  ```c++
  StrVec::StrVec(const StrVec &s)
  {
      // 调用alloc_n_copy分配空间以容纳与s中一样多的元素
      auto newdata = alloc_n_copy(s.begin(), s.end());
      elements = newdata.first;	// 可是这段空间是未构造的啊？
      first_free = cap = newdata.second;
  }
  ```

  <font color="red">解释上面的疑问：</font>

  - 在`alloc_n_copy`函数的返回部分，也就是`return`那部分，已经通过`uninitialized_copy`函数生成了"复制品"；

- **析构函数**

  ```c++
  StrVec::~StrVec() { free(); }
  ```

- **拷贝赋值运算符**

  ```c++
  StrVec &StrVec::operator=(const StrVec &rhs)
  {
      // 调用alloc_n_copy分配内存，大小与rhs元素所占空间一样多
      auto data = alloc_n_copy(rhs.begin(), rhs.end());
      free();	// 删除本对象分配的空间
      elements = data.first;
      first_free = cap = data.second;
      return *this;
  }
  ```

#### 考虑空间不足的情形

在`reallocate`之前，我们思考一下函数的功能会有哪些：

- 为一个新的、更大的`string`数组分配内存；
- 在内存空间的前一部分构造对象，保存现有元素；
- 销毁原内存空间中的元素，并释放这块内存；

考虑`string`类具有类值的行为，如果通过拷贝原内存空间元素的方式去开辟新的空间，还需要销毁原`string`所占内存，因此可以思考，我们是否可以通过移动元素的方式而不是拷贝？

因此引申出移动构造函数的用途；

- **移动构造函数和`std::move`**

  string中<font color="red">移动构造函数</font>具体的机制暂且不表，我目前需要了解的：

  - 移动构造函数可以实现我们上述移动元素的需求；
  - 当reallocate函数在新内存中构造string时，必须调用move来表示希望使用string的移动构造函数，<font color="red">原因先埋坑</font>。

#### StrVec的reallocate成员

每次重新分配内存时都将`StrVec`的容量加倍，如果`StrVec`的大小为0，那我们分配容纳一个元素的空间，这个好理解，因为`0 * 2 = 0`：

```c++
void StrVec::reallocate()
{
    // 分两倍
    auto newcapacity = size()?2 * size() : 1;
    // 分配新内存
    auto newdata = alloc.allocate(newcapacity);
    // 将数据从旧内存移动到新内存
    auto dest = newdata;	// 指向新数组中的空闲位置(指针)
    auto elem = elements;	// 指向旧数组中的首元素(指针)
    for (size_t i = 0; i != size(); ++i)	alloc.construct(dest++, std::move(*elem++));	// 注意优先级，会先执行elem++
    free();		// 移动完成则释放旧内存空间
    // 更新数据结构，执行新元素
    elements = newdata;
    first_free = dest;
    cap = elements + newcapacity;
}
```

### 对象移动

新标准一个最主要的特定就是可以移动而非拷贝对象的能力，移动而非拷贝对象可以大幅度提升性能。

上面的`StrVec`类使用移动而不是拷贝的另一个原因源于IO类或者`unique_ptr`类，这些类都包含不能被共享的资源，因此不能拷贝但可以移动。

在旧C++标准中，没有直接的方法移动对象，这种情况下比较耗资源，且要求容器中保存的类必须是可拷贝的。

在新标准中，我们可以用容器保存不可拷贝的类型，只要它们能被移动即可(如`istream`)。

#### 右值引用

**右值定义：**右值是指表达式结束后将要被销毁的值。这些值可以是临时对象（例如函数返回的对象），也可以是使用`std::move()`转移所有权的对象。

**右值引用：**右值引用就是必须绑定到右值的引用，通过`&&`来获得右值引用。

**性质：**只能绑定到一个将要销毁的对象，因此可以自由地将一个右值引用的资源移动到另一个对象中。

一般而言，一个左值表达式表示的是一个对象的身份，而一个右值表达式表示的是对象的值。

先介绍**左值引用(lvalue reference)**的特点：

- 不能将其绑定到要求转换的表达式；

- 不能将其绑定到字面常量；

- 不能将其绑定到返回右值的表达式；

  ```c++
  int i = 42;
  int &r = i;   // 正确：r引用i
  int &&rr = i; // 错误：不能将一个右值引用绑定到左值
  int &r2 = i * 42;	// 错误：i * 42是一个右值
  const int &r3 = i * 42;	// 错误：const的引用可绑定到右值
  int &&rr2 = i * 42;	// 正确：合法绑定到右值
  ```

此外：

- 返回左值引用的函数，都是返回的左值表达式，我们可以将一个左值引用绑定到这类表达式的结果上；
- 返回非引用类型的函数，都生成右值，无法将一个左值引用绑定到这类表达式上，当然可以用`const`；

右值引用的特点上面已经叙述了；

左值与右值的区别：

- 左值持久，右值短暂；

- 右值引用只能绑定到临时对象；

- 变量是左值，这意味着我们不能将一个右值引用绑定到一个右值引用类型的变量上；

  ```c++
  int &&rr1 = 42;   // 正确且合法
  int &&rr2 = rr1;  // 错误，变量是左值
  ```

**标准库的move函数**

move函数的具体机制在<font color = "red">后面会进行讲解</font>，定义在`utility`头文件，先讲功能，如上

```c++
int &&rr1 = 42;	// 正确且合法
int &&rr2 = rr1;	// 错误，变量是左值
/* 可以通过标准库中的move函数解决上述的错误问题 */
int &&rr3 = std::move(rr1);	// 这样是正确的，相当于把rr1变成了一个右值临时对象
```

书中这么描述`move`：

- 有一个左值，但想像右值一样处理它，这时候使用`move`；
- 调用`move`就意味着除了对rr1赋值或者销毁之外，我们不能再使用它，即不能对移后源对象的值做任何假设；
  - <font color="red">不能对移后源对象的值做任何假设的理解：因为这个值已经被移走了，这么理解直接了当！</font>

**移后源对象：**移后源对象是指在移动构造函数或移动赋值函数中，被移动的对象；移动后源对象必须可析构。

#### 移动构造函数

为了使得自己的类型支持移动操作，需要为其定义移动构造函数和移动赋值运算符，类似拷贝构造函数：

- 移动构造函数的第一个参数是该类类型的一个**右值引用**；
- 确保移后源对象处于——销毁无害的状态；
- 完成移动之后，源对象不再指向被移动的资源；

为`StrVec`类定义移动构造函数，实现从一个`StrVec`到另一个`StrVec`的元素移动而非拷贝：

```c++
StrVec::StrVec(StrVec &&s) noexcept	// 通知标准库我们的构造函数不抛出任何异常
    // 成员初始化器接管s中的资源
    : elements(s.elements), first_free(s.first_free), cap(s.cap)
    {
        // 令s进入这样的状态——对其运行析构函数是安全的
        s.elements = s.first_free = s.cap = nullptr;	// 接管之后的所有行为
    }
```

上述代码中，我们需要了解到的一些注意事项是：

- 将s中的对象都置为`nullptr`是必不可少的一步；
- 因为移动构造函数不分配任何新内存；
- 如果忘记置为`nullptr`，那么当我们销毁移后源对象时将会释放掉我们刚刚移动的内存；
- 置为`nullptr`之后，源对象暂时还存在，但最终会调用自己的析构将自身销毁；

上述移动操作将移后源对象置为析构安全的状态，但此外：

- 移动操作需要保证对象对象是有效的；
  - 所谓有效就是可以安全地为其赋予新值，不依赖当前值；
- 移动操作对移后源对象中留下的值没有任何要求；

**上述两点汇成一句话：**移后源对象必须保持有效的、可析构的状态，但是用户不能对其值做任何假设；

移动操作不分配任何资源，因此一般不会抛出任何异常，但需要告知标准库，否则标准库会认为移动我们的类对象时可能会抛出异常，以下有一些通知标准库的方式：

- **在移动构造函数中指明noexcept**

  `noexcept`的细节<font color="red">暂且不管</font>，目前只需要知道这是一种承诺一个函数不抛出异常的方法，具体用法：

  ```c++
  class StrVec {
      public:
      	StrVec(StrVec&&) noexcept;
  };
  StrVec::StrVec(StrVec &&s) noexcept :	/* 成员初始化器 */
  { /* 构造函数体 */ }
  ```

  书中474页详细说明了需要指明`noexcept`的必要性；

#### 移动赋值运算符

移动赋值运算符执行与析构函数和移动构造函数相同的工作，类似移动构造函数，如果不抛出任何异常就将之标记为`noexcept`；

类似拷贝赋值运算符，移动赋值运算符必须正确处理自赋值：

```c++
StrVec &StrVec::operator=(StrVec &&rhs) noexcept
{
    // 直接检查自赋值
    if (this != &rhs) {		// 这一步就是检查自赋值
        free();	// 释放自身已有元素，这一步的用处在于清除
        elements = rhs.elements;	// 从rhs接管资源
        first_free = rhs.first_free;
        cap = rhs.cap;
        // 将rhs置于可析构状态
        rhs.elements = rhs.first_free = rhs.cap = nullptr;
    }
    return *this;
}
```

**自赋值定义：**定义一个类的=操作符的时候，检查输入的参数是不是它自身。

上面代码中自赋值的检查很关键，因为万一是相同的资源，使用`free()`就是错误的行为；

#### 合成的移动操作

这部分主要会对比拷贝构造相关知识来学习：

- 一个类定义了自己的拷贝构造函数、拷贝赋值运算符或析构函数，那么编译器就不会为它合成移动构造函数和移动赋值运算符了；

- 当类没有定义任何自己版本的拷贝控制成员，且类的每个非`static`数据成员都可以移动时，编译器才会为它合成移动构造函数或移动赋值运算符；

  ```c++
  struct X {
      int i;		// 内置类型可以移动
      std::string s;	// string有自己的移动操作
  };
  struct hasX {
      X mem;	// X有合成的移动操作
  };
  X x, x2 = std::move(x);	// 使用合成的移动构造函数
  hasX hx, hx2 = std::move(hx);	// 合成的移动构造函数
  ```

- 与拷贝操作不同，移动操作永远不会隐式定义为删除的函数，但凡事有例外：

  - 当显式要求编译器生成`=default`的移动操作，且编译器无法移动所有成员，则编译器会将移动操作定义为**删除的函数**；
  - 以及书上476页的一些其他的原则；

  ```c++
  // 假设Y为一个类，定义了自己的拷贝构造函数但是未定义移动构造函数
  struct hasY {
      hasY() = default;
      hasY(hasY&&) = default;
      Y mem;	// hasY将会因为这一步会有一个删除的移动构造函数
  }
  hasY hy, hy2 = std::move(hy);	// 错误：移动构造函数是删除的
  ```

- 如果类定义了一个移动构造函数或者移动赋值运算符，则该类的合成拷贝构造函数和拷贝赋值运算符将会被定义为删除的。

  - 在此种情况下，需要定义自己的拷贝操作，合成的操作是不会生效的。

**一个左值右值应用的举例：**

直接上代码：

```c++
StrVec v1, v2;
v1 = v2;  // v2是左值；使用拷贝赋值
StrVec getVec(istream &);	
v2 = getVec(cin); // 函数返回的一个临时变量是右值，使用移动赋值
```

<font color="red">留下一个疑问：上面最后一行调用拷贝赋值运算符是可以的，只是要经历一次const的转换应该怎么理解？</font>

**<font color="red">尝试解答上面的疑问：</font>**

引出问题，一个类有一个拷贝构造函数但是未定义移动构造函数，那么在此种情况下即便是右值也是走拷贝构造，代码举例：

```c++
class Foo {
	public:
    	Foo() = default;	// 默认构造函数
    	Foo(const Foo&);	// 拷贝构造函数
    	// ...其他成员，没有移动构造
};
Foo x;
Foo y(x);	// 左值，拷贝构造
Foo z(std::move(x));	// 即便是右值，仍然是拷贝构造
```

右值拷贝构造的过程：

- `move`返回一个绑定到`x`的`Foo&&`；
- `Foo&&`转化为一个`const Foo&`;
- 正好就是一个拷贝构造的形式；

因此<font color='blue'>使用拷贝构造函数代替移动构造函数几乎肯定是安全的</font>；

#### 拷贝并交换赋值运算符

先定义一个拷贝并交换赋值运算符，这可以作为函数匹配和移动操作间相互关系的一个很好的示例：

<font color=green>也很好的理解了拷贝构造的参数为何是引用类型以及拷贝赋值运算符的参数类型(拷贝赋值可以不是引用类型)。</font>

```c++
class HasPtr {
    public:
    	// 添加的移动构造函数
    	HasPtr(HasPtr &&p) noexcept : ps(p.ps), i(p.i) { p.ps = 0; }
    	// 该赋值运算符既是移动赋值运算符也是拷贝赋值运算符
    	HasPtr& operator=(HasPtr rhs)	// 这一步需要进行拷贝初始化
        { swap(*this, rhs); return *this; }
    	// ....其他成员的定义
};

HasPtr hp, hp2;
hp = hp2;	// hp2是一个左值；hp2通过拷贝构造函数来拷贝
// 下面是对上一行的解释：
// hp2即为上面的rhs，即HasPtr rhs = hp2，这里调用拷贝构造
// 而拷贝构造本身的参数还是引用类型且只能是引用类型
// 因此就实现了拷贝赋值运算符的功能

hp = std::move(hp2);	// 实现移动构造的功能，类似上述分析即可
```

**<font color='red'>三五法则更新版：</font>**

- 一个类定义了任何一个拷贝操作，它就应该定义所有五个操作：
  - 五个操作：拷贝赋值、拷贝赋值运算符、移动赋值、移动赋值运算符、析构函数；
- 某些类它必须定义拷贝构造、拷贝赋值运算符、析构函数；
- 定义移动构造以及移动赋值运算符的类可以避免额外开销；


#### 移动迭代器

对于拷贝，存在这么一个函数`uninitialized_copy`来构造新分配的内存，但是标准库中并没有类似的函数将对象"移动"到未构造的内存中；

新标准库中的**移动迭代器(move iterator)**：这个实现由标准库的`make_move_iterator`函数处理，将一个普通迭代器转换为一个移动迭代器；

- 一般而言，一个迭代器的解引用运算符返回一个所指向元素的值；
- 移动迭代器的解引用运算符生成一个右值引用；

由于移动一个对象可能销毁掉原对象，因此只有在确信一个算法在为一个元素赋值或将其传递给一个用户定义的函数后不再访问它时，才将一个移动迭代器传递给算法；

**<font color="red">Notes：</font>**不要随意使用移动操作，因为一个*移后源对象*具有不确定的状态，对其调用`std::move`是很危险的一个操作。

#### 右值引用和成员函数

除了构造函数和赋值运算符之外，如果一个成员函数同时提供拷贝和移动版本，它也能从中受益。

这种允许移动的成员函数通常使用与拷贝/移动构造函数和赋值运算符相同的参数模式：

- 一个版本接受一个指向`const`的左值引用；
- 一个版本接受一个指向非`const`的右值引用；

以push_back为例：

```c++
void push_back(const X&);	// 绑定到任意类型的X
void push_back(X&&);	// 只可以绑定到类型X的可修改的右值
```

**非const右值的定义：**指一个可修改的且不被`const`或的表达式；

- 通常是一个临时的、将要被移动的对象，比如返回右值引用`T&&`的函数返回值、`std::move`的返回值；

- 或者是转换为`T&&`的类型转换函数的返回值；

  代码举例：

  ```c++
  // 举个例子，假设我们有一个类MyClass，它有一个非const成员函数void set(int x)。那么我们可以这样写代码：
  
  MyClass().set(10);
  
  // 在这个例子中，MyClass()是一个右值，因为它是一个临时的、将要被移动的对象。我们在这个右值上调用了set成员函数来修改这个右值。
  ```

**const右值的定义：**指一个不可修改的且不可被`volatile`修饰的表达式；

- `const`引用声明后没办法修改内部的值(只能调用非`const`方法)。
- `const`引用支持右值来构造。

为`StrVec`类定义另一个版本的`push_back`:

```c++
class StrVec {
    public:
    	void push_back(const std::string&);	// 拷贝元素
    	void push_back(std::string&&);		// 移动元素 
};
// 仅定义上两个函数的声明
void StrVec::push_back(const string& s)
{
    chk_n_alloc();
    // 在first_free指向的元素中构造s的一个副本
    alloc.construct(first_free++, s);
}
void StrVec::push_back(string &&s)
{
    chk_n_alloc();
    // 移动构造版本
    alloc.construct(first_free++, std::move(s));
}

// 在调用push_back时，实参类型决定了新元素是拷贝还是移动到容器中
StrVec vec;
string s = "some string or another";
vec.push_back(s);	// 调用push_back(const string&)
vec.push_back("done");	// 调用移动版本，如果没有移动构造呢？也可以执行，会创建一个临时的string对象，调用拷贝赋值
```

- **引用限定符(reference qualifier)**

  <font color=red>之前试着想理解为什么通过这种形式去限定，现在暂时不想那么多，只需要知道这是一种限定左右值的方式即可。</font>

  **引用限定符**的出现主要是为了满足自行定义的类对左值右值限定的需求，代码体现如下：

  ```c++
  class Foo {
  public:
      Foo &operator=(const Foo&) &;	// 只能向可修改的左值赋值
  	// 其他参数
  };
  Foo &Foo::operator=(const Foo &rhs)	&
  {
      // 执行将rhs赋予本对象所需的工作
      return *this;	// this只能只能指向一个左值
  }
  
  Foo &retFoo();	// 返回一个引用，可作左值
  Foo retVal();	// 返回一个值，作为函数是一个临时变量，用完即销毁，即右值
  Foo i, j;	// 左值
  ```

  函数可以同时用const和引用限定，此情况下，引用限定符必须跟随在`const`限定符之后：

  ```c++
  Foo someMem() & const;	// 错误用法
  Foo anotherMem() const &;	// 正确用法
  ```

- **重载和引用函数**

  一个成员函数可以根据是否有`const`来区分其重载版本，那么对于有引用限定符同样可以区分一个成员函数的重载版本：

  ```c++
  class Foo {
  public:
      Foo sorted() &&;	// 用于可改变的右值
      Foo sorted() const &;	// 可用于任意类型的Foo
      // 其他成员的定义
  private:
      vector<int> data;
  };
  
  Foo FOO::sorted() &&
  {
      sort(data.begin(), data.end());	// 对于右值可直接在源址上排序，因为没有用户使用，可随时销毁
      return *this;
  }
  
  Foo FOO::sorted() const &
  {
      Foo ret(*this);
      sort(ret.data.begin(), ret.data.end());	// 对于左值可能有用户在使用，我们不能轻易改变原对象
      return ret;
  }
  
  // 编译器会根据sorted的对象的左值/右值属性来确定使用哪个sorted版本
  ```

  **注意：**

  - 定义`const`成员函数时，可以定义两个版本，有`const`限定符以及没有`const`限定符的版本；

  - 对于**引用限定**的函数，如果定义两个及以上具有相同名字相同参数的带引用限定符的成员函数，必须对所有函数加上引用限定符；

    ```c++
    Foo sorted() &&;
    Foo sorted() const;	// 错误，无引用限定符
    using Comp = bool(const int&, const int&);
    Foo sorted(Comp*);	// 正确
    Foo sorted(Comp*) const;	// 正确
    ```

## 重载运算与类型转换

**出现场景：**当运算符作用于类类型的运算对象时，可以通过运算符重载重新定义该运算符的含义，灵活使用运算符重载能令我们的程序更易于编写和阅读；

### 基本概念

**重载运算符的概念：**

- 是具有特殊名字的函数；
- 名字由关键字`operator`和其后要定义的运算符号共同组成；
- 重载的运算符也包含返回类型、参数列表以及函数体；

**重载运算符的特点：**

- 重载运算符函数的参数数量与该运算符左右的运算对象一样多，具体在：
  - 一元运算符一个参数，二元运算符两个参数；
- 对于二元运算符而言，左侧运算对象传递给第一个参数，而右侧运算对象对象传递给第二个参数；
- 除了重载的函数调用运算符`operator()`之外，其他重载运算符不能含有**默认实参**；
- *当一个重载的运算符是成员函数时，`this`绑定到左侧运算对象，成员运算符函数的(显式)参数数量比运算对象的数量少一个*
- **一个运算符函数它或者是类的成员，或者至少含有一个类类型的参数**；
  - 当运算符作用于内置类型的运算对象时，我们无法改变该运算符的含义；
- 仅能重载已有的运算符，而无权发明新的符号；
- 重载不改变优先级和结合律；
- 某些运算符不应被重载；
  - 逻辑运算符、逗号运算符、取地址运算符；

```c++
// 一个非成员运算符的等价调用
data1 + data2;	// 普通表达式
operator+(data1, data2);	// 等价调用

data1.operator+=(data2);	// 调用
```

**使用重载运算符的思路：**

- 首先考虑这个类将要提供哪些操作
- 确定操作之后，思考把每个类操作设成普通函数还是重载的运算符；
- 如果某些操作在逻辑上与运算符相关，则它们适合定义成重载的运算符；
- 建议当操作的含义对于用户而言清晰明了时才使用运算符；

书中492、493页有一系列运算符重载的准则，记得随时查阅(<font color="red">有些东西学完才能更好地理解</font>)。

- 比如，什么叫<font color="red">string将+定义成了普通的非成员函数</font>；

### 一些常用运算符的重载

#### 输入和输出运算符

IO标准库分别使用`>>`和`<<`执行输入和输出操作，对于这两个运算符而言，IO库定义了用其读写内置类型的版本，而类需要自定义适合其对象的新版本；

- **重载输出运算符<<**

  通常情况下，输出运算符的第一个形参是非常量`ostream`对象的引用(非常量的原因是流会因内容的写入而改变状态)；

  第二个形参则是一个常量的引用，该常量通常是我们想要打印的类类型；

  为了与其他输出运算符保持一致，`operator<<`一般要返回它的`ostream`形参；

  以重写Sales_data的输出运算符为例：

  ```c++
  // 能理解为何返回引用吗，因为引用返回左值
  ostream& operator<<(ostream &os, const Sales_data &item)
  {
      os << item.isbn() << " " << item.units_sold << " "
          << item.revenue << " " << item.avg_price();
      return os;	// 返回第一个形参ostream &os的类型，因此<<号左边要是相应类型的对象
  }
  ```


- **重载输入运算符`>>`**

  输入运算符的第一个形参是运算符将要读取的流的引用，第二个形参是将要读入到的(非常量)对象的引用；

  同样以`Sales_data`的输入运算符举例：

  ```c++
  istream& operator>>(istream &is, Sales_data &item)	// 理解为何Sales_data不是const引用吗，因为要对item的状态进行处理
  {
      double price;	// 不需要初始化，因为我们将先读入数据到price
      is >> item.bookNo >> item.units_sold >> price;
      if (is)		// 检查是否输入成功
          item.revenue = item.units_sold * price;
      else
         	item = Sales_data();	// 输入失败：对象被赋予默认的状态(空)
      return is;
  }
  ```

  ***Notes:*** 输入运算符必须处理输入可能失败的情况，而输出运算符不需要，错误点有两个可能：

  - 当流含有错误类型的数据时读取操作可能失败，比如读取完`bookNo`之后，输入运算符假定接下来读入的是两个数字数据，一旦不是，则错；
  - 读取操作达到文件末尾或者遇到输入流的其他错误时也会失败；

  至于错误标识，建议由**IO标准库**自己标识这些错误；

#### 算术和关系运算符

一般而言，如果类定义了算术运算符，则它一般也会定义一个对应的复合赋值运算符。

开篇先举例一个算术运算符的定义：

```c++
// 假设两个对象指向同一本书
Sales_data operator+(const Sales_data &lhs, const Sales_data &rhs)
{
    Sales_data sum = lhs;	// 拷贝赋值
    sum += rhs;				// 将rhs加到，其中类的+=重载运算符将在后面定义，你看是属于类本身的吧
    return sum;
}
```

- **相等运算符**

  通常情况下，C++中的类会比较对象的每一个数据成员去判断两个对象是否相等，代码如下：

  ```c++
  bool operator(const Sales_data &lhs, const Sales_data &rhs)
  {
      return lhs.isbn()  rhs.isbn() &&
          lhs.units_sold  rhs.units_sold &&
          lhs.revenue  rhs.revenue;
  }
  /* 定义了，那最好也定义!= */
  bool operator(const Sales_data &lhs, const Sales_data &rhs)
  {
      return !(lhs  rhs);
  }
  ```


- **关系运算符**

  根据类的实际需求来看，有时候并不存在一种逻辑可靠的关系定义，这一部分主要是思想的学习；

#### (复合)赋值运算符

- **赋值运算符**

  前面所学已介绍过拷贝赋值以及移动赋值运算符，它们可以把类的一个对象赋值给该类的另一个对象，而考虑到`vector`类，它还定义了第三种赋值运算符，该运算符接受花括号内的元素列表作为参数：

  ```c++
  vector<string> v;
  v = {"a", "an", "the"};
  
  // 来，添加运算符
  class StrVec {
  public:
      StrVec &operator=(std::initializer_list<std::string>);
  };
  
  // 定义这个赋值运算符
  StrVec &StrVec::operator=(initializer_list<string> il)	// 无须检查运算符，因为this与之绝对不是同一个对象
  {
      // alloc_n_copy分配内存空间并从给定范围内拷贝元素
      auto data = alloc_n_copy(il.begin(), il.end());
      free();	// 销毁对象中的元素并释放内存空间
      elements = data.first;	// 更新数据成员使其指向新空间
      first_free = cap = data.second;
      return *this;
  }
  ```


- **复合赋值运算符**

  如上述定义的信息，为了保证与赋值运算符的一致性，我们一般也会将赋值运算符定义在类的内部：

  ```c++
  Sales_data& Sales_data::operator+=(const Sales_data &rhs)
  {
      units_sold += rhs.units_sold;
      revenue += rhs.revenue;
      return *this;
  }
  ```

#### 下标运算符

**下标运算符必须是成员函数**，这个好理解；

以`StrVec`为例，有一个细节就是，我们通常会定义两个包含下标运算符的版本，一个是返回普通引用，另一个是对于类的常量成员返回常量引用：

```c++
class StrVec {
public:
    std::string& operator[](std::size_t n)	{ return elements[n]; }
    const std::string& operator[](std::size_t n)	const { return elements[n]; }
 private:
    std::string *elements;	// 指向数组首元素的指针
};
```

#### 递增和递减运算符

- **前置递增/递减运算符**

  一般而言，由于递增递减运算符改变了对象的状态，一般建议将其设定为成员函数，以`StrBlobPtr`为例：

  ```c++
  class StrBlobPtr {
  public:
      // 递增和递减运算符
      StrBlobPtr& operator++();
      StrBlobPtr& operator--();
      // 其他成员与之前一致
  };
  
  /* 两个运算符的定义 */
  StrBlobPtr& StrBlobPtr::operator++()
  {
      check(curr, "increment past end of StrBlobStr");	// 检查是否已经指向了容器的尾后位置
      ++curr;
      return *this;
  }
  
  // 递减类似
  ```

- **后置递增/递减运算符**

  在C/C++中需要考虑到的是前置和后置的位置所在是有意义的，而后置面临的一个问题是：普通的重载形式无法区分处理前置后置，因为名字相同，运算的对象与数量都相同。

  为了解决这个问题，<font color=red>后置版本接受一个额外的(不被使用)int类型的形参，编译器为后置运算符提供一个值为0的实参</font>，代表了后置的形式；

  ```c++
  class StrBlobPtr {
  public:
      // 递增和递减运算符
      StrBlobPtr& operator++(int);
      StrBlobPtr& operator--(int);
      // 其他成员与之前一致
  };
  
  /* 两个运算符的定义 */
  StrBlobPtr& StrBlobPtr::operator++(int)
  {
      // 此处无须检查有效性？
      StrBlobPtr ret = *this;	// 记录当前的值
      ++*this;	// 调用前置运算的++，这部分会对有效性进行检查，妙哉！
      return *ret;	// 返回之前的状态
  }
  
  // 递减类似
  ```

  这个定义的思想好棒！

**显式调用后置运算符**

```c++
StrBlobPtr p(a1);	// p指向a1中的vector
p.operator++(0);	// 调用后置版本的operator++
p.operator++();		// 调用前置版本的operator++
```

### 成员访问运算符

#### 定义方法

在迭代器类以及智能指针类中常常用到解引用运算符`*`和箭头运算符`->`：

```c++
class StrBlobPtr {
public:
    std::string& operator*() const
    {
        auto p = check(curr, "dereference past end";)
            return (*p)[curr];	// (*p)是对象所指的vector
    }
    std::string* operator->() const
    {
        // 将实际工作委托给解引用运算符
        return & this->operator*(); // 这个符号是返回相应的地址，其中this是指向本StrBlobPtr对象的指针，下面是一个等价写法
        return & (*this).operator*();
    }
    // 其他成员与之前版本保持一致
}
```

#### 对箭头运算符返回值的限定

- 我们可以令`operator*`完成任何我们指定的操作，可以让其返回一个固定；

- 而`operator->`运算符则不是这样，它永远不能丢掉成员访问这个最基本的含义，对于形如`point->mem`的表达式来说：

  - `point`要么是一个指向类对象的指针；
  - 要么是一个重载了`operator->`的类的对象；

  从代码上来看，则是：

  ```c++
  (*point).mem;	// 一个内置的指针类型
  point.operator()->mem;	// point是类的一个对象，这个好理解
  point.operator->().mem	// 疑问：准确来说不应该是这么写吗？反正总之都会简化成上面的写法，又是语法糖
  ```

### 函数调用运算符

#### 函数调用形式

如果类重载了函数调用运算符，则我们可以像使用函数一样使用该类的对象，因为这样的类同时也能存储状态，与普通函数相比更灵活：

```c++
struct absInt {
    int operator()(int val) const {	// 一个函数调用运算符的形式
        return val < 0 ? -val : val;
    }
};

int i = -42;
absInt absObj;
int ui = absObj(i);	// 将i传递给absObj.operator()，隐式调用，语法糖形式
absObj.operator()(i);	// 显式调用
```

如果类定义了调用运算符，则该类的对象称作**函数对象(function object)**；

#### 含有状态的函数对象类

函数对象类出了除了`operator()`之外也可以包含其他成员，这些包含的数据成员被用于定制调用运算符中的操作：

```c++
class PrintString {
public:
    PrintString(ostream &o = cout, char c = ' '): os(o), sep(c) { }	// 默认实参
    void operator() (const string &s) const { os << s << sep; }		// 定义了这么一个运算符
private:
    ostream &os;	// 用于写入的目的流
    char sep;	// 用于将不同输出隔开的字符
};

// 使用上述类
PrintString printer;	// 使用默认值，打印到cout
printer(s);				// 在cout中打印s，后面接空格
PrintString erros(cerr, '\n');	// 不用默认值
errors(s);				// 在cerr中打印s，后面跟一个换行符
```

函数对象常常作为泛型算法的实参：

```c++
for_each(vs.begin(), vs.end(), PrintString(cerr, '\n'));	// 好奇是怎么传参的
```

<font color=red>为什么lambda表达式产生的类不含有默认构造函数、赋值运算符以及默认析构函数：</font>

- <font color=red>我对GPT的回答存疑；</font>

- 函数对象类的对象通常是为了在特定的上下文中进行函数调用，比如作为算法的参数、作为回调函数等；
- 默认析构函数也不是必需的，因为函数对象通常不持有资源或需要进行显式的清理操作，当函数对象不再需要时，其生命周期由使用它的代码控制。

#### lambda是函数对象

对于：`[](const string &a, const string &b) { return a.size() < b.size(); }`

其行为类似：

```c++
class ShorterString {
public:
    bool operator()(const string &s1, const string &s2) const
    { return s1.size() < s2.size(); }
};
```

所以说`lambda`是一个函数对象，默认情况下<font color=red>lambda不能改变它捕获的变量</font>，因此在默认情况下，由`lambda`产生的类当中的函数调用运算符是一个const成员函数。

**lambda产生的类**：在编译器中，`lambda`表达式会被转化为一个类，该类的名称和定义的`lambda`变量的名称无关，也无法在源代码中直接访问，这个类通常被称为 `lambda`产生的类，它包含一个名为`operator()`的成员函数，实现了`lambda`表达式定义的函数功能。

- **表示lambda及相应捕获行为的类**

  - 对于引用捕获变量，编译器可以直接使用该引用而无须作为数据成员存储在类中；

  - 通过值捕获的变量则被拷贝到`lambda`中，需要为每个值捕获的变量建立对应的数据成员，创建构造函数：

    ```c++
    auto wc = find_if(words.begin(), words.end(),
                     [sz](const string &a)
                      { return a.size() >= sz;});
    // 产生的类
    class SizeComp {
      // 形参对应捕获的变量，且表明该类不含有默认构造函数
        SizeComp(size_t n):sz(n) { }
        // 与lambda一致
        bool operator()(const string &s) const
        { return s.size() >= sz;}
    private:
        size_t sz;
    };
    ```

  lambda表达式产生的类不含默认构造函数、赋值运算符及默认析构函数；
  
  (<font color=red>没有默认析构函数，那么对象怎么释放呢？</font>)


#### 标准库定义的函数对象

*这部分是针对函数对象知识点的拓展内容；*

这些对象都定义在`functional`头文件中；

**主要有三类：**算数运算符、关系运算符和逻辑运算符(510页查表)；

这些类都被定义成模板的形式，我们可以指定具体的应用类型，即调用运算符的形参类型：`plus<string>`令plus加法运算符作用于string对象，`plus<Sales_data>`对Sales_data对象执行加法运算。

```c++
plus<int> intAdd;	// 可执行int加法的函数对
negate<int> intNegate;	// 可对int值取反的函数对象
int sum = intAdd(10, 20);
sum = intNegate(intAdd(10, 20));
sum = intAdd(10, intNegate(10));	// 为零
```

- **在算法中使用标准库函数对象**

  ```c++
  // 传入一个临时的函数对象用于执行两个string对象的>比较运算
  sort(svec.begin(), svec.end(), greater<string>());  // greater后面的括号用来接形参，由sort传过来的形参
  
  // 标准库规定其函数对象对于指针同样适用，但是直接将两个指针对比将产生未定义的行为
  vector<string *> nameTable;	// 指针的vector
  sort(*, *, [](string *a, string *b) { return a < b; })      // 错误，无法直接对指针进行对比
  sort(nameTable.begin(), nameTable.end(), less<string*>());  // 正确，因为less是定义良好的    
  ```

#### 可调用对象与函数

C++中有几种可调用对象：函数、函数指针、lambda表达式、bind创建的对象以及重载了函数调用运算符的类；

可调用对象也有类型：每个lambda有它自己唯一的(未命名)类类型，函数及函数指针的类型则由其返回值类型和实参类型决定；

可调用对象可以对其参数执行不同的算术运算，但是他们共享同一种调用形式：

`int(int, int)`：两个`int`的参数，返回`int`类型

基于上述这些可调用对象共享同一种实现形式，我们可以为这个形式定义一个**函数表**，该表用来存储指向这些可调用对象的指针，当程序需要执行特定操作时从该表调取：

- 通过`map`实现，使用运算符符号作为`string`类型的关键字，实现实现运算符的函数作为值：

  ```c++
  map<string, int(*)(int, int)> binops;
  binops.insert({"+", add});	// 插入一个pair，add是已经定义好的一个函数
  // 但是lambda表达式不能以同样的方式插入，因为值的类型不同
  ```

解决上述因为类型不一致产生的影响的方法：

**标准库function类型**

`function`的操作细看512页；

`function`是一个模板，和我们使用过的其他模板一样，当创建一个具体的`function`类型时我们必须提供额外的信息：

```c++
function<int(int, int)>	// 声明了一个function类型，接受两个int，返回一个int的可调用对象

// 定义lambda形式
function<int(int, int)> f3 = [](int i, int j) { return i * j; };  // lambda

// 重新定义map
map<string, function<int(int, int)>> binops;	// 解决上面的问题
```

- **重载的函数与function**

  由于二义性的存在，我们不能直接将重载函数的名字存入`function`类型的对象中，得处理一下：

  ```c++
  int (*fp)(int, int) = add;	// fp所指的是接受两个int的版本，而不是类的版本，fp是一个函数指针
  binops.insert( {"+", fp} );	// 正确：fp指向一个正确的add版本
  // 或者使用lambda
  binops.insert( {"+", [](int a, int b) {return add(a, b);} } );
  ```

相关内容的**[源码展示](https://github.com/Wind134/CPP_Primier_SourceCodes/tree/main/%E5%8F%AF%E8%B0%83%E7%94%A8%E5%AF%B9%E8%B1%A1-%E5%87%BD%E6%95%B0%E5%AF%B9%E8%B1%A1-lambda-%E8%BF%90%E7%AE%97%E7%AE%97%E7%AC%A6%E9%87%8D%E8%BD%BD-bind%E7%AD%89%E4%BD%BF%E7%94%A8/src)**；

### 重载、类型转换与运算符

一个实参调用的非显式构造函数定义了一种隐式的类型转换，这种构造函数将实参类型的对象转化为类类型；

同样可以定义类类型的转换，通过定义**类型转换运算符**可以做到这一点，转换构造函数和类型转换运算符共同定义了**类类型转换(class-type conversions)**，也称为**用户定义的类型转换(user-defined conversions)**。

#### 类型转换运算符

**类型转换运算符(conversion operator)**类的一种特殊的成员函数，负责将一个类类型转化为其他类型：`operator type() const;`

- type类型要求是<font color=red>能作为函数的返回类型，因此不允许转换成数组或函数类型，但可以转换成指针或者引用类型</font>。
- 类型转换运算符没有显式的返回类型，没有形参，必须定义成类的成员函数；
- 类型转换运算符不得改变待转换对象的内容；

**定义一个含有类型转换运算符的类**

```c++
class SmallInt {
public:
    SmallInt(int i = 0): val(i)
    {
        if (i < 0 || i > 255)
            throw std::out_of_range("Bad SmallInt value");
    }
    operator int() const { return val; }	// 转换运算符
private:
  std::size_t val;  
};

SmallInt si;  // 定义一个类对象
si = 4;       // 将4转化为一个SmallInt对象(隐式转换且经构造函数实现)，再调用隐式的拷贝赋值运算符
si + 3;       // 隐式转换为int
```

上述的处理过程：

- 遇到`si = 4`，调用`SmallInt`的赋值运算符，由编译器自动提供；
- 该赋值运算符发现右侧是`int`类型，需要进行类型转换；
- 此时由于SmallInt类定义了从`int`到`SmallInt`的隐式转换(通过构造函数)，所以可以进行该类型转换；
- 转换完成后，通过赋值运算符将转换结果赋值给si；
- `si + 3`则是调用了类型转换运算符，将`si`从`SmallInt`转换成`int`类型；

*类型转换运算符可能产生意外结果*

- **显式的类型转换运算符**

  存在的意义是阻止隐式转换，具体的使用方式是在前面加上一个`explicit`关键字；

  ```c++
  class SmallInt {
      public:
      	// 编译器不会自动执行
      	explicit operator int() const { return val; }
      	// 保持一致
  };
  SmaillInt si = 3;	// 这部分按之前的情况执行
  static_cast<int>(si) + 3;	// 正确，显式地请求转换
  ```

  几个仍会隐式执行的例外：

  - if、while及do语句的条件部分；
  - for语句头的条件表达式；
  - 逻辑非或与运算符的运算对象；
  - 条件运算符的条件表达式；

- **转换为bool**

  在C++11新标准下，IO标准库通过定义一个向bool的显式类型转换实现同样的目的：`while (std::cin >> value)`;

  发现没，上面的是放在条件部分的，因此可以直接定义成显式的；

#### 避免有二义性的类型转换

几个可能情况：

- 两个类提供相同的类型转换：A类定义了一个接受B类对象的转换构造函数，而B类定义了一个转换目标是A类的类型转换运算符；

  ```c++
  struct B;
  strcut A {
      A() = default;	// 默认构造函数
      A(const B&);	// B转换成A
  };
  struct B {
      operator A() const; // B转化成A
  };
  A f(const A&);	// 定义一个函数返回A类型的声明
  B b;
  A a = f(b);	// 二义性错误，调哪个呢 
  // f(B::operator A()) or f(A::A(const B&))
  ```

  我们无法使用强制类型转换来解决二义性问题，因为强制类型转换本身也面临二义性；

- 类定义了多个转换规则，而这些转换涉及的类型本身可以通过其他类型转换联系在一起；

  ```c++
  struct A {
      A( int = 0 );
      A(double);
      operator int() const;	// 转换为int对象
      operator double() const;	// 转换为double对象
      // 其他成员
  };
  void f2(long double);
  A a;
  f2(a);	// 二义性错误，该调哪个呢
  // 对于构造函数的二义性调用也是类似情况
  long lg;
  A a2(lg);	// long->double or long->int
  // 而下面的情况
  short s = 42;	// 编译器会优先选int，没必要选double
  A a3(s);	// 正确
  ```

注意**重载函数与转换构造函数的二义性**

```c++
struct C {
    C(int);
    // 其他成员
};
struct D {
    D(int);
    // 其他成员
};
// 上面这种定义使得二义性进一步提升：
void manip(const C&);
void manip(const D&);	// 重载
manip(10); // 我该调哪个呢？
manip(C(10));	// 显式正确调用
```

同时注意**重载函数与用户定义的类型转换**

```c++
struct E {		// 用户定义？
    E(double);
    // 其他成员
};
void manip2(const C&);
void manip2(const E&);
// 同样面临二义性
manip2(10);	C(10) or E(double(10))
```

#### 函数匹配与重载运算符

重载的运算符也是重载的函数，因此通用的函数匹配规则同样适用于判断在给定的表达式中到底应该使用内置还是重载的运算符。

当我们使用重载运算符作用于类类型的运算对象时，候选函数包含：普通非成员版本与内置版本；

若<font color=red>左侧运算对象是类类型</font>，则定义在该类中的运算符的重载版本也包含在候选函数内。因此在表达式中使用重载的运算符，成员函数与非成员函数都要在考虑的范围内！

**ChatGPT**有个例子很好：

```c++
// 定义了一个成员函数operator+(const Foo&)，以及一个非成员函数operator+(const Foo&, const Foo&)
// 对象与对象相加
Foo f1, f2, f3;
f3 = f1 + f2;  // 调用成员函数 operator+(const Foo&)

// 对象与常量相加
Foo f;
f = f + 5;  // 调用成员函数 operator+(const Foo&)，然后调用一次类型转换运算符

// 常量与对象相加
Foo f;
f = 5 + f;  // 调用非成员函数 operator+(const Foo&, const Foo&)，然后调用一次类型转换运算符

// 常量与常量相加
Foo f;
f = 5 + 6;  // 调用非成员函数 operator+(const Foo&, const Foo&)，然后调用两次类型转换运算符

// 如果FOO还定义了转换目标为int的类型转换，且
int f = f + 5;	// 会产生二义性错误
```

## <font color=red>面向对象程序设计</font>

面向对象程序设计基于三个基本概念：数据抽象、继承和动态绑定，这部分主要着重介绍继承和动态绑定；

- 数据抽象可以将类的接口与实现分离；
- 继承可以定义相似的类型并对其相似关系建模；
- 动态绑定(多态？)可以在一定程度上忽略相似类型的区别；

**C++的多态性:** 多态性(polymorphism)，即多种形式，我们把具有继承关系的多个类型称为多态类型，我们能使用这些类型的"多种形式"而无须在意它们的差异；

- 引用或指针的**静态类型与动态类型**不同这一事实正是C++语言支持多态性的根本所在；
  - 静态是对非虚函数的调用，这一调用是在编译时就进行绑定；
  - 动态是对虚函数的调用，要到运行时才会决定执行哪个版本；

### 前情提要

#### 对象组合

**概念:** 将多个对象进行组合，从而组合成一个新的可用对象。比如存在两个对象：`引擎`与`轮胎`，经过一系列组合，就能成为`汽车`，达到了一个新对象的组合效果；

```c++
class Person {....};
class Currency {....};
class SavingsAccount{
    public:
    	SavingsAccount(const char *name, 
                      const char* address, int cents);
    	~SavingsAccount();  // 析构函数
    	void print();
    private:
    	Person m_saver;     // 使用了一个Person类，上面已定义。
    	Currency m_balance; // 使用了一个Currency类，已定义。
}
SavingsAccount::SavingsAccount(const char* name, const char* address, 
                               int cents) : m_saver(name, address), m_balance(0, cents) {}	//	初始化列表
void SavingsAccount::print(){
    m_saver.print();
    m_balance.print();
}
```

**继承(inheritance)的概念:** 通过继承联系在一起的类构成一种层次关系，通常在层次关系的根部有一个**基类(base class)**，其他类则直接或间接地从基类继承而来，这些继承得到的类称为**派生类(derived class)**。

**对象组合的构造函数执行顺序:** 遵循在组合类中的定义顺序，与组合类构造函数的初始化列表顺序无关；

#### 区分组合与继承

**概念上的区分**

- 对象组合是拿出几个对象拼装成新的对象，这个新的对象当中的成员变量可能是其他类的对象，对象是实体；

- 类的继承是将已有的类进行改造，从而得到一个新的类；

当父类子类中有重名的函数时，**子类所定义的那个函数会覆盖掉父类定义的那个相同的函数**，这是C++的特性。

- 后续知道，这一点的实现是依赖于作用域完成的，优先选择自己作用域内的函数；


### 对象的继承机制

#### 定义基类

```c++
class Quote {
public:
    Quote() = default;	// 关于default已学
    Quote(const std::string &book, double sales_price):bookNo(book), price(sales_price) { }
    std::string isbn() const { return bookNo; }
    // 返回给定数量书籍的销售总额
    // 派生类负责改写并使用不同折扣的计算算法
    // virtual虚函数实现动态绑定
    virtual double net_price(std::size_t n) const
    	{ return n * price; }
    virtual ~Quote() = default;	// 对析构函数进行动态绑定
private:
    std::string bookNo; // 书籍的ISBN编号
protected:
    double price = 0.0; // 普通状态下不打折的价格
};
```

`virtual`部分代表虚函数，现在需要知道的是**作为继承关系中根节点的类通常都会定义一个虚析构函数**；

基于以上的代码，对以下相关知识进行了解：

- **成员函数与继承**
  - 派生类可以继承其基类的成员，但遇到一些与类型相关的成员函数的操作时，派生类需要以自己的新定义**覆盖**(`override`)基类的旧定义；
  - **虚函数(`virtual`)**即是基类希望派生类进行覆盖的成员函数；当使用**指针或引用**调用虚函数时，该调用会被**动态绑定**；
  - 任何构造函数之外的**非静态函数**(`Non-static`)都可以是虚函数；
  - 关键字`virtual`只能出现**在类内部的声明语句之前**而不能用于类外部的函数定义，一个被声明为虚函数的函数在派生类中隐式地也是虚函数；
- **访问控制与继承**
  - 派生类可以继承定义在基类中的成员，但是<font color=red>派生类的成员函数不一定有权访问从基类继承而来的成员</font>，比如不能访问私有成员；
  - 但是基类中还有这么一类成员，基类希望它的派生类有权访问该成员，同时禁止其他用户访问，此即**受保护的(`protected`)**访问运算符；

#### 定义派生类

派生类必须通过使用**类派生列表**(class derivation list)明确指出它是从哪个基类继承而来，每个基类前面可以有：`public`、`protected`、`private`；

派生类必须将其继承而来的成员函数中需要**覆盖**的那些重新声明：

```c++
class Bulk_quote : public Quote {		// Bulk_quote继承自Quote，关于访问说明符public的介绍在书中543页
public:
    Bulk_quote() = default;				// 以下两行为构造函数
    Bulk_quote(const std::string&, double, std::size_t, double);
    // 覆盖基类的函数版本以实现基于大量购买的折扣政策
    double net_price(std::size_t) const override;	// 没有加virtual
private:
    std::size_t min_qty = 0;	// 适用折扣政策的最低购买量
    double discount = 0.0;		// 以小数表示的折扣额
};
```

现在需要知道的关于**访问说明符**的作用是：控制派生类从基类继承而来的成员是否对派生类的用户可见；

- 若一个派生是`public`的，则基类的公有成员也是派生类接口的组成部分；
- 可以将**公有派生类型**的对象绑定到基类的引用或者指针上；
  - 因为公有派生不存在访问权限的问题；
  - 私有继承会使得在派生类中所有继承而来的基类的东西都变成私有；
  - 那么不能通过指针以及引用等外部方式访问是很合理的；

大多数类都只继承自一个类，这种形式的继承被称作**单继承**，但事实上是存在含有多于一个基类的情况；

下面几点是针对派生类相关内容的介绍：

- **派生类的虚函数**

  - 派生类经常(但不总是)覆盖它继承的虚函数，如果派生类选择不覆盖，则虚函数的行为类似于其他的普通成员；
  - **派生类可以在它覆盖的函数前使用`virtual`关键字，但不是非得这么做**，C++11新标准允许**派生类显式地注明它使用某个成员函数覆盖它继承的虚函数**；
    - 在形参列表后面、在`const`成员函数的`const`关键字后面、在引用成员函数的引用限定符后面加一个关键字override；
    - 上述这种方式就属于显式注明的行为，这个时候`virtual`关键字可以不写；

  基于上述原因，可以总结到**`override`说明符的作用**：

  - 派生类如果定义了一个与**基类中虚函数名字相同但形参列表不同**的函数，编译器认为新定义的函数与基类中原有函数时相互独立的，合法；
  - 基于上原因，编译器会进一步确认到派生类的函数没有覆盖掉基类中的版本，认为我们缺失了这部分，于是会报错；
  - 加上`override`关键字来说明派生类中的虚函数，**使得我们的意图更加清晰**，同时让编译器为我们发现错误，比如形参列表有误；

  同时陈述**override说明符的由来**

  - 在C++11标准之前，派生类要在它覆盖的函数前使用`virtual`关键字**，C++11新标准允许**派生类显式地注明它使用某个成员函数覆盖它继承的虚函数；

  - 在形参列表后面、在`const`成员函数的`const`关键字后面、在引用成员函数的引用限定符后面加一个关键字`override`；
  - 上述这种方式就属于显式注明的行为，这个时候`virtual`关键字可以不写；

- **派生类对象及派生类向基类的类型转换**

  一个派生类对象包括：

  - 一个含有派生类自己定义的(非静态)成员的子对象；
  - 一个与该派生类继承的基类对应的子对象；(如果有多个基类，那这样的子对象同样也有多个)；

  以`Bulk_quote`为例将包含四个数据元素：从`Quote`继承而来的`bookNo`和`price`数据成员，以及`Bulk_quote`自己定义的`min_qty`和`discount`成员；

  - 因派生类对象含有与基类对应的组成部分，所以我们可以把派生类的对象当作基类对象来使用；

    - 比如：**一个派生类指针或引用转换为基类指针或引用**，此时会发生**向上转型(造型)**，使用有如下影响：

      - 只能访问基类的中的成员与方法，派生类中新增加的成员和方法无法通过基类指针直接访问；

      - 基类与派生类如果都定义了同名的方法，会调用基类中的实现；

      - 但是不影响动态绑定的功能正常进行，也即对虚函数的调用仍然会调用实际对象的函数方法；

      - 因此说**向上造型**常用于多态性的场景当中；

        这种转换通常称为**派生类到基类的**(derived-to-base)类型转换；编译器会隐式地执行派生类到基类的转换；

        ```c++
        Quote item;	// 基类对象
        Bulk_quote bulk;	// 派生类对象
        Quote *p = &item;	// p指向Quote对象
        p = &bulk;			// p指向bulk的Quote部分，但p只能调用bulk的基类部分，此时派生类类型的指针转成了基类类型的指针
        Quote &r = bulk;	// r绑定到bulk的Quote部分
        ```

    - 如果**一个基类指针或引用转换为派生类指针或引用**，此时发生**向下造型**：

      ```c++
      Base* basePtr = new Derived();  // 基类指针指向派生类对象
      
      // 向下造型为派生类指针
      Derived* derivedPtr = dynamic_cast<Derived*>(basePtr);
      if (derivedPtr != nullptr) {
          // 成功进行向下造型，可以访问派生类特有的成员和方法
          derivedPtr->derivedMethod();
      }
      ```

      - 但需要注意的是，向下造型只能在基类指针或引用实际上指向的是派生类对象才能进行，因此最好使用`dynamic_cast`运算符进行类型检查，确保安全转换；

- **派生类构造函数**

  **派生类必须使用基类的构造函数来初始化它的基类部分**；

  派生类对象的基类部分以及派生类自己的数据成员都是在构造函数的初始化阶段执行初始化操作的；

  ```c++
  Bulk_quote(const std::string& book, double p,	// 这两个参数通过Quote类的构造函数执行
            std::size_t qty, double disc) : 
            Quote(book, p), min_qty(qty), discount(disc) { }	// 所示
  ```

  如果我们不特别指出，派生类对象的基类部分会像数据成员一样执行默认初始化；

- **派生类使用基类的成员**

  派生类可访问基类的公有成员及受保护成员：

  ```c++
  double Bulk_quote::net_price(size_t cnt) const
  {
  	if (cnt >= min_qty)	return cnt * (1 - discount) * price;	// price是受保护的成员
  	else	return cnt * price;
  }
  ```

  我们现在需要了解的是：**派生类的作用域嵌套在基类的作用域之内**；使用基类中成员以及派生类自身的成员在方法上没什么区别；

  **关键习惯：**每个类负责定义各自的接口，即便从语法上我们可以在派生类构造函数体内给它的公有或受保护的基类成员赋值，但是最好不要这么做；而是调用基类的构造函数进行赋值；

- **继承与静态成员**

  - 不论派生出多少个派生类，静态成员只有唯一实例，因为静态成员是属于类而不是对象的成员；
  - 静态成员遵循**通用的访问控制**准则，如果静态成员是`private`的，派生类同样无权访问；

- **派生类的声明**

  - 声明中包含类名<font color=red>但是不包含它的派生列表</font>；

    ```c
    class Bulk_quote : public Quote;	// 错误，派生列表不能出现在声明中
    class Bulk_quote;	// 正确方式
    ```

  - 声明语句的目的是令程序知晓某个名字的存在以及该名字表示一个什么样的实体；

- **被用作基类的类**

  - 如果我们想要将某个类用作基类，则**该类必须已经定义而非仅仅声明**；
  - 隐含一个类不能派生它本身的规定；
  - 一个类是基类，同时它也可以是一个派生类；

  ```c++
  class Base { /* ... */ };
  class D1: public Base { /* ... */ };  // Base是D1的直接基类(direct base)
  class D2: public D1 { /* ... */ };    // Base是D2的间接基类(indirect base)
  ```

- **防止继承的发生**

  我们定义一个类但是不希望其他类继承它，C++11新标准提供了一种防止继承发生的方法，即在类名后加上一个关键字`final`：

  ```c++
  class NoDerived final { /* */ };	// NoDerived不能作为基类
  class Base { /* */ };
  class Last final : Base { /* */ };	// 派生类Last不能作为基类
  ```

  由此可知，**`final`说明符的作用**：不允许后续其他类的覆盖；

#### 动态类型静态类型

上述内容已经针对类型转换与继承进行了描述，这部分更多的是补充信息；

将基类的指针或引用绑定到派生类对象上有一层极为重要的含义：

- 使用基类的引用时，实际上我们并不清楚该引用所绑定对象的真实类型，该对象可能是基类的对象，也可能是派生类的对象；
- 和内置指针一样，智能指针类也支持派生类向基类的类型转换；

**静态类型与动态类型：**

- 表达式的**静态类型在编译时总是已知的**，它是变量声明时的类型或表达式生成的类型；
- 动态类型**则是变量或表达式表示的内存中的对象**的类型，在运行时得知；

在基类指针指向派生类的过程中：

- 基类的指针或引用的静态类型可能与其动态类型不一致；
- 如果**表达式既不是引用也不是指针，则它的动态类型永远与静态类型一致**；
- <font color=red>那怎么保证不一致的情况下可以顺利执行呢？</font>
  - 回答上面这个问题就是四个字：**动态绑定**；

<font color=red>静态类型动态类型看得有些懵懵懂懂，</font>第二遍看效果好了很多；

在类型转换层面：

- **不存在**基类向派生类的<font color=red>隐式</font>类型转换；
  - 即便一个基类指针或引用绑定在一个派生类对象上也不执行这种转换；
  - 因为基类中不一定会有派生类特有的部分，而反过来则不一样了；
- 编译器只能通过检查指针或引用的静态类型来推断该转换是否合法；
  - 在已知某个基类向派生类的转换是安全的前提下，可以通过`static_cast`强制覆盖掉编译器的检查工作；
  - 这个已知，是我们作为用户的已知，我们只有确定安全，才能覆盖掉编译器的检查工作；

- 在对象之间不存在类型转换，类型转换只存在于引用或者指针类型，原因可以从以下几个方面来理解：
  - 对象之间的类型转换，很容易理解到这是一种拷贝构造或者拷贝赋值运算符的问题，而：
    - 成员函数接受引用，或者指针，作为参数；
    - 派生类到基类的转换允许我们拷贝/移动传递一个派生类的对象；
    - 而这个过程中，运行的构造函数一定是基类当中的那一个；
  - 上面的三小点<font color=red>我个人理解为：</font>
    - 因此对象之间不必有类型转换；
    - 因此一般都是派生类向基类转换；
- 当我们用一个派生类对象为一个基类对象初始化或赋值时，只有该派生类对象中的基类部分会被拷贝、移动或赋值；派生类部分会被忽略；

**Note:** 这部分的概念在初学时看得比较懵懵懂懂，现在深入学习，一切都比较清晰明了；

### 对象的多态机制

#### 动态绑定

**概念:** 也被称为运行时多态性(Runtime Polymorphism)，是面向对象编程中的一个重要概念，它是指在运行时确定调用的函数或方法，而不是在编译时确定。

- 实际传入的对象类型将决定执行的函数版本，因此动态绑定也称**运行时绑定(run-time binding)**；
- 在C++中，当我们使用**基类的引用(指针)调用一个虚函数时将发生动态绑定**；
  - 也就是说如果直接使用基类的对象来调用虚函数，编译器会根据**对象的静态类型**来确定调用的函数。
  - 这意味着如果对象的静态类型与虚函数所在的类不匹配，就无法实现多态性。

与之相对应的则是**静态绑定**；

在静态绑定(Static Binding)中，函数或方法的调用在编译时就被确定了，根据变量或表达式的静态类型来确定调用哪个函数或方法。这种绑定方式早绑定，也称为静态多态性。

#### 虚函数

在C++语言中，由于**动态绑定**的执行，我们知道运行时才能知道到底调用了哪个版本的虚函数，因此所有虚函数都必须有定义；

- 普通函数，如果不需要用到他，那么不需要提供定义；
- 虚函数无论是否被用到，只要有，都需要提供定义(类内类外)，否则编译器本身也不知道到底会使用哪个虚函数；
- 通过指针或引用调用虚函数时，编译器产生的代码直到运行时才能确定应该调用哪个版本的函数；
- **动态绑定**只有**当通过指针或引用调用**虚函数时才会发生；
- 而当通过一个**普通类型的表达式**调用虚函数时，在编译时就会将调用的版本确定下来；

面向对象中的多态性，正是由对虚函数的执行调用来体现的；

对于派生类而言，虚函数有如下特点：

- 一旦某个函数被声明成虚函数，则所有派生类中它都是虚函数；
- **派生类的函数若覆盖了某个继承而来的虚函数，它的形参类型必须与被它覆盖的基类函数完全一致**；
- **返回类型也必须与基类函数匹配**，除非一个例外：**虚函数的返回类型是类本身的指针或引用时**(这个例外暂时还没遇到实例)；
  - 但这种情况要求派生类到基类的类型转换是可访问的；

**虚函数的默认实参**

虚函数如果使用默认实参，那么基类与派生类中所定义的默认实参最好一致；

- 这是因为默认参数值本身也是静态绑定的，因此可能即便派生类更改了默认参数，还是会调基类的默认参数；

**虚函数的回避机制**

在某些情况下，我们希望对虚函数的调用不要进行动态绑定，而是强迫其执行虚函数的某个特定版本，我们可以：

```c++
// 强行调用基类中的函数版本而不管baseP的动态类型
double undiscounted = baseP->Quote::net_price(42);	// 这种情况称为回避机制
```

**继承与虚函数使用展示**

- 定义一个名为`Quote`的类，作为基类，`Quote`的对象表示按原价销售的书籍；
- `Quote`派生出另一个名为`Bulk_quote`的类，它表示可以打折销售的书籍；
- 上述类都包括：
  - `isbn()`获取`ISBN`编号、`net_price(size_t)`返回书籍的实际销售价格，前提是用户购买该书的数量都达到一定标准；

基类**将类型相关的函数**与**派生类不做改变直接继承的函数**区分对待，对于某些函数，**基类希望它的派生类各自定义成适合自身的版本**，此时基类就将这些函数声明为**虚函数**，可以将`Quote`类编写成：

```c++
class Quote {
public:	
    std::string isbn() const;
    virtual double net_price(std::size_t n) const;	// 该基类希望它的派生类将该函数自定义成适合自身的版本
};
```

派生类通过使用**派生类列表**明确指出它从哪个基类继承而来：

```c++
// 派生类列表的形式：Bulk_quote : public class1, public class2, ....
// Bulk_quote继承了Quote，可以有访问说明符public，表明可以访问public成员
class Bulk_quote : public Quote {
public:
    // 派生类需要对所有重新定义的虚函数进行声明
    double net_price(std::size_t) const override;
};
```

**茶后余思**

<font color=red>问题1：构造函数不定义为虚函数的原因</font>

- 虚函数表指针就是在构造对象的时候创建的，而虚函数的多态又依赖于虚函数表，也就是说，多态成立的前提必须是一个对象已经构建好了；
- 而构造函数本身又是创建对象的一个过程，因此构造函数不定义为虚函数；

<font color=red>问题2：虚析构函数的必要性</font>

- 如果一个基类的指针指向一个派生类的对象，在使用完毕准备销毁时，如果基类的析构函数没有定义成虚函数，指针会认为自己指向的对象是基类，因为去执行基类的析构函数，那么派生类就无法得到正确的释放了；

### 抽象基类

#### 概念相关

**抽象基类的定义:** 抽象基类是指**包含至少一个纯虚函数**的类；

**纯虚函数的定义:** 纯虚函数是指在函数声明语句的结尾处使用`= 0`来声明的虚函数；

```c++
class Quote {
public:
    Quote() = default;
    Quote(const std::string& book, double sales_price):
        bookNo(book), price(sales_price) {}
    std::string isbn() const { return bookNo; }
    virtual double net_price(std::size_t n) const = 0;	// 纯虚函数
    virtual ~Quote() = default;
private:
    std::string bookNo;
protected:
    double price = 0.0;
};
```

抽象基类的目的是为了定义一些通用的接口，而**不需要具体的实现**(即不需要对纯虚函数的具体定义)，这些接口由子类来实现；

**由于抽象基类包含了纯虚函数，因此它不能被实例化，只能作为基类来派生其他类。**

在实际应用中，抽象基类常常被用来定义通用的接口和规范，以便各个子类可以统一实现这些接口和规范。

### 访问控制与继承

每个类控制自己的成员初始化过程，与之类似，每个类还分别控制着其成员对于派生类来说是否可访问；

**protected关键字：**声明那些**它希望与派生类分享但是不想被其他公共成员访问使用的成员**；

- protected的成员对于类的用户而言是不可访问的；
- 派生类对象中的基类部分的`protected`成员对于**派生类以及友元的成员**来说是可访问的；(规定)
- 派生类的成员或友元只能通过派生类的对象来访问基类中的`protected`成员；
  - 这种情况下，访问`protected`成员的方法必须是`public`的才行；
  - 因为基类`protected`部分只对派生类开放；
  - 派生类也继承了基类的`protected`部分，所以实质上是通过访问派生类的`protected`部分来访问基类中的`protected`成员；

**公有、私有和受保护继承**

类对继承而来的成员的访问权限受两个因素影响：

- 一是基类中该成员的访问说明符；
- 二是派生类的派生列表中的访问说明符；

```c++
class Base {
public:
    void pub_mem();
protected:
    int prot_mem;
private:
    char priv_mem;
};
struct Pub_Derv : public Base {		// 派生访问说明符为public，不会影响派生列表的访问权限
    int f() { return prot_mem; }	// 正确，访问了protected成员
    char g() { return priv_mem; }	// 错误，没法访问private成员
};
struct Priv_Derv : private Base {	// private继承下，基类的public以及protected部分都成为了private访问的
    // private不影响派生类的访问权限
    int f1() const { return prot_mem; }	// 正确
};
```

**访问控制说明符的用处：**控制**派生类用户**对于基类成员的访问权限；

- **私有继承(`private`继承):** 基类的公有和保护成员在派生类中都变为私有成员，无法直接通过派生类对象访问它们；
- **受保护继承(`protectd`继承):** 派生类继承了基类的成员，并将这些成员在派生类中具有受保护的访问权限，这意味着在受保护继承中，基类的公有成员在派生类中变为受保护成员，但私有成员还是私有成员，因为权限只能渐渐收紧，而不能渐渐放松；
- **公共继承(`public`继承):** 与基类中成员的权限控制方式保持一致，公有成员依然是公有的；

  ```c++
  Priv_Derv d;
  d.pub_mem();	// 错误，pub_mem变成了private的

  // 权限只能渐渐收紧，而非渐渐放松
  // Priv_Derv中继承Base的(所有)成员已成为private的变量，那接下来继承该Priv_Derv类的子类Derived_from_Private，即便访问控制说明符是public，也改不了权限
  struct Derived_from_Private : public Priv_Derv {
      int use_base() { return prot_mem; }	// 无法访问到prot_mem
  };
  ```

#### 派生类向基类转换的访问性

<font color=red>这部分理解比较抽象</font>

第二遍学习就不抽象了；

一些设计的思路：

- 不考虑继承，类有两种用户：普通用户和类的实现者；
  - 普通用户实现类的对象，通过公有接口访问成员；
  - 类的实现者编写类的成员和友元的代码，成员友元公有私有部分都可访问；
- 进一步考虑继承，则出现派生类用户，而：
  - 基类将派生类可使用的部分声明成受保护的，普通用户无法访问受保护成员，派生类及其友元不可访问私有成员；
  - 基类仍然将其接口声明为公有的，同时将属于其实现的部分分为两组：
    - 一组供派生类访问(protected)；
    - 一组由基类及其友元访问(private)；

#### 继承相关

**友元与继承**

**友元关系不能传递，不能继承**，基类的友元在访问派生类成员时不具有特殊性，同时派生类的友元也不能随意访问基类的成员；

<font color=red>但是，基类的友元可以访问派生类中继承于基类的那部分的派生类成员；</font>

友元关系无法继承，因此：<font color=red>友元关系只对做出声明的类有效，对于由该类派生出的类而言不再有效；</font>

**改变个别成员的可访问性:** 通过`using`实现：

```c++
class Base {
public:
    std::size_t size() const { return n; }
protected:
    std::size_t n;
};
class Derived : private Base {	// 本来都成为自己的private部分，但是通过using
public:
    using Base::size; // 保持访问级别为public(using可以直接控制访问域)
protected:
    using Base::n;    // 保持访问级别仍然为protected
};
```

**默认的继承保护级别：**

- 使用`class`关键字定义的派生类是私有继承；使用`struct`关键字定义的派生类是公有继承的；

- `struct`关键字和`class`关键字定义的类之间唯一的差别就是默认成员访问说明符及默认派生访问说明符的差别；

### 继承中的类作用域

#### 执行规则

每个类定义自己的作用域，在这个作用域内我们定义类的成员；

当存在继承关系之时，派生类的作用域嵌套在其基类的作用域内；

当一个名字在派生类的作用域内无法正确解析，则编译器将继续在外层的基类作用域中寻找该名字的定义；

- 怪不得派生类可以像使用自己的成员一样使用基类的成员；

**一个对象、引用或指针的静态类型决定了该对象的哪些成员是可见的：**

- 即便静态类型与动态类型可能不一致(使用基类的指针或引用时)，但是静态类型还是拥有最终的决定权；

  ```c++
  class Disc_quote : public Quote
  {
      public:
      	// 添加了一个discount_policy()成员
  };
  Bulk_quote bulk;			// Bulk_quote是Disc_quote的派生类
  Bulk_quote *bulkP = &bulk;	// 动态静态类型一致
  Quote *itemP = &bulk;		// 动态与静态类型不一致
  bulkP->discount_pocicy();	// 可以通过继承的基类Bulk_quote找到
  itemP->discount_policy();	// 错误，Quote并不含有该成员
  ```

- <font color=red>可以看出，对名字的解析，只能由内作用域向外作用域延申，而不能反着走；</font>

那么问题又来了，**如果内层作用域中存在一个名字，与外层作用域的名字相同应该如何处理呢**？

- 内层作用域(派生类)的名字将隐藏定义在外层作用域(基类)的名字；

- 但**可以通过作用域运算符来使用一个被隐藏的基类成员**；

  ```c++
  struct Derived : Base {
      int get_base_mem() { return Base::mem; }	// 作用域运算符将覆盖掉原有的查找规则
      // ...
  };
  ```

  ***Notes:*** 除了覆盖继承而来的虚函数之外，派生类最好不要重用其他定义在基类中的名字；

<font color=red>书中549页详细介绍了名字查找与继承的有关流程；</font>

- 一如既往，名字查找先于类型检查，因此同上相似：
  - 定义在派生类的函数不会重载其基类中的成员；
  - 同名，派生类则选择隐藏基类成员，如果形参列表不一致，仍会隐藏；

**通过上述的分析，我们应该就能理解为何基类派生类中虚函数的形参列表必须相同了：**

**这部分也可以结合虚函数的特点来理解**；

- 如果形参列表不一致，对于编译器而言，在派生类中就是定义了一个新函数了，那么当进行<font color=red>虚调用</font>时，就没法实现<font color=red>动态绑定了</font>；
  - 注意，提及的是虚调用，而不是普通调用，普通调用遵循的是名字规则；
- 如果在派生类中重新定义一个与基类同名且参数列表也相同的虚函数，那么它将覆盖基类的虚函数，从而实现动态绑定。

#### 派生类覆盖重载的函数

什么叫覆盖重载的函数呢？

- 即如果在基类中存在个多个重载的虚函数，派生类要去覆盖；(<font color=red>这么理解没错吧</font>)

实现方式：

- 要么覆盖所有的版本，要么一个也不覆盖；
- 覆盖所有的版本太过繁琐，一个更好的解决方案就是，为重载的成员提供一条using声明语句；
  - **using声明语句指定一个名字而不指定形参列表**，所以<font color=red>一条基类成员函数的using声明语句就可以把该函数的所有重载实例添加到派生类作用域中；</font>
  - 而后，派生类只需要定义其特有的函数即可，方便很多，而无需为其他函数再重新定义；

### 构造函数与拷贝控制

继承体系中的类也需要控制当其对象执行一系列操作时发生什么样的行为，包括创建、拷贝、移动、赋值和销毁；

#### 虚析构函数

为了执行正确的析构函数版本，我们需要在基类中将析构函数定义成虚函数；

之前介绍过一条经验准则，如果一个类需要析构函数，那么它一般也同样需要拷贝和赋值操作，<font color=red>但对于基类的虚构函数而言并不遵循上述的准则；</font>

**虚析构函数将阻止合成的移动操作；**

#### 合成拷贝控制与继承

因为虚析构函数会阻止合成的移动操作，因此当我们确实需要执行移动操作时应该首先在基类中进行定义；

- 在派生类中，如果没有显式定义拷贝构造函数和拷贝赋值运算符，则会继承基类的对应函数；
- 如果派生类中定义了，可以使用基类的拷贝构造函数和拷贝赋值运算符来复制基类部分的成员，并在派生类的函数中处理派生类自己的成员。

总之就是，有就继承，没有就根据自己的需要自定义；

#### 派生类的拷贝控制成员

*拷贝和移动构造函数默认不会被继承*

自定义拷贝控制成员：

```c++
class Base {
public:
    Base() = default;
    Base(const Base& other) {
        // 拷贝构造函数的实现
        // 复制基类的成员
        // ...
    }
    Base& operator=(const Base& other) {
        // 拷贝赋值运算符的实现
        // 复制基类的成员
        // ...
        return *this;
    }
};

class Derived : public Base {
public:
    Derived() = default;
    Derived(const Derived& other) : Base(other) {	// 基类部分直接用Base的
        // 拷贝构造函数的实现
        // 复制派生类的成员
        // ...
    }
    Derived& operator=(const Derived& other) {
        if (this != &other) {
            Base::operator=(other); // 调用基类的拷贝赋值运算符
            // 复制派生类的成员
            // ...
        }
        return *this;
    }
};
```

同时有一个比较重要的事项：

<font color=red>如果构造函数或析构函数调用了某个虚函数，我们应该执行与构造函数或者析构函数所属类型相对应的虚函数版本；</font>

#### 继承的构造函数

继承的构造函数的特点：

- 当基类构造函数含有默认实参，这些实参不会被继承，相反派生类将获得多个继承的构造函数；
- 如果基类含有几个构造函数，大多时候派生类会继承所有这些构造函数；
  - 一个例外是派生类可以继承一部分构造函数；
  - <font color=red>一个例外是默认、拷贝和移动构造函数不会被继承；(说实话，没看懂)</font>

### 容器与继承

使用容器存在继承体系中的对象时，通常采用间接存储的方式，因为容器中不允许保存不同类型的元素；

**在容器中放置(智能)指针而非对象**

在继承体系中，对于指向派生类的指针而言，因为要实现派生类向基类的转换，所以一般而言指针也只会指向派生类的基类部分，从而实现派生类向基类的转换；

通过这一特性，对于`vector`而言，可以使得其中所有元素的类型相同；


### 多继承与虚继承

#### 多重继承

**多重继承**(multiple inheritance)是指从多个直接基类中产生派生类的能力；多重继承的派生类继承了所有父类的属性；

**概念建模**

- 定义一个抽象类`Animal`，该类保存自然界动物共有的信息，且提供公共访问接口；

- 定义一个熊科(种类)的类`Bear`；

- 定义一个濒临灭绝的动物类`EndangeredAnimal`；

- 那么以熊猫`Panda`为例，`Panda`可以由`Bear`和`EndangeredAnimal`共同派生而来；

  ```c++
  class Bear : public Animal {};
  class Panda : public Bear, public EndangeredAnimal { };
  ```

  ![](多重继承与虚继承.svg)

派生类能够继承的基类个数C++无特殊规定，但在某个派生类列表中，同一个基类只能出现一次；

#### 多重继承的构造与析构

构造一个派生类对象将同时构造并初始化它的所有基类子对象；

```c++
// EndangeredAnimal类的构造函数是默认构造，因此这里不写
inline
Panda::Panda(std::string name, bool onExhibit)  
      : Bear(name, onExhibit, "Panda") { }	// 构造函数部分交给他继承的基类Bear来处理
```

**构造函数的初始化顺序:** 基类的构造顺序与派生类列表中基类的出现顺序保持一致；下面以`Panda`对象为例：

- `Panda`首先继承的是`Bear`，因此先对`Bear`执行构造函数，但是在执行`Bear`的构造函数过程中，`Bear`又是继承自`Animal`类；
- 因此`Animal`类被首先初始化；
- 其次是继续对`Bear`的初始化；
- 接下来初始化第二个直接基类`Endangered`；
- 最后初始化`Panda`类；

总而言之就是遵循在派生类列表中出现的顺序；

C++11新标准允许派生类从一个或几个基类中继承构造函数，但是如果从多个基类中继承了相同的构造函数(形参列表完全相同)，程序将产生错误；

- **派生类在构造的时候不知道执行哪个**构造函数，从而造成了二义性；
- **解决方案**就是派生类重写自己的构造函数，以覆盖，从而解决二义性问题；

**析构函数的**执行顺序与构造函数完全相反；

**拷贝构造函数**的执行顺序也与构造函数基本一致；

但是，多重继承的派生类如果定义了自己的拷贝/赋值构造函数或者赋值运算符，**必须在完整的对象上**执行相应操作(即必须显式执行)；

#### 类型转换与多个基类

在多重继承的场景下，我们同样可以令某个可访问基类的指针或引用直接指向一个派生类对象；

- 但基类中没有的函数，通过基类的指针去调用该函数，会失败，因为该函数不属于该类；
- 解决方案就是使用虚函数，正确处理多态性；

我们要考虑到一种二义性调用的错误情况：

```c++
void print(const Bear&);
void print(const Endangered&);

Panda ying_yang("ying_yang");
print(ying_yang);	// 二义性错误，不知道调Bear的版本还是Endangered的版本
```

**多重继承下的类作用域:** 查找过程自底向上，但是多重继承的情况下，查找过程在**所有直接基类中**同时进行；

- 意味着如果多个基类中都找到了相同的名字，**则产生二义性。**

#### 虚继承

虚继承主要是为了解决这么一个问题：

- 正常而言，派生类可以多次继承同一个类；
- 那是否每次继承这个类都要创造一个新的子对象呢？
- `iostream`继承自`istream`与`ostream`，而这两个类都继承自`base_ios`；
- 那是否`iostream`对象在构造的过程中，要两次构造`base_ios`子对象呢？
- 第一，没有必要，用一个就够了；
- 第二，`iostream`对象只想操作同一个缓冲区，创建了两个子对象岂不是要操作两个缓冲区？
- 这不符合`iostream`设计的原则；

虚继承令某个类作出声明，表明愿意共享**它的基类**，共享的那个基类子对象称为**虚基类**；

不论虚基类在继承体系中出现多少次，在派生类中都只包含唯一一个共享的虚基类子对象；

**虚基类只影响从指定了虚基类的派生类中进一步派生出的类；**

- 这个理解起来不难，因为从虚基类派生出的类对象本身就只有一个该基类子对象；

**虚继承就是实现了对虚基类的共享机制；**

- 此外还有一个好处就是，虚基类避免了从多个基类中继承到的**虚基类中的同名成员**而产生的二义性问题；

#### 虚继承的构造

这一点需要注意的是，虚基类的构造函数的构造顺序不同于普通的多重继承；

- 虚派生中，虚基类是由最底层的派生类初始化的；
- 这样就会出现这么一个情况：
  - 虚基类总是先于非虚基类被构造，与他们在继承体系中的次序和位置无关；

那如果虚基类也是继承自某个基类呢，会先执行哪个基类的构造函数？

- 还是会先执行虚基类继承的那个基类的构造函数