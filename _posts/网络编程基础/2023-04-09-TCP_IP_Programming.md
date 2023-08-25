---
title: 网络编程基础
author: Ping
img_path: /assets/img/TCP-IP/
date: 2023-04-09 22:33:00 +0800
categories: [网络编程]
tags: [网络编程, Linux, socket, IO复用]
---


## 理解网络编程和套接字

### 概念理解


**网络编程:** 编写程序使得两台连网得计算机相互交换数据，又称为套接字编程；

**套接字(socket):** 套接字是网络数据传输用的软件设备，操作系统会提供这么一个部件，编程中的"套接字"就是用来连接因特网的工具；

**POSIX(Portable Operation System Interface)标准:** POSIX是为UNIX系列操作系统设立的标准，它定义了一些数据类型：

<table style="width:100%; text-align:center;">
    <tr>
        <th colspan="3" style="text-align: center;">POSIX中定义的数据类型</th>
    </tr>
    <tr>
        <td style="text-align: center;"><b>数据类型名称</b></td>
        <td style="text-align: center;"><b>数据类型说明</b></td>
        <td style="text-align: center;"><b>声明的头文件</b></td>  
    </tr>
    <tr>
        <td style="text-align: center;">int8_t</td>
        <td style="text-align: center;">signed 8-bit int</td>
        <td rowspan="6" style="text-align: center;">sys/types.h</td>
    </tr>
    <tr>
        <td style="text-align: center;">uint8_t</td>
        <td style="text-align: center;">unsigned 8-bit int(unsigned char)</td>
    </tr>
    <tr>
        <td style="text-align: center;">int16_t</td>
        <td style="text-align: center;">signed 16-bit int</td>
    </tr>
    <tr>
        <td style="text-align: center;">uint16_t</td>
        <td style="text-align: center;">unsigned 16-bit int(unsigned short)</td>
    </tr>
    <tr>
        <td style="text-align: center;">int32_t</td>
        <td style="text-align: center;">signed 32-bit int</td>
    </tr>
    <tr>
        <td style="text-align: center;">uint32_t</td>
        <td style="text-align: center;">unsigned 32-bit int(unsigned long)</td>
    </tr>
    <tr>
        <td style="text-align: center;">sa_family_t</td>
        <td style="text-align: center;">地址族(address family)</td>
        <td rowspan="2" style="text-align: center;">sys/socket.h</td>
    </tr>
    <tr>
        <td style="text-align: center;">socklen_t</td>
        <td style="text-align: center;">长度(length of struct)</td>
    </tr>
    <tr>
        <td style="text-align: center;">in_addr_t</td>
        <td style="text-align: center;">IP地址，声明为uint32_t</td>
        <td rowspan="2" style="text-align: center;">netinet/in.h</td>
    </tr>
    <tr>
        <td style="text-align: center;">in_port_t</td>
        <td style="text-align: center;">端口号，声明为uint16_t</td>
    </tr>
</table>

### 基本流程介绍

网络编程中接受连接请求的套接字创建过程整理如下：

- Step 1：调用socket函数创建套接字；
  
  ```c
  serv_sock = socket(PF_INET, SOCK_STREAM, 0);
  ```

- Step 2：调用bind函数分配IP地址和端口号；
  
  ```c
  if(bind(serv_sock, (struct sockaddr*) &serv_addr, sizeof(serv_addr)) == -1)    // 地址类型转换
      error_handling("bind() error");
  ```

- Step 3：调用listen函数转为可接收请求状态；
  
  ```c
  if(listen(serv_sock, 5) == -1)
      error_handling("listen() error");
  ```

- Step 4：调用accept函数受理连接请求；
  
  ```c
  clnt_sock = accept(serv_sock, (struct sockaddr*) &clnt_addr, &clnt_addr_size);
  ```

以上的几个过程就是套接字编程的一个轮廓；

服务器端创建的套接字又称为服务器端套接字或监听(listening)套接字；

在客户端也有请求连接的客户端套接字，一个简单的示例：

```c
#include <sys/socket.h>
int connect(int sockfd, struct sockaddr *serv_addr, socklen_t addrlen);    // 成功则返回0，失败时返回-1
```

客户端程序只做两件事：

- 调用socket函数创建套接字；
- 调用connect函数向服务器端发送连接请求；

## Linux文件操作

在Linux操作系统中，socket也被认为是一种文件，因此在网络数据传输过程中可以使用文件I/O的相关函数，而windows则需要区分socket和文件，因此需要调用特殊的数据传输相关的函数；

通过C代码可以看到，在Linux系统中，文件和套接字操作是同类型操作，通过对文件描述符值的查看可以看到，Linux将套接字也当作文件操作，返回一样的描述符；

**底层文件访问(Low-Level File Access)和文件描述符(File Descriptor)**

**底层:** 脱离于网络标准以外的，由操作系统独立提供的文件；

**文件描述符:** 由系统分配给文件或套接字的整数，这是为了程序员和OS之间的良好沟通而设计的一个渠道：

- 方便称呼操作系统创建的文件而赋予的数；
- 在Windows中也成为**文件句柄**，Linux平台则称为**描述符**；

文件和套接字一般经过创建过程才会被分配文件描述符，详细含义<font color=red>埋坑</font>，后续讲解；

下表展示了一些类型的文件打开模式：

| 打开模式     | 含义           |
|:--------:|:------------:|
| O_CREAT  | 必要时创建文件      |
| O_TRUNC  | 删除全部现有数据     |
| O_APPEND | 维持现有数据，保存到后面 |
| O_RDONLY | 只读打开         |
| O_WRONLY | 只写打开         |
| O_RDWR   | 读写打开         |

#### 打开文件

主要介绍打开文件的过程，这个过程需要传递两个参数：第一个参数为目标文件名及路径信息，第二个参数为文件打开模式(文件特性信息)；

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

int open(const char *path, int flag);    // 成功则返回文件描述符，失败时返回-1
```

#### 关闭文件

使用文件后必须要关闭：

```c
#include <unistd.h>

int close(int fd);    // 失败时返回-1，成功返回0
```

#### 写入文件

调用write函数用户向文件输出(传输)数据，成功时返回写入的字节数：

```c
#include <unistd.h>

// 成功时返回写入的字节数，失败返回-1
ssize_t write(int fd, const void * buf, size_t nbytes);    // fd文件描述符；buf保存要传输数据的缓冲地址值；nbytes表示要传输的字节数
```

<font color=red>注意上面的const，这部分我理解为是要写入的那部分数据的地址，不能变？</font>

#### 读取文件

read函数用来输入文件中(接收)数据，成功时返回接收的字节数：

```c
#include <unistd.h>

// 成功时返回接收的字节数，失败返回-1
ssize_t read(int fd, void * buf, size_t nbytes);    // fd文件描述符；buf为要保存的数据的缓冲地址值；nbytes表示要接收的最大字节数
```

<font color=red>注意上面没有const，这部分我理解为是要保存读取的那部分数据的所在地址，可以变？</font>

## 基于Windows平台

Windows平台的这部分内容暂时省略，后续学习再进行补充！

### 基于Windows的套接字相关函数

### Windows中的文件句柄和套接字句柄

Windows通过调用系统函数创建文件时，返回"句柄"(handle)，Windows中的句柄相当于Linux中的文件描述符，然而Windows中要区分文件句柄和套接字句柄；

### 基于Windows的I/O函数

Windows严格区分文件I/O函数以及套接字I/O函数；

## 套接字类型与协议设置

首先记录一些相关概念：

**协议(Protocol):** 在计算机领域，协议就是计算机间的通信规则，是为了完成数据交换而定好的约定；

### 套接字的创建

这部分针对socket函数进行详细介绍，该函数用来创建套接字：

```c
#include <sys/socket.h>

// domain是使用的协议族信息
// type是套接字数据传输类型信息
// protocol是具体的协议信息
// socket函数成功时返回套接字的文件描述符，失败返回-1
int socket(int domain, int type, int protocol);
```

下面对socket函数中使用的三个参数一一介绍：

**协议族(Protocol Family)**：声明的协议族一般保存在头文件`sys/socket.h`中，一般包括以下类型：

| 名称        | 协议族           |
|:---------:|:-------------:|
| PF_INET   | IPv4互联网协议族    |
| PF_INET6  | IPv6互联网协议族    |
| PF_LOCAL  | 本地通信的UNIX协议族  |
| PF_PACKET | 底层套接字的协议族     |
| PF_IPX    | IPX Novell协议族 |

重点讲解的是IPv4互联网协议族，即PF_INET，此外套接字采用的最终协议是通过socket中的第三个参数传递的，在指定的协议族范围内通过第一个参数决定第三个参数；

**套接字类型(Type):** 套接字类型指的是套接字的数据传输方式，通过socket函数的第二个参数传递，通过该参数决定创建的套接字的数据传输方式；是的，协议族本身也存在着多种数据传输方式，下面主要介绍两种，基本上是对应着TCP与UDP这两种传送协议：

- **面向连接的套接字(SOCK_STREAM)**
  
  有点像TCP的意思，但是具体细节与TCP又不完全相同；
  
  该传输方式的特征：
  
  - 传输过程中数据不会消失；
  - 按序传输数据；
  - 传输的数据不存在<font color=red>数据边界(Boundary)；</font>
  
  收发数据的套接字内部有缓冲(buffer)，即字节数组，通过套接字传输的数据都将保存到该数组；(<font color=red>但不意味着会马上调用read函数</font>)
  
  面向连接的套接字只能与另外一个同样特性的套接字连接，即需要相互匹配；

- **面向消息的套接字(SOCK_DGRAM)**
  
  有点像UDP的意思；
  
  该传输方式的特征：
  
  - 强调快速传输而非传输顺序；
  - 传输的数据可能丢失也可能损毁；
  - 传输的数据有数据边界；
  - 限制每次传输的数据大小；

**协议(protocol):** 一般而言，传递了前两个参数即可创建所需的套接字，因此大部分时候可以向第三个参数传递0，除非**同一协议族中存在多个数据传输方式相同的协议**，此时需要通过第三个参数具体指定协议信息：

```c
int tcp_socket = socket(PF_INET, SOCK_STREAM, IPPROTO_TCP);    // 协议采用TCP，IPv4协议族中面向连接的传输方式
int udp_socket = socket(PF_INET, SOCK_DGRAM, IPPROTO_UDP);    // 协议采用UDP，IPv4协议族中面向消息的传输方式
```


### 套接字的IP与端口介绍

这部分的知识有基础，不赘述，会补充一些细节；

为了让计算机知道数据是传输给播放器还是浏览器，操作系统设置了端口号，通过网卡将传递到内部的数据分配给对应端口的套接字；

端口号本身是不能重复的，但TCP套接字和UDP套接字不会共用端口号，因此允许重复，但TCP与TCP之间不允许共用；

**IP以及端口信息在C语言中以如下的方式呈现:**

```c
struct sockaddr_in
{
    sa_family_t sin_family;        // 地址族(Address Family)
    uint16_t sin_port;            // 16位TCP/UDP端口号
    struct in_addr sin_addr;    // 32位IP地址
    char sin_zero[8];            // 不使用
};

struct in_addr
{
    In_addr_t s_addr;            // 32位IPv4地址(为何要专门用一个结构体保存呢)    
};
```

**sockaddr_in的成员分析:** 

- **成员sin_family**
  
  地址族主要包括三种：AF_INET代表IPv4、AF_INET6代表IPv6、AF_LOCAL代表本地通信中采用的UNIX协议的地址族；

- **成员sin_port**
  
  该成员主要保存16位端口号，重点在于它以**网络字节序的大端序**保存；

- **成员sin_addr**
  
  保存32位IP地址信息，也以**网络字节序**保存；

- **成员sin_zero**
  
  无特殊含义，只是为使结构体sockaddr_in的大小与<font color=red>sockaddr结构体</font>保持一致而插入的成员，之前的代码中涉及到指针类型的转换，该成员的用处就在于此；

对于bind函数而言，他希望第二个参数的类型是`struct sockaddr`，但是sockaddr原本的定义是：

```c
struct sockaddr
{
    sa_family_t sin_family;    // 地址族
    char sa_data[14];        // 地址信息
};
```

sa_data中保存的信息中需包含IP地址和端口号，剩余部分应该填充0，**而包含地址信息是比较麻烦的**，继而有了新的结构体sockaddr_in，经历一层转换即可；

## 网络字节序与地址变换

之所以介绍这部分，是因为不同CPU对4字节整数型值1在内存空间的保存方式是不同的，此谓之大端小端存储：

- 大端：高位字节放低位地址；
- 小端：高位字节放在高位地址；(Intel系列CPU以**小端序方式**保存数据)

而网络编程为了尽可能跨平台(硬件软件)，会统一采用**网络字节序**，一般是大端字节顺序；

因此一般来说我们需要进行字节序转换；

### 字节序转换

介绍几个帮助转换字节序的函数：

- `unsigned short htons;`-转换无符号短整型(host字节序->network字节序)；
- `unsigned short ntohs;`-(net字节序->host字节序)
- `unsigned long htonl`-如上
- `unsigned long ntohl`-如上

上面的host理解为主机，network理解为网络即可；

### IP地址转换的例子

首先介绍一个简单的示例：将类似"211.214.107.99"的点分十进制格式的字符串转换成一个网络字节序主要通过以下两种方式来实现：

```c
#include <arpa/inet.h>

// inet_addr将一个点分十进制格式的字符串转换为一个标准格式的IP地址
in_addr_t inet_addr(const char * string);

