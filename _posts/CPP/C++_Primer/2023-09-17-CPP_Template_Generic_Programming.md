---
title: 14-模板与泛型编程
author: Ping
date: 2023-06-30 10:33:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

面向对象编程与泛型编程都能处理在编写程序时不知道类型的情况，但：

- OOP可以处理类型在程序运行之前都未知的情况；
- 泛型编程中在编译时就能获知类型了；

模板是泛型编程的基础，我们不必了解模板是如何定义的就能使用它们；

C++语言中既有**类模板**(class template)，也有函数模板，`vector`是其中一个类模板。

**模板本身并不是类或者函数，相反可以将模板看作编译器生成类或函数编写的一份说明**；

编译器根据模板创建类或函数的过程称为**实例化**(instantiation)，当使用模板时，需要指出编译器应把类或函数实例化化成何种类型。

接下来这部分针对C++的模板进行一个全面的介绍。

## 定义模板

当我们想要定义一个比较大小的函数，随着形参类型的不同，我们需要为每个类型的形参都去定义一种函数，显然效率极低；

### 函数模板

我们定义一个通用的**函数模板**(function template)，而不是为每个类型都定义一个新函数，以`compare`为例：

```c++
// T其实是一个类型，这个类型他不一定定义了大于小于的运算符，这就是又可以展开来讲的内容了
template <typename T>
int compare(const T & v1, const T &v2)
{
    if (v1 < v2)    return -1;
    if (v2 < v1)    return 1;
    return 0;
}
```

模板以关键字`template`开始，后跟一个**模板参数列表**(template parameter list)，这是一个逗号分隔的一个或多个**模板参数**的列表，用`< >`包围起来；

- <font color=red>模板参数不可为空；</font>

- 使用模板时，我们(隐式或显式)指定**模板实参**(template argument)，将其绑定到模板参数上；

  - 通过代码展示，显式或隐式的情形：

    ```c++
    // 我定义了这么一个函数模板
    template <typename T>
    void printValue(T value) {
        std::cout << value << std::endl;
    }

    printValue<int>(x);   // 显式指定模板参数类型为int
    printValue(y);        // 隐式推导模板参数类型，具体类型取决于y的类型
    ```

同时我记录一下我对`typename`的理解：

- 在C++中`typename`指明其后的参数是类型，而不是值；

- 在非类型模板参数中`typename`允许我们使用非类型名表示类型，而不产生与现有非类型模板参数的冲突；
 
  ```cpp
  // 下面是一个类模板，value_type是一个类型的表示
  // 该类中又包含一个类Inner，其中又定义了一个value_type为T*类型
  template <typename T>
  struct MyContainer {
      // using与typename配合使用，使得知道T是一个类型
      using value_type = T;
      struct Inner {
      using value_type = T*;
      };
  };

  // 这是一个函数模板，将Container本身作为一个类型
  template <typename Container>
  void printValueType() {
      // 使用typename标识嵌套的类型别名value_type
      // 如果没有typename关键字，没人知道value_type是关键字还是
      // 成员变量，同时没有该关键字，编译器默认会将其视为一个静态成员
      // 变量，因此在这里typename起到的作用是让非类型名表示类型
      // 或者也可以理解为Container是一个模板类，因此我们需要在
      // 该类前面加上typename关键字
      typename Container::value_type value;
      std::cout << "Type: " << typeid(value).name() << std::endl;
  }  
   ```

- 访问嵌套类或嵌套类型时进行作用域解析；

模板的使用有如下几个阶段：

- **实例化函数模板**

  编译器用函数实参为我们**推断**模板实参，再用推断出来的模板参数为我们**实例化**(instantiate)一个特定版本的函数；

  ```c++
  // 实例化int compare(const int&, const int&)
  cout << compare(1, 0) << endl;    // T为int
  
  // 实例化int compare(const vector<int>&, const vector<int>&)
  cout << compare(vec1, vec2) << endl;  // T为vector<int>
  ```

  这些编译器生成的版本通常被称为模板的**实例**(instantiation)。

- **模板类型参数**

  上述的`compare`函数有一个模板**类型参数(type parameter)**，即T，我们可以像使用类类型或者内置类型说明符一样使用类型参数T：

  ```c++
  template <typename T> T foo(T* p)
  {
      T tmp = *p;   // tmp的类型将是p指向的类型
      // ...
      return tmp;
  }
  ```

  类型参数前必须使用关键字`class`或`typename`：

  ```c++
  // U前缺乏关键字，错误使用
  template <typename T, U> T calc (const T&, const U&);

  // typename和class没什么不同，都可以用
  template <typename T, class U> calc (const T&, const U&);
  ```

- **非类型模板参数**

  一个非类型参数表示一个值而非一个类型，即我们**通过一个特定的类型名而非关键字`class`或`typename`**来指定非类型参数。

  当一个模板被实例化时，非类型参数的值被一个用户提供的或编译器推断出的值所替代(<font color=red>必须是常量表达式</font>)；

  ```c++
  template<unsigned N, unsigned M>
  int compare(const char(&p1)[N], const char(&p2)[M])
  {
      return strcmp(p1, p2);
  }
  // 调用
  compare("hi", "mom");

  // 本质上是实例化出以下内容
  int compare(const char (&p1)[3], const char (&p2)[4]);
  ```

对于**`inline`和`constexpr`的函数模板**而言，其声明的形式：

- `inline`或者`constexpr`说明符放在模板参数列表之后，返回类型之前；

  ```c++
  template <typename T> inline T min(const T&, const T&);
  ```

对于模板而言，为了生成一个实例化版本，编译器需要掌握函数模板或类模板成员函数的定义，**模板的头文件通常同时包括声明及定义**。

最后一个总结性的陈述，先看代码：

