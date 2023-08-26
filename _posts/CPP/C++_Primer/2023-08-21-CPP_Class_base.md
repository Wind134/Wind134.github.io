---
title: 07-类的基础及运用
author: Ping
date: 2022-10-21 11:40:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

##  类及其成员

### 类的定义

用户自定义的数据类型，增强类型抽象化的层次，数据抽象是一种依赖于**接口**(interface)和**实现**(implementation)分离的编程(以及设计)技术。

在抽象数据类型(abstract data type)中，由类的设计者负责考虑类的实现过程，使用该类的程序员只需要抽象地思考类型做了什么。

默认情况下，拷贝类的对象其实拷贝的是对象的数据成员。

class的定义分为两部分：

1. 头文件(header file)—用来声明该`class`的各种操作行为，头文件通常包含那些只能被定义一次的实体，如类、`const`和`constexpr`变量。

2. 代码文件(program file)—包含了操作行为的具体实现。  

一些形象化的说法，两个不同的杯子，这两个杯子应该分别看成各自的`object`，但他们同属一个`class`。

从这里我们也可以看出的是，一个类是包含了两个文件的，一个CPP文件，一个h头文件。

编译器一般不关心头文件名的形式，因此`.h`作为头文件的后缀只是咱们的一般观念。

其次，当我们读类的程序时，类的作者定义了类对象可以执行的所有动作，比如以`Sales_items`为例，这个类定义了创建一个`Sales_item`对象时会发生什么事情，以及对Sales_item对象进行赋值、加法或输入输出运算时会发生什么事情。我们以`Sales_data`为例，也就是说，`Sales_data`的接口应该包括以下几个操作：

- 一个`isbn`成员函数，用于返回对象的ISBN编号
- 一个`combine`成员函数，用于将一个`Sales_data`对象加到另一个对象上
- 一个名为`add`的函数，执行两个`Sales_data`对象的加法
- 一个`read`函数，将数据从`istream`读入到`Sales_data`对象中
- 一个`print`函数，将`Sales_data`对象的值输出到ostream

### 类的类型

每个类定义了唯一的类型。对于两个类而言，即便他们的成员完全一样，这两个类也是不同的类型。

```c++
Sales_data item1;		// 默认初始化Sales_data类型的对象
class Sales_data item1;	// 同上等价，继承至C语言
```

类也是可以事先声明的，如`class Screen;`

就像把函数的声明和定义分离开来一样，我们也可以仅声明类而暂时不定义它，这种声明我们称作**前向声明(forward declaration)**。

此时的类型我们称之为**不完全类型(incomplete type)**，知道是个类，但是不知道包含哪些成员。

而例外的情况是：

- **要直到类被定义之后数据成员才能被声明成这种类类型**

因为我们必须首先完成类的定义，然后编译器才能知道存储该数据成员需要多少空间。

也正因为此，一个类的成员类型不能是该类自己，不然就死锁了，但是可以允许包含指向它自身类型的引用或指针。

```c++
class Link_screen {
    Screen window;
    Link_screen *next;
    Link_screen *prev;
}
```

### 定义成员函数

***Tips:*** 定义在类内部的函数是隐式的inline函数。

尽管所有成员都必须在类的内部声明，但是成员函数体**可以定义在类内也可以定义在类外。**

先定义一个类，包含若干函数的声明，代码如下：

```c++
struct Sales_data {
    std::string isbn() const { return bookNo; } // 直接定义isbn()成员函数(const表示函数体内的内容不能被修改)
    Sales_data& combine(const Sales_data&);     // combine成员函数
    double avg_price() const;
    std::string bookNo;
    unsigned units_sold = 0;    // 已经给类定义了默认值(卖出去的书本)
    double revenue = 0.0;       // 同上
};
Sales_data add(const Sales_data&, const Sales_data&);
std::ostream& print(std::ostream&, const Sales_data&);
std::istream& read(std::istream&, Sales_data&);
```

- **理解常量成员函数**

  ```c++
  std::string isbn() const { return bookNo; }           // 获取书本的ISBN编号
  // 等价于
  std::string isbn(this) const { return this->bookNo; } // 这是一种更详细的底层写法
  Sales_data total;	// total是一个Sales_data对象
  total.isbn();		// 调用成员函数
  ```

  以`total.isbn()`为例(`this`指的是成员函数的隐式实参，指向对象)：

  - 首先引入`this`，**成员函数通过一个名为this的额外的隐式参数**来访问调用它的那个对象。
  - 编译器负责把total的地址传递给**isbn的隐式形参this**，等价于`Sales_data::isbn(&total)`，即在调用`Sales_data`的`isbn`成员时传入了`total`的地址。
  - 在成员函数内部，我们可以**直接使用调用该函数的对象的成员**，而无须通过成员访问运算符来做到这一点，**因为this所指的也就是这个对象**。
    - 如上部分代码所示；

  接下来解释紧随参数列表之后的`const`关键字，**它的作用是修改隐式this指针的类型**：

  - 默认情况下，`this`的类型是指向类类型非常量版本的常量指针；(这一点应该好理解，类类型的地址是不变的，但是类本身是会变化的。)
  - 在`Sales_data`成员函数中，this的类型是`Sales_data *const`，顶层`const`，代表指针不能变化，但指针指向的对象可以变化；
  - 然而根据初始化规则，因为`this`是<font color="red">指向非常量对象的常量指针，所以我们在默认情况下无法把this绑定到一个常量对象</font>。
  - 因此就通过将this处理为指向常量对象的常量指针，即`const { return bookNo; }`这么一个形式；
    - 此时的const表示this是一个指向常量的指针，<font color=red>这是C++语言的规定</font>。
  - 像这样使用const的成员函数被称作**常量成员函数(const member function)**。
  - **所以const关键字的作用在于，让常量对象也能正常调用isbn成员函数**，更好的匹配代码逻辑；

  通过总结，联系前部分所学，我们知道这么做的依据是：

  - 指向常量的指针可以指向非常量对象，但普通指针不能指向常量对象。

