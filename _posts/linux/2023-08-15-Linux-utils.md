---
title: Linux常用命令
author: Ping
date: 2023-08-15 22:33:00 +0800
categories: [Linux]
tags: [Ubuntu,Shell,TODO]
---

## Understand a Command
1. `$ man command` for manual pages
2. `$ command --help` for help

---

## Run at Background
The `screen` command launches a terminal in the background which can be detached from and then reconnected to. You can start a screen, kick off a command, detach from the screen, and log out. You can then log in later and reattach to the screen and see the program running.

- startup  
    `$ screen -S XXX.py`
- detach  
    `Ctrl + a + d`

- reattach  
    `$ screen -r`

>from <https://access.redhat.com/articles/5247>

---


## Monitor Resources  
- **Network Bandwidth**  
    `$ nload`
    > Other 17 commands：<https://www.binarytides.com/linux-commands-monitor-network/>

- **CPU**  
    `$ top`

- **GPU**  
    `$ nvidia-smi`

- **Disk**  
  1. `$ du -h`
  2. `$ df -h`

- **Continuous Monitoring**  
    `$ watch -n 0.5 nvidia-smi` 


---