```c++
template <typename T>
int compare(const T & v1, const T &v2)
{
    if (v1 < v2)    return -1;
    if (v2 < v1)    return 1;
    return 0;
}
```

这串代码假定了`T`类型中是定义了`<`运算符的，但是如果T换成某个类呢，该类并未定义`<`呢？那么上面的代码就不合法，这样的错误直到实例化时才会被发现；

因此**保证传递给模板的实参支持模板所要求的操作，以及这些操作在模板中能正确工作，是调用者的责任；**

### 类模板

#### 类模板自身

**类模板(class template)**是用来生成类的蓝图，与**函数模板不同之处在于编译器不能为类模板推断模板参数类型**，必须在模板名后的尖括号中提供额外信息，用来代替模板参数的模板实参列表；

- **定义类模板**

  之前实现过`StrBlob`，现在我们来实现模板版本，将模板命名为`Blob`，不仅仅再针对`string`：

  ```c++
  template <typename T> class Blob {    // Blob模仿的是vector的功能
  public:
      typedef T value_type;    // T是类中元素的具体类型

      // 体现出了typename的作用，告知编译器这是一种类型
      typedef typename std::vector<T>::size_type size_type;

      // 构造函数
      Blob();
      Blob(std::initializer_list<T> il);    // 使用初始化列表构造，可以这么理解？

      // Blob中的元素数目
      size_type size() const { return data->size(); }
      bool empty() const { return data->empty(); }

      // 添加/删除元素
      void push_back(const T &t) { data->push_back(t); }

      // 移动版本的push_back
      void push_back(T &&t) { data->push_back(std::move(t)); }
      void pop_back();

      // 元素访问
      T& back();    // 返回T类型的引用
      T& operator[](size_type i);
  private:
      std::shared_ptr<std::vector<T>> data; // 存储的竟然是指针

      // 若data[i]无效则抛出msg
      void check(size_type i, const std::string &msg) const;
  };
  ```

- **实例化类模板**

  当使用一个类模板时，<font color=red>必须提供额外信息</font>，这些额外信息称为：**显式模板实参**(explicit template argument)列表，它们被绑定到模板参数：

  ```c++
  Blob<int> ia; // 指定元素类型，不像函数模板会自己推断类型
  Blob<int> ia2 = {0, 1, 2, 3, 4}   // 有5个元素的Blob<int>
  ```

  通过上面指定的类型，编译器会实例化出一个下面的类：

  ```c++
  template <> class Blob<int> {
      typedef typename std::vector<int>::size_type size_type;
      Blob();
      ....
  };
  ```

  **一个类模板的每个实例都形成一个独立的类；**

- **模板中成员函数的定义**

  类模板的成员函数本身是一个普通函数，但是，类模板的每个实例都有其自己版本的成员函数；

  因此类模板的成员函数具有和模板相同的模板参数，因而在类模板之外的成员函数也必须以关键字`template`开始，后接类模板参数列表：

  ```c++
  template <typename T>    // 以template开始，接类模板参数列表
  void Blob<T>::check(size_type i, const std::string &msg) const
  {
      if (i >= data->size())
          throw std::out_of_range(msg);
  }
  /* 下标运算符和back函数用模板参数指出返回类型 */
  template <typename T>
  T& Blob<T>::back()
  {
      check(0, "back on empty Blob");
      return data->back();
  }
  template <typename T>
  T& Blob<T>::operator[](size_type i)
  {
      check(i, "subscript out of range");
      return (*data)[i];    // 返回下标值
  }
  // pop_back函数
  template <typename T> void Blob<T>::pop_back()
  {
      check(0, "pop_back on empty Blob");
      data->pop_back();
  }
  ```

  对于**构造函数**的定义：

  ```c++
  // 该构造函数分配了一个空vector，并将指向该空vector的指针保存在data中
  template <typename T>
  Blob<T>::Blob() : data(std::make_shared<std::vector<T>>()) { }
  
  // 该构造函数分配了一个新的vector，同样将指向该vector的指针保存在data中
  template <typename T>
  Blob<T>::Blob(std::initializer_list<T> il):
  data(std::make_shared<std::vector<T>>(il)) { }
  ```

- **类模板成员函数的实例化**

  一个类模板的成员函数**只有当程序用到它时**才进行实例化：

  ```c++
  // 实例化Blob<int>以及接受初始化列表的构造函数
  Blob<int> squares = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};
  // 实例化Blob<int>::size() const
  for (size_t i = 0; i != squares.size(); ++i)    squares[i] = i * i;    
  ```

观察以上的规则，我们会发现<font color=red>类外所有定义类的成员函数都必须提供模板实参</font>，但是：

- **<font color=red>在类模板自己的作用域中，可以直接使用模板名而无需提供实参；</font>**
- 当我们出于一个类模板的作用域时，编译器处理模板自身引用时就好像我们已经提供了与模板参数匹配的实参一样；

#### 类模板与友元

一个类包含一个友元声明时，类与友元各自是否是模板是相互无关的：

- 类模板包含一个非模板友元，则友元被授权可以访问所以模板实例；
- 若友元是模板，类可以授权给所有友元模板实例，也可以只授权给特定实例；

下面针对两种情况进行说明：

- **一对一友元关系**

  为了引用模板的一个特定实例，我们必须先声明模板自身，上代码：

  ```c++
  template <typename> class BlobPtr;    // 下面需要实例化，要用到
  template <typename> class Blob;        // 下一个运算符需要
  template <typename T>
      bool operator==(const Blob<T>&, const Blob<T>&);    // 模板友元函数
  
  template <typename T> class Blob {
      // 每个Blob实例将访问权限授予用相同类型实例化的BlobPtr和相等运算符
      friend class BlobPtr<T>;
      friend bool operator== <T>
          (const Blob<T>&, const Blob<T>&);
      // ...其他定义
  };
  ```

  这里的一对一就是，一个模板对一个模板，友元的声明用`Blob`的模板形参作为它们自己的模板实参，同时友好关系限定在用相同类型实例化的`Blob`与`BlobPtr`、相等运算符之间：

  ```c++
  Blob<char> ca;    // 则友元为：BlobPtr<char>和operator==<char>
  Blob<int> ca;     // 则友元为：BlobPtr<int>和operator==<int>
  ```