- **类作用域和成员函数**

  类本身就是一个作用域，类的成员函数的定义嵌套在类的作用域之内；

  在类当中，即便成员变量定义在函数声明之后，也不会影响使用；

  - 因为**编译器首先编译成员的声明**，然后才轮到成员函数体；

- **在类的外部定义成员函数**

  要注意的点就是要使得返回类型、参数列表和函数名都得与类内部的声明保持一致。因此以`avg_price()`函数为例，我们可以在外部这么定义函数体：

  ```c++
  double Sale_data::avg_price() const {
      if (units_sold)
          return revenue/units_sold;
      else
          return 0;
  }
  ```

  这里的一个小细节就是，**当编译器看到了avg_price函数，就能知道剩余代码是位于类的作用域内的**。因此函数体内编译器隐式使用了`Sales_data`的成员。

- **定义一个<font color="blue">返回this对象的函数</font>**

  这部分以函数`combine`为例，这个函数作用有点类似于复合赋值运算符`+=`，调用该函数的对象代表的是赋值运算符左侧的运算对象，右侧运算对象则通过显式的实参被传入函数：

  ```c++
  Sales_data& Sales_data::combine(const Sales_data &rhs)
  {
      units_sold += rhs.units_sold;	// 把rhs的成员加到this对象的成员上
      revenue += rhs.revenue;			// 同上
      return *this;					// 返回调用该函数的对象
  }
  ```


### 定义非成员函数

类的作者常常需要需要定义一些辅助函数，尽管这些函数定义的操作从概念上来说属于类的接口的组成部分，但实际上不属于类本身，通常同定义其他函数一样，会把函数的声明和定义分离开来。

如果该类函数在概念是属于类但是不定义在类中，则它一般应与类声明在同一个头文件内，在这种方式下，用户使用接口的任何部分都只需要引入一个文件即可。

- **定义read以及print函数**

  ```c++
  istream &read(istream &is, Sales_data &item)
  {
      double price = 0;
      is >> item.bookNo >> item.units_sold >> price;
      item.revenue = price * item.units_sold;
      return is;	//注意，返回的是引用类型(流嘛)
  }
  ostream &print(ostream &os, const Sales_data &item)
  {
      os << item.isbn() << " " << item.units_sold << " "
          << item.revenue << " " << item.avg_price();
      return os;
  }
  ```

  之所以上面用的是引用类型，是因为**IO类属于不能被拷贝的类型**，因此我们只能通过引用来传递它们；

  因为读取和写入的操作会改变流的内容，所以两个函数接受的都是普通引用；

- **定义add函数**

  add函数接受两个Sales_data对象作为其参数：

  ```c++
  Sales_data add(const Sales_data &lhs, const Sales_data &rhs)
  {
      Sales_data sum = lhs;	// 把lhs的数据成员拷贝给sum
      sum.combine(rhs);		// 调用combine函数，也可以看到，此刻做左值，sum可以被改变
      return sum;
  }
  ```


- **在C++中struct与class的区别**

  在`class`中如果定义变量没有加`private`，那么默认是`private`，而`struct`在默认没有加上`private`的前提下，默认就是公有变量。

  按照书中所说，出于统一编程风格的考虑，当我们希望定义的类的所有成员是`public`时，使用`struct`；

  如果希望成员是`private`，则使用`class`。两者唯一的区别就是默认的访问权限。

## 构造函数

构造函数这部分主要是运用在类的初始化过程，类通过一个或几个特殊的成员函数来控制其对象的初始化过程，这一类的函数叫做构造函数，其任务是初始化类对象的数据成员，无论何时只要类的对象被创建，就会执行构造函数，构造函数本身是一个非常复杂的问题。

类本身可以**包含多个构造函数**，但不同的构造函数之间必须在参数数量或参数类型上有所区别。

不同于其他成员函数，构造函数**不能被声明成const类型**。因为当创建类的一个`const`对象时，直到构造函数完成初始化过程，对象才能真正取得其"常量属性"。

### 默认构造函数

之前定义的`Sales_data`类并未定义任何构造函数，但程序仍然可以正确地编译和运行。在这种个过程中因为我们并未向对象提供初始值，因为它们执行了默认初始化。

类通过一个特殊的构造函数来控制默认初始化过程，这个函数即**默认构造函数(default constructor)**，无须任何实参。

而由编译器创建的构造函数又被称为**合成的默认构造函数(synthesized default constructor)**。

- 某些类的默认构造函数的行为与只接受一个string实参的构造函数功能相同；
- 同时，某些类不能依赖合成的默认构造函数；
- 在为类设置初始值的时候，我们要根据实际情况去设定这些，结合实际去考虑；

因此对于一个普通的类而言，必须定义它自己的默认构造函数，有三个原因：