// inet_aton将一个点分十进制格式的字符串转换为一个标准格式的IP地址，但结果保存到第二个参数的地址
// 转换成功返回非0值，转换失败返回0值
int inet_aton(const char * string, struct in_addr * addr);    // inet_aton转换，该函数利用了in_addr结构体，保存到该地址
```
同时也有一个函数可以将**网络字节序**整数型IP地址转换为我们熟悉的字符串形式：

```c
#include <arpa/inet.h>

// 传地址值作为参数
// 返回一个点分十进制类型的IP
char * inet_ntoa(struct in_addr adr);
```
该函数返回类型为char指针，这部分的数据随时可能会被清除，如果需要长期保存，需要：

```c
addr1.sin_addr.s_addr = htonl(0x1020304);
addr2.sin_addr.s_addr = htonl(0x1010101);

// 返回char指针，传给str_ptr
str_ptr = inet_ntoa(addr1.sin_addr);

// 将str_ptr地址的内容交给str_arr
strcpy(str_arr, str_ptr);

// 这一步会使得新的IP地址字符串覆盖，但由于上面str_arr已保存，不影响
inet_ntoa(addr2.sin_addr);
```

### IP地址初始化过程

初始化过程的代码：

```c
struct sockaddr_in addr;
char * serv_ip = "211.217.168.13";    // 声明IP地址字符串，这是一种硬编码
char * serv_port = "9190";            // 声明端口号字符串

memset(&addr, 0, sizeof(addr));        // 结构体变量addr的所有成员初始化为0

// 下面三行做的事情分别是：
// 指定IPv4地址族
// 基于字符串的IP地址初始化，如果是服务端可以用INADDR_ANY，表示采用自动分配的IP
// 基于字符串的端口号初始化，atoi将char->int，同时转换成网络字节序
addr.sin_family = AF_INET;
addr.sin_addr.s_addr = inet_addr(serv_ip);
addr.sin_port = htons(atoi(serv_port));
```
INADDR_ANY参数介绍：

- **INADDR_ANY:** 对于服务端而言，可以利用常数INADDR_ANY分配服务端的IP地址，采用这种方式可以自动获取运行服务器端的计算机IP地址，只要端口号一致，就可以从不同IP地址接收数据；

### 套接字IP分配

在初始化之后，需要将初始化的地址信息分配给套接字，这一项工作在服务端由bind函数负责：

```c
#include <sys/socket.h>

// sockfd 要分配地址信息的套接字文件描述符
// myaddr 存有地址信息的结构体变量地址值
// addrlen 第二个结构体变量的长度
// return 成功返回0，失败返回-1
int bind(int sockfd, struct sockaddr * myaddr, socket_t addrlen);
```

调用成功后，则将第二个参数指定的地址信息分配给第一个参数中相应的套接字；

## TCP的服务/客户端预备知识

### TCP/IP协议栈

TCP/IP协议栈共分4层，以一个表格展示：

<table style="width:100%; text-align:center;">
    <tr>
        <th colspan="2" style="text-align: center;">应用层</th>
    </tr >
    <tr>
        <td style="text-align: center;"><b>TCP层</b></td>
        <td style="text-align: center;"><b>UDP层</b></td>
    </tr >
    <tr >
        <td colspan="2" style="text-align: center;"><b>IP层</b></td>
    </tr>
    <tr>
        <td colspan="2" style="text-align: center;"><b>链路层</b></td>
    </tr>
</table>    

数据收发分成了4个层次化过程，这四个层次化过程结合起来称作**TCP/IP协议栈**；

各层的实现通过操作系统等软件实现，也可能通过类似**NIC(Network Interface Card)** 的硬件设备实现；

一个很有感触的设计思想: **分层式协议**

- 公开对外的标准，引导更多的人遵守规范，因此即便是不同公司的路由器，走的还是IP层的协议标准，网卡，走的也是链路层的协议标准；

**链路层:** 链路层是物理链接领域标准化的结果，也是最基本的领域，专门定义LAN、WAN、MAN等网络标准；

**IP层:** 在复杂的网络中传输数据的路径选择，即决定向目标传输数据需要经过哪条途径；IP本身是面向消息的不可靠的协议；

**TCP/UDP层:** 以IP层提供的路径信息为基础完成实际的数据传输，故该层又称传输层；

- **传输层与IP层间的关系**
  
  IP层只关注1个数据包的传输过程，即便是传输多个数据包，每个数据包也是由IP层实际传输的，但是传输本身以及传输顺序是不可靠的，因此需要添加TCP/UDP层来处理这些不可靠的情形；

**应用层:** 上述三层是套接字通信过程中自动处理的，即可以理解为都封装在套接字内部，程序员无需在意这些细节，而程序员需要根据程序特点决定服务器端和客户端之间的数据传输规则，这就是应用层协议；

## 实现基于TCP的服务/客户端

展示**TCP服务端的默认的函数调用顺序:** 

<img title="" src="调用顺序.svg" alt="" data-align="center">

创建套接字以及向套接字分配网络地址的过程在上一章节已经进行过详细讲解，接下来针对后续的几个过程进行讲解；

### 等待连接请求状态

服务器进入等待连接请求状态通过调用listen函数来实现，只有调用了listen函数客户端才能进入可发出连接请求的状态(connect函数)：

```c
#include <sys/socket.h>

// sock 希望进入等待连接请求的套接字文件描述符，传递的套接字参数成为服务器端套接字(监听套接字)
// backlog 为连接请求队列的长度，若为5则该长为5，表示最多使5个连接请求进入队列
// return 成功时返回0，失败时返回-1
int listen(int sock, int backlog);
```

**等待连接请求状态:** 客户端请求连接时，服务端受理连接前一直使请求处于等待状态；

- 客户端的连接请求本身就是服务端从网络中接收到的一种数据，而服务器端套接字就是接收连接请求的一扇门；

### 受理客户端连接请求

调用listen函数后，若有新的连接请求，则按序受理；

受理请求意味着进入可接受数据的状态，而进入这种状态的所需部件还是——**套接字**；

- 但这个套接字与**监听套接字**并不是同一种；

```c
#include <sys/socket.h>

// sock 服务器套接字的文件描述符
// addr 发起连接请求的客户端地址信息的变量地址值
// addrlen 第二个参数addr结构体的长度，但是传入的是存有该长度的变量地址
// return 成功时返回创建的套接字文件描述符，失败返回-1
int accept(int sock, struct sockaddr * addr, socklen_t * addrlen);
```

accept函数受理连接请求等待队列中待处理的客户端连接请求，**函数调用成功后将产生用于数据I/O的套接字**，并返回其文件描述符；

accept函数获取客户端IP地址等信息的过程：
- 操作系统提供的网络协议栈完成了网络连接的建立和数据传输等操作；
- 当服务器调用accept函数时，操作系统会在内核中创建一个新的套接字，该套接字与客户端的套接字建立连接，完成TCP三次握手。
- accept函数会返回这个新的套接字的描述符，该描述符可以用于向客户端发送和接收数据。

在这个过程中，客户端的IP地址和端口号等信息都会被保存在内核中的连接记录中，而accept函数会从这个连接记录中获取这些信息，将其写入到提供的struct sockaddr类型的变量中。

我们可以通过将该变量强制类型转换为`struct sockaddr_in`类型，来获取其中的IP地址和端口号等信息。

以上是服务端的准备工作，而客户端层面同样需要发起连接请求。

### 客户端的连接请求

与服务端相比，区别就在于**请求连接**，它是创建**客户端套接字**后向服务器端发起的连接请求，服务器端调用listen函数后创建连接请求等待队列，之后客户端即可请求连接：

```c
#include <sys/socket.h>

// sock 客户端套接字文件描述符
// servaddr 目标服务器端地址信息的变量地址值
// addrlen 以字节为单位传递servaddr的地址变量长度
// return 成功返回0，失败返回-1
int connect(int sock, struct sockaddr * servaddr, socklen_t addrlen);
```

客户端调用connect函数后，发生以下情况才会返回：
- 服务器端接收连接请求；
  - 该接收请求并不意味着服务器端调用accept函数，而是把连接请求信息记录到等待队列
  - <font color=red>我知道你要连接了，知道了知道了；</font>
  - 客户端就会想，<font color=red>好的，你知道了，那你应该知道我需要连接了，我可以返回我的connect结果了</font>；
- 发生断网等异常情况而中断连接请求；

**客户端层面对套接字IP和端口号的分配**

网络数据交换必须分配IP和端口，对于客户端而言，**客户端的IP地址和端口在调用connect函数时自动分配**，而无需像服务器那样调用bind函数进行分配；

下面详细列出TCP服务端/客户端之间的实现顺序：

<img src="服务端-客户端.svg"  />

客户端在调用connect函数之前，服务器可能率先调用了accept函数，在这种情况下服务器端进入了阻塞状态，直到客户端调用connect；

## 迭代版本的服务/客户端的实现

本质上是服务器端将客户端传输的字符串数据原封不动地传回客户端，就像回声一样，在这部分主要分两个环节，迭代服务器端，以及迭代客户端；

### 实现迭代服务器端

基于之前实现的服务器端的代码逻辑，实质上是处理完一个客户端连接即退出，要想继续受理后续的客户端连接请求，需要插入循环语句反复调用accept函数；

<img src="迭代服务器.svg"  />

现在暂时还未涉及到**线程与进程**，也就是说现在在同一个时刻服务端只能服务于一个客户端；

### 实现回声客户端

大体的框架与常规客户端并无不同，在书中唯一的变化就是输入的字符串不再是硬编码进代码中，而是设置了一个循环，经过实践测试可以看到，客户端给服务端发送的字符串信息又会被服务器传送回来；

书中对回声客户端的实现存在**一点问题**，具体体现在：

```c
write(sock, message, strlen(message));            // 假设我们发送的一个数据包服务器返回时被TCP分为报文段1、报文段2
str_len = read(sock, message, BUF_SIZE - 1);    // read会读取缓冲区的前BUF_SIZE - 1字节，但这些字节可能同时有报文段1以及报文段2的前部分
```

该部分**代码假设**：每次调用read、write函数都会以字符串为单位执行实际的I/O操作；

- 但实际上由于TCP不存在数据边界，多次调用write传递的字符串有可能一次性传递到服务器端，然后客户端一次性收到多个字符串；
- 这就是常说的TCP的**粘包问题**；

**了解到的其他解释:** 

- 假设服务器收到客户端发送的一整个30字节数据包，因为拥塞控制算法，返回了两个数据包，第一个数据包的长度为10字节，第二个数据包的长度为20字节；
- 客户端在接收时，先调用`read(sock, message, BUF_SIZE - 1)`函数读取缓冲区的前`BUF_SIZE-1`字节；
- 假设此时读到了第一个数据包的前5字节和第二个数据包的前15字节，那么`read`函数就返回20，第一个和第二个数据包的后5字节还留存在缓冲区里等待下次读取；
- 则客户端收到的消息就失去了完整性

**针对这些问题的修复代码:** 

```c
recv_len = 0;    // 该变量存储读取的字节长
while(recv_len < str_len)    // 当读取到的字节长小于之前发送过去的字节长时，不停的读取缓冲区(这里还涉及到C的一个小技巧，不写'!=')
{
    recv_cnt = read(sock, &message[recv_len], BUF_SIZE - 1);    // 并写入message
    if (recv_cnt == -1)    error_handing("read() error!");
    recv_len += recv_cnt;
}
message[recv_len] = 0;    // 在最后添加一个空字符'\0'
printf("Message from server: %s", message);    // 这样打印出来的信息就很准确了
```

上述问题即便被很好的修复了，但依然要明白一个事实: **在更多的情况下，我们都不太可能提前知道要接收的数据长度；**

因此收发过程中也需要定好规则以表示数据的边界，或者提前告知收发数据的大小，**服务器/客户端实现过程中逐步定义的这些规则集合就是应用层协议**，但是上面的解决策略也可以看作是解决粘包问题的一种手段；

具体的实现见[Github源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/2-%E8%BF%AD%E4%BB%A3%E6%9C%8D%E5%8A%A1%E5%99%A8-%E5%AE%A2%E6%88%B7%E7%AB%AF)；

## 基于UDP的服务/客户端

UDP只在IP的数据服务之上添加了很少一点的功能，即**复用和分用的功能**以及**差错检测**的功能，UDP特点：

- UDP是无连接的，即发送数据之前不需要建立连接；
- UDP尽最大努力交付，不保证可靠交付；
- UDP是面向报文的，发送方的UDP对应用层交下来的报文，不合并不拆分，而是保留报文的边界，即一次发送一个报文；
- UDP没有拥塞控制，很多实时应用(IP电话、实时视频会议)要求数据不能用太大的时延，UDP刚好符合要求；
- UDP支持一对一、一对多、多对一和多对多的交互通信(<font color=red>这个怎么理解？</font>)；
- UDP的首部开销小，仅8字节；

### C/S端的实现

**UDP中的服务器端和客户端没有连接**，因此UDP中只有创建套接字的过程和数据交换过程；

**UDP服务器端和客户端均只需1个套接字**，TCP中的套接字之间是一对一的关系，若要向10个客户端服务则需要10个套接字(<font color=red>源码中貌似没有？</font>)

- **<font color=red>解释：</font>** 源码中是有的，accept函数受理连接请求等待队列中待处理的客户端连接请求，函数调用成功后将产生用于数据I/O的套接字，并返回其文件描述符；
- 上面的解释说明，每执行一次accept函数，就会有一个套接字的产生；

也就是说一个UDP套接字可以与多个不同主机交换数据，这一点与TCP套接字具有本质的区别；

### UDP的数据I/O函数

**TCP套接字**创建好后，传输数据时无需再添加地址信息，因为TCP套接字将保持与对方套接字的连接；

但**UDP套接字**不会保持连接状态，因此每次传输数据时都要添加目标地址信息；

以下是针对相关函数的介绍：

首先是服务器向客户端发送数据的函数：

```c
#include <sys/socket.h>