- **通用与特定模板友元关系**

  一个类也可将另一个模板的每个实例都声明为自己的友元，或者限定特定的实例为友元：

  ```c++
  // 前置声明，因为下面要用到该模板类的特定实例
  template <typename T> class Pal;
  class C {
      friend class Pal<C>;    // 用类C实例化的一个友元
      template <typename T> friend class Pal2;    // 无须前置声明，这里就是一种声明
  };
  template <typename T> class C2 {    // C2是一个类模板
      friend class Pal<T>;    // C2的每个实例将相同实例化的Pal声明为友元

      // Pal2的所有实例都是C2每个实例的友元
      template <typename X> friend class Pal2;
      friend class Pal3;
  };
  ```

  由上可以看出，`Pal2`类模板使用了与类模板本身不同的模板参数；

- **新标准下使模板自己的类型参数成为友元**

  上代码：

  ```c++
  template <typename Type> class Bar {
      friend Type;    // 将访问权限用来实例化Bar的类型
  }
  ```

  <font color=red>但是自己的类型参数需要设定为友元吗？这是一个问题。</font>

#### 类模板别名

这部分简单，我们可以定义一个`typedef`来引用实例化的类：`typedef Blob<string> StrBlob;`

但模板并不是一个类型，我们不能定义一个`typedef`引用一个模板，即`typedef Blob<T> BlobT;`，这样是错误的；

但是新标准下可以通过`using`语句实现定义：

```c++
// 将twin类型作为pair<T, T>使用，结合模板一起用的
// 又发现了
template<typename T> using twin = pair<T, T>;

// authors是一个pair<string, string>
twin<string> authors;
twin<int> win_loss;
twin<double> area;
```

**还可以使用using固定一个或多个模板参数：**

```c++
template <typename T> using partNo = pair<T, unsigned>;
partNo<string> books;    // pair<string, unsigned>
partNo<Student> kids;    // pair<Student, unsigned>
```

#### 类模板的static成员

与其他任何类相同，类模板可以声明`static`成员：

```c++
template <typename T> class Foo {
public:
    static std::size_t count() { return ctr; }
    // others
private:
    static std::size_t ctr;
    // others
};

template <typename T>
size_t Foo<T>::ctr = 0;    // 定义并初始化ctr
```

对于给定的一个类型`X`，所有`Foo<X>`类型的对象共享相同的`ctr`对象和`count`函数；

同时，类模板的每个实例都有一个独有的`static`对象，不同实例不共享；

### 模板参数

类似函数参数的名字，一个模板参数的名字也没什么内在含义，通常将类型参数命名为`T`，但实际上我们可以使用任何名字：

```c++
template <typename Foo> Foo calc(const Foo& a, const Foo& b)
{
    Foo tmp = a;     // tmp的类型与参数和返回类型一致
    // ...
    return tmp; // 返回类型和参数类型一样
}
```

模板参数遵循普通的作用域规则，模板参数会隐藏外层作用域中声明的相同名字。

但是，与大多数其他上下文不同，在模板内不能重用模板参数名：

```c++
typedef double A;   // 外层作用域中的A
template <typename A, typename B> void f(A a, B b)
{
    A tmp = a;  // 隐藏了外层double的类型
}

template <typename V, typename V>   //...用法错误，不得重用 
```

#### 模板的声明

模板声明必须包含模板参数；

```c++
// 声明但不定义compare和Blob
template <typename T> int compare(const T&, const T&);
template <typename T> class Blob;
```

<font color=red>在C++中声明中的模板参数的名字不必与定义中相同</font>

- 但是一般为了方便理解以及代码可读性不建议这么做；

#### 访问类模板的类型成员

对于一个模板类型参数T，当编译器遇到`T::mem`这样的代码，编译器不知道它是一个类型成员还是一个`static`数据成员，在默认情况下，<font color=red>C++假定作用域运算符访问的名字不是类型</font>，如果需要访问类型成员，就必须显式告诉编译器该名字是一个类型：

```c++
template <typaname T>
typename T::value_type top(const T& c)
{
    if (!c.empty())
        return c.back();
    else
        return typename T::value_type();    // 没有元素时生成一个值初始化的元素
}
```

**Notes：**希望通知编译器一个名字表示类型时，必须使用关键字`typename`，而不能用`class`。

- 一般情况下可以互换使用；

- 当作为非类型模板参数时，我们必须指定一个具体的类型，这时候只能用`class`；

  ```c++
  template<class N> // N是一个非类型的模板参数
  class Array {
      // ...
  };
  ```

<font color=red>这里留下一个坑，怎么用模板去定义一个类型？</font>

#### 默认模板实参

新标准我们可以为函数和类模板提供默认实参，而之前的标准只能为类模板提供；

重写`compare`函数，默认使用标准库的`less`函数对象模板：

```c++
template <typename T, typename F = less<T>> // less是一个可调用对象
int compare(const T &v1, const T &v2, F f = F())    // 默认调less，即f为less
{
    if (f(v1, v2))    return -1;
    if (f(v2, v1))    return 1;
    return 0;
}

bool i = compare(0, 42);    // 未指定，调用less
Sales_data item1(cin), item2(cin);
bool j = compare(item1, item2, compareIsbn);    // 指定了，调用compareIsbn
```