- 编译器只有在发现类不包含任何构造函数的情况下才会替我们生成一个默认的构造函数，**一旦我们定义了一些其他的构造函数，除非我们单独定义默认的构造函数，否则将没有默认构造函数。**
- 对于某些类而言，**合成的默认构造函数可能执行错误的操作**，联系之前的知识，如果定义在块中的内置类型或复合类型的对象被默认初始化，它们的值很可能是未定义的。试图拷贝或者以其他形式访问此类值将引发错误。
- 有时候编译器不能为某些类合成默认的构造函数。
  - 例如，某类中包含一个其他类类型的成员且这个成员的而类型没有默认构造函数，那么编译器将无法初始化该成员。


当对象被默认初始化或值初始化时自动执行默认构造函数，此时这边分两类情况：值初始化和默认初始化。

- **值初始化：**int一般默认为0，以此类推。

- **默认初始化：**其初始值和变量的类型以及变量定义的位置相关。

针对上述原因的第一个原因，我们列举一段代码：

```c++
class NoDefault {
    public:
    	NoDefault (const std::string&);	// 没有了默认的构造函数，因为自己定义了一个构造函数
    // 假设下面还有其他成员，但没有其他的构造函数了
};
struct A {
    NoDefault my_mem;
};
A a;	// 无法为A合成构造函数，因为my_mem没有默认的构造函数
struct B {
    B() {}              // 执行默认构造，没问题
    NoDefault b_member; // 这是因为b_member没有初始值，可以理解，因为类NoDefault没有默认的构造函数
};
```

### 代码实例

使用下面的参数定义4个不同的构造函数：

- 一个`istream&`, 从中读取一条交易信息。
- 一个`const string&`，表示ISBN编号；一个`unsigned`，表示售出的图书数量，以及一个`double`，表示图书价格。
- 一个`const string&`，表示ISBN编号；编译器将赋予其他成员默认值。
- 一个空参数列表（即默认构造函数）因为定义了其他构造函数，所以必须也要定义一个默认构造函数

    ```c++
    struct Sales_data {
        // 新增的构造函数
        Sales_data() = default;
        Sales_data(const std::string &s) : bookNo(s) {}
        Sales_data(const std::string &s, unsigned n, double p) : bookNo(s), units_sold(n), revenue(p*n) {}
        Sales_data(std::istream &);	// 输入对象参数的构造函数
    };
    ```

- **在类的内部定义构造函数**

  构造函数有四行，第一行：`Sales_data() = default;`

  定义默认构造函数的原因是因为我们既需要其他形式的构造函数，也需要默认的构造函数，在C++11新标准中，如果我们需要默认的行为，那么可以在参数列表后写上`=default`来要求编译器生成构造函数。这部分既可以在类的内部，也可以在类的外部，内部则是内联函数，外部则不是。

  第二第三行的两个构造函数：

  ```c++
  Sales_data(const std::string &s) : bookNo(s) { }	// 只接受一个string类型的参数
  Sales_data(const std::string &s, unsigned n, double p) : bookNo(s), units_sold(n), revenue(p*n) { }	// 这部分构造比较简单，不多赘述
  ```

  这两个定义出现了新的部分，冒号以及冒号和花括号之间的代码，花括号定义了函数体，新出现的部分叫做**构造函数初始值列表(constructor initialize list)**；

  只有一个string类型参数的构造函数将`bookNo`显式初始化了，但是对于`units_sold`以及`revenue`则没有显式地初始化，此时，它将以合成默认构造的方式隐式初始化；

  - 等价于：`Sales_data(const std::string &s) : bookNo(s), units_sold(0), revenue(0) {}`

  构造函数的函数体是空的，因为这些构造函数的唯一目的就是为数据成员赋初值。

- **在类的外部定义构造函数**

  与上述几个构造函数不同的是，以istream为参数的构造函数需要执行一些实际的操作，因此函数体不能为空。

  ```c++
  Sales_data::Sales_data(std::istream &is)
  {
      read(is, *this)	// 把is的内容读取到相应的对象中
  }	// 该函数没有返回类型(构造函数都没有返回类型)
  ```

  这个构造函数比较特殊，没有返回类型，没有构造函数初始值列表(或者说构造函数初始值列表是空的)，但是因为执行了构造函数体，所以对象成员依然可以被初始化。

除了定义类的对象如何初始化之外，**类还需要控制拷贝、赋值和销毁对象时发生的行为**，即分别对应拷贝、赋值和析构；

### 构造函数与赋值

就对象的数据结构而言，初始化和赋值也有类似的区别，如果没有显式地初始化成员，那么该成员将在构造函数体之前执行默认初始化。

- 初始化与赋值的区别会有什么深层次的影响完全依赖于数据成员的类型。

但构造函数的初始值有时必不可少，这种情况发生的情形是：

- 当成员是`const`或者是引用的话，必须进行初始化；
- 当成员属于某种类类型且该类没有定义默认构造函数时，必须进行初始化；

***Notes：***初始化就是给赋一个初始值(简单理解)；

```c++
class ConstRef {
    public:
    	ConstRef(int ii);
    private:
    	int i;
    	const int ci;
    	int &ri;	// 引用必须有个初始值
};
// 上面的例子就是一个类，成员中有const也有引用，且有构造函数，但没有通过初始值初始化
ConstRef::ConstRef(int ii): i(ii), ci(ii), ri(i) {}	// 添加的构造函数
```

***Notes：***尽可能使用构造函数初始值；最好令构造函数初始值的顺序与成员声明的顺序保持一致。

### 委托构造函数

C++11新标准拓展了构造函数初始值的功能，使得我们可以定义所谓的**委托构造函数(delegating constructor)**。

- 委托构造函数使用它所属类的其他构造函数执行它自己的初始化过程。
- 是不是很像派生类执行基类的构造函数的写法；

