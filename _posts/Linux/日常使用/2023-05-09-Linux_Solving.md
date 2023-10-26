---
title: Linux问题处理
author: Ping
date: 2023-05-09 14:33:00 +0800
categories: [Linux, 日常使用]
tags: [Debian, Arch Linux, shell, tools]
---


## Manjaro(Arch系)

### 系统使用

**1、快捷键问题**

`Alt+F2`：貌似是重启`gnome`桌面(显示运行命令提示符)

`Alt+Tab`：切换任务，通过插件可实现3D效果，应用商店可以搜索

`Super+D`：返回桌面，在`manjaro`中有个名字：隐藏所有正常窗口，需要自行添加快捷键。

**2、更改默认应用程序**

以更改默认文件管理器程序为例：
```shell
# 比如要使用gnome自带的文件管理器，则在终端中运行以下命令：
xdg-mime default org.gnome.nautilus.desktop inode/directory
```

`xdg-mime`应该是gnome上的某个默认配置？我猜的；

### 驱动问题

**1、`manjaro`切换`prime`闭源驱动**

- 目前`Manjaro`已经存在成熟的`mhwd`方案进行驱动安装，经过多年发展越发便捷。

搜索相关的安装包`NVIDIA-Prime`；

### 软件问题

#### 常用软件

状态栏显示网速的插件：`Simple` `net` `speed`（`gnome`可用）

`nslookup`等IP查询工具插件：`net-tools` `dnsutils` `inetutils` `iproute2`等

#### 输入法问题

**1、搜狗输入法安装出错：`sogou`拼音异常，请尝试删除`SogouPY`并重启**

**Notes：** 2022年9月18日，很少遇到；
经过多方分析，采取的手段主要为通过`sogou-qimpanel`判断文件缺失问题，可以确认的是，与`fcitx`有大关系，涉及到`GTK`什么的，目前也不太懂。
 
试用的解决方案，好像是`fcitx`的什么东西，如下记录一遍：

```shell
yay -S fcitx-qt4
```

**2、`wps`软件无法输入中文**

**Notes：** 2022年9月18日，基本已解决

涉及到的是环境变量的设置，需要编辑一下`.xprofile`文件

添加以下内容：

```shell
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS="@im=fcitx"
```

**3、`Arch(manjaro)`系统下网易云音乐歌曲搜索无法输入中文**

首先先安装`qcef`这个软件包

```shell
sudo pacman -S qcef
```

编辑`netease-cloud-music.bash`文件

```shell
sudo gedit /opt/netease/netease-cloud-music/netease-cloud-music.bash
```

更改

```shell
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
export LD_LIBRARY_PATH="${HERE}"/libs
export QT_PLUGIN_PATH="${HERE}"/plugins 
export QT_QPA_PLATFORM_PLUGIN_PATH="${HERE}"/plugins/platforms
export QT_QPA_PLATFORM=xcb
export LD_PRELOAD="${HERE}"/libnetease-patch.so

exec "${HERE}"/netease-cloud-music $@
```

最后安装`vlc`

```shell
sudo pacman -S vlc
```

**3、关于在`Manjaro`上安装最新的`fcitx5`输入法框架**

安装`fcitx5`软件包：

```shell
sudo pacman -S fcitx5-chinese-addons fcitx5-git fcitx5-gtk fcitx5-qt fcitx5-pinyin-zhwiki kcm-fcitx5
```

- `fcitx5`: 输入法基础框架主程序
- `fcitx5-chinese-addons`: 简体中文输入的支持，云拼音
- `fcitx5-gtk`: `GTK`程序的支持
- `fcitx5-qt`: `QT5`程序的支持
- `fcitx5-pinyin-zhwiki`: 网友制作的维基百万词库
- `kcm-fcitx5`: `KDE`桌面环境的支持

配置:
- 修改环境变量
- 修改输入法环境变量，使应用可以调用`fcitx5`输入法
  将下面的内容粘贴到`~/.pam_environment`
  ```
  GTK_IM_MODULE DEFAULT=fcitx5
  QT_IM_MODULE DEFAULT=fcitx5
  XMODIFIERS DEFAULT=@im=fcitx
  ```