**Notes：**

- <font color=red>与函数默认实参一样，对于一个模板函数，只有它右侧所有参数都有默认实参时，它才能有默认实参；</font>
- <font color=red>无论合适使用类模板，我们都必须在模板名后接上尖括号；</font>

  - 尖括号指出类必须从一个模板实例化而来；
  - 如果提供的是默认实参，且我们都希望使用这些默认实参，就必须在模板名之后跟一个空尖括号对；

  ```c++
  template <class T = int> class Numbers {
  public:
      Numbers(T v = 0 ): val(v) { }
      // 各种操作
  private:
      T val;
  };
  Numbers<long double> lots_of_precision;    // 不使用默认实参
  Numbers<> average_precision;    // 希望使用默认实参
  ```

### 成员模板

一个类可以包含本身是模板的成员函数，这种成员称为**成员模板(member template)**；

- <font color=red>成员模板不能为虚函数；</font>

#### 普通类的成员模板

通过代码举例：

```c++
class DebugDelete {
public:
    DebugDelete(std::ostream &s = std::cerr): os(s) { }

    // 包含了本身是模板的成员函数，但是，该函数不能为虚函数
    template <typename T> void operator()(T *p) const
    { os << "deleting unique_ptr" << std::endl; delete p; }
private:
    std::ostream &os;
};

// 对成员模板的使用
double* p = new double;
DebugDelete d;    // DebugDelete对象d
d(p);    // 调用DebugDelete::operator()(double*)，释放p
int* ip = new int;
DebugDelete()(ip);    // 在一个临时的DebugDelete对象上调用operaotr()(int*)
```

结合前面的`unique_ptr`，我们将这个函数对象当作参数：

```c++
// 功能是销毁p指向的对象
// 实例化DebugDelete::operator()<int> (int *)
unique_ptr<int, DebugDelete> p(new int, DebugDelete());
```

上述的代码是声明了`p`要的删除器的类型是`DebugDelete`，并且在`p`的构造函数中提供了该类型的一个未命名对象；

#### 类模板的成员模板

此情况下，类和成员各自有自己独立的模板参数：

```c++
template <typename T> class Blob {
    template <typename It> Blob(It b, It e);
    // ...
};  // 类模板与成员模板的参数各自独立
```

在类和成员函数都是模板的情形下，需要考虑定义问题，当我们在类模板外定义一个成员模板的时候，需要**同时为类模板和成员模板提供模板参数列表**；

```c++
template <typename T>   // 先是类的模板参数
template <typename It>  // 其次是构造函数的模板参数
    // 假定It为迭代器类型，我们接下来看使用
    Blob<T>::Blob(It b, It e): data(std::make_shared<std::vector<T>>(b, e)) { }

int ia[] = {0, 1, 2, 3};
vector<long> vi = {0, 1, 2, 3};
list<const char*> w = {"now", "is", "the", "time"};

// 实例化Blob<int>类以及接受两个int*参数的构造函数
Blob<int> a1(begin(ia), end(ia));

// 实例化Blob<int>类以及接受两个vector<long>::iterator的构造函数
Blob<int> a2(vi.begin(), vi.end());

// 实例化Blob<string>类以及接受两个list<const char*>::iterator参数的构造函数
Blob<string> a3(w.begin(), w.end());
```

在上面这个代码示例中，对于`Blob`类的实例化是已经显式的指出，而对于其中的模板构造函数则是通过推断得来；

### 控制实例化

当模板被使用时会实例化，当两个或以上的独立编译的源文件使用了相同的模板，并提供了相同的模板参数时，每个文件中就会有该模板的一个实例，实例化相同的模板会导致严重的额外开销，因此在新标准中定义了**显式实例化**(explicit instantiation)来避免这种开销，具体形式：

```c++
extern template class Blob<string>; // 显式实例化(类)声明
extern template int compare(const int&, const int&);    // 显式实例化(函数)声明
```

当编译器遇到`extern`模板声明时，它不会在本文件中生成实例化代码，因为**`extern`承诺在程序其他位置有一个非`extern`声明(定义)，声明可以有多个，定义仅能一个**；

```c++
// Blob<string>实例化将会在其他位置
extern template class Blob<string>;

// compare<int>函数实例化将会出现在其他位置
extern template int compare(const int&, const int&);
```

**一个类模板的实例化会实例化该模板的所有成员，包括内联的成员函数；**

**但对一个类模板的对象进行实例化只会生成该对象所需要的成员的代码；**

```c++
template <typename T> 
class Vector {
public:
    T* data;
    int size;
    void push_back(T value) {...}
};

Vector<int> vec;  // 实例化定义,生成Vector<int>的全部代码
vec.push_back(1); // 普通实例化,只生成push_back方法的代码
```

## 模板实参推断

**模板实参推断**的过程就是从函数实参来确定模板实参的过程；

而有几个需要注意的事项是：

- 算术转换(`char->int...`)
- 派生类向基类的转换
- 以及用户定义的转换(`class->int...`)

都不能应用于函数模板；

### 实参推断实例

首先展示的代码是，仅有一个模板类型参数：

```c++
// 下面两行定义了函数模板
template <typename T> T fobj(T, T);
template <typename T> T fref(const T&, const T&);
// 下面两行定义了两个string，其中s2是cosnt类型的变量
string s1("a value");
const string s2("another value");

fobj(s1, s2);    // 忽略了顶层const，因为类型本身不会自行加上const
fref(s1, s2);    // 调用了两个const string&

int a[10], b[42];
fobj(a, b);    // 数组名当指针地址
fref(a, b)    // T被推断为指针类型，非引用类型，但整体而言是对一个指针的引用
```

以上两个模板形参都是一致的，而在进行推断时类型不一致会无法实例化，因为两个模板参数都是T，即发生错误；