使用委托构造函数重写Sales_data类，重写后的形式如下：

```c++
class Sales_data {
    public:
    	Sales_data(std::string s, unsigned cnt, double price): 
    		bookNo(s), units_sold(cnt), revenue(cnt * price) {}
    	// 其余构造函数全部委托给另一个构造函数，也就是说可以自行定义构造函数，也可以委托其他类进行构造函数的构造
    	Sales_data(): Sales_data("", 0, 0) { }	// 委托构造函数主要是那个符号':'
    	Sales_data(std::string s): Sales_data(s, 0, 0) {}
    	Sales_data(std::istream &is) : Sales_data() { read(is, *this); }	// 这边的举例是自己委托自己的类
};
```

**通过符号`:`进行委托构造函数的定义**。

当一个构造函数委托给另一个构造函数时，受委托的构造函数的初始值列表和函数体被依次执行；

如果受委托的构造函数的函数体包含代码：

- 那么将会先执行这些代码，然后控制权才会交还给委托者的函数体；

### 隐式的类类型转换

**如果构造函数只接受一个实参，则它实际上定义了转换为此类类型的隐式转换机制**，这种构造函数称作**转换构造函数(converting constructor)**。

以`Sales_data`为例，接受`string`的构造函数和接受`istream`的构造函数分别定义了从这两种类型向`Sales_data`隐式转换的规则。

- 即在需要使用`Sales_data`的地方，我们可以使用`string`或者`istream`作为替代：

  ```c++
  string null_book = "9-999-99999-9";
  // 下面这一行代码构造了一个临时的Sales_data对象，该对象的units_sold和revenue等于0，bookNo等于null_book
  item.combine(null_book);
  
  Sales_data Temp(null_book);   // 一个临时对象
  item.combine(Temp);           // 上面两行等价于这两行
  ```

  *这算是一个比较新颖的知识点，相当于类类型可以进行某种隐式转换。*

  基本的原理可以这么理解：

  - `null_book`是一个`string`类型的变量；
  - `combine`函数的形参是`Sales_data`类类型的引用，当放进去的参数类型是`string`类型时；
  - 相当于放进去了一个`Sales_data`对象，且经过只有一个`string`形参构造函数的处理；
  - 因此，`null_book`也可以看到一个`Sales_data`对象；

但存在几点注意事项：

- 只允许一步类类型转换
  - 假设变成`item.combine("9-999-99999-9")`，编译器就需要多处理一步，先把`9-999-99999-9`转换成`string`，再转换为`Sales_data`类型，则错误。
- 类类型转换不是总有效
  - 主要是考虑到实际情况中，我们所定义的`string`变量不一定是有效的。

**我们可以抑制构造函数定义的隐式转换**

在要求隐式转换的程序上下文中，我们可以通过将构造函数声明为`explicit`加以阻止：

```c++
class Sales_data {
public:
    Sales_data() = default;
    Sales_data(const std::string &s, unsigned n, double p) : bookNo(s), units_sold(n), revenue(p*n) { }
    explicit Sales_data(const std::string &s) : bookNo(s) { }	// 这样就使得没有任何构造函数能用于隐式地创建Sales_data对象
    explicit Sales_data(std::istream&);
    // 其他成员与之前的版本一致
};
```

关键字`explicit`只对一个实参的构造函数有效。

需要多个实参的构造函数不能用于执行隐式转换，所以无需将这些构造函数指定为`explicit`的；

此外，只能在类内声明构造函数时使用`explicit`关键字，在类外部定义时不应重复；

当使用`explicit`构造函数时，那么**它将只能用于直接初始化，而不能使用于拷贝形式的初始化过程**。

```c++
Sales_data item1(null_book);	// 直接初始化，没问题
Sales_data item2 = null_book;	// 错误，explicit构造函数无法用于拷贝初始化
```

- 拷贝初始化的过程就相当于是，把等号右边的值当作构造函数中的一个参数，随便举例：

  ```c++
  string s = "1234";
  Sales_data x1 = s;
  
  // 实质上是等价于
  Sales_data x1(s);	// 发生了隐式转换(一步之内是可以隐式转换的)
  ```

- 然而因为`explicit`关键字会**抑制隐式转换**，所以上面的拷贝初始化就无法完成，只能是直接给到构造函数一个参数，然后初始化，即直接初始化。

**显式地强制进行类型转换**

就是说，即便是有`explicit`关键字在，也可以通过显式的方式强制实现类型转换；

```c++
item.combine(Sales_data(null_book));	// 实参是一个显式构造的Sales_data对象
item.combine(static_cast<Sales_data>(cin));	// static_cast可以使用explicit的构造函数(显式的类型转换，创建了一个临时的Sales_data对象。)
```

## 访问控制与封装

经过以上的几个部分，我们成功为类定义了接口，但没有任何机制强制用户使用这些接口，类还没有封装，用户可以直达`Sales_data`对象的内部并且控制它的具体实现细节。

我们可以使用**访问说明符(access specifiers)**加强类的封装性，也即`public`以及`private`说明符。因为我们更新一下上述类的定义情况：

```c++
class Sales_data {
public:	// 添加了访问说明符，公有变量    
    // 新增的构造函数
    Sales_data() = default;
    Sales_data(const std::string &s) : bookNo(s) {}
    Sales_data(const std::string &s, unsigned n, double p) : bookNo(s), units_sold(n), revenue(p*n) {}
    Sales_data(std::istream &);
    std::string isbn() const { return bookNo; }
    Sales_data &combine(const Sales_data&);
private:	// 私有变量
    double Sale_data::avg_price() const 
    { return units_sold ? revenue/units_sold : 0;}	// 双目运算符
    std::string bookNo;
    unsigned units_sold = 0;
    double revenue = 0.0;
};
```

