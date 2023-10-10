---
title: 13-C++标准库之动态内存
author: Ping
date: 2022-11-02 11:34:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

到目前为止，我们编写的程序所使用的对象都有着严格定义的生存期。

**全局对象在程序启动时分配，在程序结束时销毁**；**对于局部自动对象，当我们进入其定义所在的程序块时被创建**，在离开块时被销毁；局部static对象在第一次使用前分配，在程序结束时销毁。

C++支持动态分配对象，这一类对象的生存期与它们在哪里创建无关，只有当显式地被释放时，这些对象才会销毁。

动态对象地正确释放被证明是编程中极易出错的地方，为了更安全的使用动态对象，标准库定义了两个智能指针类型`shared_ptr`与`unique_ptr`来管理动态分配的对象。**当一个对象应该被释放时，指向它的智能指针可以确保自动地释放它**。

在之前学过的内容中，一般都是使用**静态内存或者栈内存**：

- 静态内存用来保存局部`static`对象、类`static`数据成员以及定义在任何函数之外的变量，由编译器自动创建和销毁；
- 栈内存用来保存定义在函数内的非`static`对象，由编译器自动创建和销毁；

而对于一类程序而言，每个程序还拥有一个内存池，这部分内存被称作**自由空间(free store)或堆(heap)**。

程序**用堆来存储动态分配(dynamically allocate)的对象**，也即那些在程序运行时分配的对象。动态对象的生存期由程序来控制。

程序使用动态内存出于以下三种原因之一：

- 程序不知道自己需要使用多少对象；(*容器类*)
- 程序不知道所需对象的准确类型；
- 程序需要在多个对象间共享数据；

*Notes:正确管理动态内存是一件非常棘手的事*。

**总结性陈述:** 

<font color=red>内存区域主要分五大块：</font>

- 栈：由编译器管理分配和回收，存放局部变量和函数参数；
- 堆：由程序员自行管理的动态区域，需要手动`new malloc delete free`进行分配和回收，空间较大，但可能出现内存泄漏和空闲碎片的情况；
- 全局/静态存储区：分为初始化和未初始化两个相邻区域，存储初始化和未初始化的全局变量和静态变量；
- 常量存储区：存储常量，一般不允许修改；
- 代码区：存放程序的二进制代码；

## 动态内存与智能指针

在C++中，动态内存的管理是通过一对运算符来完成的：`new`和`delete`，前者在动态内存中为对象分配空间并返回一个指向该对象的指针，对对象进行初始化；后者接受一个动态指针的对象，并销毁该对象，释放与之关联的内存。

新标准库提供的两种智能指针`shared_ptr`与`unique_ptr`，还定义了一种伴随类`weak_ptr`：

- `shared_ptr`允许多个指针指向同一个对象；
- `unique_ptr`独占所指向的对象；
- `weak_ptr`是一种<font color="red">弱引用</font>，指向`shared_ptr`所管理的对象。

三种类型都定义在`memory`头文件中。

## shared_ptr类

类似`vector`，智能指针也是模板，当我们创建一个智能指针时，必须提供额外的信息——指针可以指向的类型。

```c++
shared_ptr<string> p1;		// shared_ptr，可以指向string
shared_ptr<list<int>> p2;	// shared_ptr，可以指向int的list
```

默认初始化的智能指针中保存着一个空指针。

智能指针的使用方式：

```c++
// 如果p1不为空，检查它是否指向一个空string
if (p1 && p1->empty())
    *p1 = "hi";    // 如果p1指向一个空string，解引用p1，将一个新值赋予string
```

`shared_ptr`和`unique_ptr`都支持的操作：

- `shared_ptr<T> sp、shared_ptr<T> up`——空智能指针，可以指向类型为T的对象；
- `p`——将p作为一个条件判断，若p指向一个对象，则为`true`；
- `*p`——解引用`p`，获得它指向的对象；
- `p->mem`——等价于`(*p).mem`；
- `p.get()`——返回p中保存的指针，如果智能指针释放了其对象，返回的指针所指向的对象也就消失了；
- `swap(p, q)、p.swap(q)`——交换`p`和`q`中的指针；

`shared_ptr`独有的操作：

- `make_shared<T>(args)`——返回一个`shared_ptr`，指向一个动态分配的类型为T的对象，使用`args`初始化此对象。

- `shared_ptr<T> p(q)`——`p`是`shared_ptr q`的拷贝；此操作**会递增q中的计数器**。

- `p = q`——两者都是`shared_ptr`，所保存的指针必须能够相互转换，**此操作会递减p的引用计数。递增q的引用计数**；当引用计数变为0，则将其管理的原内存释放；

  - 为什么说会递减p的引用计数呢？比如说p原来指向某个对象，但是因为被赋值，原来指向的那个对象不指了，因此说递减p的引用计数；
  - 而递增q的引用计数也很好理解，因为q指向的那个对象又有一个新的智能指针指向它了；

- `p.unique()`——若`p.use_count()`为1，则返回true；

- `p.use_count()`——返回与p共享对象的智能指针数量；可能很慢，用于调试。

**`make_shared`函数**

最安全的分配和使用动态内存的方法是调用一个名为`make_shared`的标准库函数，此函数在动态内存中分配一个对象并初始化它，返回指向此对象的`shared_ptr`。

```c++
shared_ptr<int> p3 = make_shared<int>(42);             // 指向一个值为42的int的shared_ptr
shared_ptr<int> p4 = make_shared<string>(10， '9');    // 指向一个值为"9999999999"的string
shared_ptr<int> p5 = make_shared<int>();
```

**类似顺序容器的`emplace`成员，`make_share`用其参数来构造给定类型的对象**。

**`shared_ptr`的拷贝与赋值**