// sock UDP套接字的文件描述符
// buff 保存待传输数据的缓冲地址值
// nbytes 待传输的数据长度
// flags 可选参数，默认0
// to 目的地址
// addrlen 地址字节长，传值
// 成功时返回传输的字节数，失败时返回-1
ssize_t sendto(int sock, void *buff, size_t nbytes, int flags,
               struct sockaddr *to, socklen_t addrlen);
```

与TCP的输出函数write函数最大的区别是：此函数需要**向它传递目标地址信息**(无连接嘛)；

客户端从服务器接收数据的函数；

```c
#include <sys/socket.h>

// sock 客户端UDP套接字的文件描述符
// buff 保存待接收数据的缓冲地址值
// nbytes 待接收的数据长度
// flags 可选参数，默认0
// from 数据的来源方
// addrlen 地址字节长，传值
// 成功时返回传输的字节数，失败时返回-1
ssize_t recvfrom(int sock, void *buff, size_t nbytes, int flags,
                 struct sockaddr * from, socklen_t *addrlen);
```

**基于UDP的回声服务器端/客户端**的源码实现在这一块不详细记录；

**UDP客户端套接字的地址分配:** 在调用sendto函数传输数据前应完成对套接字的地址分配工作，一般而言通过调用bind函数实现，但是调用sendto时发现尚未分配地址信息，则在首次调用sendto函数时也会给相应套接字自动分配IP和端口，此时分配的地址一直保留到程序结束为止；

### UDP的数据传输特性

TCP传输面向字节流，数据不存在边界，而UDP是**具有边界**的协议(一次一个包)，**传输中调用I/O函数的次数非常重要**，换句话说，输入函数的调用次数和输出函数的调用次数完全一致，这样才能保证数据接收全部的已发送数据；

**介绍两种类型的UDP套接字:** 

- **未连接UDP套接字**
  
  针对目标地址每次都变动的问题，可以重复利用同一套UDP套接字向不同目标传输数据，这种未注册目标地址信息的套接字称为未连接套接字；
  
  *但是如果需要向同一个地址发送多次数据呢*？这样的效率就不是很高，我们可以创建已连接UDP套接字；

- **创建已连接UDP套接字**
  
  代码：
  
  ```c
  sock = socket(PF_INET, SOCK_DGRAM, 0);    // 创建的还是UDP套接字
  memset(&adr, 0, sizeof(adr));
  adr.sin_family = AF_INET;
  ...
  connect(sock, (struct sockaddr *) &adr, sizeof(adr));    
  ```
  
  connect之后就与TCP套接字一样，调用sendto函数时只需传输数据，**还可以使用write、read函数进行通信**；

具体实现[详见github](https://github.com/Wind134/TCP-IP-Programming/tree/main/4-UDP%E7%9A%84%E6%95%B0%E6%8D%AE%E8%BE%B9%E7%95%8C)；

## 优雅的断开套接字连接

这部分可以结合TCP的[四次握手](https://wind134.github.io/posts/TCP_Learning/)的过程进行理解，发送方A->接收方B的连接关闭后，**B->A的连接还是保留着**，B确认自身没有任何需要发送的数据之后，B会告知TCP可以断开连接了；

### 理解"优雅断开"

**理解:** 

- A发送请求说我没有需要发送的数据了，我要断开了；
- B回A说好的，已收到你的请求，为了让你知道我已经收到了，我给你发一条确认信息，然后我看看我这边还有有没有没干完的活；
- A收到B发回的确认之后，表示，好的，我愿意再等等，于是进入某种状态，B检查了一会过后，又给A发了一条确认信息，表示我没有任何要发送的了；
- A又收到B的确认，又发送一条消息告知B已收到B刚刚发送的信息后A进入2MSL状态，B收到这条信息之后关闭连接，A经过2MSL后也会关闭；

所谓优雅的断开连接，即TCP连接释放阶段中的**半关闭状态**，如果只是直白的断开连接，就不太考虑对方的感受了；

实现半关闭状态的函数：

```c
#include <sys/socket.h>

// sock 需要断开的套接字文件描述符
// howto 传递断开方式信息
// 成功返回0，失败返回-1
int shutdown(int sock, int howto)
```

`howto`的三个参数：

- `SHUT_RD`-断开输入流，这个输入流指的是输入的缓冲区，即要读取的缓冲区；
- `SHUT_WR`-断开输出流；
- `SHUT_RDWR`-同时断开I/O流；

源码部分[已上传Github](https://github.com/Wind134/TCP-IP-Programming/tree/main/3-%E4%BC%98%E9%9B%85%E7%9A%84%E6%96%AD%E5%BC%80%E5%A5%97%E6%8E%A5%E5%AD%97%E8%BF%9E%E6%8E%A5)！

### 半关闭的必要性

考虑这么一个情景：客户端连接到服务器端，服务器端将约定的文件传给客户端，客户端收到后发送字符串"Thank you"到服务器端；

但是客户端无法知道需要接收数据到何时，客户端自己也不知道该文件啥时候才接收完毕；

于是我们考虑，是不是可以让服务器与客户端约定一个代表文件尾的字符，这个方向是正确的，但是这也意味着文件中不能有与约定字符相同的内容；

于是我们约定一个特殊的规则，服务器端应最后向客户端传递EOF表示文件传输结束，客户端通过函数返回值接收EOF，以避免与文件内容冲突；

而服务器传递EOF，则是在断开输出流时向对方主机传输EOF；

当然我们可以在调用close函数的同时关闭I/O流，这样也会向对方发送EOF，但此时无法再接收对方传输的数据，因此可以调用shutdown函数，只关闭服务器的输出流，这样又可以表明自己的数据发送完毕，又可以接收对方数据；

## 域名及网络地址

**DNS域名系统:** 对IP地址和域名进行相互转换的系统，其核心是DNS服务器；基于这些情形，我们需要考虑的一点是：在我们写的程序中需不需要填进去域名呢，针对用户而言，我们需要考虑一种尽可能便利的方法；

- 写入域名对应的IP到程序，那么每次IP更换我们都需要重新编译，下下策；
- 因此，我们考虑让程序本身根据域名去自动获取IP地址；

### 地址<->域名

**利用域名获取IP地址**

以下函数可以通过传递字符串格式的域名获取IP：

```c
#include <netdb.h>    // 需要包含该头文件

// hostname 域名参数，字符串类型
// return 成功时返回hostent结构体地址，失败时返回NULL指针
struct hostent * gethostbyname(const char * hostname);

// h_name 官方域名，代表某一主页，但不是每家著名公司都会注册官方域名
// h_aliases 多个域名，即可以通过多个域名访问同一主页，h_aliases指向一个字符串数组，保存多个域名
// h_addrtype 获取的IP地址的地址族信息
// h_length 保存IP地址长度，IPv4地址长为4，IPv6长为16
// h_addr_list 一些网站可能将多个IP分配给同一域名，这里保存了多个IP(以整数形式(char形式？)保存)
struct hostent
{
    char * h_name;
    char ** h_aliases;
    int h_addrtype;
    int h_length;
    char ** h_addr_list;
}
```

**利用IP地址获取域名**

以下函数可以利用IP地址获取域相关信息：

```c
#include <netdb.h>    // 需要包含该头文件

// addr 含有IP地址信息的in_addr结构体指针，为了传递IPV4地址之外的信息，该变量类型声明为char指针
// len 表示第一个参数中的地址信息的字节数，IPv4时为4，IPv6时为16
// family 传递地址族信息，IPv4时为AF_INET，IPv6时为AF_INET6，(AF_INET是一个宏常量，值为2)
// return 成功时返回hostent结构体地址，失败时返回NULL指针
struct hostent * gethostbyaddr(const char * addr, socklen_t len, int family);
```

**Notes:** <font color=red>上面说的传递IPV4地址之外的信息是什么意思？</font>
- 意思是可能出于某种需要，需要附带与IP地址相关的一些信息；

从上面两个函数，我们可以看到的是，本质上都是获取同一个信息：`struct hostent*`；
- 传入域名的参数，可以通过返回的结构体提取IP信息；
- 传入IP的参数，可以通过返回的结构体提取域名信息；

详细的使用过程[见源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/5-%E5%9F%9F%E5%90%8D%E5%8F%8A%E7%BD%91%E7%BB%9C%E5%9C%B0%E5%9D%80)；

## 套接字的多种可选项

### 套接字可选项

之前的程序基本用的是默认套接字特性进行数据通信，之前所有的范例比较简单，无须特别操作套接字特性；

书中列出了一系列可设置套接字的多种可选项(140页)，该一系列套接字选项几乎都可以进行**读取(Get)**和**设置(Set)**，接下来会针对一些重要的套接字可选项进行介绍；

<table style="width:100%; text-align:center;">
  <tr>
    <th style="text-align: center;">协议层</th>
    <th style="text-align: center;">选项名</th>
    <th style="text-align: center;">读取</th>
    <th style="text-align: center;">设置</th>
  </tr>
  <tr>
    <td style="text-align: center;" rowspan="9">SQL_SOCKET</td>
    <td style="text-align: center;">SO_SNDBUF</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_RCVBUF</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_REUSEADDR</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_KEEPALIVE</td>  
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_BROADCAST</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_DONTROUTE</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_OOBINLINE</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_ERROR</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">X</td>
  </tr>
  <tr>
    <td style="text-align: center;">SO_TYPE</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">X</td>
  </tr>
  <tr>
    <td style="text-align: center;" rowspan="5">IPPROTO_IP</td>
    <td style="text-align: center;">IP_TOS</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">IP_TTL</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">IP_MULTICAST_TTL</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">IP_MULTICAST_LOOP</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">IP_MULTICAST_IF</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;" rowspan="3">IPPROTO_TCP</td>
    <td style="text-align: center;">TCP_KEEPALIVE</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">TCP_NODELAY</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr>
  <tr>
    <td style="text-align: center;">TCP_MAXSEG</td>
    <td style="text-align: center;">O</td>
    <td style="text-align: center;">O</td>
  </tr> 
</table>

针对**读取和设置**套接字可选项，先介绍两个函数：

```c
#include <sys/socket.h>

// sock 套接字文件描述符，level为查看的可选项的协议层，optname为要查看的可选项名
// optval 保存查看结果的缓冲地址值，optlen是向optval传递的缓冲大小
// 成功返回0，失败返回-1
int getsockopt(int sock, int level, int optname, void *optval, socklen_t *optlen);

// 成功返回0，失败返回-1
int setsockopt(int sock, int level, int optname, void *optval, socklen_t *optlen);

// 上面两个函数的功能分别是查看和设置sock套接字的类型，具体的类型值体现在optval中，对于SOCK_STREAM而言一般是对应返回1，SOCK_DGRAM一般是返回2
// 但是换句话来说，set的意义不大，因为套接字只能在创建时决定，后续不能再更改
```

在实现TCP以及UDP的服务器端/客户端通信的过程中，我们已经了解到，**Linux系统中针对套接字的写入读取与针对一般文件的写入读取并没有太大差异**，换句话说就是创建套接字时像创建普通的文件描述符一样，将会生成I/O缓冲，IO缓冲存在两个可选项：

- `SO_SNDBUF`：输入缓冲大小相关的可选项；
- `SO_RCVBUF`：输出缓冲大小相关的可选项；

### Time-wait状态介绍

这部分主要介绍可选项SO_REUSEADDR，顾名思义可以了解到这是一个重用地址的选项，何时重用，TCP本身是面向连接的，当两个地址正处于TCP连接的过程中，该地址是无法被重用的；

在前面的实现迭代服务器端/客户端部分，我们通过让客户端控制台输入Q消息，或者通过CTRL+C快捷键终止程序，但是几种方式存在的区别是：

- Q消息输入后会调用close函数关闭套接字，然后向服务器端发送FIN消息并经过四次握手过程，正常断开，不会发生`bind() error`；
- "CTRL+C"则直接向服务端发送FIN消息，后续由操作系统关闭文件以及套接字，也是正常断开，不会发生错误；
- 但如果直接向服务器这端控制台输入CTRL+C，则服务端重新运行将产生问题，会输出`bind() error`，要过3分钟后才可重运行(<font color=red>2MSL</font>)时间；
  - 因为这将是一个强制终止的过程，不会经过TCP断开连接过程的规范处理； 

以上的区别大体可以归结为一个原因: **先断开连接的套接字必然要经过time-wait过程**；

- 对于服务器而言，先发送FIN断开连接，那么后续服务器会进入time-wait，而这个时长按照现在TCP协议的规定约为3分钟；
- 客户端之所以不需要考虑这些，是因为客户端的套接字是任意指定的，也没有bind过程；

从上面的例子我们可以看出，Time-wait是个好东西，但是有时候不一定符号实际的需求，比如因系统故障而紧急停止，**这时候需要尽快重启服务器端以提供服务**；此时：

- 我们可以在套接字的可选项中更改SO_REUSEADDR的状态，适当调整该参数，通过该参数可以将处于Time-wait状态下的套接字端口号重新分配给新的套接字；
  
  ```c
  optlen = sizeof(option);
  option = TRUE;    // 设置为在time-wait状态下可重新将端口号分配给新的套接字
  setsockopt(serv_sock, SOL_SOCKET, SO_REUSEADDR, (void*) &option, optlen);
  ```

### Nagle算法

Nagle算法为了防止因数据包过多而发生网络负载，该算法运用于TCP层，比较简单；

TCP套接字默认使用Nagle算法交换数据，因此**最大限度进行缓冲**，直到收到ACK，接下来以发送"Nagle"为例，分析使用以及不使用该算法的过程：

- 使用算法时，发送放先输入`N`，然后收到接收方返回的确认，该确认字段也会告知自身的接收缓冲区的大小，然后发送方最大限度利用缓冲，发送`agle`字段，接收方再针对此返回ACK；
- 不使用算法时，发送方直接依序传`N`到`e`到输出缓冲，这个过程与是否接收到对方发来的ACK无关，此情况下会对网络流量有异常影响，因为来来回回交换的东西太多了；

是否需要启用该算法，要考虑数据传输的特性以及网络流量的状态，当传输大文件数据时，我们想要的就是尽快将文件传输出去，而不需要等待ACK报文返回再发送，从而提升效率；

而控制该算法是否启用的套接字可选项为**TCP_NODELAY**：

```c
// 设置Nagle算法的启用状态
int opt_val = 1;    // 1是禁用，0是启用
setsockopt(sock, IPPROTO_TCP, TCP_NODELY, (void *)&opt_val, sizeof(opt_val));