**封装的两个优点：**

- 确保用户代码不会无意间破坏封装对象的状态。
- 被封装的类的具体实现细节可以随时改变，而无须调整用户级别的代码，因为用户级别的代码只能调动`public`部分，`public`一改，就会影响到用户级代码。

### 友元

同样由上引申，由于`Sales_data`定义的数据成员是`private`的，所定义的`read、print、add`函数就无法正常编译了，**因为它们并非类的成员，无法访问private**。

因此，类可以允许其他类或者函数访问它的非公有成员，方法是令其他类或者函数成为它的**友元(friend)**。

- 友元声明只能出现在类定义的内部，但位置不限。
- 友元不是类的成员，也不受它所在区域访问控制级别的约束；
- 我们会建议在类定义开始或者结束前的位置集中声明友元；
- **友元仅仅是指定了访问的权限，而非一个通常意义上的函数声明**。因此**如果希望类的用户能够调用某个友元函数，最好再提供一个独立的函数声明**；

**整理：**通过上述的整个知识体系的构建，我们已经了解到C++语言中关于类的许多语法要点，比如，类的一些特性、类通过访问说明符屏蔽自身的实现细节同时也提供给用户代码接口、类同样需要通过构造函数进行初始化、在定义了其他构造函数之后我们也需要补上一个默认构造函数等等。

将上述总结的那些关于类的特性运用到最终代码上，代码：

```c++
class Sales_data {

// 这三个友元让外部代码能访问到private部分
friend Sales_data add(const Sales_data&, const Sales_data&);
friend std::ostream &print(std::ostream&, const Sales_data&);
friend std::istream &read(std::istream&, Sales_data&);
public:
    Sales_data() = default;
    Sales_data(const std::string &s) : bookNo(s) {}
    Sales_data(const std::string &s, unsigned n, double p) : bookNo(s), units_sold(n), revenue(p*n) {}
    Sales_data(std::istream &);
    std::string isbn() const { return bookNo; }
    Sales_data &combine(const Sales_data&);
private:
    double Sale_data::avg_price() const 
    { return units_sold ? revenue/units_sold : 0;}
    std::string bookNo;
    unsigned units_sold = 0;
    double revenue = 0.0;
};
// 下面三行是类的非成员函数的声明，默认它们，无法访问private部分。
Sales_data add(const Sales_data&, const Sales_data&);
std::ostream &print(std::ostream&, const Sales_data&);
std::istream &read(std::istream&, Sales_data&);

// 函数的具体定义，先行略过。
```

上述例子只是将三个普通的非成员函数定义成了友元。类还可以把其他类定义成友元，也可以将其他类的成员函数定义成友元。此外，友元函数能定义在类的内部，这样的函数是隐式内联的。

比如现在有两个有关联的类，其中一个有访问另一个类私有成员的需求，此时就应该将那个需要访问数据的类指定成友元。

如果一个类指定了友元类，则该友元类的成员函数可以访问此类包括非公有成员在内的所有成员。

还是利用下述的两个相互关联的类来举例：

```c++
class Screen {
    // Window_mgr的成员可以访问Screen类的私有部分
    friend class Window_mgr;
    // Screen类的剩余部分
};
class Window_mgr {
public:
    // 窗口中每个屏幕的编号，在类中数据类型为size_type
    using ScreenIndex = std::vector<Screen>::size_type;
    void clear(ScreenIndex);
private:
    std::vector<Screen> screens{Screen(24, 80, ' ')};	// 初始化列表
};

class Screen {
    // 一个替代方案，声明成员函数为友元
    friend void Windows_mgr::clear(ScreenIndex);
    // ....
}

void Window_mgr::clear(ScreenIndex i)	// 将第i个窗口清空，即clear的功能
{
    Screen &s = screens[i];		// 引用可以做左值，改变我们想要改变的对象
    s.contents = string(s.height * s.width, ' ');
}
```

**需要注意：**友元关系不存在传递性；每个类负责控制自己的友元类或友元函数；重载函数需要单独定义友元，重载函数不代表函数一样；

上述将整个类作为友元类的做法还可以进一步拓展，主要发挥作用的是`clear`函数，因此我们进一步将另一个类所需要访问`private`部分的函数设置为友元函数，也是很好的方法。

但在这部分，需要注意的点有以下几点(基于`Window_mgr`类以及`Screen`类)：

- 首先定义`Window_mgr`类，然后声明`clear`函数，但是此时无法定义，因为`clear`用到了`Screen`中的内容，因此必须先声明`Screen`。
- 定义`Screen`，包括对于`clear`的友元声明。
- 最后定义`clear`函数。

## 对类的特性的补充

这部分将介绍`Sales_data`中没有体现出来的一些特性，为了展示这些特性，我们需要定义一对相互关联的类，即`Screen`(显示器中的一个窗口)和`Windows_mgr`(包含一个`Screen`类型的`vector`)。

```c++
// 定义一个类
class Screen {
public:
	typedef std::string::size_type pos;   	// 将无符号类型别名为pos类型
private:
    pos cursor = 0; // 光标的位置
    pos height = 0, width = 0;  // 窗口长宽
    std::string contents;       // 窗口内容
};
// 上面代码将pos放在public部分还是很巧妙的，这样子用户只需要用pos，因为这部分包含了屏幕的长宽位置等信息
// 同时内容contents由于在private,外部函数访问不到，保证了安全
```