当进行拷贝与赋值操作时，每个`shared_ptr`都会记录有多少个其他(包括自己)`shared_ptr`指向相同的对象(<font color="red">是不是可以解释上面的疑问</font>)：

```c++
auto p = make_shared<int>(42);    // p指向的对象只有p一个引用
auto q(p);    // p和q指向相同对象，此对象有两个引用者
```

我们可以认为每个`shared_ptr`都有一个关联的计数器，通常称之为**引用计数(reference count)**；一个`shared_ptr`的计数器变为0时，它就会自动释放自己所管理的对象：

- 初次看到称为引用计数可能难以避免令人感觉疑惑，因为实质上还是一个指针；

```c++
auto r = make_shared<int>(42);    // r指向的int只有一个引用者，即r
r = q;    // r被赋新值，令它指向另一个地址，递增q指向的"对象的引用计数"，递减r原来指向的"对象的引用计数"

// 最终的结果就是此int被自动释放

// 再举一个例子
shared_ptr<int> p(new int(42));    // 引用计数为1
process(p);    // p被拷贝进临时参数，计数值自增为2
int i = *p;    // 将p指向的地址的值赋给i，p指向i了，引用计数值自减为1
```

*Notes：到底是用一个计数器还是其他数据结构来记录有多少指针共享对象，取决于标准库本身的具体实现。*

当指向一个对象的最后一个`shared_ptr`被销毁时，`shared_ptr`类会自动销毁此对象。它是通过一个**特殊的成员函数——析构函数(destructor)**完成销毁工作的。

当动态对象不再被使用时，`shared_ptr`会自动释放相关联的内存：

```c++
// factory返回一个shared_ptr，指向一个动态分配的对象
shared_ptr<Foo> factory(T arg)
{
    // 处理arg
    // shared_ptr负责释放内存
    return make_shared<Foo>(arg);
}
// 由于factory返回一个shared_ptr，所以我们可以确保它分配的对象会在恰当的时刻被释放
void use_factory(T arg)
{
    shared_ptr<Foo> p = factory(arg);
    // 使用p    
}    // p离开了作用域，它指向的内存会被自动释放掉
```

在上述的例子中，如果有其他`shared_ptr`也指向这块内存，它就不会被释放掉：

```c++
void use_factory(T arg)
{
    shared_ptr<Foo> p = factory(arg);
    // 使用p
    return p; // 返回p时，引用计数进行了递增操作
}    // p离开了作用域，但它指向的内存不会被释放
```

由于在最后一个`shared_ptr`销毁前内存都不会释放，保证`shared_ptr`在无用之后不再保留就非常重要了(是为了节省内存考虑)。

在目前我们所使用的类中，分配的资源都与对应对象生存期一致。

```c++
vector<string> v1;    // 空vector
{
    vector<string> v2 = {"a", "an", "the"};
    v1 = v2;    // 从v2拷贝元素到v1中
}    // v2被销毁，其中的元素也被销毁
```

***但某些类分配的资源具有与原对象相独立的生存期：***比如我们<font color="orange">自定义</font>一个`Blob`的类，保存一组元素，但我们希望`Blob`对象的不同拷贝间共享相同的元素，这样就不能单方面销毁底层数据了。

```c++
Blob<string> b1;    // 空Blob
{    // 新作用域
    Blob<string> b2 = {"a", "an", "the"};
    b1 = b2;    // b1和b2共享相同的元素
}    // b2被销毁了，但b2中的元素不能销毁
```

*Notes：使用动态内存的一个常见原因是允许多个对象共享相同的状态！*

**定义`StrBlob`类**

我们<font color="orange">最终会为上述的Blob类实现一个模板</font>，但在这部分我们尝试先去定义一个管理`string`的类，此版本命名为`StrBlob`。

实现一个新的集合类型来管理元素最简单的方法是使用某个标准库容器来管理元素；采用这种方法，我们可以借助标准库类型来管理元素所使用的内存空间。在本例中使用`vector`来保存元素。

一些注意事项：

- 不能在一个对象内直接保存`vector`，因为一个对象的成员在对象销毁时也会被销毁。
- 保证`vector`中的元素继续存在，则需要将`vector`保存在动态内存中。
- 为了实现所需要的数据共享，为每个`StrBlob`设置一个`shared_ptr`来管理动态分配的`vector`。此`shared_ptr`的成员将记录有多少个`StrBlob`共享相同的`vector`，并在`vector`的最后一个使用者被销毁时释放`vector`。
- 需要确定这个类应该提供什么操作，我们会实现一个`vector`操作的小子集。(修改访问元素的操作`front`和`back`，若是访问不存在元素则抛出异常)
- 类会有一个默认构造函数和一个构造函数，接受单一的`initializer_list<string>`类型参数，此构造函数可以接受一个初始化器的花括号列表。

```cpp
class StrBlob {
    public:
        typedef std::vector<std::string>::size_type size_type;    // 利用自己定义自己？
        StrBlob();
        StrBlob(std::initializer_list<std::string> il);
        size_type size() const { return data->size(); }
        bool empty() const { return data->empty(); }
        // 添加和删除元素
        void push_back(const std::string &t) { data->push_back(t); }
        void pop_back();
        // 元素访问
        std::string& front();    // 引用可作左值，细节
        std::string& back();
    private:
        std::shared_ptr<std::vector<std::string>> data;    // data是一个指针类型
        // 如果data[i]不合法，抛出一个异常
        void check(size_type i, const std::string &msg) const;    // 这是函数声明
};


// StrBlob构造函数，用来创建StrBolb对象
// 两个构造函数都通过初始化列表来初始化其data成员
StrBlob::StrBlob() : data(make_shared<vector<string>>()) {}
StrBlob::StrBlob(initializer_list<string> il) : data(make_shared<vector<string>>(il)) {}

// private中check函数定义
void StrBlob::check(size_type i, const string &msg) const
{
    if (i >= data -> size())
        throw out_of_range(msg);
}

// 元素访问函数定义
string& StrBlob::front()
{
    // 如果vector为空，check会抛出一个异常
    check(0, "front on empty StrBlob");
    return data->front();
}
string& StrBlob::back()
{
    // 如果vector为空，check会抛出一个异常
    check(0, "back on empty StrBlob");
    return data->back();
}
string& StrBlob::pop_back()
{
    // 如果vector为空，check会抛出一个异常
    check(0, "pop_back on empty StrBlob");
    return data->pop_back();
}
```