// 查询Nagle算法的设置状态
int opt_val;
socklen_t opt_len;
opt_len = sizeof(opt_val);
setsockopt(sock, IPPROTO_TCP, TCP_NODELY, (void *)&opt_val, &opt_len);
```

以上的所有介绍只是针对一些比较常见的套接字可选项，[源码中](https://github.com/Wind134/TCP-IP-Programming/tree/main/6-%E6%9F%A5%E7%9C%8B%E5%92%8C%E8%AE%BE%E7%BD%AE%E5%A5%97%E6%8E%A5%E5%AD%97%E5%8F%AF%E9%80%89%E9%A1%B9)针对如何get以及如何set都有着较为清晰的描述；

## 多进程服务器端

### 进程概念及应用

考虑服务端对每个客户端的平均服务时间，如果时间过长，那么后面的客户端会相当不满于这一点；

即便有可能延长时间，我们也需要对服务端进行改进，使其同时向所有发起请求的客户端提供服务，同时也需要考虑到网络程序中数据通信时间比CPU运算时间更大，因此向多个客户端提供服务是一种有效利用CPU的方式，一般而言有如下一些方式：

- **多进程服务器:** 创建多个进程提供服务；
- **多路复用服务器:** 通过捆绑并统一管理I/O对象提供服务；
- **多线程服务器:** 通过生成与客户端等量的线程提供服务；

### 多进程服务器

操作系统层面针对此概念有过详细描述，这里按照书本的角度进行新的描述；

**进程:** 占用内存空间的正在运行的程序；

- 存储在硬盘上的不算进程，只能算程序，因为并未进入运行状态；
- 操作系统中，进程是程序流的基本单位，若创建多个进程，则操作系统将同时运行多个进程，有时一个程序本身也会产生多个进程；

**Notes：CPU核心数与进程**

- 1个CPU中可能包含多个核，核的个数与可同时运行的进程数相同；
- 若进程数超过核数，进程将分时使用CPU资源，但一般而言由于CPU极快，我们会认为所有的进程在同时运行；

**进程ID:** 以Linux为例，所有进程都会从操作系统分配到ID，该ID即为进程ID，其值为大于2的整数，1要分配给操作系统启动后的(用于协助操作系统)首个进程；

在C语言中，我们一般通过调用fork函数创建进程：

```c
#include <unistd.h>

// 成功时返回进程ID，失败时返回-1
pid_t fork(void);
```

fork函数将创建调用的进程副本(概念上如何理解)：

- 并非根据完全不同的程序创建进程，而是复制正在运行的、调用fork函数的进程；
- **两个进程都将执行fork函数调用后的语句**；

由于通过同一个进程、复制相同的内存空间，之后的程序流要根据fork函数的返回值加以区分：

- **父进程:** 调用fork函数的主体，fork函数返回子进程ID，从而根据返回值知道，我这是父进程；
- **子进程:** 通过父进程调用fork函数复制出的进程，fork函数返回0，从而根据返回值知道，我这是子进程；

fork函数的具体运用，[详见源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/7-%E5%A4%9A%E8%BF%9B%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/fork%E5%AD%90%E8%BF%9B%E7%A8%8B)；

### 进程和僵尸进程

如果没有认真对待进程销毁，可能会导致僵尸进程的出现，占用系统的重要资源；

**产生僵尸进程的原因分析**

一般而言，调用fork函数产生子进程的终止方式主要有两种：

- 传递参数并调用exit函数；
- main函数中执行return语句并返回值；

向exit函数传递的参数值和main函数产生的return语句返回的值都会传递给操作系统，而操作系统本身不会销毁子进程，要等到那些值传递给产生该子进程的父进程，处在这种状态下的进程就是僵尸进程；

因此问题的根源在于:**操作系统本身不会把子进程的那些值传递给父进程**；

因此:**需要父进程去主动要求获得子进程的结束状态值**，父母要负责收回自己生的孩子；

如前所述，为了销毁子进程，父进程应主动请求获取子进程的返回值，而发起请求有两种方式：

- **销毁僵尸进程方法1**
  
  调用wait函数：
  
  ```c
  #include <sys/wait.h>
  
  // statloc 子进程的终止状态信息存储在改指针指向的整数变量中
  // 若成功则返回终止的子进程ID，失败时返回-1
  pid_t wait(int* statloc);
  ```
  
  调用该函数时如果已有子进程终止，那么子进程终止时传递的返回值(exit函数的参数值、main函数的return返回值)将保存到参数statloc所指的内存空间。
  
  但函数参数指向的单元中还包含其他信息，因此需要通过下列宏进行分离：
  
  - WIFEXITED：子进程正常终止时返回true；
  - WEXITSTATUS：返回子进程的返回值；
  
  也就是说，向wait函传递变量status的地址时，调用wait函数后应编写如下代码：
  
  ```c
  wait(&status);  // wait函数返回了子进程的ID
  
  // 接下来确定status的状态即可
  if(WIFEXITED(status)) // 如果是正常终止(该宏表示正常终止)
  {
      puts("Normal termination!");
      printf("Child pass num: %d", WEXITSTATUS(status));  // WEXITSTATUS是一个宏定义
  }
  ```
  
  **Notes:** 调用wait函数时，如果没有已终止的子进程，那么程序将阻塞(Blocking)直到有子进程时终止；

- **销毁僵尸进程方法2**
  
  由于wait函数会引起程序阻塞，还可以考虑调用waitpid函数，可以防止阻塞：
  
  ```c
  #include <sys/wait.h>
  
  // pid 等待终止的目标子进程的ID，若传递-1，则与wait函数相同，可以等待任意子进程的终止
  // statloc 与wait中的statloc参数具有相同含义
  // options 传值，传递头文件sys/wait.h中声明的常量WNOHANG(NO HANG-没有挂起)，即使没有终止的子进程也不会进入阻塞状态，而是返回0并退出函数
  // return 成功时返回终止的子进程ID，如果子进程还在运行，返回0，失败时返回-1
  pid_t waitpid(pid_t pid, int * statloc, int options)
  ```

两种方式的具体应用[详见源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/7-%E5%A4%9A%E8%BF%9B%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E7%88%B6%E8%BF%9B%E7%A8%8B%E5%AF%B9%E5%AD%90%E8%BF%9B%E7%A8%8B%E7%9A%84%E7%AE%A1%E7%90%86)；

### 信号处理

经过上面的学习已经知道了进程创建以及销毁办法，但还有一个没有解决的问题：

- 子进程究竟何时终止，调用waitpid函数后要无休止地等待吗？

父进程有自己的任务，因此不能只调用waitpid函数以等待子进程终止；

针对这种情况，一般有一下的解决方案：

- **向操作系统求助**
  
  操作系统是一切进程的管理者，若操作系统告知父进程，其创建的子进程终止了，那么父进程则可以暂时放下工作，处理子进程终止的相关事宜；
  
  实现该想法，我们引入了**信号处理(Signal Handling)**机制，此处的信号是在特定事件发生时由操作系统向进程发送的消息；
  
  为了响应该消息，执行**与消息相关的自定义操作**的过程即为信号处理；
  
  为了理解这个过程，以一个比较轻松的对话开始信号处理：
  
  - **进程:** 操作系统，如果我之前创建的子进程终止，就帮我调用zombie_handler函数；
  - **操作系统:** 好，如果你的子进程终止，我就帮你调用，但你要先把该函数要执行的语句写好；
  
  这个过程即为**注册信号**的过程，进程发现自己的子进程结束，请求操作系统调用特定函数，实现这一过程的函数：
  
  ```c
  #include <signal.h>
  
  // 整体是一个信号处理的函数: void (*)(int)
  void (*signal(int signo, void (*func)(int)))(int);
  
  // 下面是拆分写法：
  // 第一行将一个void (*)(int)，一个接受int参数，返回void类型的函数指针命名为SignalHandler类型
  // 第二行表明而signal函数返回这个类型，signal从来就是一个函数，而不是指针，只是返回的是指针
  // signo 特殊情况信息
  // func 信号处理函数
  // return 传入一个信号处理函数，同时又返回一个信号处理函数
  typedef void (*SignalHandler)(int);
  SignalHandler signal(int signo, SignalHandler func);
  ```
  
  该函数是一个典型的函数指针，先从C语言的角度对该函数做分析：
  
  - 首先，signal是一个函数声明，该`signal`函数的参数有两个：`(int signo, void (*func)(int);)`
    - 其中第二个参数也是一个指向函数的指针，指针名为`func`，这个指针指向的函数接受一个整型参数并返回`void`
  - 把`signal(int signo, void (*func)(int))`看成一个整体，即`void (\*)(int)`;
    - (\*)代表这又是一个指向函数的指针，名为`signal(int signo, void (*func)(int))`，该指针指向的函数也接受一个整型参数，返回`void`
    - 该指针本身的返回类型也是`void*`；
    - 返回的指针地址指向的函数本身会不会就是之前的func呢？
  
  **signo的部分注册的特殊情况信息**

  也就是上面的`signo`参数：
  
  - SIGALRM：已到通过调用alarm函数注册的时间；
  - SIGINT：输入CTRL+C，即强行终止；
  - SIGCHLD：子进程终止；
  
  接下来编写调用signal函数的语句完成请求：子进程终止时则调用mychild函数：
  
  ```c
  signal(SIGCHLD, mychild);   // 子进程终止时调mychild函数
  signal(SIGALRM, timeout);   // 已到通过alarm函数注册的时间，请调用timeout函数
  signal(SIGINT, keycontrol); // CTRL+C调用keycontrol函数
  ```
  
  以上就是**信号注册**部分，即执行signal函数的部分；
  
  注册好后，发生注册信号时，操作系统将调用该信号对应的函数：
  
  ```c
  #include <unistd.h>
  
  // seconds 传递过去之后，相应时间后(秒)将产生SIGALRM信号
  // 若向该参数传递0，则之前对SIGALRM信号的预约将取消
  // return 返回0或以秒为单位的距SIGNAL信号发生所剩时间
  unsigned int alarm(unsigned int seconds);
  ```
  
  如果通过该函数预约信号后未指定该信号对应的处理函数，则终止进程，不做任何处理；
  
  这部分的理解给出源码示例，已经上传到Github；

- **利用sigaction函数进行信号处理**
  
  sigaction函数功能类似于signal函数，而且可以完全代替后者，且更稳定，因为signal函数在不同的UNIX系列OS中可能存在区别，但sigaction函数则完全相同；
  
  以下针对sigaction函数的介绍只限于可替换signal函数功能的部分：
  
  ```c
  #include <signal.h>
  
  // signo 传递信号信息
  // act 对于第一个参数信号处理函数信息
  // oldact 通过此函数获取之前注册的信号处理函数指针，若不需要则传递0
  // 成功返回0，失败返回-1
  int sigaction(int signo, const struct sigaction * act, struct sigaction * oldact);
  
  // 声明并初始化sigaction结构体变量以调用上述函数
  // sa_handler 保存信号处理函数的指针值
  // 下面两个参数初始化为0，这两个成员用于指定信号相关的选项和特性，后面介绍这些参数
  struct sigaction
  {
      void (*sa_handler)(int);
      sigset_t sa_mask;
      int sa_flags;
  };
  ```

以上代码的具体运用[详见源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/7-%E5%A4%9A%E8%BF%9B%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F%E7%9A%84%E4%BF%A1%E5%8F%B7%E6%9C%BA%E5%88%B6)；

### 基于多进程的并发服务器

基于上述的学习，我们可以准备利用fork函数编写并发服务器了，基于之前的echo服务器端做拓展，使其可以同时向多个客户端提供服务，具体思路：

每当有客户端请求服务时，回声服务器端都创建子进程以提供服务，请求服务的客户端有多少个，子进程就有多少个，具体的过程：

- 回声服务器端(父进程)通过调用accept函数受理连接请求；
- 此时获取的套接字文件描述符创建并提供给子进程；
- 子进程利用传递来的文件描述符提供服务；

并发服务器的源码实现见Github；

这里有部分内容需要做笔记，涉及到父进程子进程以及套接字描述符和套接字之间的关系：

- 父进程fork出的子进程贡献父进程的所有资源，因此，我们需要考虑套接字描述符共享的问题；

- 套接字描述符共享的核心点: **进程只是拥有套接字描述符，而真正的套接字资源是属于操作系统的；**

- 对于一个父进程以及fork出的子进程，具体关系如下：

  <img src="fork.svg"  />

- 父进程和子进程都会有各自的套接字描述符，为了使得程序结束之后，操作系统能正常回收套接字，**子进程同样需要终止套接字描述符**：
  
  ```c
  if (pid == 0)   // 子进程执行的部分
  {
      // 子进程会获取到同样的套接字描述符，关闭这部分，否则套接字无法被完全关闭
      // 因为serv_sock实质上只是一个套接字文件描述符，只要有文件描述符存在
      // 那套接字就无法完全销毁
      close(serv_sock);   
      // 这部分读取和写入都在子进程部分进行，后续可以考虑进行分割
      while ((str_len = read(clnt_sock, buf, BUF_SIZE)) != 0)
          write(clnt_sock, buf, str_len); // 将读取到的信息写回
  
      close(clnt_sock);    // 原因同上
      puts("client disconnected...");
      return 0;    
  }
  ```

具体实现，[详见源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/7-%E5%A4%9A%E8%BF%9B%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E5%A4%9A%E8%BF%9B%E7%A8%8BC-S%E5%AE%9E%E7%8E%B0)；

针对多进程服务端，或者说一个服务端程序同时为多个客户端提供服务，后续回顾，<font color=red>有了一些新的理解：</font>

- 服务端的程序，设置了一个while循环，这个循环属于该程序声明周期的一部分；
- 在这个程序的生命周期中，我们可以同时向多个客户端提供服务，做到这一点，依靠的是该程序所fork出的子进程；
- 子进程针对数据的读取和写入，有严格处理方案，也就是说，子进程一定可以很好的完成数据处理的功能，在本例中是(实现对读取的数据的返回写入)；
- 然后最终从一个宏观的角度来看，这个服务端的程序实现了同时为多个客户端提供服务的功能；
- 而起初的程序是不具备的，它完成了对一个客户端的服务之后就会结束运行；

### 分割TCP的客户端I/O程序

在上述基于多任务的并发服务器中，我们通过源码：

```c
while ((str_len = read(clnt_sock, buf, BUF_SIZE)) != 0)
  write(clnt_sock, buf, str_len); // 将读取到的信息写回