要使类更加实用，还需要添加一个构造函数令用户能够定义屏幕的尺寸和内容，以及其他两个成员，分别负责移动光标和读取给定位置的字符。

```c++
// 以下代码只写上新添加的部分
class Screen {
public:    
    Screen() = default;	// 添加必要的默认构造函数，因为Screen还有其他的构造函数
    Screen(pos ht, pos wd, char c): height(ht), width(wd), contents(ht * wd, c) {}	// 定义的构造函数，如不存在初始值，则就从private初始化
    char get() const { return contents[cursor]; }   // 隐式内联，类内部的成员函数默认内联
    inline char get(pos ht, pos wd) const;          // 显式内联声明，读取给定位置的字符
    Screen &move(pos r, pos c);                     // 声明移动光标的函数，参数代表了行列的位置
private:
    /* 这部分同上 */
};
inline	// 无须在声明和定义处同时说明inline,但这么做是合法的，可以使类更容易理解
Screen &Screen::move(pos r, pos c)
{
    pos row = r * width;    // 计算行的位置
    cursor = row + c;       // 在行内将光标移动到指定的列
    return *this;           // 以左值的形式返回对象，因为对象被改变了
}
char Screen::get(pos r, pos c) const
{
    pos row = r * width;
    return contents[row + c];
}
```

**重载成员函数：**

```c++
Screen myscreen;
char ch = myscreen.get();	// 调用Screen::get()，返回此刻光标处的内容
ch = myscreen.get(0, 0);	// 调用Screen::get(pos, pos)，返回指定位置光标处的内容
// 我们看到的是，这边调用了不同版本的函数
```

### 可变数据成员

**可变数据成员(mutable data member)**可以帮助我们实现这么一个功能：我们希望能修改类的某个数据成员，即便是在一个`const`成员函数内。具体实现即在变量的声明中加入`mutable`关键字来做到这一点。

**可变数据成员(mutable data member)**永远不会是`const`，即使是`const`对象的成员，一个`const`成员函数可以改变一个可变成员的值。

我们加入一个名为`access_ctr`的可变成员，通过它追踪每个`Screen`的成员函数的调用次数：

```c++
class Screen {
    public:
    	void some_member() const;
    private:
    	mutable size_t access_ctr;	// 即使在一个const对象内也能被修改
};
void Screen::some_member() const
{
    ++access_ctr;	// 保存一个计数值
}
```

<font color=red>可变数据成员的使用意义在哪呢？</font>
- 这是曾经提出来的一个问题；
- 确实用得不多；

### 类数据成员的初始值

接下来定义一个窗口管理类并用它表示显示器上的一组`Screen`。

也即这个类将包含一个`Screen`类型的`vector`，每个元素表示一个特定的`Screen`，命名为`Window_mgr`。

默认情况下，我们希望`Window_mgr`类开始时总是拥有一个默认初始化的`Screen`。

**在C++11新标准中**，最好的方式就是把这个默认值声明成一个类内初始值：

```c++
class Window_mgr {
    private:
    	// 默认情况下，一个Window_mgr包含一个标准尺寸的空白Screen
        // {}内的元素代表了数组的内容，也就是说，这个数组就一个这样的screens对象
    	std::vector<Screen> screens{24, 80, ' '};
};
```

### 返回*this

继续给这个类添加一些函数，它们负责设置光标所在位置的字符或其他任一给定位置的字符：

```c++
class Screen {
    public:
    	Screen& set(char);			// 设置光标所在位置的字符
    	Screen& set(pos, pos, char);// 设置指定位置的字符
};
inline Screen &Screen::set(char c)
{
    contents[cursor] = c;	// 设置值，cursor是光标的意思
    return *this;			// 将this对象作为左值返回
}
inline Screen &Screen::set(pos r, pos col, char ch)
{
    contents[r * width + col] = ch;	// 设置值
    return *this;					// 将this对象作为左值返回
}
```

**再次总结：**set成员的<font color="blue">返回</font>值是调用set的对象的引用。<font color="blue">返回引用的函数是左值</font>，意味着这些函数<font color="blue">返回的是对象本身</font>而非对象的副本。因此一系列的操作可以连接在一条表达式中：

```c++
myScreen.move(4, 0).set('#');   // 将光标移动到一个指定的位置，并设置该位置的字符值
myScreen.set(4, 0, '#');        // 同样的功能
// 上述表达式可以分为两步进行：
myScreen.move(4, 0);    // move函数同样是调引用，因此也是返回左值，可以理解为，此处得到一个新的myScreen
myScreen.set('#');      // 这两步等价于第一行的一步
```

如果不用引用，那么上述`myScreen.move(4, 0).set('#');`就无法达到我们想要的结果，也即改变不了`myScreen`，而是等价于：

```c++
Screen temp = myScreen.move(4, 0);  // 拷贝了返回值，并未改变myScreen
temp.set('#');	                    // 只能改变临时副本
```

- **从const成员函数返回`this`**

  继续添加一个名为`display`的操作，该操作负责打印`Screen`中的内容。我们希望这个函数能和`move`以及`set`出现在同一序列中：

  - (我想这句话的意思是类似`myScreen.move(4, 0).set('#');`这种操作)

  因此也应该返回执行它的对象的引用(结合上述说明)。

  而显示一个`Screen`不需要改变它的内容，因此我们令`display`为`const`成员，此时，`this`将是一个指向`const`的指针而`*this`是`const`对象。

  但是我们定义的`myScreen`是个非常量对象，因此无法写成：`myScreen.display(cout).set('*');`

  ***Notes：***`const`成员函数如果以引用的形式返回`*this`，那么它的返回类型将是常量引用。