如果想要实现相关需求：**只需要将模板定义为两个类型，以上面的那部分代码为例，即改成：**

```c++
template <typename A, typename B>
int flexibleCompare(const A& v1, const B& v2)
{
    //...
}
```

还有一种情形是：**含有普通类型定义参数的函数模板**：

```c++
// 给定的就按照给定的类型走
template <typename T> ostream &print(ostream &os, const T &obj)
{
    return os << obj;
}

// 实例化print(ostream&, const int&)
print(cout, 42);
ofstream f("output");

// 使用print(ostream&, const int&)；
// ostream&类型不依赖于模板实参，所以ofstream->ostream&
printf(f, 10);
```

### 函数模板显式实参

某些情况编译器无法推断出模板实参的类型，在这种情况下，我们希望允许用户控制模板实例化；

我们会有以下的一些措施：

- **指定显式模板实参**

  举例如下：

  ```c++
  // 编译器无法推断T1，因为未出现在函数参数列表中
  template <typename T1, typename T2, typename T3>
  T1 sum(T2, T3);
  ```

  在这种情形下，每次调用都需要为`T1`提供一个**显式模板实参**：`auto val3 = sum<long long>(i, lng);`

  由于显式模板实参按从左到右的顺序与对应的模板参数匹配，只有尾部参数的显式模板实参才可以忽略，因此可能会出现一个比较糟糕的设计：

  ```c++
  // "< >"中指定的具体类型才叫模板实参
  template <typename T1, typename T2, typename T3>
  T3 sum(T2, T1);
  
  // 如果我们这么定义，由于需要从左往右与对应模板参数进行匹配

  // long long这个模板实参对应的是T1，但是T1却还要通过lng去推断，这样就有问题了
  auto val3 = sum<long long>(i, lng);

  // 应该显式指定了模板实参，那么i与lng就必须按要求来
  auto val3 = sum<long long, int, long>(i, lng);
  // 所以说是糟糕的设计
  ```

  **对于已经显式指定的模板实参，可以进行正常的类型转换**；

### 尾置返回类型推断

使用尾置返回类型主要是为了处理我们不知道返回值的信息的情况，因而需要使用`decltype`进行推断：

```c++
template <typename It>
unknowntype &fcn(It beg, It end)
{
    // 处理序列，It当迭代器类型看
    return *beg;    // 返回序列中一个元素的引用，但我们不知道该返回值的类型
}
vector<int> vi = {1, 2, 3, 4, 5};
Blob<string> ca = { "hi", "bye" };
auto &i = fcn(vi.begin(), vi.end());    // fcn应该返回int&
auto &s = fcn(ca.begin(), ca.end());    // 应该返回string&
```

处理此种情形，我们这么定义：

```c++
// decltype去推断返回类型(话说auto本身不能推断吗？)-auto本身就要根据返回类型去推断
template <typename It>
auto &fcn(It beg, It end) -> decltype(*beg)
{
    // 处理序列，It当迭代器类型看
    return *beg;    // 返回序列中一个元素的引用，但我们不知道该返回值的类型
}
```

**<font color=red>尾置返回类型返回元素，而不是引用(没太理解)</font>**

标准库本身带有类型转换模板，定义在头文件`type_traits`中，涉及到<font color=red>模板元程序设计</font>，该头文件中有一个`remove_reference`模板，模板中有一个模板类型参数和一个名为`type`的(`public`)类型成员，其用法：

- 引用类型实例化`remove_reference`，则`type`将表示被引用的类型；
- 实例化`remove_reference<int&>`，则`type`成员将是`int`，依此类推；

因此如果需要返回一个元素的话：

```c++
template <typename It>
auto fcn2(It beg, It end) ->
    // 需要加typename，表示type是个类型，type定义在类模板中
    typename remove_reference<decltype(*beg)>::type
{
    // ...
    return *beg;    // 返回序列中一个元素的拷贝
}
```

### 函数指针类型推断

当使用一个函数模板初始化一个函数指针或者为一个函数指针赋值，编译器使用指针的类型来推断模板实参；

在这部分，我们很多时候需要使用显式模板实参来指出实例化哪个版本；

```c++
void func(int(*)(const string&, const string&));
void func(int(*)(const int&, const int&));
func(compare);        // 使用compare的哪个？
fun(compare<int>);    // 传递了compare(const int&, const int&)
```

### 实参推断和引用

这部分主要是为了理解如何从函数调用进行类型推断，分两种情况介绍，左值引用以及右值引用；

**从左值引用函数参数推断类型**

这部分主要是要回忆起以前的一个知识点：**传递给一个引用的实参必须是一个左值**；

```c++
template <typename T> void f1(T&);
f1(i);  // i代表int，则T->int
f1(ci); // i代表const int，则T->const int
f1(4);  // 不能传递右值，因为&一般意味着要修改，而常量无法修改

// 变化一下
template <typename T> void f1(const T&);
// i代表int，则T->int
f1(i);

// i代表const int，则T->int，因为const已经是函数参数类型的一部分了
f1(ci);

// 此时可以绑定右值，因为模板中已经有const类型了，const int&类型是可以绑定常量的，且T->int
f1(4);
```

**从右值引用函数参数推断类型**

```c++
// 这个更简单
template <typename T> void f3(T&&);
f3(42);    // 指定右值了已经
```

正常来说，在这种定义了右值的情况下：`f3(i)`这种操作是不被允许的，<font color=red>但是C++为此开了一扇窗，定义了例外，具体原理书中608页</font>；

- **涉及到一个引用折叠的概念；**

总之就是，在上述情况下，对于变量`i`，`T`会推断为`int&`类型，即(`T&&->T&`)，这些例外是`move`这种标准库设施正确工作的基础；