**`StrBlob`的拷贝、赋值和销毁**  `StrBlob`使用默认版本的拷贝、赋值和销毁成员函数来对此类型的对象进行这些操作，`StrBlob`类中只有一个`shared_ptr`类型的数据成员。

- 拷贝一个`shared_ptr`会递增其引用计数，左侧给右侧赋值会递减左侧指向对象的引用计数。
- 当引用计数值变为0，它所指向的对象会被自动销毁。
- 因此对由`StrBlob`构造函数分配的`vector`，当最后一个指向它的`StrBlob`对象被销毁时，它也会随之被自动销毁。

### 直接管理内存

相对于智能指针，运算符`new`与`delete`去管理内存非常容易出错；

自己直接管理内存的类与使用智能指针的类不同，它们不能依赖类对象拷贝、赋值和销毁操作的任何默认定义。

- 因为默认的构造、拷贝构造都是浅拷贝，一旦成员中存在指针则会出现问题；

***Warning：***截止到此部分的学习内容，建议除非是使用智能指针来管理内存，否则不要分配动态内存。

- **使用`new`动态分配和初始化非`const`对象**

  **自由空间(free store)**分配的内存是无名的，`new`无法为其分配的对象命名，而是返回一个指向该对象的指针：

  `int *pi = new int;    // 在自由空间(或者说堆)内构造一个int型对象，并返回指向该对象的指针。`

  动态分配的对象有如下几个特点：

  - 是默认初始化的，这就意味着：

    - 内置类型或组合类型的对象的值将是未定义的；
    - 类类型对象将用默认构造函数进行初始化；

  - 也可以自行将动态分配的对象进行值初始化：

    - 在类型名后加一对空括号；

  - 对于定义了自己的构造函数的类类型而言，要求值初始化是没有意义的：

    - 无论如何都是通过默认构造函数来初始化；
    - 如果依赖于编译器合成的默认构造函数的内置类型成员，若未在类内被初始化，那么它们的值也是未定义的；

  *Notes：一般会建议对动态分配的对象进行初始。*

  初始化对象：

  ```c++
  int *pi = new int(1024);            // 列表初始化方式，pi指向的对象的值为1024
  string *ps = new string(10, '9');    // *ps为"9999999999"
  
  // vector有10个元素，值依次从0～9
  vector<int> *pv = new vector<int>{0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
  
  // 如果我们提供了一个括号包围的初始化器，可以使用auto，但要求括号中仅有单一初始化器才可以使用auto
  auto p1 = new auto(obj);    // p1指向一个与obj类型相同的对象，自动推断
  auto p2 = new auto{a, b, c};    // 错误，只允许有单一初始化器
  ```

- **用new动态分配const对象**

  ```c++
  const int *pci = new const int(1024);    // 这个应该好理解，分配出来的类型是const变量
  const string *pcs = new const string;    // 理解同上
  ```

  *Notes：定义了默认构造函数的类类型，其const动态对象可以隐式初始化，而其他类型的对象需要显式初始化。*

  **在使用`new`时，需要考虑内存空间被耗尽的情况**：

  - 如果无法进行空间分配，它会抛出一个类型为`bad_alloc`的异常，但是可以通过某些方式阻止：

    ```c++
    int *p1 = new int;    // 这种情况下抛出std::bad_alloc
    int *p2 = new (nothrow) int;    // 如果分配失败，返回一个空指针，而不是抛出异常
    
    // 上面这种形式的new称之为定位new(placement new)
    ```

  - **定位new(placement new)**允许我们向`new`传递额外的参数，其中一个用法如上所示。

- **使用delete将动态内存归还给系统**

  两个动作：销毁给定的指针指向的对象；释放对应的内存。

  使用`delete`的注意事项：

  - 传递给`delete`的指针**必须指向动态分配的内存**，或者是空指针。

    - 也就是说必须得指向`new`出来的内存；

  - 释放一块并非`new`分配的内存或者将相同的指针值释放多次都是未定义的。

  - `delete`一个普通变量，编译器会生成错误信息，而`delete`一个静态对象，编译器无法判断静态动态，会允许编译通过，潜在危害极大。

  - `const`对象的值是可以被`delete`的。

  ~~~cpp
  delete p;   // p必须指向一个动态分配的对象或是一个空指针
  ~~~

**动态对象的生存期直到被释放时为止**，这部分主要分为两种情况介绍：

- 由`shared_ptr`管理的内存在最后一个`shared_ptr`销毁时会被自动释放；
- 内置指针类型(也就是`new`出来的)在被显式释放之前它都是存在的；

返回指向动态内存的普通指针的函数给其调用者增加了额外负担，即得记得释放内存：

```c++
// 一个新版本的factory,指向一个动态分配的对象
Foo* factory(T arg)
{
    // 处理arg的部分
    return new Foo(arg);  // 调用者负责释放此内存
}

void use_factory(T arg)
{
    Foo *p = factory(arg);
    // 使用了p但忘记delete，错误做法
    // 使用p
    delete p;    // 正确做法
}   // p离开了作用域，但是指向的内存没有被释放(加上delete即可)

// 如果系统中还有其他代码需要使用use_factory所分配的对象
// 我们就应修改此函数，即返回指针，指向它分配的内存
```

