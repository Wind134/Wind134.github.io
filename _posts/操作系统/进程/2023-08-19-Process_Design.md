---
title: 进程的设计
author: Ping
math: true
img_path: /assets/img/OS/
date: 2023-08-19 10:33:00 +0800
categories: [操作系统, 进程]
tags: [操作系统]
---

## 设计进程的意义

在刚开始学习计算机的时候，从来就没有真正考虑过进程对于资源调度的意义，出于准备秋招的契机，在这里记录一下个人的理解；

先抛出一个问题，为什么操作系统需要创建进程去处理资源的运行？<font color=red>操作系统直接去管理程序不好吗</font>？我也可以实现对程序的并发处理啊。

我们把整个计算机看成是一家超大公司，那操作系统显然是这家公司的老板，而要执行的程序就是这家公司的某个部门，当然，这个类比相对比较特殊的一点是，老板需要亲自负责每个部门的工作，再有，每个部门的工作都依赖公司唯一的机器。其次，为什么说是部门而不是员工呢？因为后面还有线程的概念，后续会补充这一点，一个部门需要完成各式各样的工作任务，假设并不存在进程，且公司有1000个部门，因为进程不存在，所以老板需要亲自管理这1000个部门，然后我们现在假设这么一种场景：
- 部门1跟部门999现在有很重要的工作任务，需要老板去处理，1~999之间的部门也有一些需要完成的工作，999部门的事情很紧急，等到执行它的时候再去执行，需要等999个部门干完自己的活，这样显然不现实；
- 现在部门1跟部门999都要完成自己的任务，由于部门之间并不存在一个负责人，部门现在为了自己的任务，疯狂抢夺公司那唯一的机器，1~999之间的部门一看这情况，直接开摆，不就是开抢嘛，我们也行，于是也加入进来，这个公司一片混乱，老板直接崩溃；
- 这个时候怎么办，招人呗，他觉得需要管管每个人部门了，毫无秩序怎么行，那谁管呢，老板自己？老板自己管也不是不行，但是1000个部门啊，等老板一个一个管理，那999号部门得等多久才能执行自己的工作，再有，老板在管理某个部门的时候，其他部门岂不是又来随便抢夺资源，也许会说，在老板管理某个部门的时候，其他部门状态冻结，但冻结的状态总得有人保存，老板保存，行，但保存那么多，不太行，效率真的很低，于是思来想去决定给每个部门安排一个部门经理，现在把每个部门都交给部门经理，部门在部门经理的指挥下，安分有序工作，老板就负责管理部门经理，老板从管理1000个部门的大大小小的事务上抽出身来，只管理这1000个部门经理，老板再也不需要时刻监督每个部门的情况了，现在他需要管理的是部门经理，部门经理有什么需求向老板提出，老板为部门经理解决需求，而部门经理，就是进程；
- <font color=red>这，就是进程的意义所在！</font>

## 进程的资源分配

有了进程，操作系统后续所有的资源分配都可以基于进程，接下来同样用这个例子描述资源的分配；

- 老板在有了部门经理之后，可以对每个部门的工作状态放心了，但是现在又遇到了新的问题，是不是一定需要每个部门经理管理的工作全部做完才去处理下一个部门的工作呢？
- 一个一个等下去也不是办法，因此他决定制定一种规则，这个规则使得我不需要等待每个部门工作全部做完再去处理下一个部门，而是将公司机器完成一个任务的时间划分为多个小的时间片，分配给每个部门的时间片到了之后，保存好这个部门目前的进度，保存进度的任务得老板来干，但是因为有了<font color=red>部门经理</font>的存在，老板只需要保存部门经理给定的部门状态信息即可，这么一个步骤，大致上就是<font color=red>操作系统对进程上下文切换</font>的过程；
- 假设机器执行一个任务<font color=red>需要占用机器</font>的时间是`1s`，老板拆分这个时间到1000个时间片，这样给每个部门分配的时间是`1ms`，那么处理完1000个也就是`1s`，老板很高兴，`1s`的时间让1000个部门都干活了，宏观上老板在`1s`内实现了1000个部门的并行工作，这种策略，就是CPU资源的<font color=red>时间片轮转</font>的调度策略；

以上这些就是个人对操作系统进程管理的一个比较式理解，整个流程梳理下来，理解清晰了很多，接下来要进行标准的教科书描述了；

## 介绍进程
### 进程的教科书定义

以下的内容基本都是基于汤子瀛等人编撰的《计算机操作系统》-第四版；