正是因为上述特性，会引发一些新的疑虑，比如：

```c++
template <typename T> void f3(T&& val)
{
    T t = val;    // T代表的是一个引用类型还是一个右值的具体类型呢？
}
```

<font color=red>这部分留坑，后续填补；</font>

通过对实参推断的学习以及对引用折叠的学习，**可以帮助我们更好的理解`std::move`**，<font color=red>留坑待补</font>；

- 主要是我们需要知道，从一个左值`static_cast`到一个右值引用是允许的；

### 转发

转发就是将一个或多个实参连同类型不变地转发给其他函数，我们需要保持被转发实参的所有性质：

```c++
template <typename F, typename T1, typename T2>
void flip1(F f, T1 t1, T2 t2)
{
    f(t2, t1);
}
// 正常情况一切顺利照常进行，但如果f的形参接受一个引用的参数：
void f(int v1, int &v2)    // 注意v2是一个引用
{
    cout << v1 << " " << ++v2 << endl;
}

f(42, i);           // i应该时被改变了的
flip1(f, j, 42);    // j为int类型，flip1被实例化为

// j的值拷贝到了t1，这没问题，但是t1绑定到了int&并不会导致j受影响
void flip1(void(*fcn) (int, int&), int t1, int t2);
```

像该代码就面对着这个问题，转发没有完成所有性质的传递；

**因此需要定义一个能保持类型信息的函数参数：**

```c++
template <typename F, typename T1, typename T2>
void flip2(F f, T1 &&t1, T2 &&t2)
{
    f(t2, t1);
}
flip2(f, j, 42);
```

由于**引用折叠**的存在，`j`作为一个左值传递给参数`t1`，推断出的`T1`的类型为`int&`，因此`t1`被绑定到`j`上，而`f`中引用参数`v2`被绑定到`t1`上，即传递了；

但这个版本的`flip2`**不能**用于接受右值引用的参数的函数：

```c++
void g(int &&i, int& j) 
{
    cout << i << " " << j << endl;
}
flip2(g, i, 42);    // 错误，原因如下分析
// i没问题，i被推断为int&，即int& t1 = i，int& j = t1
// 刚好可以传递给g的第二个参数
// 而传递给g的第一个参数的是flip2中的t2，t2被推断为int
// 即int t2 = 42，t2作为一个左值表达式无法实例化为int&&
// 而左值引用不存在这个问题
```

因此又出现了一个`std::forward`来解决这个问题，它能保持原始实参的类型，同样定义在头文件`utility`中；

`forward`的调用必须通过显式模板实参来调用，返回该显式实参类型的右值引用，即`forward<T>`的返回类型是`T&&`；

重写翻转函数：

```c++
template <typename F, typename T1, typename T2>
void flip(F f, T1 &&t1, T2 &&t2)
{
    f(std::forward<T2>(t2), std::forward<T2>(t1));    // 如果T2是一个右值，forward后还是一个右值，如果是一个左值forward后还是一个左值
}

flip(g, i, 42);
```

## 重载与模板

函数模板可以被另一个模板或一个普通非模板函数重载：

- 同平常一样，名字相同的函数必须具有不同数量或类型的参数；

### 编写一个重载模板

设计一个调试函数`debug_rep`，每个函数都返回一个给定对象的`string`表示，先编写此函数最通用的版本：

```c++
template <typename T> string debug_rep(const T &t)
{
    ostringstream ret;
    ret << t;    // 使用T的输出运算符打印t的一个表示形式
    return ret.str();   // 返回一个绑定的副本
} 
```

再定义一个指针的版本：

```c++
template <typename T> string debug_rep(T *p)    // 注意不能用于char*
{
    ostringstream ret;
    ret << "pointer: " << p;    // 打印p，如果是字符指针会直接打印数组内容而不是指针信息
    if (p)    ret << " " << debug_rep(*p);    // 是不是调用了上面的那个版本
    else ret << " null pointer";
    return ret.str();    // 返回ostringstream对象绑定的一个副本
} 
```

使用这些函数：

```c++
string s("hi");
cout << debug_rep(s) << endl;    // 只会调用第一个版本，因为s是一个string变量
cout << debug_rep(&s) << endl;    // 两个版本都会调用，其中：
// 第一个版本的T推断为了string*类型
// 第二个版本的T推断为了string，但是要经历普通指针->const指针的转换
```

编译器会优先选择第二个版本；

但是如果针对：

```c++
const string *sp = &s;    
cout << debug_rep(sp) << endl;    // 正常情况下函数匹配规则无法区分这两个函数
```

针对此类情况，函数模板重载设定了一个特殊规则，使得此调用解析为`debug_rep(T*)`，即更特例化的版本；

- **这是一条额外特例设计的规则**，就是考虑到对`const`的指针的调用；

### 非模板和模板重载

定义一个普通的非模板版本的`debug_rep`来打印双引号包围的`string`：

```c++
string debug_rep(const string &s)
{
    return '"' + s + '"';
}
// 调用
string s("hi");    // 匹配，T绑定到string
cout << debug_rep(s) << endl;   // 显然更精确的匹配
```

依据上述类似的规则，会优先匹配非模板版本；

### 综合上述两种情况的案例

考虑对一个C风格字符串指针的调用，以字符串字面常量为例，上面都是`string`类型的示例，下面考虑C风格字符串指针的案例：

```c++
cout << debug_rep("hi world!") << endl;    // 一个字符串字面常量的例子
// 版本一：debug_rep(const T&)，T绑定到char[10]，即一个长度为10的字符数组
// 版本二：debug_rep(T*)， T被绑定到const char，即一个字符指针
// 版本三：debug_rep(const string&)，要求从const char*到string的类型转换
```