- 系统登陆后默认启动`fcitx5`输入法
  将下面的内容粘贴到`~/.xprofile`
  ```
  fcitx5 &
  ```
- 配置主题:
  可以使用`fcitx5-material-color`这个主题

  ```shell
  sudo pacman -S fcitx5-material-color
  ```

#### GUI界面的DPI调整

**1、wine系列软件的DPI缩放设置**

现如今直接在`~/.pam_environment`中设置相应的环境变量即可。

```python
DEEPIN_WINE_SCALE = 2	# 根据分辨率与自行设定缩放大小
```

一般使用的软件是`deepin`移植版本，因此使用`deepin`附带的`wine`，开启`winecfg`的命令，然后调整缩放。
```
env WINEPREFIX="$HOME/.deepinwine/Deepin-TIM" winecfg
```
而后生效；

<font color=red>以前的处理方案:</font>

```shell
env WINEPREFIX="/home/****/.deepinwine/Deepin-WeChat" deepin-wine winecfg
```

注意参考`deepin-wine`的版本

以星火商店中的`deepin-wine5`版本为例

```shell
env WINEPREFIX="/home/ping/.deepinwine/Spark-WeChat" deepin-wine5 winecfg
```

一定要确定好`deepin-wine`版本以及文件夹名称，比如我这里是`Spark-WeChat`；

**2、网易云音乐(QT系)的`DPI`问题**

常规方式是修改`desktop`文件，但无效

因此找到网易云音乐的启动脚本：

```shell
sudo gedit /opt/netease/netease-cloud-music/netease-cloud-music.bash
```

```shell
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
export LD_LIBRARY_PATH="${HERE}"/libs
export QT_PLUGIN_PATH="${HERE}"/plugins
export QT_QPA_PLATFORM_PLUGIN_PATH="${HERE}"/plugins/platforms
exec "${HERE}"/netease-cloud-music $@
```
添加一行参数
```shell
export QT_SCALE_FACTOR=2	# 要添加在倒数第二行而不是最后一行
```

理论上适用于`QT`编写的程序

或者在`desktop`文件中编辑`Exec`路径参数：

```shell
exec=env QT_SCALE_FACTOR=2 /opt/apps/com.163.music/files/bin/netease-cloud-music %U
```


#### 源码编译

**1、Arch上关于源码编译的问题**

在拉取`github`源码的过程中，系统在进行编译可能会遇到报错：

```shell
ModuleNotFoundError: No module named 'giscanner._giscanner'
```

这主要是因为安装`conda`之后默认进入了`conda`环境，而这一模块需要与系统的`python`版本相对应，因而出现找不到模块的的情况，解决方案：退出`conda`环境即可：

```shell
conda deactivate
```

### 网络问题

**1、`github`访问及下载速度过慢的解决策略**

定位`github`以及一个有关网站的IP，在`hosts`文件中强行加入解析(补充)

**2、刷新`DNS`缓存的命令行操作**

这个要看你是什么网络管理器了，针对`NetworkManager`而言，则只需要以下命令：

```shell
sudo systemctl restart NetworkManager.service
```

### 系统美化

#### 1、资源的寻找

主要包括图标，主题，`shell`等资源的搜集，最好本地留存备份

#### 2、资源的安装