```
实现了边界的处理，即让所有发送于客户端的数据在服务器端能够按序接收，这是服务器本身的操作策略；
<font color=red>上面这段话只是额外插进去的，与我们下面要说的没太大关联；</font>

而分割TCP的I/O程序是客户端部分应该使用的内容；

在我们之前实现的echo客户端中，我们的数据回声方式的源码：

```c
while (recv_len < str_len)
{
    read_len = read(sock, message, BUF_SIZE - 1);
    if (read_len == -1) error_handling("read() error!");
    recv_len += read_len;
}
```

只要没有接收完服务器端的回声数据，就无条件等待，接收完之后接着准备下一轮的数据写入，也就是说，**一定要等接收完之后才进行下一批数据的传输**；

因此我们可以考虑在客户端层面将**数据的读取和发送交给父进程和子进程来做**，这样无论客户端是否从服务端接收完数据都可以进程传输；

分割I/O程序的另一个好处就是:**可以提高频繁交换数据的程序性能**；

## 进程间的通信

通过上面一个章节的学习，我们对多进程在网络编程中的运用有了初步的了解，多进程的运用难以避免涉及到进程之间的通信，而这部分就是我们需要讲解的内容；

进程间通信意味着两个不同进程间可以交换数据，为了完成这一点，**操作系统应提供**两个进程可以同时访问的内存空间；

**对进程间通信的基本理解**：进程A有一个面包，变量bread的值为1，如果吃掉这个面包，bread的值又变回0，进程B可以通过bread的值判断A的状态；

### 进程间通信的方式

#### 通过管道实现进程间的通信

先画一个模型：

<img title="" src="基于管道.svg" alt="" data-align="center">

为了完成进程间的通信，我们需要创建一个管道，管道并非属于进程的资源，而是和套接字一样，**属于操作系统**，因此也就不是fork函数的复制对象；

下面是创建管道的函数：

```c
#include <unistd.h>

// filedes 一个数组，有两个元素：
// filedes[0]是通过管道接收数据时使用的文件描述符，即管道出口
// filedes[1]是通过管道传输数据时使用的文件描述符，即管道入口
// 成功返回0，失败返回-1
int pipe(int filedes[2]);
```

通过上述的函数可以看出，对于单个进程而言，它**可以读写同一管道**，但是父进程的目的是与子进程进行数据交换，因此需要将入口或出口的中的一个文件描述符传递给子进程；

将**[通过源码演示](https://github.com/Wind134/TCP-IP-Programming/tree/main/8-%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1/%E5%9F%BA%E4%BA%8E%E7%AE%A1%E9%81%93)**；

### 通过管道进程双向通信

先**引入源码**；

通过源码可以了解到，父进程子进程对管道有相同的控制权，在读取管道中数据的时候，存在进程先读后读的问题，我们需要通过控制程序读取的时间去保证读取的顺序，简而言之需要预测并控制运行流程，而这是一个很难完成的任务，为了解决这个问题：

我们在进程双向通信之时，**创建两个管道**，我们分别标为管道1和管道2：

- **子进程**获取管道1的入口，获取管道2的出口；
- **父进程**获取管道1的出口，获取管道2的入口；

这样即便是子进程从管道2读取了数据，也不会影响父进程读取管道1的数据，两者各自拥有不同管道的出入口，可以方便的进行双向通信；

## 运用进程间的通信

进程间的通信与创建服务器端并没有直接关联，但有助于我们对操作系统的理解，接下来我们将这些知识运用于网络代码中；

我们希望将echo客户端传输的字符串按序保存到文件中，详细内容见源码；

在服务端源码中，子进程设定了一个循环，将客户端传输的字符串保存到文件中，父进程则仍然是负责数据的发送以及数据向管道的写入，很好的展示了两个进程间的通信；
### 运用案例源码

[详见github](https://github.com/Wind134/TCP-IP-Programming/tree/main/8-%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1/%E8%BF%9B%E7%A8%8B%E9%97%B4%E9%80%9A%E4%BF%A1%E7%9A%84%E8%BF%90%E7%94%A8)；

## I/O复用

I/O复用是实现并发服务器方式的一种延申；

**多进程服务器端的缺陷和解决办法:** 

- 创建进程需要大量的运算和内存空间，因为每个进程都有独立的内存空间，所以相互间的数据交换也要求采用相对复杂的方法；
- 上述数据交换涉及到的方法是IPC方法，即(Inter-Process Communication，进程间通信)；

因此尝试考虑在不创建进程的同时向多个客户端提供服务，此即为**IO复用**技术；

**理解复用**

不需要创建专门的进程去传输信息，该进程本身就能实现一个时间段向多个客户端的传输；

- 宏观上是并行发送，但微观上还是串行发送；

书本195页，通过一个老师给10个学生解答问题的方式去介绍了服务器端的I/O复用；

- 从这个例子上，可以看到的是，教师需要确认有无举手的学生，那么针对I/O复用服务器端的进程需要确认举手(收数据)的套接字，并通过举手的套接字接收数据；


服务器端的进程确认举手的套接字，通过select函数来实现；

### select函数

select函数可以将多个文件描述符集中到一起统一监视，监视的内容如下：

- 是否存在套接字接收数据？也就是说，是否套接字是否有数据可供读取？该情形称为**可读事件**；
- 无需阻塞传输数据的套接字有哪些？也就是说，套接字准备将数据写入缓冲区，该情形称为**可写事件**；
- 哪些套接字发生了异常？该情形称为**异常事件**；

上述监视项称为**事件**，发生了**监视项对应情况时**，则称"发生了事件"；

select函数的使用方法与一般函数区别较大，比较难使用，接下来以一张图片介绍select函数的调用方法和顺序：

<img title="" src="select.svg" alt="" data-align="center">

接下来按步骤介绍相关的内容：

- **步骤一(1)部分：设置文件描述符**
  
  select函数可以同时监视多个文件描述符，当然在套接字编程中也可以视为监视套接字；
  
  在这个时候需要将监视的文件描述符集中到一起，集中时也按照监视项(接收、传输、异常)进程区分；
  
  - "集中时也按照监视项(接收、传输、异常)进程区分"：
    - 表明如果需要这三种事件，<font color=red>需要设定三种不同的fd_set数组；</font>
  
  - 从下图中可以看到，fd_set位图中的下标索引就可以代表具体的文件描述符；
  
  存储这些集中在一起的变量为一个结构体：
  
  <img title="" src="fd_set.svg" alt="" data-align="center">
  
  上图展示的是结构体中的**位数组**，该数组存有0或者1，其中最左边的是文件描述符0，该位设置为0，表明该文件描述符并非监视对象，在上述的数组中，可以很清晰看到的是文件描述符1和3是监视对象；
  
  在fd_set变量中注册和更改值的操作由下列宏完成：
  
  - `FD_ZERO(fd_set * fdset)`：将fd_set变量的所有位初始化为0；
  
  - `FD_SET(int fd, fd_set * fdset)`：在参数fdset指向的变量中注册文件描述符fd的信息；
  
  - `FD_CLR(int fd, fd_set * fdset)`：从参数fdset指向的变量中清除文件描述fd的信息；
  
  - `FD_ISSET(int fd, fd_set * fdset)`：若参数fdset指向的变量中包含文件描述符fd的信息，则返回"真"，说明已经设置了**文件描述符**；
    
    ```c
    int main()
    {
        fd_set set;    // 设置一个结构体变量
        FD_ZERO(&set);    // 清零
        FD_SET(1, &set);    // 设置文件描述符号1为1，表明要监视
        FD_CLR(1, &set);    // 清除文件描述符号1，表明不监视
    }
    ```
  
- **步骤一(2/3)部分：设置检查(监视)范围及超时**
  
  select函数的参数介绍：
  
  ```c
  #include <sys/select.h>
  #include <sys/time.h>
  
  // maxfd 监视对象文件描述符数量
  // readset 所有关注"是否存在待读取数据"的文件描述符注册到fd_set型变量，并传递其地址值
  // writeset 所有关注"是否可以传输无阻塞数据"的文件描述符注册到fd_set型变量，并传递其地址值
  // exceptset 所有关注"是否发生异常"的文件描述符注册到fd_set型变量，并传递其地址值
  // timeout 调用select函数后，为了防止陷入无限阻塞的状态，会传输超时信息，此时返回0
  // return 发生错误返回-1，超时返回0，因发生关注的事件返回时，返回大于0的值，该值时发生事件的文件描述符数
  int select(
  int maxfd, fd_set * readset, fd_set * writeset, fd_set * exceptset,
      const struct timeval * timeout);    // 成功返回正值，失败则返回-1
  ```
  
  看完上述的内容之后，存在的一些疑问是：<font color=red>一个事件不是包含三个内容吗？三种内容只满足一类，算事件的发生吗？</font>
  
  - 之前的介绍已经有说明，算事件的发生；
  
  timeval的结构体内容：
  
  ```c
  struct timeval
  {
      long tv_sec;    // 存秒seconds
      long tv_usec;    // 存毫秒microseconds
  }
  ```

- **调用select函数返回结果**
  
  select返回的是发生变化的文件描述符数量，那select返回正整数时，怎么获知哪些文件描述符发生变化，这时候根据select本身的特性来判断即可：
  
  - 如果在调用select函数之前某个文件描述符的位为1，表示关注该文件描述符的事件；
  - select函数返回后，如果该文件描述符确实发生了变化，则对应的位会保持为1；如果该文件描述符没有发生变化，则对应的位会被修改为0；
  
  这两点是属于select函数负责的行为，这么理解就直观多了；

最后理解一下select的使用以及相关的返回值：

- <font color=red>select关注的是某一个监视项？</font>还是三个监视项一起呢？
  - 从源码来看，关注的是**可读事件**，可写事件以及异常事件都设置为了0；
- select<font color=red>可否同时关注三个事件监视项呢</font>，目前还没有可以体现到这一点的源码；
  - 是的，可同时关注三类事件，设定3个fd_set即可；

- select最后返回的也是**发生事件**的文件描述符数；

[先写源码，通过源码理解](https://github.com/Wind134/TCP-IP-Programming/blob/main/9-IO%E5%A4%8D%E7%94%A8/select%E5%87%BD%E6%95%B0%E7%9A%84%E7%90%86%E8%A7%A3%E4%B8%8E%E7%94%A8%E6%B3%95/select.c)，源码解决了部分关于select使用的疑惑；

### select源码实现

下面通过select函数具体实现I/O复用的服务器端；

具体见[源码](https://github.com/Wind134/TCP-IP-Programming/blob/main/9-IO%E5%A4%8D%E7%94%A8/IO%E5%A4%8D%E7%94%A8%E7%9A%84%E5%AE%9E%E7%8E%B0/echo_selectserv.c)部分；

结合多进程服务端，对源码的一些<font color=red>宏观性理解：</font>

- 服务端的程序，设置了一个while循环，这个循环属于该程序声明周期的一部分；
- 在这个程序的生命周期中，我们可以同时向多个客户端提供服务，做到这一点，依靠的是I/O复用的功能；
- I/O复用的实现，依靠的是select系统调用，哪个文件描述符需要接收数据，就去给进程举手确认，进程就为它服务；
- select函数的第一个参数代表了监视的范围，由于描述符号是从0开始，因此一般会在监视的描述符基础上+1，就确保可以覆盖到我们要监视的描述符；
- 由于一切都在服务器程序中的while循环里进行，最终从一个宏观的角度来看，这个服务端的程序实现了同时为多个客户端提供服务的功能；
- 而起初的程序是不具备的，它完成了对一个客户端的服务之后就会结束运行；

实现I/O复用的传统方法除了select函数之外，在Linux系统下还有一个效率更高的复用技术：epoll；

### epoll介绍

select函数有其自身的限制，它无论如何优化性能，也无法同时接入上百个客户端，无法适应以Web服务器端开发为主流的现代开发环境，因此在Linux下推荐使用性能更好的epoll；

**select的复用技术慢的原因:**

- 调用select函数后常见的针对所有文件描述符都要进行一次循环，其实本应聚焦我们所监视的文件描述符；
- 每次调用select函数时都需要向该函数传递监视对象信息；

而上述原因中的第二点，应用程序向操作系统传递数据将对程序造成很大负担；

因此我们考虑：

- 仅向操作系统传递1次监视对象；
- 监视范围或内容发生变化时只通知发生变化的事项；

这就无需每次调用select都向操作系统传递监视对象的信息，但前提是操作系统支持这种方式，而在Linux下支持这种方式的是epoll，windows则是IOCP；

但select本身有优点：

- 程序兼容性好，可跨多平台；
- 接入服务器的客户端如果不多，效率相对更高；

**实现epoll的必要函数和结构体**

首先介绍需要的3个函数：

- **epoll_create:** 创建保存epoll文件描述符的空间(该空间也称为epoll例程)；

  ```c
  #include <sys/epoll.h>
  
  // size表示的是epoll实例的大小(供操作系统参考)，2.6.8后的内核会完全忽略size参数，内核会自行调整大小
  // return 成功时返回epoll文件描述符，失败返回-1，需要终止时，也调用close函数
  int epoll_create(int size);
  ```

  - select方式通过fd_set数组保存监视对象文件描述符；
  - 而epoll方式下由操作系统负责，因此需要向操作系统请求创建保存epoll实例的文件描述符的空间；

- **epoll_ctl:** 向空间注册或者注销文件描述符；

  ```c
  #include <sys/epoll.h>
  
  // epfd 用于注册监视对象的epoll例程的文件描述符
  // op 用于指定监视对象的添加、删除或更改操作，各操作通过宏定义(int类型)
  // fd 需要注册的监视对象文件描述符
  // event 监视对象的事件类型
  // return 成功返回0，失败返回-1
  int epoll_ctl(int epfd, int op, int fd, struct epoll_event * event);
  
  // 理解该函数
  epoll_ctl(A, EPOLL_CTL_ADD, B, C);	 // EPOLL_CTL_ADD意味着添加，epoll例程A中注册文件描述符B，目的时监视参数C中的事件
  epoll_ctl(A, EPOLL_CTL_DEL, B, NULL);// EPOLL_CTL_ADD意味着删除，epoll例程A中删除文件描述符B
  
  // 还有一个参数：EPOLL_CTL_MOD，用于更改注册的文件描述符的关注事件发生情况
  ```

  - select方式通过FD_SET、FD_CLR去添加和删除监视对象文件描述符；
  - epoll中由epoll_ctl负责；

- **epoll_wait:** 与select函数类似，等待文件描述符发生变化；

  ```c
  #include <sys/epoll.h>
  
  // epfd 用于注册监视对象的epoll例程的文件描述符
  // events 保存发生事件的文件描述符集合的结构体数组的地址
  // maxevents 代表第二个参数中可以保存的最大事件数
  // timeout 以1ms为单位的等待时间，传递-1时，一直等待直到发生事件
  // return 成功时返回发生事件的文件描述符数，失败返回-1
  int epoll_wait(int epfd, struct epoll_event * events, int maxevents, int timeout);
  
  // 第二个参数所指的缓冲需要动态分配空间
  int event_cnt;
  struct epoll_event * ep_events;
  // ...
  ep_events = malloc(sizeof(struct epoll_event)*EPOLL_SIZE);	// EPOLL_SIZE为宏常量
  // ...
  event_cnt = epoll_wait(epfd, ep_events, EPOLL_SIZE, -1);
  // ...
  ```

  - select方式中调用select函数等待文件描述符的变化；
  - epoll中调用epoll_wait函数；


接下来介绍epoll_event结构体，在select中通过fd_set变量查看监视对象的状态变化，而epoll则通过该结构体将发生变化的文件描述符单独集中到一起；

```c
struct epoll_event
{
    __uint32_t events;	// 发生的事件
    epoll_data_t data;	// data本身又是一结构体
};