**delete之后还存在重置指针值的问题**：`delete`之后，指针值变为无效的了，虽然指针无效了，但是很多机器上指针仍然保存着(已经释放了的)动态内存的地址，这就是常说的**空悬指针(dangling pointer)**，未初始化指针的所有缺点空悬指针也有，一般有如下方式去避免空悬指针的问题：

- 在指针即将要离开其作用域之前释放掉它所关联的内存；
- 如果需要保留指针，可以在`delete`之后将`nullptr`赋予指针；

但是上述两种方式无法避免的一个问题就是：`delete`之后重置指针的方法只对该指针有效，对其他任何指向该地址的指针是无效的。

```c++
int *p(new int(42));
auto q = p;     // 俩指针指向相同的内存地址
delete p;       // 俩指针指向的地址都无效
p = nullptr;    // p不再绑定到任何对象

// 那q咋办呢.....
```

<font color="red">所以上面的问题怎么解决呢？</font>

- 用，智能指针！

最后总结，动态内存的直接管理容易出错，主要有三个原因：

- 忘记`delete`内存
- 使用已经释放掉的对象
- 同一块内存释放两次

*Notes：书中会更建议使用智能指针。*

**`new delete`, `malloc free`区别:**

- `new delete`是操作符，`malloc free`是C语言中的库函数；

- `new`的执行过程：

  - 通过`malloc`分配**未初始化**的内存空间，返回空间的首地址，出现问题则抛出`std::bad_alloc`异常；

    ```cpp
    ptr = (int *)malloc(5 * sizeof(int));    // malloc返回的是内存空间地址
    ```

  - 使用对象的构造函数对空间进行初始化，如果这一步出现异常，则自动调用delete释放内存；

- `delete`的执行过程：

  - 使用析构函数对对象进行析构；
  - 通过`free`回收内存空间；

- 以上已经清晰展示了区别: 

  - `new`得到的是经过初始化的空间，`malloc`得到的是未初始化的空间；
  - `delete`包括了对对象的析构，而`free`则只释放空间；

### shared_ptr与new结合使用

在`shared_ptr`类中，已经提过，如果我们不初始化一个智能指针，那么它会被初始化为一个空指针：

```c++
shared_ptr<double> p1;              // shared_ptr可以指向一个double(空)
shared_ptr<int> p2(new int(42));    // p2指向一个值为42的int
```

**接受指针参数的智能指针构造函数是`explicit`的**，因为我们无法将一个内置指针(`new`出来的)隐式转换为一个智能指针，必须使用直接初始化形式来初始化一个智能指针<font color = "red">(这一段话里其实有点东西，涉及到了诸多方面的知识点)</font>。

看完这句话，有点新的理解与体会，参见构造函数章节中的隐式的类类型转换部分。

由于智能指针构造函数是`explicit`的，所以**我们必须显式绑定到一个想要返回的指针上**：

```c++
shared_ptr<int> clone(int p) {
    return shared_ptr<int>(new int(p))
}
```

注意事项：

- 默认情况下，一个**用来初始化智能指针的普通指针必须指向动态内存**，因为**智能指针默认使用`delete`释放**它所关联的对象。
- 若要绑定到其他类型资源的指针上，必须提供自己的操作来替代`delete`。

*<font color="green">书中413页</font>有一表格介绍了如何调用自己所提供的操作来代替`delete`！*

***尽可能不要混合使用普通指针和智能指针！***

如上所示，`shared_ptr`可以协调对象之间的析构，但这仅限于自身之间，所以一般而言会更推荐使用m`ake_shared`而不是`new`，这样的优点在于，在分配对象的同时就将`shared_ptr`与之绑定，从而避免无意中将同一块内存绑定到多个独立创建的`shared_ptr`上。

```c++
int *x(new int(1024));  // x为一普通指针
process(x);             // 错误，无法隐式转换
process(shared_ptr<int>(x));    // 合法，但是内存会被释放
int j = *x;   // 由于内存被释放了，所以x指向的那个地址是未定义的，即x变成了一个空悬指针
```

从上面的代码可以看出来的是：

- 当将一个`shared_ptr`绑定到一个普通指针时，所有管理内存的责任都将移交，**就不该再用内置指针来访问`shared_ptr`所指向的内存了**。

**同时，也不要使用`get`初始化另一个智能指针或者为智能指针赋值：**

```c++
shared_ptr<int> p(new int(42)); // 引用计数为1
int *q = p.get();               // 正确，但使用q要注意，不要让它管理的指针被释放，否则p就没法搞了
{    // 新程序块
    shared_ptr<int>(q);    // 创建一个shared_ptr对象，其指向q所指向的内存
}    // 程序块结束，q被销毁，它指向的内存被释放，因为对智能指针而言，q是一个单独的指针
int foo = *p;    // 寄了
```

这两部分所描述的东西还确实是比较类似的原理，存在着智能指针被释放空间的可能。

**其他`shared_ptr`操作**

主要介绍智能指针的`reset`函数：

- 如果智能指针p是唯一指向对象的`shared_ptr`，`reset`会释放此对象；
- 若传递了可选的参数内置指针q，会令p指向q(<font color="red">是指向q所指的那个对象</font>)，且p原来指向的空间也会被释放；
- 若还传递了参数d，即`p.reset(q, d)`，将会调用d而不是`delete`来释放q；

```c++
// 假设定义了一个shared_ptr指针p
p = new int(1024);        // 错误方法
p.reset(new int(1024));    // 正确，p指向一个新对象

// 与赋值类似，reset会更新引用计数，reset成员经常与unqiue一起使用，来控制多个shared_ptr共享的对象
// 我们在改变底层对象之前，需要检查自己是否是当前对象仅有的用户
if (!p.unique())
    p.reset(new string(*p));    // 我们不是唯一用户，分配新的拷贝
*p += newVal;    // 现在我们知道自己是唯一的用户了(指向了新分配的string类型的变量)，可以改变对象的值
```