- **基于`const`的重载**

  主要是为了解决上述返回`*this`的问题，常量对象无法调用非常量版本的函数，即便在非常量对象上可以调用常量或者非常量版本，但是最好是用非常量版本去匹配非常量对象。

  下面定义个一个名为do_display的私有成员，由它负责打印Screen的实际工作，所有的display操作将调用这个函数，然后返回执行操作的对象：

  ```c++
  class Screen {
      public:
      	// 根据对象是否是const，重载了display函数
      	Screen& display(std::ostream &os)	{ do_display(os); return *this; }			// 非常量用这个版本
      	const Screen& display(std::ostream &os) const { do_display(os); return *this; }	// 常量用这个版本
      private:
      	// 该函数负责显示Screen的内容
      	void do_display(std::ostream &os) const { os << contents; }
  		// 其他成员与之前版本一致
  };
  ```

  书中对此段话有描述：**当一个成员调用另外一个成员时，`this`指针在其中隐式地传递**；

  - 之所以说是传递，主要是因为`this`指向的是指针的对象，那不就只能是传递了；

  *建议：对于公共代码尽量使用私有功能函数。*

## 字面值常量类

字面值类型的类可能含有`constexpr`函数成员，这样的成员必须符合`constexpr`的所有要求；字面值常量类的特点：

- 数据成员都必须是字面值类型。
- 类必须至少含有一个`constexpr`构造函数。
- 如果一个数据成员含有类内初始值，则内置类型成员的初始值必须是一条常量表达式；如果成员属于某种类类型，则初始值必须使用成员自己的`constexpr`构造函数。
- 类必须使用析构函数的默认定义，该成员负责销毁类的对象。

### constexpr构造函数

**众所周知，构造函数是不能`const`的，但是字面值常量类的构造函数可以是`constexpr`的，且一个字面值常量类必须至少提供一个`constexpr`构造函数**。

`constexpr`构造函数可以声明成`default`的形式(或者是`delete`函数的形式)，否则：

`constexpr`既要符合构造函数的要求(即不能包含返回语句)，又要符合`constexpr`函数的要求(它能拥有的唯一可执行语句就是返回语句)；

同时满足这两点几无可能，因此constexpr构造函数函数体一般是空的：

```c++
class Debug {
    public:
    	constexpr Debug(bool b = true): hw(b), io(b), other(b) {}
    	constexpr Debug(bool h, bool i, bool o): hw(h), io(i), other(o) {}
    	constexpr bool any() { return hw || io || other; }
    	void set_io(bool b) { io = b; }
    	void set_hw(bool b) { hw = b; }
    	void set_other(bool b) { hw = b; }
    private:
    	bool hw;	// 这三个数据成员必须都要被constexpr构造函数初始化
    	bool io;
    	bool other;
};
constexpr Debug io_sub(false, true, false);             // 调试IO，因为只有IO为true
if (io_sub.any())
    cerr << "print appropriate error messages" << endl; // 打印恰当的错误信息
constexpr Debug prod(false);    // 不调试IO
if(prod.any())
    cerr << "print an error message" << endl;
```

## 类的静态成员

有时候类需要它的一些成员与类本身直接相关，而不是与类的各个对象保持关联。

举一个现实例子，一个银行账户类可能需要一个数据成员来表示当前的基准利率，从实现效率的角度，没必要每个对象都存储利率信息，一旦利率浮动，我们希望所有对象都能使用新值。

***Notes：***类静态成员需要初始化，否则其默认值是未定义的。

### 静态成员的声明

在成员的声明之前加上关键字static使得其与类关联在一起：

```c++
class Account {
    public:
    	void calculate() { amount += amount * interestRate; }

        // 疑惑点：加上static就是从底层去优化了物理空间的存储？
        // 但是成员函数本身就不算在类的大小当中，因此应该不是为了节省类的空间
    	static double rate() { return interestRate; }
    	static void rate(double);
    private:
    	std::string owner;
    	double amount;
    	static double interestRate;
    	static double initRate();
};
```

**说明：**类的静态成员存在于任何对象之外，对象中不包含任何与静态数据成员有关的数据。

以上述代码为例，每个`Account`对象将包含两个数据成员：`owner`和`amount`。只存在一个`interestRate`对象而且它被所有`Account`对象共享。

且静态成员函数本身也不与任何对象绑定在一起，他们也不包含`this`指针。

作为结果，静态成员函数也不能声明成`const`的，因为不再指向一个固定的对象。

(<font color = 'red'>所以确实是一个偏向于底层的存储空间优化</font>)

### 类静态成员的使用

我们使用作用域运算符直接访问静态成员：

```c++
double r;
r = Account::rate();	// Account是这个类名，因此需要用作用域运算符进行访问。
```

虽然底层上静态成员并不属于类的某个对象，**但是宏观上，我们仍然可以使用类的对象、引用或者指针来访问静态成员**：

```c++
Account ac1;
Account *ac2 = &ac1;    // 定义指针
r = ac1.rate();         // 用法与一般成员并无本质区别
r = ac2->rate();
```

同时，成员函数也不用通过作用域运算符就能直接使用静态成员。

### 类静态成员的定义