typedef union epoll_data	// 这是一个union联合体
{
    void * ptr; // 这个是(可能是一个指向文件的指针)
    int fd;     // 文件描述符
    __uint32_t u32;
    __uint64_t u64;
} epoll_data_t;

// 下面是一个应用示例，结合了epoll_ctl函数
struct epoll_event event;
// ....
event.events = EPOLLIN;	// 发生需要读取数据的情况时
event.data.fd = sockfd;
epoll_ctl(epfd, EPOLL_CTL_ADD, sockfd, &event);
// .....
// 上述代码将sockfd注册到epoll例程epfd中，并在需要读取数据的情况下产生了相应事件
```

接下来介绍epoll_event成员events中可以保存的常量及所指的事件类型：

- **EPOLLIN:** 需要读取数据的情况；
- **EPOLLOUT:** 输出缓冲为空，可以立即发送数据的情况；
- **EPOLLPRI:** 收到OOB数据的情况；
- **EPOLLRDHUP:** 断开连接或者半关闭的情况，这在<font color=red>边缘触发</font>方式下有用；
- **EPOLLERR:** 发生错误的情况；
- **EPOLLET:** 以边缘触发的方式得到事件通知；
- **EPOLLONESHOT:** 发生一次事件后，相应文件描述符不再收到事件通知，此时需要向epoll_ctl函数的第二个参数传递EPOLL_CTL_MOD；

上述内容有点多，结合回声客户端的具体实现理解epoll，[源码已上传Github](https://github.com/Wind134/TCP-IP-Programming/blob/main/9-IO%E5%A4%8D%E7%94%A8/%E5%9F%BA%E4%BA%8Eepoll%E7%9A%84%E5%9B%9E%E5%A3%B0%E5%AE%A2%E6%88%B7%E7%AB%AF/echo_epollserv.c)；

### Epoll的两种触发模式

真正理解了条件(水平)触发(Level Trigger)和边缘触发(Edge Trigger)，才算是完整掌握了epoll；

书上举了一个很形象的例子，可以帮助我们很好的理解这两类触发，具体可以看书；

**条件触发:** 只要输入缓冲中**还剩有**数据，就将以事件方式再次注册；

**边缘触发:** 边缘触发中输入缓冲收到数据时仅注册1次该事件，后续即便输入缓冲中还有数据也不会再进行注册；

接下来[通过源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/9-IO%E5%A4%8D%E7%94%A8/epoll%E4%B8%AD%E7%9A%84%E6%9D%A1%E4%BB%B6%E8%A7%A6%E5%8F%91%E5%92%8C%E8%BE%B9%E7%BC%98%E8%A7%A6%E5%8F%91)去了解这两者的使用；

**边缘触发的服务器端实现中必知的两点**

- 通过errno变量验证错误原因；

  - 跟边缘触发相关的类型只需要知道：
  - read函数**发现输入缓冲中没有数据可读时**返回-1，同时在errno中保存EAGAIN常量；

- 更改套接字特性以完成非阻塞(Non-blocking)I/O，send与recv函数也涉及到了非阻塞方式；

  - 这里通过Linux平台提供的方法进行更改；

    ```c
    #include <fcntl.h>
    
    // filedes代表更改目标的文件描述符
    // cmd表示函数调用的目的(是获取状态标志还是设置状态标志)
    // 参数是可变参数的形式
    int fcntl(int filedes, int cmd, ...); // 成功时返回cmd参数相关值，失败返回-1
    
    // 使用
    int flag = fcntl(fd, F_GETFL, 0);     // 获取第一个参数所指的文件描述符属性，如果是F_SETFL则是更改文件描述符属性
    fcntl(fd, F_SETFL, flag|O_NONBLOCK);  // 通过位运算在flag基础上添加非阻塞O_NONBLOCK标志
    ```

  - 通过以上设置就可以将read&write函数设置为非阻塞形式；

  通过[源码内容](https://github.com/Wind134/TCP-IP-Programming/tree/main/9-IO%E5%A4%8D%E7%94%A8/epoll%E4%B8%AD%E7%9A%84%E6%9D%A1%E4%BB%B6%E8%A7%A6%E5%8F%91%E5%92%8C%E8%BE%B9%E7%BC%98%E8%A7%A6%E5%8F%91)得到的几点体会：

  - 条件触发只要在缓冲中存在数据，那么就会向操作系统进行一次注册，这种机制就是每次读取了一部分数据，就向操作系统报告缓冲区接下来还有多少数据，可以只要有数据就进行读取，如果没有数据就要关闭描述符了，一切的读取都是透明的；
  - 边缘触发则是只在一开始收到数据时告知操作系统，而接下来到底缓冲区到底还有没有数据是未知的，如果没有数据read函数会陷入阻塞，导致长时间没反应，这个时候就需要通过一个循环，去不断的读取数据，等最终读取完毕，由于是非阻塞方式，我们可以通过一些信息知道数据读取完了，退出循环，关闭对套接字的监视；
  - <font color=red>但是条件触发本身也会面临阻塞的可能，所以其实第一点的理解不是那么的准确。</font>

## 多种I/O函数

之前的示例中，基于Linux的操作系统一般是使用`read&write`函数进行I/O，在Windows下则是`send&recv`函数，而事实上，在Linux中也存在`send&recv`函数，接下来针对这部分内容进行介绍，并与`read&write`进行对比；

### send & recv函数

使用方式如下：

```c
#include <sys/socket.h>

// sockfd-与数据传输对象的连接的套接字文件描述符
// buf-保存待传输数据的缓冲地址值
// nbytes-待传输的字节数
// flags-传输数据时指定的可选项信息
// return 成功时返回发送的字节数，失败时返回-1
ssize_t send(int sockfd, const void * buf, size_t nbytes, int flags);
```

send函数对应于之前所学习的write函数，表明往缓冲区写入数据，而recv函数则类似read函数：

```c
#include <sys/socket.h>

// sockfd-与数据传输对象的连接的套接字文件描述符
// buf-保存接收数据的缓冲地址值
// nbytes-可接收的最大字节数
// flags-接收数据时指定的可选项信息
// return 成功时返回接收的字节数(收到EOF返回0)，失败时返回-1 
ssize_t recv(int sockfd, void * buf, size_t nbytes, int flags);
```

send函数以及recv函数的最后一个参数是收发数据时的可选项，利用**位或bit OR**运算同时传递多个信息：

<table style="width:100%; text-align:center;">
  <tr>
    <th>可选项(Option)</th>
    <th>含义</th>
    <th>send</th>
    <th>recv</th>
  </tr>
  <tr>
    <td>MSG_OOB</td>
    <td>用于传输带外数据(Out-of-band data)</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>MSG_PEEK</td>
    <td>验证输入缓冲中是否存在接收的数据</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>MSG_DONTROUTE</td>
    <td>数据传输过程中不参照路由表，在本地网络中寻找目的地</td>
    <td>Yes</td>
    <td>-</td>
  </tr>
  <tr>
    <td>MSG_DONTWAIT</td>
    <td>调用I/O函数时不阻塞，用于使用非阻塞(Non-blocking)I/O</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>MSG_WAITALL</td>
    <td>防止函数返回，直到接收全部请求的字节数</td>
    <td>-</td>
    <td>Yes</td>
  </tr>
</table>

不同的操作系统针对上述可选项的支持情况不同，选取表中的一部分进行详细讲解：

- **MSG_OOB: 发送紧急消息**

  `MSG_OOB`可选项用于创建特殊发送方法和通道以发送紧急消息，而这属于TCP的**紧急模式**传输的一部分；

  [结合源码的使用请看Github](https://github.com/Wind134/TCP-IP-Programming/blob/main/10-%E5%A4%9A%E7%A7%8DIO%E5%87%BD%E6%95%B0/Send-Recv%E6%94%B6%E5%8F%91%E6%95%B0%E6%8D%AE%E7%9A%84%E5%8F%AF%E9%80%89%E9%A1%B9/oob_recv.c)；

  运行源码后的结果可能出乎我们预料，通过MSG_OOB可选项传递数据时不会加快数据传输速度，而结合源码来看，信号处理函数也只能读取到一个字节；<font color=red>具体原因书上说得不是那么明确；</font>

  **紧急模式的原理**

  `MSG_OOB`的真正意义在于督促数据接收对象尽快处理处理，这就是紧急模式的全部内容，TCP本身按序传输的特性依然成立；

  即使真正意义上没那么紧急，但还是紧急消息，以医院救治举例：

  - 迅速入院
  - 医院急救

  TCP的紧急模式无法保证迅速入院，这是传输过程中的任务，TCP无法管到，但是可以要求急救，也就是要求接收方迅速从缓冲区读取这部分数据；

  对缓冲区举例：

  ![](紧急消息输出缓冲.svg)

  如上图所示，字符0右侧偏移量为3的位置就存有紧急指针，该指针指向紧急消息的下一个位置，即0右边的位置(偏移量+1)，同时告知对方主机紧急指针指向的偏移量为3之前的部分就是紧急消息；

  而这部分信息，**就写在TCP报文的首部；**

  指定MSG_OOB选项的数据包本身就是紧急数据包，但是对于字符"890"，我们并不知道具体的紧急消息是哪个；

  但这不重要，紧急消息的意义在与督促消息处理，而非紧急传送那些形式受限的消息；

- **检查输入缓冲**

  同时设置`MSG_PEEK`选项和`MSG_DONTWAIT`选项，以验证输入缓冲中是否存在接收的数据；

  设置`MSG_PEEK`选项并调用recv函数时，即使读取了输入缓冲的数据也不会删除，因此该选项通常与`MSG_DONTWAIT`合作，用于调用以非阻塞方式验证待读数据存在与否的函数；

  [这份源码是](https://github.com/Wind134/TCP-IP-Programming/blob/main/10-%E5%A4%9A%E7%A7%8DIO%E5%87%BD%E6%95%B0/Send-Recv%E6%94%B6%E5%8F%91%E6%95%B0%E6%8D%AE%E7%9A%84%E5%8F%AF%E9%80%89%E9%A1%B9/peek_recv.c)结合这两者的使用；

### readv & writev函数

**readv & writev函数的功能**可概括如下：对数据进行整合传输及发送的函数；

- writev函数可以讲分散保存在多个缓冲中的数据一并发送；
- readv函数可以由多个缓冲分别接收；

因此适当调用这两个函数可以减少I/O函数的调用次数；

以下是代码：

```c
#include <sys/uio.h>