### 智能指针和异常

本章节下面的那个章节介绍了异常处理的一系列流程，我们发现使用异常处理的程序在异常发生之后资源可以正确的被释放，一个简单的确保资源被释放的方法是使用智能指针。

```c++
void f()
{
    shared_ptr<int> sp(new int(42));    // 分配一个新对象
    // 这段代码抛出一个异常，且在f中未被捕获
}   // 在函数结束时shared_ptr自动释放内存(或许是正确处理结束或者是发生了异常)

// 而如果使用内置指针管理内存，内存就不会被释放

void f()
{
    int *ip = new int(42);    // 分配一个新对象
    // 这段代码抛出一个异常，且在f中未被捕获
    delete ip;                // 是不是就导致这部分执行不了了
}
```

**智能指针和哑类**

包括所有标准库类在内的很多C++类都定义了析构函数负责清理对象使用的资源。但不是所有的类都是这样良好定义的(<font color="red">哑类?</font>)，特别是那些为C和C++两种语言设计的类，<font color="red">通常都要求用户显式地释放所使用的任何资源</font>。

- 也就是说没有定义析构函数并不是一个彻底的错误，但要求程序员一定要记得释放资源；
- 同时资源分配和释放之间不能发生异常，否则可能也会资源泄漏；

```c++
// 假定我们正在使用一个C和C++都使用的网络库，都没有析构函数
struct destination; // 表示我们正在连接什么
struct connection;  // 使用连接所需信息
connection connect(destination*);   // 打开连接(传入的是指针？)
void disconnect(connection);        // 关闭给定的连接(这是函数声明)
void f(destination &d /* 其他参数 */)
{
    // 获得一个连接；使用完之后记得关闭
    connection c = connect(&d);
    // 使用连接
    // 如果退出之前忘记调用disconnect，就无法关闭c了
}
```

<font color="red">问题：为什么有些函数的参数会传入指针形式？</font>

针对上述问题，我们使用`shared_ptr`来保证`connection`被正确关闭，下面我们定义一个删除器：

```c++
void end_connection(connection *p) { disconnect(*p); }    // 这就是那个定义的删除器

// 创建一个shared_ptr时，可以传递一个(可选的)指向删除器函数的参数
void f(destination &d /* 其他参数 */)
{
    connection c = connect(&d);
    shared_ptr<connection> p(&c, end_connection);    // 下面这种类似的想法可不可以
    shared_ptr<connection> p(&c, disconnect);        // 可能不行，因为他接受的是指针，而声明中并非指针？
    // 使用连接
    // 如果退出之前忘记调用disconnect，就无法关闭c了
}
```

正确使用智能指针的一些基本规范：

- 不使用相同的内置指针值初始化多个智能指针，**因为一个智能指针被销毁，其他的指向就无效了**。
- 不`delete get()`返回的指针，**因为**`p.get()`**返回的指针如果被释放，p自己也没了**。
- 不使用`get()`初始化或`reset`另一个智能指针。原因同上，存在被释放的可能。
- 如果智能指针管理的资源不是`new`分配的内存，记住传递给它一个删除器。
  - 意思就是说自己定义的东西自己记得管理；

## unique_ptr类

顾名思义，某个时刻只有唯一`unique_ptr`指向一个给定对象。与`shared_ptr`不同，**没有类似`make_share`的标准库函数返回一个`unique_ptr`**(C++ 14有)。

- 意味着定义`unique_ptr`需要将其绑定到一个`new`返回的指针上；

- 类似`shared_ptr`(但是`shared_ptr`可通过`make_shared`函数进行`拷贝初始化`)，**初始化`unique_ptr`必须采用直接初始化形式**；

  - 考虑到`unique_ptr`的独特性，`unique_ptr`**不支持普通的拷贝或赋值**工作；
  - 因为`std::unique_ptr`的拷贝构造函数和拷贝赋值运算符被删除(`deleted`)，禁止对其进行拷贝操作；

  ```c++
  unique_ptr<double> p1;            // 可以指向一个double的unique_ptr(空？)
  unique_ptr<int> p2(new int(42));  // p2指向一个值为42的int
  
  unique_ptr<string> p1(new string("Stegosaurus"));
  unique_ptr<string> p2(p1);        // 错误：不支持拷贝，因此p1不能被拷贝
  
  unique_ptr<string> p3;
  p3 = p2;    // 错误：不支持赋值
  ```

一些`unique_ptr`操作：

- `unique_ptr<T> u1;`——空`unique_ptr`，可以指向类型为T的对象，u1会使用`delete`来释放它的指针；

- `unique_ptr<T, D> u2;`——`u2`则使用一个类型为`D`的可调用对象来释放它的指针；

- `unique_ptr<T, D> u(d);`——空`unique_ptr`，指向类型为T的对象，用类型为`D`的对象d代替`delete`；

  这部分可以用其来传递删除器，详见代码：

  ```c++
  // p指向一个类型为objT的对象，并使用一个类型为delT的对象释放objT对象，调用的delT对象名为fcn
  unique_ptr<objT, delT> p(new objT, fcn);
  
  // 重写上述的连接程序，这边使用unique_ptr来代替shared_ptr
  void f(destination &d /* 其他需要的参数 */)
  {
      connection c = connect(&d);    // 打开连接
      // 下面的p被销毁时，连接将会关闭
      unique_ptr<connection, decltype(end_connection)*> p(&c, end_connection);
      // 使用连接
      // f退出时(即便是因为异常而退出)，connection会被正确关闭
  }
  ```

- `u = nullptr;`——释放u指向的对象，将u置为空；