操作系统配置了一个称为**进程控制块(Process Control Block, PCB)**的数据结构使得参与并发执行的每个程序能够独立运行，系统正是利用PCB来描述进程的基本情况和活动过程，在系统调用中，`fork()`所创建出的`PID`也属于PCB的一部分，它是一个标识符，操作系统用它来唯一识别一个进程。通常来说，由
- 程序代码段
- 数据段
- <font color=red>进程控制块</font>

三部分构成了进程实体，这个进程实体一般就称之为进程，当然严格来说进程的定义是多种多样的，但是我们需要把握的一个核心点就是，进程是计算机进行资源分配的基本单位，但是并非CPU调度的基本单位，由于线程的存在，线程可以共享进程的资源，但是线程本身也是一个独立的执行流；

在这里补充一下<font color=red>进程控制块</font>的这部分信息，进程在中断之后能恢复之前的工作，这个过程中进程控制块PCB扮演者着很重要的作用，它包含；
- 程序计数器PC的信息(Program Counter)，程序计数器是一个特殊的寄存器，用于存储当前正在执行的指令的内存地址或指令序号。
- 堆栈指针(Stack Pointer)，堆栈指针是一个寄存器，用于指示当前堆栈顶部的内存地址，数据压栈，指针减小(为什么是减小呢，请看<a href="#diagram-1">下图</a>)
- 除堆栈指针以外，还有通用寄存器、栈基指针等寄存器信息，这些保存的信息都是被抢占前的信息，它们是进程的关键上下文信息。
- 内存管理信息，PCB还会包含有关进程所占用内存的信息，如基址、界限等。
- 进程优先级、进程标识符(PID)等信息，用于进程调度以及进程识别；



### 进程的基本状态及转换

进程的生命周期一般而言包括了三种状态：
- 就绪态：进程一旦获得了CPU就能进入工作状态；
- 执行态：进程获得CPU后正在执行的状态；
- 阻塞态：执行态的进程由于发生某事件(如I/O请求)等暂时无法继续执行的状态；

阻塞态的进程没有必要一直占据着CPU，这个时候就会将其阻塞，并放入到一个队列，阻塞的进程多了就会形成阻塞队列；

阻塞态的进程在发生的事件完成之后，就从阻塞队列转移到就绪队列；

以上基本就大致描述了三个状态的转换过程；

当然教科书上的描述就更加细节了，在三种基本状态的基础上还会加入一个挂起操作，挂起操作可以干涉上面任意的基本状态；

## 进程控制

在操作系统中，有一个被称为**原语**的概念，所谓原语就是一个不能被打断的操作，依靠这个操作，实现对进程的控制；

在描述对进程的控制之前，先讲讲操作系统中的两种状态：
- 系统态：又称为管态，具有特权，能执行一切指令，操作系统本身的权限级别比较高，因此操作系统相关的程序一定都在系统态中执行；
- 用户态：又称目态，它仅仅能执行规定的指令，如果它想要去控制硬件，比如输出一段文字，那就得通过系统调用，把这个要求传递给操作系统，由系统负责处理这个调度；

后面会针对这部分进行更加详细的描述；

说回进程控制，首先就是进程创建了，进程创建就是一个很显然的原语过程，不能被中断，进程创建分为以下几个过程：
- 分配进程控制块PCB；
- 为新进程分配其运行所需资源，包括内存，文件，IO设备和CPU时间等；
    - 如果是`fork()`操作，那么资源则来源于其父进程，内存也会重新分配，但是内容基本与父进程保持一致；
- 初始化进程控制块PCB，这部分的工作主要是初始化处理器状态信息等，比如将程序入口地址保存进PC计数器；
- 最终正常来说，进程会被插入就绪队列；

进程创建成功之后，理论上接下来要去CPU执行了，但这个时候会遇到的一个问题是，比如我一个*hello world程序*，操作系统知道了`main`函数的逻辑入口地址，但是程序本身是装载在磁盘的，要执行这段程序，需要将程序装入内存，操作系统管理内存的基本单位是页，装入这段程序的过程中就会发生缺页中断，需要将程序载入内存，在等待载入的过程中，该进程会被转为阻塞态，直到中断处理完成，也就是说，进程刚刚进入执行态就被阻塞了，缺页中断完成后，再由中断处理程序将该进程唤醒；

在上述的过程中，阻塞和唤醒的过程都是原语操作，这个操作极其重要，不能被打断；

进程的创建以及终止过程同样是这个性质；

这部分在之前学习的时候全是理论，其中应该结合一些实践过程去理解的；

## 进程的地址空间

千言万语不如一张图标的展示更加直观：
<a name="diagram-1"></a>
请看一张好图，下面是操作系统整个进程的虚拟地址空间的一个大致展示：

