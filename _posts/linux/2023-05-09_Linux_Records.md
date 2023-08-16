---
title: Linux使用汇总
author: Ping
date: 2023-05-09 14:33:00 +0800
categories: [Linux]
tags: [Debian, Arch Linux, shell, tools]
---

# Linux学习

## 用户层

### 一、desktop文件的参数

在自编辑desktop文件的过程中遇到固定到任务栏(Dock栏)后，在任务栏点开程序运行发现不会基于我固定的那个图标启动，经资料查询发现与StartupWMClass参数有关系，如果desktop文件中的StartupWMClass参数与程序真实的StartupWMClass参数不同就会另起一图标。解决方案如下：

```shell
xprop WM_CLASS # 获取WM_CLASS名，获取方法，在终端输入之后将鼠标放置于对应窗口上点击，即可获取。
```

### 二、更改某文件类型在系统中的图标显示

以xmind为例，查阅其xml文件，我们进行对照：

```shell
cat /usr/share/mime/packages/xmind.xml	# 也可以修改对应的xml文件
#--------------------------------------------------------------------------
<?xml version="1.0" encoding="utf-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
<mime-type type="application/xmind">	# xmind文件的打开类型
  <glob pattern="*.xmind"/>	# 文件后缀格式
    <comment>Xmind Workbook</comment>
  <icon name="xmind" />	# 文件类型图标
</mime-type>
</mime-info>
#--------------------------------------------------------------------------
sudo update-mime-database /usr/share/mime # 刷新数据库，或者说同步数据库。生效。
```

### 三、配置oh my zsh

主要是各类插件的总结

- 安装zsh-syntax-highlighting语法高亮插件

```shell
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git $ZSH_CUSTOM/plugins/zsh-syntax-highlighting
echo "source $ZSH_CUSTOM/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh" >> ${ZDOTDIR:-$HOME}/.zshrc
source ~/.zshrc
```

- 安装zsh-autosuggestions语法历史记录插件

```shell
git clone https://github.com/zsh-users/zsh-autosuggestions.git $ZSH_CUSTOM/plugins/zsh-autosuggestions 
echo "source $ZSH_CUSTOM/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh" >> ${ZDOTDIR:-$HOME}/.zshrc 
source ~/.zshrc
```

### 四、跳过Grub引导，直接进入系统

主要grub有各种各样的问题，因此我换成了refind引导

首先编辑grub文件

```shell
sudo gedit /etc/default/grub
```

将代码GRUB_TIMEOUT参数改为0

然后编辑30_os-prober 文件

```shell
sudo gedit /etc/grub.d/30_os-prober   
```

找到这一串C代码

```shell
if [ "\${timeout}" = 0 ]; then

set timeout=10

fi
```

将这三行都注释掉，保存，最后：

```shell
sudo update-grub
```

**补充：使grub自动记忆上次的启动选项**

在grub文件中添加如下参数：

```
GRUB_DEFAULT=saved
GRUB_SAVEDEFAULT=true
```

### 五、tar命令的使用

tar命令可以用来压缩打包单文件、多个文件、单个目录、多个目录。

**常用格式：**

```shell
# 单个文件压缩打包
tar czvf my.tar.gz file1
# 多个文件压缩打包
tar czvf my.tar.gz file1 file2,...（file*）（也可以给file*文件mv至一个目录再压缩）
# 单个目录压缩打包
tar czvf my.tar.gz dir1
# 多个目录压缩打包 
tar czvf my.tar.gz dir1 dir2
# 解包至当前目录
tar xzvf my.tar.gz
```

**参数：**

`-c` ：建立一个压缩文件的参数指令(create 的意思)；

`-x` ：解开一个压缩文件的参数指令！

`-t` ：查看 tarfile 里面的文件！

特别注意，在参数的下达中， `c/x/t` 仅能存在一个！不可同时存在！因为不可能同时压缩与解压缩。

`-z` ：是否同时具有gzip(tar.gz)的属性？即是否需要用gzip压缩？

`-j` ：是否同时具有bzip2(tar.bz2)的属性？即是否需要用bzip2压缩？

`-v` ：压缩的过程中显示文件！这个常用，但不建议用在背景执行过程！

`-f` ：使用档名，请留意，在 f 之后要立即接档名喔！不要再加参数！