- `u.release();`——**u放弃对指针的控制权(并不会释放内存)**，返回指针的原始指针，而将u置为空；

  - `release`会切断`unique_ptr`和它原来管理的对象间的联系；

  - 需要用另一个智能指针来保存`release`返回的指针，否则我们就要自行负责资源的释放；

    ```c++
    p2.release();           // 错误用法，p2的内存并未释放，且我们丢失了指针
    auto p = p2.release();  // 正确，但我们必须记得delete(p)，因为这个是普通指针
    
    delete p;
    ```

- `u.reset(q);`——如果提供了内置指针`q`，则令`u`指向这个对象，并将`u`置为空；

通过上面的操作，我们也能了解到：

- 即便我们不能拷贝或赋值`unique_str`，但是可以通过调用`release`或者`reset`将指针的所有权从一个`unique_ptr`转移给另一个`unique_ptr`。

```c++
// 将所有权从p1转移给p2
unique_ptr<string> p2(p1.release());    // release将p1置为空，所有权从p1转给了p2

unique_ptr<string> p3(new string("Trex"));
p2.reset(p3.release());    // reset释放了p2原来指向的内存，并将所有权从p3转向p2

// 好像还可以通过move函数实现
```

**传递`unique_ptr`参数和返回`unique_ptr`**

不能拷贝`unique_ptr`的规则有一个例外：*我们可以拷贝或赋值一个将要被销毁的`unique_ptr`。*

```c++
unique_ptr<int> clone(int p) {
    // 正确：从int*创建一个unique_ptr<int>
    // 查资料了解到，对于unique_ptr，当return时，更多的是说转移而不是拷贝
    return unique_ptr<int>(new int(p));    // 也挺能理解的，因为将要被销毁了嘛
}

// 还可以返回一个局部对象的拷贝:
unique_ptr<int> clone(int p) {
    unique_ptr<int> ret(new int(p));
    // ...
    return ret;
}

// 对于上述的两段代码，编译器都知道返回的对象将要被销毁，在这么一个前提之下，编译器执行一种特殊"拷贝"
```

本质上是因为`shared_ptr`管理删除器的方式与`unique_ptr`不同。原因留坑，后续填补。

## weak_ptr

**注意：**该部分有极具理解意义的代码

weak体现在它是**并不控制所指向对象生存期**的智能指针，它**指向由一个shared_ptr管理的对象**。

**weak_ptr绑定到一个`shared_ptr`不会改变`shared_ptr`的引用计数**。

<font color="red">那想想，这玩意儿的用处会是什么呢？</font>

- 核心用处就是为了解决循环引用的问题；

首先，创建一个`weak_ptr`，需要使用`shared_ptr`进行初始化。(*对应上面所说的，指向由`shared_ptr`所管理的对象*。)

```c++
auto p = make_shared<int>(42);
weak_ptr<int> wp(p);    // wp弱共享p；p的引用计数未改变。
```

`weak_ptr`的一些用法：

- `weak_ptr<T> w;`——空`weak_ptr`可以指向类型为T的对象；

- `weak_ptr<T> w(sp);`——T必须能转换为sp指向的类型；

- `w = p;`——p既可以是一个`shared_ptr`也可以是`weak_ptr`。赋值后w与p共享对象；

- `w.reset();`——将w置为空；

- `w.use_count();`——与w共享对象的`shared_ptr`数量；

- `w.expired();`——若`w.use_count = 0`则返回true；

- `w.lock();`——如果`expired`为true，则返回一个空`shared_ptr`；

  ```c++
  // weak_ptr指向的对象可能不存在，所以我们需要调用lock进行判断
  if (shared_ptr<int> np = wp.lock()) {    // 如果np不为空则条件成立
      // 在if中，np与p共享对象
  }    // 在这个范围中使用np访问共享对象是安全的
  ```

 **核查指针类**

  展示一下`weak_ptr`的一个用途，我们将为`StrBlob`类定义一个<font color="red">伴随指针类</font>，命名为：`StrBlobPtr`，会保存一个`weak_ptr`，指向`StrBlob`的`data`成员，这是初始化时提供的。

  **通过使用`weak_ptr`不会影响一个给定的`StrBlob`所指向的`vector`的生存期，但是可以阻止用户访问一个不再存在的`vector`的企图。**

  ```c++
  // 对于访问一个不存在元素的尝试，StrBlobPtr抛出一个异常
  class StrBlobPtr {
      public:
          StrBlobPtr() : curr(0) { }        // 保存当前对象所表示的元素的下标
          StrBlobPtr(StrBlob &a, size_t sz = 0): wptr(a.data), curr(sz) {}    // wptr指向StrBlob中的vector
          std::string& deref() const;        // 解引用
          StrBlobPtr& incr();                // 前缀递增，暂未定义
      private:
          // 检查成功，check返回一个指向vector的shared_ptr
          std::shared_ptr<std::vector<std::string>> check(std::size_t, const std::string&) const;
          // 保存一个weak_ptr,意味着底层vector可能会被销毁
          std::weak_ptr<std::vector<std::string>> wptr;    // wptr指向一个StrBlob中的vector
          std::size_t curr;    // 在数组中的当前位置
  };
  
  // 下面是check函数的定义
  
  std::shared_ptr<std::vector<std::string>> StrBlobPtr::check(std::size_t i, const std::string &msg) const
  {
      auto ret = wptr.lock();    // 检查vector的存在性
      if (!ret)
          throw std::runtime_error("unbound StrBlobPtr");    // 不存在时的情况
      if (i >= ret->size())
          throw std::out_of_range(msg);
      return ret;                // 否则，返回指向vector的shared_ptr
  }
  
  // 接下来是指针操作，本质上就是定义名为deref和incr的函数，分别用来解引用和递增StrBlobPtr
  std::string& StrBlobPtr::deref() const
  {
      auto p = check(curr, "dereference past end");
      return (*p)[curr];    // (*p)是对象所指向的vector
  }    // 对其解引用shared_ptr来获得vector，使用下标提取并返回curr位置上的元素
  
  StrBlobPtr& StrBlobPtr::incr()
  {
      // 如果curr已经指向容器的尾后位置，则不能递增
      check(curr, "increment past end of StrBlobPtr");
      ++curr;        // 推进当前位置
      return *this;
  }
  
  // 为了访问data成员我们的指针类必须声明为StrBlob的friend，同时也要为StrBlob类定义begin和end操作，返回一个指向它自身的StrBlobPtr
  class StrBlobPtr;
  class StrBlob {
      friend class StrBlobStr;
      // 这部分内容与前面对StrBlod中的定义以及声明一致
      // 下面返回首元素和尾后元素的StrBlobPtr
      StrBlobPtr begin() { return StrBlobPtr(*this); }    // 返回的是指向首元素的迭代器，切记
      StrBlobPtr end()
      {
          auto ret = StrBlobPtr(*this, data->size());
          return ret;
      }
  }
  ```

  *上面好像是第一次在`private`部分见到函数声明。*