如上所言：类静态成员需要初始化，否则其默认值是未定义的；

既可以在类的内部，也可以在类的外部定义静态成员函数。

**当在类的外部定义静态成员时，不能重复`static`关键字**，该关键字只能出现在类内部的声明语句，定义示例：

```c++
void Account::rate(double newRate)
{
    interestRate = newRate;	// 初始化
}
```

**因为静态数据成员不属于类的任何一个对象，所以他们不是在创建类的对象时被定义的，即他们不是由类的构造函数初始化的。**

**一般而言不能在类的内部初始化静态成员而是必须在外部定义和初始化。**

```c++
double Account::interestRate = initRate();	// 定义并且初始化一个静态成员
```

*Notes:* 要想确保对象只定义一次，最好的办法是把静态数据成员的定义与其他非内联函数的定义放在同一个文件中。

### 静态成员的类内初始化

通常情况下，类的静态成员不应该在类的内部初始化。**但可以为静态成员提供const整数类型的类内初始值**，但是**要求静态成员必须是字面值常量类型的`constexpr`**。

初始值必须是常量表达式，因为这些成员本身就是常量表达式。

```c++
class Account {
    public:
    	// 同上，省略
    private:
    	static constexpr int period = 30;	// period是常量表达式
    	double daily_tbl[period];
};
```

如果某个静态成员的应用场景仅限于编译器可以替换它的值的情况，则一个初始化`const`或者`constexpr static`不需要分别定义(即可以定义在一处)。

如果我们将它用于值不能替换的场景中，则该成员必须有一条定义语句。

***Notes：***即便一个常量静态数据成员在类内部被初始化了，**通常情况下也应该在类的外部定义一下该成员**。

**静态成员能用于某些场景，而普通成员不能，如：**

- 静态数据成员的类型可以就是它所属的类类型。而非静态成员则受到限制，只能声明成它所属类的指针或引用：

  ```c++
  class Bar {
      public:
      	// ...
      private:
      	static Bar mem1;    // 正确且合法
      	Bar *mem2;          // 正确且合法，因为可以定义类的指针或者引用
      	Bar mem3;           // 错误，对于一般成员而言(非静态)，此时这个类都没有定义完成，此时根本不知道这个类是什么，陷入一种，死锁状态。
  };
  ```


**不完全类型(incomplete type)：**已经声明但是尚未定义的类型。不完全类型不能用于定义变量或者类的成员，但是用不完全类型定义指针或者引用是合法的。

**静态成员和普通成员的另外一个区别就是我们可以使用静态成员作为默认实参**

- 非静态数据成员不能作为默认实参，因为它的值本身就属于对象的一部分，这么做的结果是无法真正提供一个对象以便从中获取成员的值，最终将引发错误；
- 静态类型可以作为实参是因为静态类型一般已经被初始化了，可以获取到成员的值；
- 更底层的解释是：
  - <font color=red>静态成员在编译时就已经确定，而默认实参也需要在编译时确定，所以静态类型是可以作为默认实参的值的。</font>
  - <font color=red>动态成员在运行时才能确定，无法在编译时确定其具体的值，所以动态类型不可以作为默认实参。</font>

```c++
class Screen {
    public:
    	Screen& clear(char = bkground); // 默认实参
    private:
    	static const char bkground;     // 是不是可以在外部定义值！
};
```

## 类的作用域

每个类都会定义它自己的作用域，在类的作用域之外，普通的数据和函数成员只能由对象、引用或者指针使用成员访问运算符来访问，对于类类型成员则使用作用域运算符来访问。

```c++
Screen::pos ht = 24, wd = 80;   // 这里本质上是无符号整数类型
Screen scr(ht, wd, ' ');        // 运用了之前的构造函数
Screen *p = &scr;               // 定义了一个指向scr对象的指针
char c = scr.get();             // 访问scr对象的get成员
c = p->get();                   // 本质上同上
```

**名字查找(name lookup)的过程：**在名字所在块中寻找声明语句-->若未找到，查找外层作用域-->若最终未找到匹配的声明，程序报错；在类中首先编译成员的声明，直到类全部可见再编译函数体。

**用于类成员声明的名字查找：**主要是有一点说明，类中的函数体**只会在整个类可见后才被处理**，因此**如果函数体要返回类内类外都定义过的某个变量，会优先返回类内变量**。

当成员定义在类的外部时，名字查找不仅要考虑类定义之前的全局作用域中的声明，还需要考虑在成员函数定义之前的全局作用域中的声明。

<font color = 'red'>其实本质上就是，函数在定义之前最好要声明，这样有利于对函数的查找，也是一个比较好的习惯。</font>

**类型名的特殊处理：**内层作用域可以重新定义外层作用域中的名字，即便名字已经在内层作用域中使用过。但在类中：

如果成员使用了外层作用域中的某个名字，且该名字代表一种类型，则类不能在之后重新定义该名字；

即便有些编译器仍然可以通过编译。

## 聚合类

**聚合类(aggregate class)**使得用户可以直接访问其成员，并且具有特殊的初始化语法形式。几个特点：

- 所有成员都是`public`的。
- 没有定义任何构造函数。
- 没有类内初始值。
- 没有基类，也没有`virtual`函数。

```c++
struct Data {	// 就是struct类型而已？
    int ival;
    string s;
};
```

初始化聚合类成员的方法：

```c++
Data vall = {0, "Anna"};
```

初始值的顺序必须与声明的顺序一致，且若初始值列表中的元素个数少于类的成员数量，则靠后的成员被值初始化；

---