例如使用`tar -zcvfP tfile sfile`就是错误的写法，要写成`tar -zcvPf tfile sfile`才对！

`-p` ：使用原文件的原来属性（属性不会依据使用者而变）

`-P` ：可以使用绝对路径来压缩！

`-N` ：比后面接的日期`yyyy/mm/dd`还要新的才会被打包进新建的文件中！

`--exclude FILE`：在压缩的过程中，不要将 FILE 打包！



## 底层

### 一、双系统下（Windows、Linux）实现蓝牙鼠标（键盘）自动连接

原理，主要是两个OS上对于鼠标的信息生成不一致导致连接需要频繁切换，解决方案如下：

- 先在Windows下配对，配对好了会在注册表下生成蓝牙设备相关信息
- 在Linux上同样连接上你的蓝牙设备，然后我们获取Linux下的相关参数

```shell
su

cd /var/lib/bluetooth 

ls -alF

cd XX:XX:XX:XX:XX:XX  进入蓝牙设备地址

ls -alF

cd XX:XX:XX:XX:XX:XX #你蓝牙设备的地址

cat info
```

将你所获取的info文件单独Copy下来，进入Windows操作系统，通过[工具集PSTools](https://download.sysinternals.com/files/PSTools.zip)进行注册表信息更改，执行并进入

```
psexec.exe -s -i regedit
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\BTHPORT\Parameters\Keys\
```

找到你蓝牙设备对应的mac地址，与你在Manjaro下所获取的mac信息进行对照，发现会存在不一样的信息（主要是最后一位），进行更改，要更改两处的蓝牙设备mac信息：

```
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\BTHPORT\Devices\
HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\BTHPORT\Parameters\Keys\
```

修改完之后，进入keys中的那一栏，把info中的信息分别对照过来：

- 把IdentityResolvingKey的16进制形式复制到 IRK中（在注册表中该项是二进制，建议一个个手动输入吧，不知为啥我复制不动）
- 把LongTermKey的16进制复制到LTK中    
- 把EDIV以10进制复制到EDIV中
- 把RAND以10进制复制到ERAND中

OK，Reboot，Solved。

### 二、整理Linux内核

查看你现在所有已安装的内核：

```shell
dpkg --get-selections | grep linux
```

进行卸载的命令

```shell
sudo apt purge ***
```

### 三、清除网络缓存

首先安装nscd

```shell
sudo apt-get install nscd
```

再执行命令

```shell
service nscd restart
```

或者一个更简单的命令

```shell
sudo /etc/init.d/networking restart
```

### 四、UNIX类系统中的文件重定向

当测试程序时，反复从键盘敲入一些信息作为程序的输入，是非常乏味且低效的，这时候就可以用到操作系统的文件重定向功能，这种机制允许我们将标准输入和标准输出与命名文件关联起来：

```shell
addItems <infile >outfile
```

`addItems`是我们执行的程序，`infile`是我们的要读取信息的文件，最终要输出的信息会被保存到文件`outfile`

中。

### 五、文件权限问题

普通用户通过`su`命令切换到root用户，使用`sudo`则短暂提权；

**权限管理**

三种权限属性，读权限，写权限、执行权限。

文件按访问者可分为三类：

- 拥有者：文件的拥有者user，在系统用u表示。
- 所属组：文件属于哪个组的group，在系统用g表示。
- 其他用户：other，在系统用o表示。
- 所有用户，在系统用a表示。

以上三者更多的是一种角色，而root用户、普通用户则是具体的人。

| 第1位：文件类型 | 第2-10位：权限 | 连接数 | 文件拥有者 | 文件所属组 | 文件大小 | 文件最新修改时间 | 文件名 |
| --------------- | :------------: | :----: | :--------: | :--------: | -------- | ---------------- | ------ |

这是通过`ll`命令列出的文件详情信息，以此参照，一一做说明。

- **文件类型的详细说明：**d：目录文件(文件夹)；-：普通文件；l：软链接(类似Windows的快捷方式)；b：块设备文件；p：管道文件；c：字符设备文件(如屏幕等串口设备)；s：套接口文

- **第2-10位的权限：**r代表读权限，w代表写权限，x代表执行权限。前3位：文件拥有者的权限；中间3位：文件所属组的权限；后3位：其他用户的权限。

  - **字符表示**

  | linux表示 |      说明      | linux表示 |    说明    |
  | :-------: | :------------: | :-------: | :--------: |
  |    r--    |      只读      |    -w-    |    只写    |
  |    --x    |    仅可执行    |    rw-    |  可读可写  |
  |    -wx    |   可写可执行   |    r-x    | 可读可执行 |
  |    rwx    | 可读可写可执行 |    ---    |   无权限   |

  - **八进制表示**

  | 权限符号 | 8进制 |
  | :------: | :---: |
  |    r     |   4   |
  |    w     |   2   |
  |    x     |   1   |
  |    rw    |   6   |
  |    rx    |   5   |
  |    wx    |   3   |
  |   rwx    |   7   |
  |   ---    |   0   |

  ```shell
  chmod u-rwx 文件名		# 去掉文件拥有者的所有权限
  chmod g-rwx	文件名		# 去掉文件所属组的所有权限
  chmod o-rwx 文件名		# 去掉文件其他用户的所有权限
  chmod a+r 文件名		# 增加所有用户的读权限
  chmod a+rwx 文件名		# 增加所有用户的读写执行权限
  chmod u-x,g+x 文件名	# 去掉拥有者的执行权限，增加所属组的读权限
  ```

  同时也可以用八进制也可以更改相应的权限，这就是常用的`chmod 777、666 `一类的由来。
  
  同时，也可以改变文件的拥有者和所有组，不需要更改其他用户，因为文件拥有者和所属组的改变就会改变其他用户。
  
  **chown指令**
  
  ```shell
  #功能：更改文件拥有者
  #用法：chown 用户名 文件名
  ```
  
  **chgrp指令**
  
  ```shell
  #功能：更改文件所属组
  #用法：chgrp 所属组名 文件名
  ```
  
  **chown指令**
  
  ```shell
  #功能：拥有者和所属组一起修改，中间加冒号
  #用法：chown king:king 文件名
  ```
  
  - **默认权限：**在Linux中，文件的起始权限：普通文件：0666；目录文件：0777。此外还涉及到掩码umask，真实默认的文件起始权限是~umask&文件的起始权限而得。
  
  上述举例都是针对文件，针对目录而言，稍微不同，具体如下：
  
  - 可读权限：如果目录没有可读权限，则无法使用ls等命令查看目录中的文件内容。
  - 可写权限：如果没有可写权限，则无法在目录中创建文件，也无法在目录中删除文件。
  - 可执行权限：如果目录没有可执行权限，则无法cd到目录中。
  
  在上述问题中，我们可以看到一个bug，那就是，如果一个目录的拥有者对目录中任意文件(包括文件夹)进行读写删，而不论该用户是否具有文件的相应的权限，因此，针对这样的问题，linux引入了粘滞位：
  
  ```shell
  # chmod o+t 目录
  # t即为粘滞位，代替了x
  ```
  
  当一个目录被设置粘滞位时，该目录下的文件只能由root用户删除、该文件的拥有者删除、目录的拥有者删除。

### 六、自定义SSH的端口号

这个问题出现的原因主要是在自行架设VPS主机的时候，遇到了在clash的TUN模式下默认的22端口无法连接的问题，因此有了这部分记录，[参考链接](https://news.sangniao.com/p/933687883)！

- **SSH端口的选择**

  当选择一个新的SSH端口时，要注意端口号0-1023是为各种服务保留的，只能通过root访问来绑定，以下列举一些常用的特权服务以及相关端口和功能的列表：

  |    端口     |  协议   |                服务                |
  | :---------: | :-----: | :--------------------------------: |
  |     20      |   TCP   |      文件传输协议（FTP）数据       |
  |     21      |   TCP   |             FTP服务器              |
  |     22      |   TCP   |                SSH                 |
  |     23      |   TCP   |            Telnet服务器            |
  |     25      |   TCP   |   Simple Mail Transfer Protocol    |
  |     53      | TCP/UDP |           域名系统(DNS)            |
  |    67/68    |   UDP   |       动态主机配置协议(DHCP)       |
  |     69      |   UDP   |         Trivial FTP (TFTP)         |
  |     80      |   TCP   | Hypertext Transfer Protocol (HTTP) |
  |     110     |   TCP   |    Post Office Protocol3(POP3)     |
  |     123     |   UDP   |         网络时间协议(NTP)          |
  | 137/138/139 | TCP/UDP |              NetBIOS               |
  |     143     |   TCP   |    Internet信息访问协议（IMAP）    |
  |   161/162   | TCP/UDP |      简单网络管理协议（SNMP）      |
  |     179     |   TCP   |     Border边界网关协议（BGP）      |
  |     389     | TCP/UDP |     轻量级目录访问协议（LDAP）     |
  |     443     |   TCP   |      HTTP over SSL/TLS(HTTPS)      |
  |     636     | TCP/UDP |     LDAP over SSL/TLS (LDAPS)      |
  |   989/990   |   TCP   |      FTP over SSL/TLS (FTPS)       |

  以上这些都是为了专用的服务而特定保留，因此不建议在0~1023范围选择新端口！

- **改变SSH默认的22端口**

  - 连接到服务器，并修改sshd_config文件

    ```shell
    # 默认root用户
    vim /etc/ssh/sshd_config
    
    # 将
    # Port 22这一行的注释去掉
    # 改为1099
    Port 1099
    
    # 退出，保存
    ```

  - 如果有防火墙的话，配置防火墙

    以firewalld为例，永久添加端口号：`firewall-cmd --zone=public --add-port=1099/tcp --permanent`；

    重新加载防火墙：`firewall-cmd --reload`；

  - 测试新的端口是否开放

    测试命令：`netstat -tulpn | grep 1026`;

### 七、Linux下的文本处理工具

#### grep的基本使用

`grep`是Linux下常用的查找字符串工具，它的功能是**搜索**文本内容中符合某种模式或规则的字符串。

**基本语法：**`grep pattern file`-在file文件中查找与pattern模式所匹配的字符串；

```shell
grep "linux" test.txt	# 在test文本文件中查找含有Linux字段的行
grep "c*" test.txt		# 匹配以c开头的行(通配符)
grep "o+d" test.txt		# 匹配至少包含'o'或'd'的行(正则表达式)
```

**常用选项：**

`-i`：忽略大小写；

`-n`：打印行号；

`-v`：只打印不匹配的行；

`-r`：递归搜索多级目录；

#### sed的基本使用

`sed`是用于文本的流编辑器，可以实现如插入、删除、替换等高级编辑功能；

**基本语法：**`sed 's/pattern/replacement/' file`-在file文件中查找pattern并替换为replacement；

```shell
sed 's/hello/hi/' test.txt	# 将test文本文件中的hello替换成hi
```

#### awk的基本使用

`awk`用于文本分析和提取，相比`grep`和`sed`，`awk`的文本处理语言更为强大，可以实现比较复杂的文本分析功能；

**基本语法：**`awk 'pattern {action}' file`-用于找到file文件中符合pattern的<font color=red>行</font>，执行action指定的操作；

```shell
awk '/linux/ {print $3}' test.txt	# 将找到包含linux的行,并打印第3个字段。
```

### 八、输入输出重定向

在Linux中，`>`、`>>`、`>!`表示输出重定向：

```shell
echo "123" > test.txt	# 将123输入到文件test.txt中，覆盖输入

echo "123" >> test.txt	# 将123输入到文件test.txt中，追加输入

echo "123" >! test.txt	# 将123输入到文件test.txt中，强行覆盖输入
```

### 九、后台运行进程

如果想要从后台启动进程，可以在命令的结尾加上`&`符号，这样就可以在不阻塞当前终端的情况下启动一个新的进程。

例如，执行命令`python script.py &` 就可以在后台启动一个Python脚本。

### 十、可移植操作系统接口(POSIX)

POSIX互斥锁是指统一接口的互斥锁，它有一些相关的函数：

```shell
pthread_mutex_init 		# 初始化一个互斥量      
pthread_mutex_lock  	# 给一个互斥量加锁      
pthread_mutex_trylock	# 加锁，如果失败不阻塞      
pthread_mutex_unlock 	# 解锁      
pthread_mutex_destroy 	# 销毁互斥锁     
```

### 十一、文件描述符

在Linux系统中，一切设备都看作文件，每打开一个文件,就有一个代表该打开文件的文件描述符。

程序启动时默认打开三个I/O设备文件：标准输入文件stdin，标准输出文件stdout，标准错误输出文件stderr： 

- 文件描述符0：标准输入文件stdin；

- 文件描述符1：标准输出文件stdout；

- 文件描述符2：标准错误输出文件stder；

### 十二、Linux的底层服务

**Samba服务：**主要用来实现Linux系统的文件和打印服务，SMB(Server Messages Block，信息服务块)是一种在局域网上共享文件和打印机的一种通信协议。 

---

# 问题处理

## Manjaro(Arch Linux)

### 一、输入法问题

#### 1、搜狗输入法安装出错：sogou拼音异常，请尝试删除SogouPY并重启

- 2022年9月18日，很少遇到

经过多方分析，采取的手段主要为通过sogou-qimpanel判断文件缺失问题，可以确认的是，与fcitx有大关系，涉及到GTK什么的，目前也不太懂。

试用的解决方案，好像是fcitx的什么东西，如下记录一遍：

```shell
yay -S fcitx-qt4
```

#### 2、wps软件无法输入中文

- 2022年9月18日，基本已解决

涉及到的是环境变量的设置，需要编辑一下.xprofile文件

添加以下内容：

```shell
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

#### 3、常用软件

状态栏显示网速的插件：Simple net speed（gnome可用）

nslookup等IP查询工具插件：net-tools dnsutils inetutils iproute2等

### 二、Manjaro Linux涉及到的网络问题

#### 1、github访问及下载速度过慢的解决策略

定位github以及一个有关网站的IP，在hosts文件中强行加入解析（补充）

#### 2、刷新DNS缓存的命令行操作

```shell
sudo systemctl restart NetworkManager.service
```

#### 3、停止ping的快捷键：Ctrl C

### 三、manjaro系统的美化总结（gnome桌面）

#### 1、资源的寻找

主要包括图标，主题，shell等资源的搜集，最好本地留存备份

#### 2、资源的安装

主要多多逛逛github，一般都有着详细的使用说明，阅读readme文档，可以[本网址](https://drasite.com/flat-remix-gnome)为例，以及[archlinux官方网站](https://aur.archlinux.org/)。（用户软件仓库）

附带常用的命令行

```shell
sudo mv /*** /***            //移动文件到某处
sudo cp (-r) /*** /***        //复制文件（夹）到某处
chmod XXX                    //处理权限问题
sh -c XXX                    //它可以让 bash 将一个字串作为完整的命令来执行
```

### 四、manjaro系统使用问题

#### 1、快捷键问题

Alt+F2：貌似是重启gnome桌面（显示运行命令提示符）

Alt+Tab：切换任务，通过插件可实现3D效果，应用商店可以搜索

Super+D：返回桌面，在manjaro中有个名字：隐藏所有正常窗口，需要自行添加快捷键。

#### 2、更改默认应用程序
以更改默认文件管理器程序为例
```shell
# 比如要使用gnome自带的文件管理器，则在终端中运行以下命令：

xdg-mime default org.gnome.nautilus.desktop inode/directory
```

### 五、驱动问题

#### 1、manjaro切换prime闭源驱动

- 目前Manjaro已经存在成熟的mhwd方案进行驱动安装，经过多年发展越发便捷。

搜索相关的安装包NVIDIA-Prime

### 六、软件问题

#### 1、wine系列软件的DPI缩放设置

- 现如今直接在~ /.pam_environment中设置相应的环境变量即可。

  ```python
  DEEPIN_WINE_SCALE = 2	# 根据分辨率与自行设定缩放大小
  ```

一般使用的软件是deepin移植版本，因此使用deepin附带的wine，开启winecfg的命令，然后调整缩放。

```
env WINEPREFIX="$HOME/.deepinwine/Deepin-TIM" winecfg
```

而后生效。



### 2、Arch（manjaro）系统下网易云音乐歌曲搜索无法输入中文

首先先安装qcef这个软件包

```shell
sudo pacman -S qcef
```

编辑netease-cloud-music.bash文件

```shell
sudo gedit /opt/netease/netease-cloud-music/netease-cloud-music.bash
```

更改

```shell
#!/bin/shHERE="$(dirname "$(readlink -f "${0}")")"export LD_LIBRARY_PATH=/usr/libexport QT_PLUGIN_PATH="${HERE}"/pluginsexport QT_QPA_PLATFORM_PLUGIN_PATH="${HERE}"/plugins/platformsexec "${HERE}"/netease-cloud-music $@
```

最后安装vlc

```shell
sudo pacman -S vlc
```



### 3、关于在Manjaro上安装最新的fcitx5输入法框架

安装Fcitx5软件包：

    sudo pacman -S fcitx5-chinese-addons fcitx5-git fcitx5-gtk fcitx5-qt fcitx5-pinyin-zhwiki kcm-fcitx5

- fcitx5: 输入法基础框架主程序

- fcitx5-chinese-addons: 简体中文输入的支持，云拼音

- fcitx5-gtk: GTK程序的支持

- citx5-qt: QT5程序的支持

- fcitx5-pinyin-zhwiki: 网友制作的维基百万词库

- kcm-fcitx5: KDE桌面环境的支持

配置:

修改环境变量

修改输入法环境变量，使应用可以调用Fcitx5输入法

将下面的内容粘贴到~/.pam_environment

```
GTK_IM_MODULE DEFAULT=fcitx5
QT_IM_MODULE DEFAULT=fcitx5
XMODIFIERS DEFAULT=@im=fcitx
```

系统登陆后默认启动Fcitx5输入法

将下面的内容粘贴到 ~/.xprofile

```
fcitx5 &
```

配置主题:
可以使用fcitx5-material-color这个主题

```shell
sudo pacman -S fcitx5-material-color
```

### 4、Arch上关于源码编译的问题

在拉取git源码的过程中，系统在进行编译可能会遇到报错：

```python
ModuleNotFoundError: No module named 'giscanner._giscanner'
```

这主要是因为安装conda之后默认进入了conda环境，而这一模块需要与系统的python版本相对应，因而出现找不到模块的的情况，解决方案：退出conda环境即可：

```python
conda deactivate
```



## Ubuntu(debian系)

### 一、硬件问题

### 1、禁用某项驱动（如WiFi）

通过命令列出硬件：lshw

找到你要禁用的设备，并找到驱动名：

如：driver=iwlwifi

编辑文件：sudo gedit /etc/modprobe.d/blacklist.conf

添加屏蔽项。

### 2、切换显卡驱动

准备工作：商店安装“显卡驱动管理器”（可选）

第一步：使用“显卡驱动管理器”切换到“使用intel默认驱动”（可选）

第二步：在终端“root”权限下，卸载系统存在的所有英伟达驱动

```shell
sudo apt autoremove nvidia-*
```

建议使用完代码后重启下系统

第三步：在终端“root”权限下，禁止nouveau驱动

```shell
sudo dedit /etc/modprobe.d/blacklist.conf
```

在新建的blacklist.conf文件中复制以下内容并保存

```
blacklist nouveau
blacklist lbm-nouveau
options nouveau modeset=0
alias nouveau off
alias lbm-nouveau off
```

然后：

```shell
sudo update-initramfs -u
```

第四步：重启系统，使用代码：

```shell
lsmod | grep nouveau
```

如果没有输出内容，证明成功禁止nouveau驱动

——————————————————————————————————————————————

安装工作：安装deepin 20 beta源里面的英伟达440闭源驱动

第一步：在终端“root”权限下，使用代码：

```shell
sudo apt install nvidia-driver
```

- 以下步骤并非必要，应该是显卡策略调用的部分代码。

第二步：查看自己电脑存在的显卡，使用代码：

```shell
lspci | egrep "VGA|3D"
```

记住Nvidia显卡前面的数字（这里要进行转换一下：01:00:0 --> 1:0:0）

第三步：

```shell
sudo dedit /etc/X11/xorg.conf
```

在新建的xorg.conf文件中复制以下内容并保存

```
Section "Module"
  Load "modesetting"
EndSection
Section "Device"
  Identifier "nvidia"
  Driver "nvidia"
  BusID "PCI:X:X:X"    
  Option "AllowEmptyInitialConfiguration"
EndSection
```

注意：代码中的"PCI:X:X:X"要替换成自己电脑Nvidia显卡前面的数字（比如我的"PCI:1:0:0"）

第四步：

```shell
sudo dedit ~/.xinitrc
```

在新建的.xinitrc文件中复制以下内容并保存

```
xrandr --setprovideroutputsource modesetting NVIDIA-0
xrandr --auto
xrandr --dpi 125
```

第五步：使用代码：

```shell
sudo dedit /etc/lightdm/display_setup.sh
```

在新建的display_setup.sh文件中复制以下内容并保存

```shell
#!/bin/sh  
xrandr --setprovideroutputsource modesetting NVIDIA-0  
xrandr --auto
```

赋予权限

```shell
sudo chmod +x /etc/lightdm/display_setup.sh
```

第六步：使用代码：

```shell
sudo dedit /etc/lightdm/lightdm.conf
```

在打开的文本中，找到[Seat:*]行，在下面一行复制以下内容并保存

```shell
display-setup-script=/etc/lightdm/display_setup.sh
```

最后，在成功完成以上六步操作后，重启

——————————————————————————————————————————————————————————————

附加工作：安装“nvidia-smi”和“nvidia-settings”

第一步：使用代码：

```shell
sudo apt install nvidia-smi nvidia-settings
```

第二步：查看启动器中是否成功安装“NVIDIA X 服务器设置”；终端输入：nvidia-smi查看是否成功启用

注：Ubuntu其实就没那么复杂，系统自带GUI界面切换，但是记得，记得一定要尽量升级最新版本的稳定版内核后再操作，尤其是较新的硬件，Yoga 14s折腾死我了

### 3、修复deepin下麦克风无法使用的问题

大概是因为debian库的问题导致的，deepin论坛有人提供了解决方案，亲测：

列出声卡设备信息（以本人设备信息为例）：

```shell
arecord -l
```

```
**** List of CAPTURE Hardware Devices ****
card 0: sofhdadsp [sof-hda-dsp], device 0: HDA Analog (*) []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
card 0: sofhdadsp [sof-hda-dsp], device 1: HDA Digital (*) []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
card 0: sofhdadsp [sof-hda-dsp], device 6: DMIC (*) []
  Subdevices: 0/1
  Subdevice #0: subdevice #0
card 0: sofhdadsp [sof-hda-dsp], device 7: DMIC16kHz (*) []
  Subdevices: 1/1
  Subdevice #0: subdevice #0
```

card 0代表声卡号，device 0代表设备号

用相应的设备录制一段音频文件：

```shell
arecord -Dhw:0,6 -d 10 -f cd -c 2 -t wav test.wav			//0代表card num，6代表device num，test文件在根目录
```

确定哪个设备可以正常录音，我的是0,6，接下来写入pulseaudio配置文件：

首先复制配置文件：

```shell
sudo cp /usr/share/pulseaudio/alsa-mixer/profile-sets/default.conf  /usr/share/pulseaudio/alsa-mixer/profile-sets/audio.conf		//复制的配置文件名字自定义即可
```

编辑相应文件：

```shell
sudo dedit /usr/share/pulseaudio/alsa-mixer/profile-sets/audio.conf
```

在“[General] auto-profiles = yes  # 这是文件开头“这一行，添加：

```
[Mapping Inter-Mic] 
device-strings = hw:%f,6 		//这里的6根据你的能工作的capture 设备ID来定 
channel-map = left,right 
paths-input = analog-input-internal-mic multichannel-input 
priority = 9 
direction = input 

#下面是其他元素
```

测试一下看看：

```shell
pacmd load-module module-alsa-card device_id=0 profile_set=audio.conf	//记得你的配置文件名
```

应该在设置里可以选择到输入设备了，最后一步，将上述参数写入到/etc/pulse/default.pa里面，在最后一行添加：

```shell
load-module module-alsa-card device_id=0 profile_set=audio.conf
```

最后reboot，解决。

### 二、软件问题



### 1、关于intel 9260无线网卡的驱动问题

网速过慢，Ubuntu一般不会出现，主要在deepin会出现这种异常

关键在于iwlwifi驱动文件，debian内核有明确说明，需要修改参数

```shell
sudo gedit /etc/modprobe.d/iwlwifi.conf
```

将11n_disable参数修改为：

```
11n_disable=0
```

最后使用iwconfig命令找到网络速率

### 2、借鉴Deepin平台安装微信等软件

或者走Spark-Store（星火商店）

首先获取deepin-wine

```shell
wget -O- https://deepin-wine.i-m.dev/setup.sh | sh
```

然后按照提示安装相应软件，如微信

```shell
sudo apt install deepin.com.wechat
```

### 3、Deepin-wine系列软件的问题处理

#### DPI显示问题：同上

```shell
env WINEPREFIX="/home/****/.deepinwine/Deepin-WeChat" deepin-wine winecfg
```

注意参考deepin-wine的版本

以星火商店中的deepin-wine5版本为例

```shell
env WINEPREFIX="/home/ping/.deepinwine/Spark-WeChat" deepin-wine5 winecfg
```

一定要确定好deepin-wine版本以及文件夹名称，比如我这里是Spark-WeChat

#### 文字乱码问题：

本质上还是因为Deepin-WeChat这个容器中配置的字体与你系统中所存在的字体不一致引起的。

```shell
WINEPREFIX=~/.deepinwine/Deepin-TIM deepin-wine6-stable regedit
```

代码前半部分定位到相关软件的文件夹，第二个参数是容器名，我的是deepin-wine6-stable，regedit代表编辑的是注册表

找到HKEY_LOCAL_MACHINE/Software/Microsoft/Windows NT/CurrentVersion/FontSubstitutes
将微软雅黑mysh.ttc的值数据改为你在系统中想映射的字体值，比如我的是wqy-microhei，然后确定保存。
重新运行!

其它网上链接都类似的改字体方案。



### 4、网易云音乐(QT系)的DPI问题

常规方式是修改desktop文件，但无效

因此找到网易云音乐的启动脚本：

```shell
sudo gedit /opt/netease/netease-cloud-music/netease-cloud-music.bash


#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
export LD_LIBRARY_PATH="${HERE}"/libs
export QT_PLUGIN_PATH="${HERE}"/plugins
export QT_QPA_PLATFORM_PLUGIN_PATH="${HERE}"/plugins/platforms
exec "${HERE}"/netease-cloud-music $@
```

添加一行参数

```
export QT_SCALE_FACTOR=2	//要添加在倒数第二行而不是最后一行
```

理论上适用于QT编写的程序

或者在desktop文件中编辑Exec路径参数：

```
Exec=env QT_SCALE_FACTOR=2 /opt/apps/com.163.music/files/bin/netease-cloud-music %U
```

### 5、intel 11th的CPU使用会出些问题

如屏幕闪烁以及自带键盘（yoga 14s）无法使用

```shell
sudo gedit /etc/default/grub
```

添加相关参数，参考：https://wiki.archlinux.org/index.php/Lenovo_Yoga_14s_2021_(简体中文)

显卡驱动，升级内核，甚至可以解决独显的驱动问题（5.11.11内核）

### 6、Ubuntu系统下录屏出现重影

obs以及simplescreenrecord下都有这个问题，不确定我说的对，但是经过多方排查，我确实发现我的yoga 14s是在集显驱动的情况下才会有这个问题，换成NVIDIA独显之后就一切正常了，因此初步判断我认为是在Linux下Iris集显的问题

待更新…

或者去GitHub编译源码自行安装。

### 7、为了使用Utools修改alt space快捷键

```shell
sudo dedit ~/.config/kglobalshortcutsrc
```

### 8、修正因UUID更改导致开机速度很慢的问题

一般是由于安装了其他的操作系统导致某些分区的UUID被更改，因此系统寻访导致的开机速度缓慢，解决方案：

首先，列举分区的相关详细信息：

```shell
sudo blkid
```

这样应该就能看到磁盘下属分区的详细UUID，与fstab文件信息中的UUID进行对照：

```shell
sudo dedit /etc/fstab
```

修正为对应的UUID，即可

上述方案为其中一种情形，此外可能遇到以下情形：

mdadm配置文件导致的开机缓慢，本质上也是因为UUID的更改导致的。解决方案：

删除原先的配置文件：

```shell
sudo rm /etc/mdadm/mdadm.conf
```

更新新的mdadm配置文件：

```shell
update-initramfs  -u
```

这样即可正确更新。

