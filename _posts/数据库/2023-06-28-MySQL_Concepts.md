---
title: MySQL学习笔记-概念部分
author: Ping
math: true
img_path: /assets/img/SQL/
date: 2023-05-27 14:33:00 +0800
categories: [数据库]
tags: [MySQL, 数据库]
---

## MySQL介绍

MySQL是一个关系型数据库管理系统，由瑞典MySQL AB公司开发，属于Oracle旗下产品。MySQL 是最流行的关系型数据库管理系统之一，在 WEB应用方面，MySQL是最好的RDBMS(Relational Database Management System，关系数据库管理系统)应用软件之一。在Linux上进行学习的是MySQL的开源版本MariaDB。

## 层次模型

**特征：**

- 有且只有一个结点且没有双亲结点，该结点称为根结点；
- 根结点以外的其他结点有且只有一个双亲结点；

## 网状模型

**特征：**

- 允许一个以上的结点无双亲；
- 一个结点也可以有多于一个双亲；

## 关系模型

**特征：** 可以理解为一张表(table)

**关系模型中的一些定义：**

- **关系：** 一个关系对应通常说的一张表；
- **元组：** 表中的一行；
  - **悬浮元组(Dangling tuple)：** 两个关系做自然连接时，其中一个元组有可能在另一个元组中不存在公共属性上值相等的元组，从而造成的被舍弃的元组。
- **属性：** 表中的一列；
- **码：** 也称码键，表中的某个属性组；
- **域：** 是一组具有相同数据类型的值的集合；
- **分量：** 元组中的一个属性；

### 关系模式

关系模式本质上是对关系的描述，关系即一张表，一张二维表；

关系中需要描述的部分：R(U, D, DOM, F)

- 关系中有哪些属性(U即为属性名，F为属性间的依赖关系)；
- 这些属性来自哪些域(D代表域)；
- 属性与域之间的映射关系(DOM代表映射关系)；

### 关系语言

- **关系代数语言**
  
  是一种抽象的查询语言，它用对关系的运算来表达查询，有三大要素：
  
  - **运算对象(关系)**
  - **运算符(包括集合运算符和专门的关系运算符)**
    - **集合运算符：**并$\cup$、差$\setminus$、交$\cap$、笛卡尔积$\times$(并不会发生数据的乘除计算)；
    - **关系运算符**
      - 选择$\sigma$(基于一定条件选择，选择行)；
      - 投影$\pi$(选择所要求的列)；
      - 连接$\Join$：又分为自然连接(共同属性等值连接)、外连接、左外连接、右外连接；
      - 除$\div$；
  - **运算结果(关系)**

- **关系演算语言**
  
  (暂略)

- **SQL语言**
  
  在[操作部分](https://wind134.github.io/posts/MySQL_Operation/)的文档有详细的笔记；

## MySQL数据类型介绍

为了对数据库进行设计，熟练掌握数据类型是很必要的一个环节；

### 字符串类型

- **CHAR**

  固定长度字符串；

- **VARCHAR**

  可编入索引，可变长度字符串，最大大小64KB，最多字符个数65535，超过这个部分将会被截断；

- **MEDIUMTEXT**

  可变字符长，最大大小16MB；

- **LONGTEXT**

  可变字符长，最大大小4GB；

- **TINYTEXT**

  可变字符长，最大大小255 bytes；

以上所有类型都支持国际字符，英语每个字母占一字节，中东语言占二字节，中文和日文占三字节；因此在分配字符串长度之时，会自动分配乘以字节数之后的空间；

### 整数类型

- **TINYINT：**1B
- **UNSIGNED TINYINT：**1B，[0, 255]
- **SMALLINT：**2B
- **MEDIUMINT：**3B
- **INT：**4B
- **BIGINT：**8B

INT(4)==>0001，这是一种存储方式，代表4位长度的整数；

尽量用符合实际的长度去存储信息，节约空间以及提升效率；

### 定点数类型和浮点数类型

- **DECIMAL(p, s)：**定点数，比如DECIMAL(9, 2) => 1234567.89
- **DEC、NUMERIC、FIXED：**同上类型
- **FLOAT：**4B，单精度浮点数
- **DOUBLE：**8B，双精度浮点数

### 布尔类型

判定真假的类型：`BOOL`、`BOOLEAN`；

### 枚举和集合类型

- **ENUM(..,..,....)：**枚举类型应用于某列中仅支持固定类型值的情况，有一个缺陷就是不好拓展，新增或减少一部分枚举内容需要对整张表进行重建；
- **SET(...)：**表格内容允许多个值的存储；

### 日期和时间类型

- `DATE`-存储没有时间成分的日期；
- `TIME`-存储一个时间；
- `DATETIME`-存储日期和时间；
- `TIMESTAMP`-时间戳，只能存储到2038年以前的日期时间；
- `YEAR`-年份；

### Blob类型

存储大型二进制数据；

- `TINYBLOB`-255B
- `BLOB`-65KB
- `MEDIUMBLOB`-16MB
- `LONGBLOB`-4GB

不建议用数据库存储二进制数据，因为关系型数据库是为了处理结构化关系型数据设计的；存储在数据库中，数据库大小会迅速提升，且性能会受较大影响；

### JSON类型

JSON类型的文档是一种通过网络存储和传输数据的轻量级文件格式；应用程序通过JSON将数据发送到后端；

```json
{
    "key": value
}
```

在SQL中添加json配置：

```sql
USE sql_store;
UPDATE products 
SET properties = '{
 	"dimensions": [1, 2, 3],
 	"weight": 10,
 	"manufacturer": {"name": "sony" }
 }'
 WHERE product_id = 1;
 -- 或者
 SET properties = JSON_OBJECT(
	'weight', 10,
	'dimensions', JSON_ARRAY(1, 2, 3),
	'manufacturer', JSON_OBJECT('name', 'sony')
)
-- 更改JSON内容
SET properties = JSON_SET(
	properties,
	'$.weight', 20,	-- 有key的则更改
	'$.age', 10		-- 没有key则新增项
)
-- 移除
SET properties = JSON_REMOVE(
	properties,
	'$.age'		-- 删除age的key
)
```

## MySQL属性介绍

### 列属性(Column Attributes)

这部分结合图表来进行学习：

<img src="列属性.png" alt="image-20230317164552473" style="zoom:50%;" />

- **列名(Column)**-每一列详细的名字信息；
- **数据类型(Datatype)**-每一列数据中的数据类型：
  - `INT`-代表整型数字；
  - `VARCHAR(50)`-代表可变长度的Char类型，最长50位，与之对应的是`CHAR`类型，如果没有满足相应长度，会填满那个长度；
  - `DATE`-日期的数据格式；
- **主键PK(Primary Keys)**-是<font color=red>表格中的唯一标识给定表中每条记录的列</font>，以图表中数据为例，customer_id即为主键；
- **NN(Not NULL)**-该列是否可以写空值，像上表中customer_id、first_name、last_name就不能写空值；
- **AL(Auto-Increment)**-一般用在主键列，当新增一条记录的时候，该主键列会递增；
- **Default/Expression**-标明了每列的默认值；