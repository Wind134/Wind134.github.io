---
title: HTTP概述
author: Ping
img_path: /assets/img/TCP-IP
date: 2023-06-08 14:33:00 +0800
categories: [计算机网络, 重要协议]
tags: [NetWork, Linux, 网络编程]
---

`HTTP`(Hypertext Transfer Protocol)是一种用于传输超文本的协议，它是在Web上进行数据交换的基础；

`HTTP`是一个无状态的协议，即它不会保留之前请求和响应之间的任何状态信息，`HTTP`是基于`TCP`的协议；

## HTTP的关键特点和概念

1. 客户端-服务器模型：
   - HTTP采用客户端-服务器模型，客户端发送请求，服务器返回响应；
   - 客户端可以是Web浏览器、移动应用程序或其他发送HTTP请求的应用程序；
   - 服务器则是存储和提供资源的计算机；
2. 请求和响应：
   - HTTP通信由请求和响应组成。
   - 客户端发送一个`HTTP`请求到服务器，请求中包含请求方法(如`GET`、`POST`)、`URL`、请求头部和可选的请求体(如`POST`请求中的表单数据)。
     - 因此一般而言，连接请求会单独封装为一个类；
   - 服务器根据请求返回一个`HTTP`响应，响应中包含状态码、响应头部和可选的响应体(如`HTML文档`、`图像`、`JSON`等)。
     - 连接响应也会单独封装成一个类；