// filedes-表示数据传输对象的套接字文件描述符，但该函数并不仅限于套接字的处理
// iov-iovec结构体数组的地址值，结构体iovec中包含待发送数据的位置和大小信息
// iovcnt-向第二个参数传递的数组长度
ssize_t writev(int filedes, const struct iovec * iov, int iovcnt);	// 成功时返回发送(写入)的字节数，失败时返回-1

ssize_t readv(int filedes, const struct iovec * iov, int iovcnt);	// 成功时返回接收(读取)的字节数，失败时返回-1
```

上述的结构体声明如下：

```c
struct iovec
{
    void * iov_base;	// 缓冲地址
    size_t iov_len;		// 缓冲大小
}
```

结构体数组，则表明有多个这样的缓冲，刚好对应了上述两个函数的功能；

再次用图片展示这个功能：

![](功能展示.svg)

如图所示：一个缓冲区数组，ptr指向数组的首地址；

readv的功能与之类似，只是一个读取一个写入而已，给出源码；

**合理的使用readv & writev函数**

能使用该函数的所有情况都适用，在要传输的数据分别位于不同缓冲(数组)时，需要多次调用write函数，此时可以通过1次writev函数调用替代操作，以提高效率；

**结合Nagle的说明(在关闭Nagle算法时使用):** 

- 关闭Nagle算法时，发送端只需想着尽快发送，有多少发多少，因此发送方可能会把自己要发送的东西分别临时存放在多个缓冲区，然后多次调用write函数；
- 而如果使用writev，仅需要一次调用即可；

### Windows版本的实现

暂时略过

## 多播与广播

### 多播的介绍

考虑一种1000个站点向10000个用户发送信息的情况，如果是单一的发送，不论是UDP还是TCP都将是巨大的开销，UDP得多次向不同IP去传输数据，TCP更是需要建立很多的连接；

此时就引入了**多播(Multicast)**机制；

多播的实现与UDP实现方式比较接近，UDP数据传输以单一目标进行，而多播数据同时传递到加入(注册)特定组的大量主机；

**多播的优点:** 

- 多播服务器针对特定多播组，只发送一次数据；
- 即使只发生一次数据，该组内的所有客户端都会接收数据；
- 多播组数可在IP地址范围内任意增加；
- 加入特定组即可接收发往该多播组的数据；

多播组的IP范围(224.0.0.0~239.255.255.255)，这个范围为D类IP地址，加入多播组可以理解为通过程序完成声明：

- 在D类IP地址中，我希望接收发往目标239.234.218.234的多播数据；

多播基于UDP，但是与与一般的UDP数据包不同，向网络传递一个多播数据包时，路由器将复制该数据包并传递到多个主机，也就是说，多播需要借助路由器完成；

但**一些路由器**也许不支持多播，这种情况下会使用**隧道(Tunneling)技术**去应对这种情况，但这不是我们考虑的范围；

### 多播编程

为了传递多播数据包，必需设置TTL，决定"数据包传送距离"，每经过一个路由器TTL就减1，TTL为0时该数据包无法再被传递，只能销毁；

![](TTL和多播路由器.svg)

TTL的设置是通过[套接字可选项](#套接字的多种可选项)来完成的，使用到的协议层是：`IPPROTO_IP`，对应的选项名：`IP_MULTICAST_TTL`：

```c++
int send_sock;
int time_live = 64;
// ...
send_sock = socket(PF_INET, SOCK_DGRAM, 0);	// 看出来了是UDP
setsockopt(send_sock, IPPROTO_IP, IP_MULTICAST_TTL, (void*) &time_live, sizeof(time_live));
// ...
```

此外加入多播组也通过设置套接字选项完成，加入多播组相关的协议层为`IPPROTO_IP`，选项名为`IP_ADD_MEMBERSHIP`：

```c
int recv_sock;
struct ip_mreq join_adr;
// ...
recv_sock = socket(PF_INET, SOCK_DGRAM, 0);
// ...
join_adr.imr_multiaddr.s_addr = "多播组地址信息";
join_adr.imr_interface.s_addr = "加入多播组的主机地址信息";
setsockopt(recv_sock, IPPROTO_IP, IP_ADD_MEMBERSHIP, (void*) &join_adr,
sizeof(join_adr));
// ...
```

上面用到了ip_mreq结构体，该结构体的定义：

```c
struct ip_mreq
{
    struct in_addr imr_multiappr;	// 写入加入的组IP地址
    struct in_addr imr_interface;	// 加入该组的套接字所属主机的IP地址，也可使用INADDR_ANY
};
```

接下来介绍多播Sender和Receiver的实现，发送者作为服务器端，接收者作为客户端，Sender向AAA组广播(Broadcasting)文件中保存的新闻信息，Receiver则接收传递到AAA组的新闻信息；

[这里是源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/11-%E5%A4%9A%E6%92%AD%E4%B8%8E%E5%B9%BF%E6%92%AD/%E5%A4%9A%E6%92%AD)；

### 广播的介绍

**广播**(Broadcast)与多播类似，但传输数据的范围有区别，多播即使在跨越不同网络的情况下，只要加入多播组就能接收到数据，而广播只能向同一网络中的主机传输数据；

广播也是基于UDP，根据传输数据时使用的IP地址的形式，广播分为两组：

- **直接广播:** 直接广播地址除指定的网络号外，主机号的位全为1，也就是说可以采用直接广播的方式向特定网络内的所有主机传输数据；
- **本地广播:** 将IP限定为255.255.255.255，本网络中的主机向该IP传递数据时，数据将传递到该网络的所有主机，而不会跨越路由器；

### 广播编程

对于广播而言，如果不仔细观察广播示例中通信使用的IP，很难与UDP示例区分，默认生成的套接字会阻止广播，因此仅需要如下设置：

```c
int send_sock;
int bcast = 1;	// 对变量初始化一将SO_BROADCAST选项信息更改为1，区分广播
// ...
send_sock = socket(PF_INET, SOCK_DGRAM, 0);
// ...
setsockopt(send_sock, SOL_SOCKET, SO_BROADCAST, (void*) *bcast, sizeof(bcast));
// ...
```

[这里是源码；](https://github.com/Wind134/TCP-IP-Programming/tree/main/11-%E5%A4%9A%E6%92%AD%E4%B8%8E%E5%B9%BF%E6%92%AD/%E5%B9%BF%E6%92%AD)

## 套接字和标准I/O

### 标准I/O函数

使用标准I/O主要有两大优点：

- 标准I/O函数具有良好的可移植性(Portability)；

  - 这些函数都是按照ANSI C标准去定义的；

- 标准I/O函数可以利用缓冲提高性能；

  - 创建套接字时操作系统会生成用于I/O的缓冲，该缓冲在执行TCP时有着重要作用；

  - 而使用标准I/O将得到额外的另一缓冲；

    在对操作系统的学习过程中，曾经了解到缓冲的作用，缓冲在高速设备与低速设备之间充当一个媒介，将常用的数据预先存入缓冲可以提升效率；

**标准I/O函数和系统函数之间的性能对比**

这方面[主要看源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/12-%E5%A5%97%E6%8E%A5%E5%AD%97%E5%92%8C%E6%A0%87%E5%87%86IO/%E6%A0%87%E5%87%86IO%E5%92%8C%E7%B3%BB%E7%BB%9F%E5%87%BD%E6%95%B0%E4%B9%8B%E9%97%B4%E7%9A%84%E6%80%A7%E8%83%BD%E5%AF%B9%E6%AF%94)；

通过对比可以发现：使用标准I/O可以极大的提升数据的存取效率；

但是标准I/O同样存在缺点：

- **不方便进行双向通信；**
- 有时可能频繁调用fflush函数；
- 需要以FILE结构体指针的形式返回文件描述符；

### 标准I/O函数的使用

如之前两类函数对比的源码所示，为了使用标准I/O函数，要将之转化为标准I/O函数中的FILE结构体指针，实现这一转化的函数用法：

```c
#include <stdio.h>

// fildes是需要转换的文件描述符
// mode将要创建的FILE结构体的模式信息
// return 成功时返回转换的FILE结构体指针，失败时返回NULL
FILE * fdopen(int fildes, const char * mode);

// stream代表文件流，即指向文件的指针
// return 成功时返回转换后的文件描述符，失败时返回-1，是上述函数功能的逆向实现：FILE指针->文件描述符
int fileno(FILE * stream);
```

函数使用[看源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/12-%E5%A5%97%E6%8E%A5%E5%AD%97%E5%92%8C%E6%A0%87%E5%87%86IO/%E6%A0%87%E5%87%86IO%E5%87%BD%E6%95%B0%E7%9A%84%E4%BD%BF%E7%94%A8)；

### 结合套接字使用

具体使用[看源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/12-%E5%A5%97%E6%8E%A5%E5%AD%97%E5%92%8C%E6%A0%87%E5%87%86IO/%E5%9F%BA%E4%BA%8E%E5%A5%97%E6%8E%A5%E5%AD%97%E7%9A%84%E6%A0%87%E5%87%86IO%E5%87%BD%E6%95%B0%E4%BD%BF%E7%94%A8)；

## I/O流分离的其他内容

**对流的理解:** 调用fopen函数打开文件后可以与文件交换数据，因此说调用fopen函数后创建了"流"(Stream)，此处的"流"是指"数据流动"，但通常可以比喻为"以数据收发为目的的一种桥梁"，可以理解为"数据收发路径"；

**之前所学的几次I/O流分离**

- 多进程服务器中的方法通过调用fork复制出1个文件描述符，以区分输入和输出中使用的文件描述符(即父进程子进程各自负责读写)

- 基于套接字的标准I/O函数使用通过2次fdopen函数的调用，创建读模式FILE指针和写模式FILE指针，分离了输入工具和输出工具；

  流分离的方法、情况不同时，带来的好处也不尽相同；

**"流"分离带来的EOF问题**

- 上述的方法一由于调用了半关闭函数shutdown，因此不存在问题；
- 而如果使用FILE指针使用类似的方法则会出现问题，因为服务器调用了fclose函数会完全终止套接字clnt_sock，而非半关闭；

具体[源码已贴Github](https://github.com/Wind134/TCP-IP-Programming/tree/main/13-%E5%85%B3%E4%BA%8EIO%E6%B5%81%E5%88%86%E7%A6%BB%E7%9A%84%E5%85%B6%E4%BB%96%E5%86%85%E5%AE%B9/FILE%E6%8C%87%E9%92%88%E5%8D%8A%E5%85%B3%E9%97%AD%E6%96%B9%E6%A1%88/%E5%B8%B8%E8%A7%84%E6%96%B9%E6%A1%88%E5%BC%95%E5%8F%91%E9%97%AE%E9%A2%98)；

## 文件复制和半关闭

终止"流"时无法半关闭的原因，用一张图详细展示：

![](FILE指针.svg)

如图所示，两种模式的指针都是基于同一文件描述符创建的，因此针对任意一个FILE指针调用fclose函数时都会关闭文件描述符；

而解决这个问题的方案，我们可以参照此图例：

![](FILE半关闭模型.svg)

上述形式就为半关闭准备好了环境，**但只是准备好了环境**，要真正进入半关闭还需要特殊处理：

- 即便销毁了上述的某个文件描述符，剩下的文件描述符仍然可以进行输入输出；
- 因此无法发送EOF指令，也即未真正进入半关闭状态；

解决上述问题，我们又分两方面学习；

### 复制文件描述符

该复制不通过fork函数进行，因此就是说与fork的方式有所区别：

- 调用fork函数将复制整个进程，因此同一进程内不能同时有原件和副本；

此处讨论的是在同一进程内完成描述符的复制；

考虑这么几个要求：

- 文件描述符复制可以正常进行，但是文件描述符的值不能重复这是铁律；
- 因此实质上是为了访问同一文件或套接字，创建另一个文件描述符；

能很好实现这几个要求的函数：dup & dup2：

```c
#include <unistd.h>