主要多多逛逛`github`，一般都有着详细的使用说明，阅读`ReadME`文档，可以[本网址](https://drasite.com/flat-remix-gnome)为例，以及[AUR仓库](https://aur.archlinux.org/)；

附带常用的命令行：

```shell
sudo mv /xxx /xxx       # 移动文件到某处
sudo cp (-r) /xxx /xxx  # 复制文件（夹）到某处
chmod XXX               # 处理权限问题
sh -c XXX               # 它可以让bash将一个字串作为完整的命令来执行
```


## Ubuntu(debian系)

### 系统使用

**1、为了使用Utools修改alt space快捷键**

```shell
sudo dedit ~/.config/kglobalshortcutsrc
```

### 驱动问题

**1、禁用某项驱动(如`WiFi`)**

通过命令列出硬件：`lshw`

找到你要禁用的设备，并找到驱动名：

如：`driver=iwlwifi`

编辑文件：`sudo gedit /etc/modprobe.d/blacklist.conf`

添加屏蔽项。

**2、切换显卡驱动**

准备工作：商店安装*显卡驱动管理器*(可选)；

**第一步:** 使用*显卡驱动管理器*切换到*使用`intel`默认驱动*(可选)；

**第二步:** 在终端`root`权限下，卸载系统存在的所有英伟达驱动；

```shell
sudo apt autoremove nvidia-*
```

建议使用完代码后重启下系统；

**第三步:** 在终端`root`权限下，禁止`nouveau`驱动

```shell
sudo dedit /etc/modprobe.d/blacklist.conf
```

在新建的`blacklist.conf`文件中复制以下内容并保存

```shell
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

**第四步:** 重启系统，使用代码：

```shell
lsmod | grep nouveau
```

如果没有输出内容，证明成功禁止`nouveau`驱动

---

安装工作：安装`deepin 20 beta`源里面的英伟达440闭源驱动

**第一步:** 在终端`root`权限下，使用代码：

```shell
sudo apt install nvidia-driver
```

以下步骤并非必要，应该是显卡策略调用的部分代码。

- 查看自己电脑存在的显卡，使用代码：
  ```shell
  lspci | egrep "VGA|3D"
  ```
  记住`Nvidia`显卡前面的数字(这里要进行转换一下：`01:00:0` --> `1:0:0`)；

- 编辑`xorg`文件

  ```shell
  sudo dedit /etc/X11/xorg.conf
  ```

  在新建的`xorg.conf`文件中复制以下内容并保存：

  ```shell
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

  注意：代码中的`PCI:X:X:X`要替换成自己电脑`Nvidia`显卡前面的数字(比如我的`PCI:1:0:0`)；

- 处理缩放

  ```shell
  sudo dedit ~/.xinitrc
  ```

  在新建的`.xinitrc`文件中复制以下内容并保存

  ```shell
  xrandr --setprovideroutputsource modesetting NVIDIA-0
  xrandr --auto
  xrandr --dpi 125
  ```

- 使用代码：

  ```shell
  sudo dedit /etc/lightdm/display_setup.sh
  ```

  在新建的`display_setup.sh`文件中复制以下内容并保存

  ```shell
  #!/bin/sh  
  xrandr --setprovideroutputsource modesetting NVIDIA-0  
  xrandr --auto
  ```

  赋予权限：

  ```shell
  sudo chmod +x /etc/lightdm/display_setup.sh
  ```

- 编辑显示管理器配置文件

  ```shell
  sudo dedit /etc/lightdm/lightdm.conf
  ```

  在打开的文本中，找到`[Seat:*]`行，在下面一行复制以下内容并保存

  ```shell
  display-setup-script=/etc/lightdm/display_setup.sh
  ```

  最后，在成功完成以上六步操作后，重启

---

附加工作：

- 安装`nvidia-smi`和`nvidia-settings`

  ```shell
  sudo apt install nvidia-smi nvidia-settings
  ```

- 查看启动器中是否成功安装*NVIDIA X 服务器设置*；
  终端输入：`nvidia-smi`查看是否成功启用

注：`Ubuntu`其实就没那么复杂，系统自带`GUI`界面切换，但是记得，记得一定要尽量升级最新版本的稳定版内核后再操作，尤其是较新的硬件，`Yoga 14s`折腾死我了；

**3、修复deepin下麦克风无法使用的问题**

大概是因为`debian`库的问题导致的，`deepin`论坛有人提供了解决方案，亲测：

列出声卡设备信息(以自身设备信息为例)：

```shell
arecord -l
```

```shell
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

`card 0`代表声卡号，`device 0`代表设备号

用相应的设备录制一段音频文件：

```shell
# 0代表card num，6代表device num，test文件在根目录
arecord -Dhw:0,6 -d 10 -f cd -c 2 -t wav test.wav
```

确定哪个设备可以正常录音，我的是`0,6`，接下来写入`pulseaudio`配置文件：

首先复制配置文件：

```shell
sudo cp /usr/share/pulseaudio/alsa-mixer/profile-sets/default.conf  /usr/share/pulseaudio/alsa-mixer/profile-sets/audio.conf		# 复制的配置文件名字自定义即可
```

编辑相应文件：

```shell
sudo dedit /usr/share/pulseaudio/alsa-mixer/profile-sets/audio.conf
```

在`[General] auto-profiles = yes  # 这是文件开头`这一行，添加：

```conf
[Mapping Inter-Mic] 
device-strings = hw:%f,6  # 这里的6根据你的能工作的capture 设备ID来定 
channel-map = left,right 
paths-input = analog-input-internal-mic multichannel-input 
priority = 9 
direction = input 

```

测试一下看看：

```shell
# 记得你的配置文件名，我这里是audio.conf
pacmd load-module module-alsa-card device_id=0 profile_set=audio.conf
```

应该在设置里可以选择到输入设备了，最后一步，将上述参数写入到`/etc/pulse/default.pa`里面，在最后一行添加：

```shell
load-module module-alsa-card device_id=0 profile_set=audio.conf
```

最后`reboot`，解决。

### 软件问题

**1、`intel 11th`的CPU使用会出些问题**

如屏幕闪烁以及自带键盘`yoga 14s`无法使用；

```shell
sudo gedit /etc/default/grub
```

添加相关参数，[参考链接](https://wiki.archlinux.org/index.php/Lenovo_Yoga_14s_2021_(简体中文))；

显卡驱动，升级内核，甚至可以解决独显的驱动问题（5.11.11内核）

**2、Ubuntu系统下录屏出现重影**

`obs`以及`simple screen record`下都有这个问题，不确定我说的对，但是经过多方排查，我确实发现我的`yoga 14s`是在集显驱动的情况下才会有这个问题，换成NVIDIA独显之后就一切正常了，因此初步判断我认为是在`Linux`下`Iris`集显的问题

待更新…

或者去GitHub编译源码自行安装驱动，可以，但没必要应该。

**3、修正因UUID更改导致开机速度很慢的问题**

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

**4、通过`Deepin`平台安装微信等软件**

或者走`Spark-Store`(星火商店)

首先获取`deepin-wine`：

```shell
wget -O- https://deepin-wine.i-m.dev/setup.sh | sh
```

然后按照提示安装相应软件，如微信

```shell
sudo apt install deepin.com.wechat
```

<font color=red>衍生出过文字乱码问题：</font>

本质上还是因为`Deepin-WeChat`这个容器中配置的字体与你系统中所存在的字体不一致引起的。

```shell
WINEPREFIX=~/.deepinwine/Deepin-TIM deepin-wine6-stable regedit
```

代码前半部分定位到相关软件的文件夹，第二个参数是容器名，我的是`deepin-wine6-stable`，`regedit`代表编辑的是注册表

找到`HKEY_LOCAL_MACHINE/Software/Microsoft/Windows NT/CurrentVersion/FontSubstitutes`
将微软雅黑`mysh.ttc`的值数据改为你在系统中想映射的字体值，比如我的是`wqy-microhei`，然后确定保存。
重新运行!

其它网上链接都类似的改字体方案。

### 网络问题

**1、关于`intel 9260`无线网卡的驱动问题**

网速过慢，`Ubuntu`一般不会出现，主要在`Deepin`会出现这种异常；

关键在于`iwlwifi`驱动文件，`debian`内核有明确说明，需要修改参数；

```shell
sudo gedit /etc/modprobe.d/iwlwifi.conf
```

将`11n_disable`参数修改为：

```shell
11n_disable=0
```

最后使用`iwconfig`命令找到网络速率