对于上述三个版本，编译器会优先调用第二个版本，因为数组到指针的转换对于函数匹配而言是属于精确匹配的一种情况；

如果我们希望将字符指针转化为`string`处理，则再定义两个非模板重载版本，实现更精确的匹配：

```c++
string debug_rep(char *p)
{
    return debug_rep(string(p));
}

string debug_rep(const char *p)
{
    return debug_rep(string(p));
}
```

在调用的过程中，不要忘了在作用域中声明`debug_rep(const string&)`，不然可能会调用错误的`debug_rep`版本；(模板会实例化出与调用匹配的版本)

## 可变参数模板

### 可变参数模板介绍

**可变参数模板**(variadic template)就是一个接受可变数目参数的模板函数或模板类；

- 可变数目的参数被称为**参数包**(parameter packet)；

  - **模板参数包**(template parametet packet)；
  - **函数参数包**(function parameter packet)；

- 我们用一个省略号来指出一个模板或函数参数表示一个包；

  ```c++
  // Args是一个模板参数包；rest是一个函数参数包
  // Args表示零个或多个模板类型参数
  // reset表示零个或多个函数参数

  // typename后接的模板
  // 先给定了具体类型Args，而后省略号代表多个函数的参数
  template <typename T, typename... Args>
  void foo(const T &t, const Args& ... rest);
  ```

来使用上述的可变参数模板：

```c++
// 下面的例子是一个函数参数包的案例，由于Foo都加了const，需要注意到这个细节
int i = 0; string s = "how do you do"; double d = 3.14;
foo(i, s, 42, d);    // 包中有三个参数，实例化出
void foo(const int&, const string&, const int&, const double&);
foo(s, 42, "hi");    // 包中有两个参数，实例化过程同上
```

以上的每个实参，T都是从第一个实参的类型推断出来的，剩下的实参提供额外实参的数目以及类型；

可以通过`sizeof...`运算符得知包中有多少元素：

```c++
template<typename ... Args> void g(Args ... args) {
    cout << sizeof...(Args) << endl;    // 模板参数数目
    cout << sizeof...(args) << endl;    // 函数参数数目
}
```

**Notes：**`sizeof...`不是一个函数，而是一个运算符，它是C++11引入的编译时运算符；

### 可变参数模板编写

可变参数函数通常是递归的，第一步调用第一个实参，然后用剩余实参调用自身；

接下来定义一个`print`函数，每次递归调用将第二个参数打印到第一个实参表示的流中，为了终止递归，我们还需要定义一个非可变参数的`print`函数：

```c++
template<typename T>    // 必须提前声明
ostream &print(ostream &os, const T &t)
{
    return os << t;
}
template <typename T, typename... Args>
ostream &print(ostream &os, const T &t, const Args&... rest)
{
    os << t << ", ";    // 打印第一个实参
    // 用剩余实参调用自身，参数包中参数调用完了的时候调用上述声明过的print函数
    return print(os, rest...)
}
```

以`print(cout, i, s, 42);`为例：

|         调用          |  t   |          rest...          |
| :-------------------: | :--: | :-----------------------: |
| `print(cout, i, s, 42)` |  `i`   |           `s, 42`           |
|  `print(cout, s, 42)`   |  `s`   |            `42`             |
|    `print(cout, 42)`    |      | 调用非可变参数版本的`print` |

定义了可变参数版本的`print`时，非可变参数的版本的声明必须在作用域中，否则**可变参数版本会无限递归**，因为没有退出的界限；

- 无限递归原因在于，当调用`print(cout)`时，由于参数已经消耗完毕，无法匹配任何模板，编译失败。
- 但是，这个调用来自上一层的递归，上一层的递归调用也无法继续执行(因为它的返回值来自这个调用)。
- 依此类推，所有的递归调用层都无法继续，这就形成了无限递归。
- 也就是说，真正导致无限递归的原因是，当参数用尽后，最内层的递归调用`print(cout)`无法找到匹配的模板，这导致整个递归调用栈全部暂停，无法返回。
- 如果有基本模板，最内层调用可以匹配基本模板，并正常返回，整个递归调用链才可以执行完毕。

上述的写法涉及到：

- **参数包拓展**

  对于一个参数包，除了获取大小之外，还可以进行拓展，拓展时，我们要提供用于每个拓展元素的**模式**(pattern)，拓展一个包就是将它分解为构成的元素；

  说人话，看代码：

  ```c++
  // 拓展了Args，拓展了模板参数包
  template <typename T, typename... Args>
  ostream &
  print(ostream &os, const T &t, const Args&... rest)
  {
      os << t << ", ";
      return print(os, rest...);    // 拓展了rest，拓展了函数参数包
  }
  ```

  举例理解：

  ```c++
  print(cout, i, s, 42);    // 包中有两个参数
  // 最后两个参数确定尾置参数的类型，这是第一个拓展
  ostream&
      print(ostream&, const int&, const string&, const int&);
  // 第二个拓展在return print的递归调用环节，调用等价于：
  print(os, s, 42);
  ```

- **参数包拓展的理解(函数调用模式)**

  上面的例子仅仅是将包拓展为`print`的构成元素，C++还允许更复杂的拓展模式：即编写可变参数函数：

  ```c++
  template <typename... Args>
  ostream &
  errorMsg(ostream &os, const Args&... rest)
  {
      // os << t << ", ";
      // 该调用使用了模式debug_reg(rest)，
      // 表明对函数参数包rest中的每个元素调用debug_rep函数
      return print(os, debug_rep(rest)...);
  }
  // 比如某调用
  errorMsg(cerr, fcnName, code.num(), otherData, "other", item);
  // 等价于
  print(cerr, debug_rep(fcnName), debug_rep(code.num()),
        debug_rep(otherData), debug_rep("other"),
        debug_rep(item));
  
  // 但是注意，这样写print是错误的
  // 这样是将函数参数包中所有的参数作为一个参数传入debug_rep
  print(os, debug_rep(rest...));
  ```

  ***Notes：***<font color=red>上述的错误是很致命也是很细节的！</font>