// fildes是需要复制的文件描述符
// fildes2是明确指定的复制出的文件描述符整数值，传递的应该是大于0且小于进程能生成的最大文件描述符值
// return 两个函数返回值一致，成功时返回复制的文件描述符，失败时返回-1
int dup(int fildes);
int dup2(int fildes, int fildes2);
```

dup & dup2的使用[看源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/13-%E5%85%B3%E4%BA%8EIO%E6%B5%81%E5%88%86%E7%A6%BB%E7%9A%84%E5%85%B6%E4%BB%96%E5%86%85%E5%AE%B9/%E5%A4%8D%E5%88%B6%E6%96%87%E4%BB%B6%E6%8F%8F%E8%BF%B0%E7%AC%A6)；

结合使用[看源码](https://github.com/Wind134/TCP-IP-Programming/tree/main/13-%E5%85%B3%E4%BA%8EIO%E6%B5%81%E5%88%86%E7%A6%BB%E7%9A%84%E5%85%B6%E4%BB%96%E5%86%85%E5%AE%B9/FILE%E6%8C%87%E9%92%88%E5%8D%8A%E5%85%B3%E9%97%AD%E6%96%B9%E6%A1%88/%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88)；

源码中**使用了shutdown函数**，无论复制出多少文件描述符，均应调用shutdown函数发送EOF并进入半关闭状态；

## 多线程服务器端

### 理解线程

创建进程的工作本身会给操作系统带来相当沉重的负担，此外每个进程都会有自身独立的内存空间，[进程间通信](#进程间的通信)的实现难度也会随之提高；

而其中开销最大的则是进程间的"上下文切换"(Context Switching)；

- 分时使用CPU，运行程序前需要将相应进程读入内存，而运行进程A之后还得运行进程B，将A相关信息移出内存；
- 将进程B读入内存，此时进程A的数据又要被移入硬盘，这个过程即上下文切换，及其耗时；

线程的优势：

- 线程的创建和上下文切换比进程更快；
- 线程间交换数据时无需特殊技术；

对于进程间内存，我们通过一个图例展示：

![](进程间独立的内存.svg)

而对于线程而言，其内存结构：

![](线程的内存结构.svg)

**进程:** 在操作系统构成单独执行流的单位；

**线程:** 在进程构成单独执行流的单位；

操作系统中存在多个进程，而每个进程又有各自的多个线程；

### 线程创建与运行

线程的创建基于POSIX标准，即可移植操作系统接口，这是一个为了提升UNIX系列操作系统的可移植性而制定的API规范；

**线程的创建和执行流程**

线程具有单独的执行流，因此需要单独定义线程的main函数，还需要请求操作系统在单独的执行流中执行该函数：

```c
#include <pthread.h>

// thread 保存新创建线程ID的变量地址值
// attr 用于传递线程属性的参数，传递NULL时，创建默认属性的线程
// start_routine 相当于线程main函数、在单独执行流中执行的函数地址值(函数指针)
// arg 通过第三个参数传递调用函数时包含传递参数信息的变量地址值(C语言中真的超级多指针用法)
// return 成功时返回0，失败时返回其他值
int pthread_create(pthread_t * restrict thread, const pthread_attr_t * restrict attr,
	            void * (* start_routine)(void *), void * restrict arg);
```

要理解上述函数，需要熟练掌握restrict关键字和函数指针相关语法，我们首先关注使用方法：[看源码](https://github.com/Wind134/TCP-IP-Programming/blob/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E7%BA%BF%E7%A8%8B%E7%9A%84%E5%88%9B%E5%BB%BA%E5%92%8C%E8%BF%90%E8%A1%8C/thread1.c)；

这部分源码中通过sleep延迟了时间，以便让线程可以顺利执行完毕，但实际应用中我们不可能去预测线程何时结束，因此sleep不能用于复杂的场景，这个时候通常使用一个新的函数取控制线程的执行流：

```c
#include <pthread.h>

// thread 代表一个线程ID
// status 保存线程的main函数返回值的指针变量地址值
// 调用该函数的进程将进入等待状态，直到第一个参数代表的线程终止为止，而且可以得到线程的main函数返回值
// return 成功返回0，失败返回其他值
int pthread_join(pthread_t thread, void ** status);
```

利用该函数实现的线程[源码](https://github.com/Wind134/TCP-IP-Programming/blob/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E7%BA%BF%E7%A8%8B%E7%9A%84%E5%88%9B%E5%BB%BA%E5%92%8C%E8%BF%90%E8%A1%8C/thread2.c)；

**多个线程的处理机制**

线程的创建方法本质上没有什么区别，但是关于线程的运行时需要考虑"多个线程同时调用函数时可能产生问题"；

这里涉及到的是**临界区:** 

- 临界区(Critical Section)是指在多线程或多进程环境下，访问共享资源的代码段或区域，需要保证同一时间只有一个线程或进程能够执行其中的代码，以避免竞争条件(Race Condition)和数据不一致的问题。
- 临界区的目的是确保多个线程或进程之间对共享资源的访问是互斥的，从而避免并发访问引发的问题。
- 通常使用互斥锁(Mutex)或其他同步机制来实现临界区的互斥访问。

同时根据临界区是否引起问题，而区分：

- **线程安全函数:** 是指在多线程环境下可以安全并发调用的函数，它们能够正确处理多个线程同时访问共享资源的情况，不会导致数据竞争或出现不一致的结果。线程安全函数内部使用了适当的同步机制，如互斥锁或原子操作，以确保共享资源的访问是互斥的。
- **线程不安全函数:** 是指在多线程环境下并发调用可能导致问题的函数，它们没有进行适当的同步或互斥处理，可能导致数据竞争和不确定的结果。当多个线程同时调用线程不安全函数并访问共享资源时，可能会出现数据错乱、数据丢失或不一致的情况。

为了确保线程安全，应尽量使用线程安全函数，或者在调用线程不安全函数时采取适当的同步措施，如使用互斥锁或其他线程同步机制来保护共享资源的访问。

回忆之前所学内容，学过一个根据域名获取IP信息的函数`gethostbyname`，该函数在现如今的2023年已经过时，但是这里需要提及的是这就是个线程不安全函数；

相对应的线程安全函数是：`gethostbyname_r`；

可以通过宏`_REENTRANT`自动将`gethostbyname`->`gethostbyname_r`；

**工作线程模型**

我们尝试创建两个实例，源码已上传至Github：

- [其中一个实例](https://github.com/Wind134/TCP-IP-Programming/blob/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E7%BA%BF%E7%A8%8B%E7%9A%84%E5%88%9B%E5%BB%BA%E5%92%8C%E8%BF%90%E8%A1%8C/thread3.c)在一个进程中创建两个线程，其中一个线程计算1到5的和，另一个线程计算6到10的和，该实例确实得出了正确结果，但是并未考虑临界区；
- 因此[另一个实例](https://github.com/Wind134/TCP-IP-Programming/blob/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E7%BA%BF%E7%A8%8B%E7%9A%84%E5%88%9B%E5%BB%BA%E5%92%8C%E8%BF%90%E8%A1%8C/thread4_error_show.c)直接给出了因为临界区访问不受限制而造成的错误结果；

于是再回到上述我们所提及的临界区，我们需要对其加以限制；

**临界区位置**

临界区的划分并不难，函数内同时运行多个线程时引起问题的多条语句构成的代码块即为临界区；

```c
void * thread_inc(void * arg)
{
    for (int i = 0; i < 50000000; i++)
    {
        num += 1;	// 临界区
    }
    return NULL;
}

void * thread_des(void * arg)
{
    for (int i = 0; i < 50000000; i++)
    {
        num -= 1;	// 临界区
    }
    return NULL;
}
```

### 线程同步

之前内容探讨了线程中所存在的问题，接下来就要去讨论解决办法；

**线程同步**用于解决访问顺序引发的问题，以下两种情形需要线程同步：

- 同时访问同一空间内存时发生的情况；
- 需要指定访问同一内存空间的线程执行顺序的情况；

线程同步主要有两种技术手段：**互斥量**和**信号量**技术，两者概念上比较接近；

**互斥量**

互斥量不允许多个线程同时访问，从而解决线程同步访问的问题；

当存在一个线程在访问某个内存空间时，另一个线程需要排队等待；

互斥量的创建及销毁函数：

```c
#include <pthread.h>

// mutex是创建互斥量时传递保存互斥量的变量地址值，销毁时传递需要销毁的互斥量地址值
// attr传递即将创建的互斥量属性，没有特别需要指定的属性时传递NULL
// return 函数一，成功返回0，失败返回其他值
// return 函数二，成功返回0，失败返回其他值
int pthread_mutex_init(pthread_mutex_t * mutex, const pthread_mutexattr_t * attr);
int pthread_mutex_destory(pthread_mutex_t * mutex);

// 声明pthread_mutex_t型变量，即声明信号量
pthread_mutex_t mutex;
```

利用互斥量锁住或释放临界区使用的函数：

```c
#include <pthread.h>

int pthread_mutex_lock(pthread_mutex_t * mutex);	// 成功时返回0，失败返回其他值
int pthread_mutex_unlock(pthread_mutex_t * mutex);	// 同上

pthread_mutex_lock(&mutex); // 当线程没有没有获取到锁，则会进入阻塞状态
// 临界区的开始
// ....
// 临界区的结束
pthread_mutex_unlock(&mutex); // 因此需要unlock进行解锁，让被阻塞的进程获得锁
```

使用[互斥量的源码](https://github.com/Wind134/TCP-IP-Programming/blob/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E8%BF%9B%E7%A8%8B%E5%90%8C%E6%AD%A5%E7%AD%96%E7%95%A5/thread4_error_correct_mutex.c)；

**信号量**

信号量与互斥量的机制较为相似，这部分只涉及利用二进制信号量(0和1)完成控制线程顺序的同步方法；

```c
#include <semaphore.h>

// sem 创建的信号量的地址值，销毁时则传递需要销毁的信号量变量地址值
// pshared 创建可由多个进程共享的信号量；传递0时，创建只允许1个进程内部使用的信号量
// value 创建新创建的信号量初始值
// return 两个函数成功都返回0，失败都返回-1
int sem_init(sem_t * sem, int pshared, unsigned int value);
int sem_destory(sem_t * sem);
```

利用信号量锁住或释放临界区使用的函数：

```c
#include <semaphore.h>

// sem 传递保存信号量读取值的变量地址值
// 传递给sem_wait时信号减1，传递给sem_post信号增1
// 成功时返回0，失败时返回其他值
int sem_wait(sem_t * sem);
int sem_post(sem_t * sem);


sem_wait(&sem);		// 信号量(初始值为1)变为0
// 临界区的开始
// ....
// 临界区的结束
sem_post(&sem);		// 信号量增1
```

[使用信号量的源码](https://github.com/Wind134/TCP-IP-Programming/blob/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E8%BF%9B%E7%A8%8B%E5%90%8C%E6%AD%A5%E7%AD%96%E7%95%A5/semaphore.c)；

### 线程销毁

上面所提及的pthread_join函数会等待线程终止，还会引导线程销毁，但是该函数面对的一个问题是，线程终止前，**调用该函数的线程**将进入阻塞状态，因此我们通常而言会用如下函数调用引导线程销毁：

```c
#include <pthread.h>

// thread 终止的同时需要销毁的线程ID
// return 成功时返回0，失败时返回其他值
int pthread_detach(pthread_t thread);
```

该函数不会引起线程终止或者进入阻塞状态，可以通过该函数引导销毁线程创建的内存空间；

调用该函数后就不能再针对相应线程调用pthread_join函数了；

## 多线程并发服务器的实现

这部分不再实现回声服务器端，而是介绍多个客户端之间可以交换信息的简单的聊天程序；

[源码已上传](https://github.com/Wind134/TCP-IP-Programming/tree/main/14-%E5%A4%9A%E7%BA%BF%E7%A8%8B%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/%E5%A4%9A%E7%BA%BF%E7%A8%8B%E5%B9%B6%E5%8F%91%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF%E7%9A%84%E5%AE%9E%E7%8E%B0)；

# 制作HTTP服务器端

**理解Web服务器端**

**Web服务器:** 基于HTTP(超文本传输协议)应用层协议，将网页对应文件传输给客户端的服务器端；

浏览器在这个过程中的作用是，将服务器端传输的HTML格式的超文本解析为可读性较强的视图；

## HTTP的详细内容

HTTP又称为"无状态的Stateless"协议，服务器端响应客户端请求后立即断开连接，而后如果这个服务端再一次发送请求，服务端也无法辨认是哪个；

- 为了弥补HTTP无法保持连接的缺点，Web编程通常会使用Cookie和Session技术；
- 这样我们断开浏览器后再打开网站，信息都还在；

**请求消息(Request Message)的结构**

客户端向服务端发送的请求消息的结构称为Request Message结构，以图片形式展示：

![](HTTP请求头.svg)

- 请求头含有请求方式(目的)等信息，典型包含GET和POST，GET主要用于请求数据，POST主要用于传输数据，后续的实现都是基于GET而不涉及POST；
- 消息头包含发送请求的浏览器信息，用户认证信息等关于HTTP消息的附加信息；
- 最后的消息体装有客户端向服务器传输的数据，这部分数据装入需要以POST方式实现请求，因此忽略这部分；

**响应消息(Response Message)的结构**

这部分是Web服务器->客户端传递的响应信息的结构，图示如下：

![](HTTP响应头.svg)

- 请求行中，会包含响应结果，表示该结果的数字称为状态码，典型状态码有以下几种：
  - 200 OK：成功处理；
  - 404 Not Found：请求的文件不存在；
  - 400 Bad Request：请求方式错误，请检查；
- 消息头中含有传输的数据类型和长度等信息：服务器端名为SimpleWebServer，传输数据类型为text/html，数据长度不超过2048字节；
- 最后的消息体发送客户端请求的文件数据；

[实现的源码](https://github.com/Wind134/TCP-IP-Programming/blob/main/15-%E4%B8%80%E4%B8%AA%E7%AE%80%E6%98%93%E7%9A%84HTTP%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF/webserv_linux.c)已上传Github；