![](进程的地址空间.svg)
_进程的地址空间_

操作系统为每个运行的进程分配了独立的虚拟内存空间，操作系统将整个内存划分为两个区域：
- **内核空间:** 属于权限极高的进程空间，这部分不允许用户层的任何软件染指，用户进程需要用到内核空间的功能，可以，但是需要经过系统层面的严格把关，如系统调用；
- **用户空间:** 这部分就是用户进程自由挥洒青春的空间，但是也需要遵循一些规范，比如防内存泄漏，每个进程空间都需要遵循调度的原则等；

对于用户进程空间的分配，我们基于该图，基本就能看到，⼀个程序由命令行参数和环境变量、栈、共享区区、堆、BSS段、数据段、代码段组成，接下来逐步介绍各个部分的作用：
- `命令行参数和环境变量`——命令行参数是指从命令行执行程序的时候，给程序的参数。
- `栈区`——存储局部变量、函数参数值，栈有一个特点就是从<font color=red>高地址向低地址</font>增长，同时也是一块连续的空间。
- `共享区`——大多时候留来给文件映射准备，比如`mmap()`函数就是用来将文件内容全部映射到内存的一个系统调用函数；
- `堆区`——动态申请内存用，堆与栈相反，从<font color=red>低地址向高地址</font>增长；
- `BSS段`——存放程序中未初始化的全局变量和静态变量的⼀块内存区域。
- `数据段`——存放程序中已初始化的全局变量和静态变量的⼀块内存区域。
- `代码段`——存放程序执⾏代码的⼀块内存区域，这部分区域<font color=red>只读</font>，代码段的头部还会包含⼀些只读的常数变量。

关于堆和栈为何地址延申的方向相反，后面会专门出一片文章来分析这么设计的缘由，个人认为主要是为了可变参的使用；

## 进程同步

系统中多道程序并发执行，确实可以显著提高系统的吞吐量，但同时也使得系统更加复杂，因此需要一定的同步机制进行妥善管理，有些程序执行的先后顺序必须要确定；

此外，对系统中某些资源的访问必须要有先后，比如典型的生产者——消费者模型，消费者要消费里面的东西，必须有一个前提就是里面有东西；

此外，接下来给出一个例子，这段代码没有加任何的同步机制：
```c
#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>

int main() {
    int num_processes = 0;
    
    // 循环执行三次fork()函数
    for (int i = 0; i < 3; i++) {
        pid_t pid = fork();
        if (pid == 0) {
            // 子进程打印出自己所处的循环次数之后就不再继续fork了
            // 也就是说子进程不参与fork，只有父进程参与，也就是说，子进程进入不到下一个循环了
            // 同时在这里子进程继承的num_processes上次循环后num_processes的值
            printf("子进程 %d\n", i + 1);
            break;
        } else if (pid > 0) {
            // 父进程
            num_processes++;
        } else {
            // fork()函数调用失败
            printf("fork()函数调用失败\n");
            return 1;
        }
    }
    // 父进程打印子进程数量
    if (num_processes > 0) {
        printf("总共创建了%d个子进程\n", num_processes);
    }
    return 0;
}

```
理论上说，这段代码你每次运行，都会得到一个不同的输出结果，而之所以输出不同的结果，根源上就是因为并行的策略；

(对这段代码的分析，后续会出一篇专门的文章)

接下来会介绍的就是操作系统中的同步机制了，在介绍之前，首先提及的是所有同步机制应该遵循的四条原则：
- `空闲让进` - 最基本的准则，懒得解释；
- `忙则等待` - 同样也是基本准则，懒得解释； 
- `有限等待` - 进程等待进入临界区的时间应该是有限的，不能一直"死等"；
- `让权等待` - 进程知道自己不能进入临界区时，要立即释放资源，比如不能一直执行while循环；

更本质来说，其实是进程在访问临界区资源时应该遵循的准则；

**临界区**这个概念理解起来应该没什么太大问题，折射到C语言代码当中就是
```c
{
    // 临界区资源
}
```

### 硬件同步机制

这部分主要参考教科书，三种策略：
- `关中断`指令
- `Test-and-Set`指令
- `Swap`指令

硬件机制层面的内容这里不详细描述；我们只需要知道的一点是，硬件层面的所有操作都是原子操作，不能被打断，从而实现了上锁与解锁；

### 软件同步机制

软件同步机制中用途最广泛的应该是**信号量机制**，这是1965年由荷兰学者Dijkstra(不知道是不是发明那个算法的)提出的一种同步工具；

信号量机制分三种：