### 转发参数包

组合使用可变参数模板与`forward`机制来编写函数，实现将实参不变地传递给其他函数，以`StrVec`类为例，我们为该类添加一个`emplace_back`成员：

```c++
class StrVec {
public:
    template <class... Args> void emplace_back(Args&&...);  // 右值引用诸多用处
    // 其他成员的定义
};

template <class... Args>
    inline
    void StrVec::emplace_back(Args&&... args)
{
    chk_n_alloc();
    alloc.construct(first_free++, std::forward<Args>(args)...);
}
```

通过`construct`的功能，将`std::forward<Args>(args)...`扔进`first_free`指向的元素的类型(也就是`string`类)的构造函数中；

我们把`std::forward<Args>(args)...`拆开理解：

- `std::forward<T1>(t1)`、`std::forward<T2>(t2)`...

举例：

```c++
svec.emplace_back(10, 'c');    // 对于string而言是将ccccccccc添加为新的元素
svec.emplace_back(s1 + s2);    // 移动构造函数，因为s1+s2是右值，直接移动过去    
```

## 模板特例化

有时候我们不想要通用模板推断出来的版本，需要自行定义一些特定版本，称为**模板特例化**；

前面有过一个例子：

```c++
template <typename T> int compare(const T&, const T&);    // 版本一
template <size_t N, size_t M>
int compare(const char (&)[N], const char (&)[M]);        // 版本二

const char *p1 = "hi", *p2 = "mom";
compare(p1, p2);        // 调用版本一
compare("hi", "mom");    // 调用版本二
```

为了仅仅在版本一就能实现一个特例版本，我们进行：

### 函数模板特例化

特例化一个函数模板时，必须为原模板中的每个模板参数都提供实参，同时为了指出我们在特例化一个模板，需要在`template`后接一个`<>`：

```c++
template <>    // 特例化的明显特征
int compare(const char* const &p1, const char* const &p2)
{
    return strcmp(p1, p2);
}
```

这个特例主要是为字符常量而设置的，`T->char* const`，结合在一起，就是一个指向`const char`的`const`指针的引用，之所以要`const`，是因为字符串常量的首地址(指针)是不变的，因此要`const&`，即引用不变；

一个特例化版本实质上是一个实例，我们代替编译器的职能而创造出的一个实例，并非简单的**重载版本**；

- 因此特例化不影响函数匹配；
- 此外，<font color=red>为了特例化一个模板，原模板的声明必须在作用域中；</font>
- <font color=red>在任何使用模板实例的代码之前，特例化版本的声明也必须在作用域中；</font>

### 类模板特例化

书中的例子是为标准库`hash`模板定义一个特例化版本，将`Sales_data`的对象保存在无序容器中，默认情况下无序容器使用`hash<key_type>`来组织元素；

为了让我们自己的`Sales_data`类也能使用这种默认组织方式，我们需要定义hash模板的一个特例化版本(因为这个类是我们自己定义的)：

- 一个重载的调用运算符，接受一个容器关键字类型的对象，返回`size_t`；
- 两个类型成员，`result_type`和`argument_type`，分别调用运算符的返回类型和参数类型；
- 默认构造函数和拷贝赋值运算符；

```c++
// 以下的操作涉及到对命名空间的操作
namespace std {    // std下的命名空间
template <>    // 我们在特例化一个版本
struct hash<Sales_data>
{
    // 用来散列一个无序容器类型需要定义：
    typedef size_t result_type;
    typedef Sales_data argument_type;
    size_t operator()(const Sales_data& s) const;
    // 我们的类需要使用默认的拷贝控制成员和默认构造函数
};

size_t
hash<Sales_data>::operator()(const Sales_data& s) const
{
    return hash<string>()(s.bookNo) ^
        hash<unsigned>()(s.units_sold) ^
        hash<double>() (s.revenue);
}
}    // 关闭std命名空间，没有分号
```

考虑到类模板的特殊性，类模板的特例化不必为所有模板参数提供实参；

- **类模板部分特例化**

  部分特例化本质上还是一个模板，以之前介绍的`remove_reference`为例：

  ```c++
  // 原始通用版本
  template <class T> struct remove_reference {
      typedef T type;    // 把T设置为类型
  };
  // 部分特例化版本，用于左值引用和右值引用
  template <class T> struct remove_reference<T&> // 左值引用
  { typedef T type; };
  template <class T> struct remove_reference<T&&> // 右值引用
  { typedef T type; };
  
  int& i;
  // decltype(42)为int，使用原始模板
  remove_reference<decltype(42)>::type a;    // 使用通用版本

  // decltype(i)为int&，使用第一个特例化版本
  remove_reference<decltype(i)>::type a;

  // decltype(std::move(i))为int&&，使用第二个特例化版本
  remove_reference<decltype(std::move(i))>::type c;
  ```

- **特例化成员而不是类**

  我们可以只特例化特定成员函数而不是特例化整个模板：

  ```c++
  template <typename T> struct Foo {
      Foo(const T &t = T()): mem(t) { }
      void Bar() { /* ... */}
      T mem;
      // 其他成员
  };
  template<>    // 特例化模板中的一个成员函数
  void Foo<int>::Bar()
  {
      // 特例化处理
  }
  Foo<string> fs;    // 实例化Foo<string>::Foo()
  Fs.Bar();        // 实例化Foo<string>::Bar()
  Foo<int> fi;    // 实例化Foo<int>::Foo()
  fi.Bar();        // 使用特例化版本的Foo<int>::Bar()
  ```

---

