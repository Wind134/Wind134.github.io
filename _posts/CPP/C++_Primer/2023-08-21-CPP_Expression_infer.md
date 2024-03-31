---
title: 03-表达式类型推断
author: Ping
date: 2022-10-21 11:34:00 +0800
categories: [CPP, C++_Primer]
tags: [Programming, C++/C, cpp]
---

这部分讲解的主要是`decltype`关键字，这是`C++11`标准新增的功能，之前笔记记录比较零散，现在都集中于这一章节；

## 针对变量

这部分主要包括这几部分：

- **针对指针变量的推断**

  ```c++
  int x = 3;
  int *p = x;
  decltype(p) q;	// q是一个指向int变量的指针
  
  // 针对函数部分介绍了对函数指针的指向
  // 针对数组部分介绍了对数组的指向
  ```

- **针对常规变量的推断**

  ```c++
  int x = 42;
  decltype(x) y; // y的类型为 int
  
  int& ref = x;
  decltype(ref) z = y; // z的类型为int&，因为ref是int&类型的引用
  
  int&& right_rex = 3;

  // 这样使用是不合法的，因为推导出的r是一个右值引用，right_rex作为一个右值引用，是左值
  decltype(right_rex) r = right_rex;
  decltype(right_rex) r = std::move(right_rex); // 合法修改
  decltype(right_rex) r = 3;  // 合法，3是一个右值，右值引用绑定到右值；
  ```

- **针对表达式的推断**

  主要是为了强调这么一点：表达式可修改，既然可修改，那就推断为左值；
  ```c++
  int x = 42;
  decltype((x)) y;  // y的类型为int&，因为(x)是一个表达式，表达式做左值
  ```

## 针对函数

正常情况，针对函数的返回值，一般有如下的推导策略：

```c++
int foo();
double bar();

decltype(foo()) result1; // result1的类型为int，根据foo()的返回类型推断
decltype(bar()) result2; // result2的类型为double，根据bar()的返回类型推断

// 而在C++14标准，甚至可以通过auto自动推导
decltype(auto) result1 = foo(); // result1的类型为int，根据foo()的返回类型推断
decltype(auto) result2 = bar(); // result2的类型为double，根据bar()的返回类型推断
```

如果推导的不是函数，而是函数名呢？

```c++
decltype(foo) f;
```

由上可知，`foo`是一个函数指针，指向一个参数为空，返回类型为`int`的函数，因此：

推导出f的类型应该是一个指向参数为空，返回类型为`int`的函数的指针；

## 针对数组

假如我们知道函数返回的指针将指向哪个数组，就可以使用`decltype`关键字声明返回类型：

```c++
int odd[] = {1, 3, 5, 7, 9};
int even[] = {0, 2, 4, 6, 8};

// 首先decltype(odd)推断的是一个类型，这个类型是一个大小为5的整型数组
// 而arrPtr是一个函数指针，它指向的函数接受一个int型参数，返回的类型是一个大小为5的整型数组
decltype(odd) *arrPtr(int i)
{
    return (i % 2) ? &odd : &even;
}
```

这就是CPP中表达式类型推断的知识点了；

---