- 整型信号量

    有两个操作，`wait`和`signal`操作，这两个操作都是原子的；
    ```c
    wait(S) {
        while (S <= 0);
        --S;
    }

    signal(S) {
        ++S;
    }
    ```
- 记录型信号量

    观察整型信号量，确实易懂，方便，但是在`S <= 0`时，会很明显的违反了`让权等待`的原则，记录型信号量针对此就进行了优化，首先是设计了一个数据结构：
    
    ```c
    typedef struct {
        int value;  // 资源数目
        struct process_control_block *list; // 排队的进程
    } semaphore;
    ```
    相应的更改两个函数：
    ```c
    wait(semaphore* S) {
        S->value--; // 减去一个资源数目
        if (S->value < 0)   block(S->list); // 小于0则等待
    }

    signal(semaphore* S) {
        S->value++; // 归还一个资源数目
        if (S->value <= 0)   wakeup(S->list);
    }
    ```

    这个时候问题来了，`if (S->value <= 0)`的条件下`wakeup(S->list)`吗？是的，我们假设给定了一个资源数目，如果是在`S->value >= 0`的情况下才去唤醒，那么就会有一个问题：阻塞队列之前被阻塞的那些进程很多没有被唤醒，`S->value >= 0`都成立了，说明没有进程被阻塞，这个时候还有什么可唤醒的呢？

    这是我在几年前初次学习这部分的时候所遇见的疑惑，分享一下；

    总而言之，在`S->value <= 0`之时，说明阻塞队列有阻塞进程，那么在资源新增1的时候应该去选择唤醒一个进程；

- AND型信号量

    这部分不会进行详细描述，这一机制主要是为了处理多个共享资源的互斥，AND同步机制的基本思想是将进程在整个运行过程中需要的所有资源，一次性的分配给进程，使用完之后一起释放，只要有一个资源未能分配，那么其他所有的都不分配，分配的过程也是原子操作；

    相当于就是把所有的共享资源打包起来看成一类资源，从而实现1的效果；

- 信号量集

    信号量集是对AND信号量机制的补充，扩充的部分主要是新增了：`资源的需求量`；

    用代码描述就是：

    ```c
    Swait(S1, t1, d1, ..., Sn, tn, dn);
    Ssignal(S1, d1, ..., Sn, dn);
    ```

    代码上可以看到参数中会有多个信号量，以及与信号量对应的资源分配下限值$t_i$和进程对该资源的需求值$d_i$，这就是信号量集的介绍；

到这里，关于信号量机制的介绍已经比较全面了，但是在进程的同步处理中，必须要面对的一个问题是：每个进程都需要自备P、V操作，有多少进程就有多少这方面的操作，显然给系统的管理带来了麻烦；

为了解决这个问题，又有一种新的进程同步工具被设计出来，那就是——**管程**；

区别于信号量，管程的逻辑就是不在进程中去折腾这些操作，而是通过在共享资源上设置互斥锁来确保只有一个进程可以访问资源，进而实现互斥；

**管程的定义**

管程利用一种共享数据结构抽象地表示系统中的共享资源，并且将对该共享数据结构实施的特定操作定义为一组过程，**操作系统的这么一种资源管理模块**，我们称之为管程，从这里基本也可以看出，基本就是封装的思想了；

**条件变量**

同样是两个用于同步的原子操作`wait`和`signal`，当进程通过管程请求获得临界资源而没有得到满足时，`wait`原语使得该进程等待，并将之排在等待队列上，仅当另一进程访问完成并释放该资源之后，管程又调用`signal`原语，唤醒等待队列中的队首进程；

如果仅仅局限于此，则需要面对一个问题：

- 当进程使用临界资源调用了管程，在使用期间如果不释放管程，则其他进程需要长时间等待，破坏了"有限等待"的原则；

因此解决方案就是针对进程阻塞的原因去设置一个条件变量`condition`，当进程因为某个具体原因而阻塞，也就是因为某个具体的条件变量`condition`而阻塞，针对该条件去调用`wait`和`signal`，这样就能在最大程度上实现并发的处理；

具体代码：

~~~c
condition x, y; // condition是一种特殊的数据结构 

x.wait;         // 正在调用管程的进程因x条件需要被阻塞或挂起
x.signal;       // 正在调用管程的进程发现x条件发生了变化，则重新启动一个因x而阻塞的进程
~~~

## 进程通信

进程通信是指不同进程之间进行数据、信息或信号的交换，以实现协同工作、共享资源、数据传递等目的。