## 动态数组

`new`和`delete`运算符一次分配/释放一个对象，而某些应用需要一次为很多对象分配内存的功能(vector和string)。

为了支持上述的需求，C++语言和标准库提供了两种一次分配一个对象数组的方法：

- C++定义了另一种`new`表达式语法，可以分配并初始化一个对象数组；
- 标准库包含一个名为`allocator`的类，允许我们将分配和初始化分离；`alloactor`通常会提供更好的性能和更灵活的内存管理能力。

**Notes：**大多数应用应该使用标准库容器而不是动态分配的数组，使用容器更为简单、更不容易出现内存管理错误且可能有更好的性能。

### new和数组

`new`分配数组的做法：

```c++
int *pia = new int[get_size()];        // pia指向第一个int，方括号中的大小必须是整型，且不必是常量。
```

也可以用一个表示数组类型的类型别名来分配一个数组，这样`new`表达式就不需要方括号了：

```c++
typedef int arrT[42];    // 利用类型别名，arrT表示42个int的数组类型
int *p = new arrT;        // 分配一个42个int的数组；p指向第一个int
```

**分配一个数组会得到一个元素类型的指针**

虽然我们通常称`new T[]`分配的内存为动态数组，但这种叫法某种程度上有些误导：

- new分配一个数组时，得到的不是一个数组类型的对象，而是得到一个数组类型的指针。
- 由于并非一个数组类型，因此不能对动态数组调用`begin`或者`end`。

*Notes：动态数组并不是数组类型!*

- **初始化动态分配对象的数组**

  ```c++
  // 默认情况下，new分配的对象都是默认初始化的
  // 可以对数组中的元素进行值初始化，加上一对括号即可
  int *pia = new int[10];           // 默认初始化
  int *pia2 = new int[10]();        // 10个值初始化为0的int
  string *psa = new string[10];     // 10个空string
  string *psa2 = new string[10]();  // 还是10个空string
  ```

  在新标准中，我们还可以

  ```c++
  // 初始化器初始化
  int *pia3 = new int[10]{0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

  // 前面4个通过初始化器初始化，剩余值初始化
  string *psa3 = new string[10]{"a", "an", "the", string(3, 'x')};
  ```

  在上述的代码中，我们需要了解到的几点是：

  - 初始化器数目小于元素数目，剩余元素将进行值初始化；

  - 初始化器数目大于元素数目，则`new`表达式失败，不会分配任何内存；

  *<font color="blue">动态分配一个空数组是合法的：</font>*

  ```c++
  // 体现在代码中是
  char arr[0];    // 举例常规的定义方式，不合法
  char *cp = new char[0];    // 正确，但cp不能解引用，因为大小为0
  ```

  合法原因：

  - `new`分配一个大小为0的数组时，`new`返回一个合法的非空指针；

  - 这种非空指针可以理解为`vector`中的尾后指针；

  - 不能解引用的原因是它不指向任何元素；

- **释放动态数组**

  ```c++
  // 代码用法：
  delete p;        // p必须指向一个动态分配的对象或者为空
  delete [] pa;    // pa必须指向一个动态分配的数组或者为空
  ```

  释放一个指向数组的指针时，空方括号对是必须的，因为它指示编译器此指针指向一个对象数组的第一个元素。

  同时考虑使用类型别名的情况，也不能忽略上述要点：

  ```c++
  typedef int arrT[42];
  int *p = new arrT;    // 分配了一个数组
  delete [] p;          // 方括号是必需的，因为我们当初分配的是一个数组
  ```

- **智能指针和动态数组**

  编译器提供了一个可以管理`new`分配的数组的`unique_ptr`版本，定义方式：

  ```c++
  unique_ptr<int []> up(new int[10]);    // up指向一个包含10个未初始化int的数组
  up.release();    // 自动用delete销毁其指针，销毁的仅仅是up自己而言，而并非原对象
  ```

  如同上部分所描述，`unique_ptr`指向的是一个数组而不是单个对象，因此无法使用运算符，但可以使用下标运算符：

  ```c++
  for (size_t i = 0; i != 10; ++i)
      up[i] = i;    // 为每个元素赋予一个新值
  ```

  一些指向数组的`unique_ptr`的用法：

  - `unique_ptr<T[]> u;`——u可以指向一个动态分配的数组，数组元素类型为T。
  - `unique_ptr<T[]> u(p);`——u指向内置指针p所指向的动态分配的数组。p必须能转换为类型`T*`。
  - `u[i];`——返回u拥有的数组中位置i处的对象。

  与`unique_ptr`不同，`shared_ptr`不直接支持管理动态数组，如果硬是要用`shared_ptr`：
  
  **必须定义自己的删除器：**

  ```c++
  // 为了使用shared_ptr，必须提供一个删除器

  // 第二个参数是可调用对象，用来执行删除器的功能
  shared_ptr<int> sp(new int[10], [](int *p) { delete[] p; });
  
  // 使用我们提供的lambda释放数组
  sp.reset();
  ```

  **注意事项：**`shared_ptr`不直接支持动态数组这一特性会影响我们如何访问数组中的元素！

  - 首先，`shared_ptr`未定义下标运算符。

  - 其次，`shared_ptr`的智能指针不支持指针的算术运算，需要通过`get`获取。

    ```c++
    for (size_t i = 0; i != 10; ++i)
        *(sp.get() + i ) = i;    // 使用get获取一个内置指针
    ```