3. `URL`(Uniform Resource Locator)：
   - `URL`用于指定资源在Web上的位置。
   - 它由协议(如`HTTP``)、主机名、可选的端口号、路径和查询参数组成。
     - `http://127.0.0.1:8888/index.html`-这是一个示例；
4. 状态码：
   - `HTTP`响应中的状态码表示服务器对请求的处理结果；
   - 常见的状态码包括`200`(成功)、`404`(未找到)、`500`(服务器内部错误)等。
5. 请求方法：
   - HTTP定义了一组请求方法，用于指定对资源的操作类型。
   - 常见的请求方法包括`GET`(获取资源)、`POST`(提交数据)、`PUT`(更新资源)、`DELETE`(删除资源)等。
6. 头部信息：
   - HTTP请求和响应中的头部包含了关于请求或响应的元数据信息，如`Content-Type`、`Content-Length`、`Cookie`等。
7. `Cookie`：
   - `HTTP`协议通过`Cookie`机制来跟踪用户的会话状态。
   - 服务器可以通过设置响应头部中的`Set-Cookie`字段来发送`Cookie`给客户端，客户端会在后续的请求中通过`Cookie`头部将`Cookie`发送回服务器。

`HTTP`是Web开发中非常重要的协议，它提供了一种标准的方式来进行客户端和服务器之间的通信。理解`HTTP`的工作原理和概念对于开发`Web`应用程序以及进行网络调试和优化都是至关重要的。

## HTTP报文剖析

### 请求报文

请求报文是客户端发给服务器的，一定要弄清楚是谁，发给谁！

**请求报文的详细结构：**

- **请求行**(Request Line)：包含请求方法、请求的`URL`和`HTTP`协议版本。
- **请求头部**(Request Headers)：包含一系列的键值对，用于描述请求的属性和要求。
- **空行**(Blank Line)：用于分隔头部和请求体。
- **请求体**(Request Body)：可选的请求体，用于在`POST`、`PUT`等请求方法中传输数据。

我来列举一段请求报文：

```
GET /path/to/resource HTTP/1.1   -- 请求行，包含请求方法GET，URL: /path/to/resource，HTTP协议版本：1.1
Host: example.com                -- 从这里开始的3行是请求头部，包含了一系列的键值对
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
                                 -- 空行，用于分隔头部和请求体(请求体可选)
```

从上面的报文可以看到的是，如果请求报文中使用了`GET`方法，一般不会包含请求体；


接下来再看一段不同的请求报文，该段请求报文请求行使用了`POST`方法，而`POST`以及`PUT`请求方法，通常需要在请求体中包含数据；

```
POST /path/to/resource HTTP/1.1  -- 请求行，包含了请求方法、URL、HTTP协议版本
Host: example.com                -- 从这里开始的3行是请求头部
Content-Type: application/json
Content-Length: 32
                                 -- 空行
{                                -- 请求体，包含了键值对
  "key1": "value1",
  "key2": "value2"
}
```

**GET、POST、PUT、PATCH区分**

`GET`一般不附带请求体，`POST`一般请求体中会附带表单信息，比如用户登录的账户密码信息；

(随时补充)

### 响应报文

响应报文是服务区发给客户端的；

**响应报文的详细结构：**

- **状态行**(Status Line)：包含HTTP协议版本、状态码和状态描述。
- **响应头部**(Response Headers)：包含一系列的键值对，用于描述响应的属性和信息。
- **空行**(Blank Line)：用于分隔头部和响应体。
- **响应体**(Response Body)：响应的实际内容，可以是`HTML`、`JSON`、`图片`等。

下面继续列举一段响应报文：

```
HTTP/1.1 200 OK         -- 状态行，HTTP版本：1.1，状态码：200，状态描述：OK，表明正常收到请求
Content-Type: text/html	-- 第二第三行都属于响应头部，包含一系列的键值对；
Content-Length: 127     -- 这个属于响应头部的字段，展示的是响应体中内容的长度；
                        -- 空行，用于分隔头部和响应体；
<!DOCTYPE html>         -- 下面的都属于响应体，响应的实际内容，这里展示的是HTML
<html>
<head>
    <title>Example</title>
</head>
<body>
    <h1>Hello, World!</h1>
</body>
</html>
```

以上内容就是`HTTP`响应报文和请求报文的详细介绍；

## HTTP的状态码

HTTP状态码分为五个类型，每个类型表示一种不同的状态或结果。

- 信息性状态码（`1xx`）：这些状态码表示服务器已接收到请求并正在处理。最常见的是`100 Continue`，它表示服务器正在等待客户端继续发送请求的剩余部分。

- 成功状态码（`2xx`）：这些状态码表示服务器成功接收、理解并处理了请求。最常见的是`200 OK`，表示请求已成功处理并返回相应的资源。

- 重定向状态码（`3xx`）：这些状态码表示请求的资源已被移动到其他位置，或者需要进一步的操作来完成请求。最常见的是`301 Moved Permanently`，表示请求的资源已永久移动到新的URL。

- 客户端错误状态码（`4xx`）：这些状态码表示客户端发送的请求有错误，服务器无法处理。最常见的是`400 Bad Request`，表示请求存在语法错误或无法被服务器理解。

- 服务器错误状态码（`5xx`）：这些状态码表示服务器在处理请求时遇到了错误。最常见的是`500 Internal Server Error`，表示服务器内部发生了错误。

每个状态码都有特定的含义和用途，它们帮助客户端和服务器之间进行通信，并提供有关请求和响应的信息。


## HTTP的四个版本

就HTTP技术的发展而言，目前HTTP主要经历了四个版本的迭代：

- `HTTP/1.0`

   - 最早的HTTP版本，于1996年发布。
   - 每次请求/响应建立一个新的TCP连接，无连接持续性。
   - 同时<font color = red>不支持持久连接，</font>每个请求都需要重新建立连接，导致性能低下。
   - 不支持请求<font color=red>管道化(Pipelining)</font>，也就是说不支持在同一个连接上发送多个请求。

- `HTTP/1.1`

   - 于1999年发布，是一个重要的升级版本。
   - 首次<font color = red>引入了持久连接(Persistent Connections)</font>，同一个连接可以用于多个请求和响应。
   - 引入了<font color=red>管道化(Pipelining)</font>，允许在一个连接上发送多个请求，减少延迟，也是利用了持久连接的特性。
   - 引入了分块传输编码(Chunked Transfer Encoding)，支持流式传输数据。
   - 引入了HTTP状态码`100 Continue`，用于客户端确认可以发送请求主体。

- `HTTP/2`

   - 于2015年发布，是HTTP/1.1的重大改进版本。
   - 引入了<font color=red>二进制传输</font>，将报文分割成帧并以二进制传输，提高传输效率。
   - 支持<font color=red>多路复用(Multiplexing)</font>，在一个连接上同时处理多个请求和响应(与<font color=brown>持久连接的区别？</font>)。
   - 引入了<font color=red>头部压缩(Header Compression)</font>，减少了数据传输的开销。
   - 支持<font color=red>服务器推送(Server Push)</font>，允许服务器预先发送客户端需要的资源。

- `HTTP/3`

   - 于2020年发布，是HTTP/2的进一步改进版本。
   - 引入了QUIC协议作为传输层，提供更快的连接建立和传输性能。
   - 支持快速握手和连接迁移，适应移动设备网络变化。
   - 减少了头部阻塞问题，提高了并发性能。
   - 支持零RTT(Round-Trip Time)数据传输，进一步减少延迟。

`HTTP/3`这个版本还是比较新的，目前未曾在实践层面有所接触；