常用的进程通信类型：
1. **管道通信**
    - **无名管道**

    半双工通信机制，且数据只能从管道一端写入，从另一端读出，管道不是任何进程的资源，而是属于操作系统；

    同时无名管道只能在具有公共祖先的进程之间使用；
    - **有名管道**

    有名管道英文名称为FIFO，是的就是那个先进先出，它作为一个特殊的文件而存在，但是内容存放在内存中；

    不相关的进程之间可以通过打开命名管道进行通信；

2. **消息队列**

    消息队列是一种用于进程间通信的机制，它允许不同的进程在异步的情况下通过传递消息来实现数据交换。消息队列在多进程或多线程环境中非常有用，可以实现进程之间的解耦和协调，以及实现简单的同步和通信。

    消息队列的基本思想是，一个进程可以将消息发送到队列，而另一个进程可以从队列中接收消息；消息队列通常有一定的容量，当队列满时，新的消息可能需要等待；不同进程之间通过消息队列传递的消息可以是结构化的数据、文本、状态信息等。

3. **共享内存**

    最经典的就是共享存储映射机制了，如`mmap`函数；

    介绍一下该函数：
    ```c
    /* 
    * addr：映射的首选地址，通常设置为NULL，让操作系统自动分配合适的地址。
    * length：映射区域的长度，以字节为单位。
    * prot：映射区域的保护标志，表示内存的访问权限（读、写、执行等）。
    * flags：映射的标志，控制映射区域的属性，如共享方式、映射方式等。
    * fd：要映射的文件的文件描述符，如果不是基于文件的映射，可以设置为-1。
    * offset：映射区域在文件中的偏移量。
    */
    void *mmap(void *addr, size_t length, 
    int prot, int flags, 
    int fd, off_t offset);
    ```
    其中`prot`：
    - `PROT_READ`：允许读取映射区的数据。
    - `PROT_WRITE`：允许写入映射区的数据。
    - `PROT_EXEC`：允许执行映射区的代码（仅适用于可执行文件映射）。
    - `PROT_NONE`：禁止对映射区进行任何访问。

    有这么四个参数，可以对这片区域的访问权限进行设置；

    这种机制其中一个比较方便的点就是：可以在不使用`read`和`write`函数情况下，使用指针来完成IO操作；

4. **套接字**

    套接字通信是一种在计算机网络中用于实现进程间通信的机制。套接字可以在同一台计算机上的不同进程之间，或者在不同计算机上的进程之间进行通信。套接字提供了一种标准化的接口，使得应用程序能够通过网络传输数据，实现远程通信和数据交换。

5. **信号量**

    信号量之前说过，是一种用于多进程或多线程间同步和互斥的机制。信号量可以用来管理对共享资源的访问，以避免竞争条件和数据不一致性，它是一种在并发编程中常用的同步原语。

## 守护进程

守护进程(Daemon Process)是在后台运行的一种特殊类型的进程，它通常在操作系统启动时由`init`进程或其他进程管理器创建，并且在系统运行期间持续运行，为系统提供各种服务和功能。

守护进程的特点：

- **在后台运行**：守护进程在后台运行，不与用户交互，通常没有控制终端。这使得它们不会影响用户的交互操作。

- **脱离终端**：守护进程通常会调用`fork`函数来创建子进程，并在子进程中执行任务，然后<font color=red>关闭父进程</font>，这样守护进程就与终端分离，不会受到终端关闭等操作的影响。

- **独立于用户会话**：守护进程通常与用户会话无关，不受用户登录和注销的影响。它们通常在系统启动时启动，而不是在用户登录时启动。

- **长时间运行**： 守护进程通常持续运行，提供系统服务，如网络服务、日志记录、定时任务等。它们会在系统运行期间一直保持活动状态。

- **没有标准输入输出**：守护进程没有控制终端，因此没有标准输入和输出。它们通常将输出写入日志文件，而不是终端。

守护进程的实现可能涉及一些步骤：

- 调用`fork`：为了创建守护进程，通常会使用`fork`函数来创建一个子进程，然后在子进程中执行实际的任务。

- 调用`setsid`：为了使守护进程脱离终端会话，可以调用`setsid`函数创建一个新的会话。
    - `sid`：是`Session ID`的缩写，表示会话标识符；

- 关闭文件描述符：守护进程通常会关闭所有的文件描述符，以防止因未关闭的文件描述符导致的资源泄漏。

- 捕捉和处理信号：守护进程可能需要捕捉和处理一些信号，如重启或停止服务。

- 记录日志：守护进程通常会将输出写入日志文件，以便记录其运行状态和输出。

守护进程在操作系统中发挥着重要的作用，为系统提供各种服务和功能，如Web服务器、数据库服务、网络服务、定时任务等。因为它们在后台运行且不受用户干预，所以需要谨慎编写和管理，以确保系统的稳定性和安全性。