## allocator类

`new`和`delete`有一些灵活性上的局限，主要体现在：

- `new`将内存分配和对象构造组合在了一起；

  ```c++
  // 可能会导致一些不必要的浪费
  string *const p = new string[n];    // 构造n个空string，指针p是const变量
  string s;
  string *q = p;                        // q指向第一个string
  while (cin >> s && q != p + n)
      *q++ = s;    // 赋予*q一个新值
  const size_t size = q - p;            // 记住我们存储了多少个string
  // 使用数组
  delete[] p;        // p指向一个数组；记得用delete[]释放
  ```

  `new`分配了n个空间，而我们可能根本用不上那么多空间，可能造成了浪费。

- `delete`将对象析构和内存释放组合在了一起；

**标准库allocator类定义在头文件memory中，它帮助我们将内存分配和对象构造分离开来**。

- 提供一种**类型感知**的内存分配方法；
- 分配的内存**是原始的、未构造的**；

类似`vector`，`alloactor`是一个模板，为了定义一个`allocator`对象，我们需要指明这个`allocator`可以分配的对象类型：

```c++
allocator<string> alloc;            // 包含了对象类型信息，即为string，alloc可以为类型为string的对象分配内存
auto const p = alloc.allocate(n);   // 分配n个未初始化的string，为n个string分配了内存
```

- **标准库`allocator`类及其算法**
  - `allocator<T> a;`——定义了一个名为a的`allocator`对象，它可以为类型为T的对象分配内存；
  - `a.allocate(n);`——分配一段<font color="orange">原始的</font>、未构造的内存，保存n个类型为T的对象，返回指向这片空间的指针；
  - `a.deallocate(p, n);`——释放从`T*`指针p中地址开始的内存，这块内存保存了n个类型为T的对象；调用之前，一般需要先调用`destory`。
  - `a.construct(p, args);`——p必须是一个类型为T*的指针，指向一块<font color="orange">原始内存</font>；arg传递给类型为T的构造函数；
  - `a.destroy(p);`——p为`T*`类型的指针，此算法对p指向的对象执行析构函数；

`allocator`分配的内存是**未构造的(unconstructed)**，我们按需要在此内存中构造对象；

新标准中，`construct`成员函数接受一个指针和零个或多个额外参数，用来初始化构造的对象，但同时附带一些注意事项：

```c++
auto q = p;             // q指向最后构造的元素之后的位置，q类型为string
alloc.construct(q++);   // *q为空字符串
alloc.construct(q++, 10, 'c');  // *q为cccccccccc，有个细节，用了++，是为了让首位留空？
alloc.construct(q++, "hi");     // *q为hi
```

- <font color="red">还未构造对象的情况下就使用原始内存是错误的！</font>

- <font color="red">用完对象之后，必须对每个构造的元素调用`destory`来销毁它们。</font>

  ```c++
  while (q != p)
      alloc.destory(--q);    // 释放我们真正构造的string
  
  // 只对构造了的元素进行destory操作
  // 销毁之后可以重新使用这部分内存来保存其他string，也可以归还给系统
  alloc.deallocate(p, n);    // 归还给系统
  ```

  传递给`deallocate`的指针不能为空，它**必须指向由`allocate`分配的内存**。

  **而且传递给`deallocate`的大小参数必须与调用`allocated`分配内存时提供的大小参数有一样的值**。

- **拷贝和填充未初始化内存的算法**

  这是标准库为`allocator`类定义的两个伴随算法，可以在**未初始化内存中**创建对象，都定义在头文件`memory`中：

  - `uninitialized_copy(b, e, b2);`——从迭代器`(b, e)`指出的输入范围中拷贝元素到迭代器b2指定的未构造的原始内存中，要求b2指向的内存必须足够大。

    返回值是一个指向复制结束的最后一个元素后面的位置的指针；

  - `uninitialized_copy_n(b, n, b2);`——从迭代器b指向的元素开始，拷贝n个元素到b2开始的内存中，返回**指向最后一个复制元素之后位置的迭代器**。

  - `uninitialized_fill(b, e, t);`——从迭代器`(b, e)`指定的原始内存范围中创建对象，对象**值均为t**的拷贝。

  - `uninitialized_fill_n(b, n, t);`——从迭代器b指向的内存地址开始创建n个对象，b需要指向足够大的的未构造的初始内存。

  ```c++
    // 举例，假定有一个int的vector，希望将其内容拷贝到动态内存中，我们分配*2的动态内存空间，前一半空间保存vector，后一半保存一个定值
    // vi是vector数组，分配内存，但未构造
    auto p = alloc.allocate(vi.size() * 2);

    // 走拷贝流程，从这里可以看出，该函数返回(递增后的)目的位置迭代器
    auto q = uninitialized_copy(vi.begin(), vi.end(), p);

    // 用42值填充分配出的所有空间
    uninitialized_fill_n(q, vi.size(), 42);
    ```