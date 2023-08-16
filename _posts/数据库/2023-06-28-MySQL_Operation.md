---
title: MySQL学习笔记-操作部分
author: Ping
math: true
date: 2023-05-27 14:33:00 +0800
categories: [数据库学习]
tags: [MySQL, 数据库]
---

## 预备环节

首先了解MySQL的注释方案：

- **`-- 注释内容`** 这种注释方法不能够实现多行注释，要注意的是 --后面是有一个空格的。且由于'--'后面的内容将不会被识别，因此需要在下一行加上分号来结束该语句。
- **`# 注释内容`** 这种注释方法也不能实现多行注释。
- **`/* 注释内容 */`** 这种注释能够实现多行注释。
- **`/*! 注释内容 */`** 这种注释在mysql中叫做内联注释，当后面所接的数据库版本号时，当实际的版本等于或是高于那个字符串，应用程序就会将注释内容解释为SQL，否则就会当做注释来处理。默认的，当没有接版本号时，是会执行里面的内容的。

## DQL语句

DQL是**数据查询语言(Data Query Language)** 的缩写，对数据库内部的对象进行查询的语言，分两个方面来学习；

### 表内查询

**选择语句(The SELECT Statement)**

代码展示：

```sql
-- 在SQL语言中，一句分号代表了一句语言的结束
USE sql_store;            -- sql_store是已经存在的一个数据库

SELECT (Columns) FROM (Tables)        -- 从某个Tables选中某Columns，未加分号，因为下面还有语句
WHERE customer_id = 1        -- 指定条件
ORDER BY first_name;        -- 按first_name排序
```

**选择子句(The SELECT Clause)**

即SELECT的用法：

```sql
SELECT 
    first_name,
    last_name,
    points,
    (points + 10) * 1000 AS discount_factor    -- 对points进行四则运算，AS给这新的列命名为discount_factor
FROM customers
```

上述新列，如果我们想要命名为discount factor，则需要在该名称两端加上双引号，表示是一个字符串形式；

同时，如果我们想展示某列中的内容，但内容存在重复，这时候可以使用DISTINCT关键字去重；

```sql
SELECT DISTINCT state    -- 获取无重复内容
FROM customers
```

**WHERE子句(The WHERE Clause)**

即WHERE用法：

```sql
SELECT *
FROM Customers
WHERE points > 3000;    -- WHERE的作用就是处理条件

-- ----------------------------
-- 对日期的处理
WHERE birth_date > '1990-01-01';    -- 日期在这里直接看成字符串是吗？所以可以比较大小。
```

MySQL中表达不等于的符号：'<>'或者'$!=$';

- **WHERE中运算符的使用**
  
  ```sql
  -- AND：表多个条件需要同时成立
  WHERE birth_date > '1990-01-01' AND points > 1000
  
  -- OR：多个条件只要其中一个成立即可
  WHERE birth_date > '1990-01-01' OR points > 1000
  
  -- 需要考虑到运算符的执行顺序
  -- 有AND，AND运算符优先级最高
  
  -- NOT：对后续所有的条件取反
  WHERE NOT (birth_date > '1990-01-01' OR points > 1000)
  
  -- IN：只要是为了简化对OR运算符的用法
  WHERE state = 'VA' OR state = 'FL' OR state = 'GA';    -- 用IN代替
  WHERE state IN ('VA', 'FL', 'GA');    -- 等价于上
  WHERE state NOT IN ('VA', 'FL', 'GA');    -- 结合NOT
  
  -- BETWEEN：用来处理两个区间之间的范围选择
  WHERE points > 1000 AND points < 3000;
  WHERE points BETWEEN 1000 AND 3000;
  
  -- LIKE：检索遵循特定字符串模式的行
  WHERE last_name LIKE 'b%';    -- %可以理解为一种正则方式，代表其中的任意字符数
  WHERE last_name LIKE '%b%';
  WHERE last_name LIKE '%b';
  WHERE last_name LIKE '_b';     -- '_b'固定了长度只能为2，无所谓'_'那个位置是什么字符
  
  -- REGEXP运算符：以正则表达式的规范进行检索(下面一些示范相当于学习正则表达式了)
  WHERE last_name LIKE '%field%';
  WHERE last_name REGEXP 'field';
  WHERE last_name REGEXP '^field';    -- 以field打头的last_name，'^'表示要求后面的字符串开头
  WHERE last_name REGEXP 'field$';    -- 以field结尾的last_name，'$'要求要以前面的字符串结尾
  WHERE last_name REGEXP 'field|mac';    -- 含有'field'或者'mac'的last_name，'|'表示多个搜寻模式
  WHERE last_name REGEXP '[gim]e';    -- 含有ge或者ie或者me的last_name
  WHERE last_name REGEXP '[a-h]e';    -- 含有(ae, he)的last_name
  
  -- NULL运算符：
  WHERE phone IS NULL;    -- 找到号码为空的行
  ```

**OREDER BY子句**

WHERE之后列出的数据默认是按**主键列(primary key column)**排序的，通过OREDER BY字句可以自定义排序方式。

```sql
ORDER BY first_name;    -- 按照first_name排序

ORDER BY first_name DESC;    -- 按照first_name排序，但是是降序排列

ORDER BY state, first_name;    -- 优先按照state字段的字典序排序，state相同则参照first_name排序

ORDER BY state DESC, first_name DESC;    -- 优先按照state字段的字典序排序，state相同则参照first_name排序，加了DESC条件

-- 
```

- 在MySQL中，即便我们选择排序的列没有被SELECT，也不会影响到ORDER的选择，同样会依据ORDER中的选择列出SELECT出来的结果；
- 用于OREDR BY子句的表达式不一定得是一个列名称，可以是别名或者算术表达式；

**LIMIT子句**

限定查询返回的记录，什么意思：

- <font color="red">比如我们选中了一张表，我们只想要前面三行的记录信息，这就是限定查询返回的记录。</font>

```sql
SELECT *
FROM customers
LIMIT 3        -- 仅返回前三行的数据信息，如果这个数大于表中实际的数目(行数)，则返回全部信息

LIMIT 6, 3    -- 从6开始(不包括6)，返回接下来3行的信息

-- 
```

LIMIT常与OFFSET配合使用：

```sql
SELECT *
FROM customers
LIMIT 3 OFFSET 1   -- OFFSET表示跳过一条数据，从第二条数据开始读取，读取3条
```

LIMIT永远都要放在最后；

**GROUP BY子句**

这部分通常会结合聚合函数一起使用：

```sql
SELECT 
	sum(invoice_total) AS total_sales
FROM invoices i 
WHERE invoice_date >= '2019-07-01'	-- 结合where子句使用，但是where子句一定要放在group之前
GROUP BY client_id 		-- 依据client_id分组
GROUP BY state, city	-- 依据州和城市分组
ORDER BY total_sales DESC -- 根据结果逆序(从大到小)排序，同时需要放在GROUP之后，GROUP需要先执行
```

再来列举一个不结合聚合函数使用的例子：

```sql
-- Select clients with at least two invoices

SELECT client_id, COUNT(*) as numbers
FROM invoices
GROUP BY client_id	-- 以client_id进行组合
```

**HAVING字句**

HAVING子句的功能于WHERE类似，但是where使用会受到一些限制，比如语句执行位置的限制，而HAVING子句刚好可以处理这些限制。

```sql
SELECT 
	sum(invoice_total) as total_sales
FROM invoices
GROUP BY client_id	-- 相当于需要先执行SELECT部分的语句才会执行GROUP，而WHERE属于SELECT部分的语句
HAVING total_sales > 500

-- 另一个范例
SELECT client_id, COUNT(*) as numbers
FROM invoices
GROUP BY client_id	-- 以client_id进行组合
HAVING numbers > 2
```

<font color="red">WHERE与HAVING的区分：</font>

- HAVING子句所接的条件必须是SELECT中所存在的，WHERE子句只要满足表中存在该条件即可；
- 所处位置不同，以`GROUP BY`为例做区分；

**WHERE与HAVING的结合使用**

```sql
-- 获取位置在Virginia且花了超过100美元的顾客
USE	sql_store;

SELECT 
	c.customer_id ,
	c.first_name ,
	c.last_name ,
	sum(oi.quantity * oi.unit_price) AS total_sales
FROM customers c 
JOIN orders o USING (customer_id)
JOIN order_items oi USING (order_id)
WHERE state = 'VA'	-- 结合where
GROUP BY c.customer_id ,
	c.first_name ,
	c.last_name 
HAVING total_sales > 100	-- 结合having
```

由上可以看出，HAVING后的条件一定要是GROUP中有的；

### 跨表查询

**内连接(Inner Joins)**

从上述选择语句的学习中，我们可以看到，基本都是在同一张表格当中选取的列，而现实世界中，需要从**多张表格里选取列**；

通过以下代码举例：

```sql
SELECT * FROM sql_store.orders;    -- 我们选取sql_store的orders信息
-- 接下来通过orders信息，去获取客户名，即跨表获取信息

SELECT *
FROM orders
JOIN customer    -- 如果仅写JOIN，则默认内连接
    ON orders.customer_id = customers.customer_id    -- ON后面接条件，比如这边要求orders.customer_id列与customers.customer_id列要匹配
```

在上述代码中，我们发现，许多单词会有重复，在MySQL中针对这种情况是有简化策略的，具体来说就是

```sql
SELECT *
FROM orders o    -- 别名为o
JOIN customer c    -- 别名为c
    ON o.customer_id = c.customer_id    -- 简化形式
```

- **隐式连接语法(Implicit Join Syntax)**
  
  对于上述的内连接，隐式连接语法可以写成：
  
  ```sql
  SELECT *
  FROM orders o, customers c
  WHERE o.customer_id = c.customer_id
  ```
  
  同样实现了内连接！

- **USING子句**
  
  同样也是简化写法的应用之一
  
  ```sql
  SELECT *
  FROM orders o, customers c
  -- WHERE o.customer_id = c.customer_id
      USING (custom_id)
  
  -- 这种写法只能应用于where左右两边子项是一致的情况
  
  -- 同时，可以处理那种复合连接条件的简化写法
  ```

- **注意区分ON和USING的使用**

  如果列名不一致，则用`ON`，列名一致，则通过`USING`简化；

**自连接(Self Joins)**

通过一定规则，将表中的列进行自我连接，举例：

```sql
USE sql_hr;

SELECT e.employee_id , e.first_name , m.first_name as manager
from employees e    -- 别名是为了直观上显示，比如这边代表员工
join employees m     -- 代表管理人员
    on e.reports_to = m.employee_id;
```

怎么理解上面最后一行的等于呢，比如e的reports_to等于001，而m即便是管理层也是公司的员工，也会有employee_id，我们需要列出编号为001的管理层，就能很清楚的显示employee与manager的信息；

**多表连接(Joining Multiple Tables)**

不一定所有的信息都在一张表格中，有些内容需要在不同的表格中展示：

```sql
use sql_invoicing;

select                 -- 列出同一客户，同一付款方式下的订单信息
    p.`date`,
    p.invoice_id,
    p.amount,
    c.name,
    pm.name as payment_ways 
from payments p 
join clients c 
    on p.client_id = c.client_id     -- 客户ID一致
join payment_methods pm  
    on p.payment_method  = pm.payment_method_id -- 付款方式一致
```

- **复合连接条件(Compound Join Coniditions)**
  
  复合连接条件只要用来控制多列的情形，也就是说，在某一行中，需要保证这一行中的两列的数据都是一致的；
  
  ```sql
  SELECT *
  FROM order_items oi
  JOIN order_item_notes oin
      ON oi.order_id = oin.order_id
      AND oi.product_id = oin.product_id
  
  -- 使用USING语句代替上述的写法，即简化
  SELECT *
  FROM order_items oi
  JOIN order_item_notes oin
      USING (order_id, product_id)
  ```

**外连接(Outer Joins)**

<font color="red">注意：</font>这个与之前所学的内连接本质上的区别就是对于缺醒值(N/A、NULL)的处理，外连接可以理解为，会在外面另起一行去加入缺醒值(N/A、NULL)的处理：

所谓缺醒值的处理，就是对于某一个不存在的数值，内连接会将之省去，以代码为例：

```sql
SELECT
    c.customer_id,
    c.first_name,
    o.order_id
FROM customers c
JOIN orders o
    ON c.customer_id = o.customer_id
ORDER BY c.customer_id
-- 上面那部分是内连接，内连接后，orders中不存在order_id的行会被省去
-- 因而就导致，customer_id不会全部都显示出来
```

而外连接会对这种情况有不同的处理：

```sql
SELECT
    c.customer_id,
    c.first_name,
    o.order_id
FROM customers c
LEFT JOIN orders o    -- 左外连接，同内连接相似，也省去了(OUTER)关键字
    ON c.customer_id = o.customer_id
ORDER BY c.customer_i
-- 左外连接，也就是说会显示JOIN左边的customers的所有信息，orders中丢失的以N/A(NULL)显示

RIGHT JOIN orders o    -- 右外连接，显示orders中的信息
```

- **多表外连接(Outer Join Between Mutiple Tables)**
  
  ```sql
  select
      o.order_id,        -- 表o(简写)
      o.order_date,
      c.first_name,    -- 表c
      s.name as shipper,    -- 表s
      os.name as status     -- 表os
  FROM orders o
  JOIN customers c  
      ON o.customer_id  = c.customer_id
  left join shippers s 
      on o.shipper_id = s.shipper_id 
  join order_statuses os 
      on o.status = os.order_status_id 
  ```

- **自外连接(Self Outer Joins)**
  
  通过一定规则，将表中的列进行自我连接，但遵循外连接方式：
  
  ```sql
  USE sql_hr;
  
  SELECT e.employee_id , e.first_name , m.first_name as manager
  from employees e    -- 别名是为了直观上显示，比如这边代表员工
  left join employees m     -- 代表管理人员，加上left，即便是没有reports_to的员工也会显示其信息
      on e.reports_to = m.employee_id;
  ```

**自然连接(Natural Joins)**

让编译器自己去猜基于哪一列做连接，不是很建议使用这种方式：

```sql
select 
    *
from orders o 
natural join customers c 
```

**交叉连接(Cross Joins)**

表中每条记录都会与产品表里的每条记录结合；

先列举代码：

```sql
SELECT *
FROM customers c
CROSS JOIN products p

-- 客户表中的每条记录都会和产品表里的每条记录结合
-- 假设customers有10条记录，products中有10条记录
-- 那么连接后的表则会有100条记录，每条customers对应10条products
```

- **交叉连接的隐式语法**
  
  ```sql
  SELECT
      c.first_name as customer,
      p.name as product
  FROM customers c, orders o
  order by c.first_name
  ```

**总结四种连接的特点**

内连接：返回两个表中存在连接匹配的记录；
左连接：返回左表全部记录和右表符合连接条件的记录；
右连接：返回右表全部记录和左表符合连接条件的记录；
外连接：返回两个表全部记录，不匹配的记录对应值为NULL；

### 跨数据库查询

**跨数据库连接(Join Across Databases)**

这部分将讲述如何让将分散在多个数据库的表中的列合并起来；

```sql
use sql_inventory;    -- 使用sql_inventory表

SELECT *
FROM sql_store.order_items oi     -- 跨数据库连接
join products p     -- products是sql_inventory中的列
    on oi.product_id = p.product_id 
```

### 联合(Unions)

前面所述基本都是关于多张表中列的连接，但是在SQL中我们也可以结合多张表的行去进行连接，这个时候就需要用到Unions语法了；

```sql
select 
    order_id,
    order_date,
    'Active' AS status
from orders
where order_date >= '2019-01-01'    -- 不要加上该分号，很重要！

union    -- 连接

select 
    order_id,
    order_date,
    'Archived' AS status
from orders
where order_date < '2019-01-01';    
```

### 聚合函数(Aggregate Functions)

所谓聚合函数，就是MySQL中的内置函数，下面一些结合有关条件的常用聚合函数的代码：

```sql
USE sql_invoicing;

SELECT 
	max(invoice_total) AS highest,	-- max函数取某列中的最大值
	min(invoice_total) AS lowest,	-- min函数取某列中的最小值
	avg(invoice_total) AS average,	-- 平均值
	sum(invoice_total) AS total,	-- 和
	count(client_id) AS total_records	-- 某列的值数目，不会计算NULL值，但默认计算重复值
	count(DISTINCT client_id) AS total_records	-- 这样就不计算重复值了
FROM invoices i 
WHERE invoice_date > '2019-07-01'
```

### ROLLUP运算符

官方说明：ROLLUP运算符应用于聚合值的列，那么<font color="red">何为聚合值？</font>

以代码举例：

```sql
-- 简单用法，只聚合total_sales
USE	sql_invoicing;

SELECT 
	client_id,
	sum(invoice_total) AS total_sales
FROM invoices i 
GROUP BY client_id WITH ROLLUP 
```

上面的示例代码会自动聚合total_sales；

考虑多列表连接的情况：

```sql
USE	sql_invoicing;

SELECT 
	sum(invoice_total) AS total_sales,
	state, city
FROM invoices i 
JOIN clients c USING (client_id)
GROUP BY state, city WITH ROLLUP 	-- 根据每一个state的数据做汇总，且最后进行总体汇总
```

### 数值函数(Numeric Function)

mysql中的内置函数，用以应对数值、日期和字符串值；

```sql
SELECT ROUND(5.73, 1)	-- 四舍五入，这里的范例是保留一位小数
SELECT TRUNCATE(5.73, 1)	-- 截断函数，这里的范例是小数点后截断一位
SELECT CEILING(5.7)		-- 返回大于或等于这个数字的最小整数
SELECT FLOOR(5.7)		-- 返回小于或等于这个数字的最大整数
SELECT ABS(-2.3)		-- 返回绝对值 
SELECT RAND()			-- 返回0-1之间的随机数
```

- **字符串函数(String Functions)**

  一些超级有用的处理字符串值的函数：

  ```sql
  SELECT LENGTH('sky')	-- 获取字符串中字符个数
  SELECT UPPER('sky')		-- 转化大写
  SELECT LOWER('sky')		-- 转化小写
  
  SELECT LTRIM(' sky')	-- 去除左空格
  SELECT RTRIM('sky ')	-- 去除右空格
  SELECT TRIM(' sky  ')	-- 去除两边空格
  
  SELECT LEFT('Kindergarten', 4)		-- 选取最左边的4个字符
  SELECT RIGHT('Kindergarten', 6)		-- 选取最右边的6个字符
  SELECT SUBSTRING('Kindergarten', 3, 5)	-- 起始位置为3，长度为5的子串 
  SELECT SUBSTRING('Kindergarten', 3)		-- 起始位置为3，到最后一位的字串
  SELECT LOCATE('n', 'Kindergarten')	-- 定位第一次出现的位置，不区分大小写
  SELECT LOCATE('garten', 'Kindergarten')	-- 定位字串第一次出现的位置
  SELECT REPLACE('Kindergarten', 'garten', 'garden')	-- 替换字串，如果有的话
  SELECT CONCAT('first', ' ', 'last')		-- 连接函数
  ```

- **日期函数(Date Function)**

  适用于日期格式的函数：

  ```sql
  SELECT now(), curdate(), curtime();		-- 分别获取此刻的详细时间以及此刻日期以及此刻时间
  SELECT YEAR(now());		-- int类型，返回整数(2023)
  SELECT MONTH (now());	-- 返回月份
  SELECT HOUR  (now());	-- 返回时刻
  
  -- 获取字符串格式
  
  SELECT dayname(now()), monthname(now()), EXTRACT (DAY FROM now())  	-- 获取"星期几"，"月份名"
  -- EXTRACT是标准SQL语言的一部分
  ```

  - **格式化日期和时间(Formatting)**

    在数据库中的默认形式是："2023-03-29"，将之格式化为用户所能看懂的形式：

    ```sql
    SELECT date_format(now(), '%m %d %Y'), time_format(now(), "%H:%i:%s")	-- 格式转化 
    ```

  - **计算日期与时间**

    列举一些常用函数：

    ```sql
    SELECT date_add(now(), INTERVAL -1 year) AS last_year,	-- 今年的基础上减一年 
    	datediff('2019-01-05 09:00', '2019-01-01 01:00'),	-- 两个日期的差
    	time_to_sec('09:00') - time_to_sec('09:02')  		-- 两个时间相差的 秒数
    ```

- **IFNULL函数和COALESCE函数**

  用于填充：

  ```sql
  USE sql_store;
  
  SELECT 
  	order_id,
  	ifnull(shipper_id, "Not assigned") AS shippers,	-- ID为空则用"Not assigned"填充
  	-- 对于shipper_id，为空则用comments填充，comments还为空就用最后一个'Not assigned'填充
  	COALESCE(shipper_id, comments, 'Not assigned') AS shippers 
  FROM orders o 
  ```

- **IF函数**

  使用形式：`IF(expression, first, last)`满足expression则返回first，否则返回last；

  ```sql
  SELECT
  	o.order_id,
  	o.order_date,
  	(IF(YEAR(order_date) = 2019, 'Actived', 'Archived')) AS status  -- 使用IF
  FROM orders o 
  ```

- **CASE运算符**

  IF运算符只能满足单一的测试表达式，因此引入CASE运算符，应对单一运算符无法处理的情况，此外，CASE运算符一般与WHEN配个使用：

  ```sql
  USE sql_store;
  
  SELECT 
  	order_id,
  	CASE 
  		WHEN YEAR(order_date) = YEAR(now()) THEN 'Active' 	-- 当.....的时候
  		WHEN YEAR(order_date) = YEAR(now()) - 1 THEN 'Last Year' 	
  		WHEN YEAR(order_date) < YEAR(now()) - 1 THEN 'Archived'
  		ELSE 'Future'	-- 否则是之后的订单
  	END AS category		-- 重命名
  FROM orders
  ```


## 复杂查询编写(Complex Queries)

### 子查询(Subqueries)

就是在关键字后面可以直接放一个子查询语句，如下：

```sql
SELECT *
FROM products p 
WHERE unit_price > (	-- 以下为子查询
	SELECT unit_price 
	FROM products p2 
	WHERE product_id = 3
)
```

- **IN运算符**

  按照英文意思理解即可：

  ```sql
  USE sql_store;
  
  SELECT 
  	p.name 
  FROM products p  
  WHERE product_id NOT IN (
  	SELECT DISTINCT product_id 
  	FROM order_items oi 
  ) 
  ```

- **ALL关键字**

  假设我们想实现一个功能：

  ```sql
  -- Select invoices lager than all invoices of
  -- clients 3
  USE sql_invoicing;
  
  SELECT *
  FROM invoices
  WHERE invoice_total > (
  	SELECT 
  		max(i.invoice_total) 	-- 找出了一个最大值
  	FROM invoices i 
  	WHERE client_id = 3
  )
  
  -- 上面是一种比较不错的方法，但同时可利用ALL关键字
  
  SELECT *
  FROM invoices
  WHERE invoice_total > ALL (
  	SELECT invoice_total 	-- 找出了一系列值，要求比这些都大
  	FROM invoices i 
  	WHERE client_id = 3
  )
  ```

  从人类理解的角度来看，使用方法二是更直观的一种做法；

- **ANY关键字**

  可以对比*ALL关键字*一起理解，ALL是必须大于所有，而ANY则是满足某一个即可：
  
  ```sql
  SELECT client_id, COUNT(*) AS numbers
  FROM clients
  WHERE client_id = ANY (
  	SELECT client_id
      FROM invoices
      GROUP BY client_id
      HAVING COUNT(*) >= 2
  )
  ```

- **SELECT语句的子查询**

  引出这个问题的几个原因是：

  - 这里可以看出的是SELECT语句也可以有子查询；

  - 其次是在语句：

    ```sql
    SELECT
    	invoice_id,
    	invoice_total,
    	avg(invoice_total) as invoice_average
    FROM invoices
    ```

    这部分一位会<font color="red">出现每一invoice_id的的avg信息，但是只有一行，因此产生了一些疑问</font>；

    针对这个问题的解释是，逻辑上而言，平均值确实是每一列只有一个值，因此id以及total也跟着只出现一行，这时候就用到SELECT的子查询了；

  子查询示例：

  ```sql
  USE sql_invoicing;
  
  SELECT 
  	invoice_id ,
  	invoice_total ,
  	(SELECT avg(invoice_total) FROM invoices) AS invoice_average 
  FROM invoices i
  
  -- 另一个练习题
  
  USE sql_invoicing;
  
  SELECT 
  	client_id,
  	c.name,
  	(SELECT sum(invoice_total)
  		FROM invoices i
  		WHERE i.client_id = c.client_id) AS total_sales,
  	(SELECT avg(invoice_total) FROM invoices) AS average,
  	(SELECT total_sales) - (SELECT average)
  FROM clients c 
  ```

  这样就会对invoice_id, invoice_total每一行做AVG；

- **FROM子句的子查询**

  基于上述练习题部分的代码进行学习：

  ```sql
  SELECT *
  FROM (
      SELECT 
          client_id,
          c.name,
          (SELECT sum(invoice_total)
              FROM invoices i
              WHERE i.client_id = c.client_id) AS total_sales,
          (SELECT avg(invoice_total) FROM invoices) AS average,
          (SELECT total_sales) - (SELECT average)
      FROM clients c 
  ) AS summary_sales	-- 一个子查询范例，这部分子查询可以当作一个视图来进行处理，这部分后面学习
  ```

  从上可以看出，我们SELECT出来的一张表格，即便是在数据库中不存在的，我们也可以把它当作一张普通表格进行我们所学的操作；

### 子查询与连接的对比

```sql
SELECT 
	*
FROM clients
WHERE client_id NOT IN (
	SELECT DISTINCT client_id 
	FROM invoices 
)

-- 以上写法是通过子查询的方式获取没有发票的客户，也可以使用外连接的方式进行实现

SELECT *
FROM clients
LEFT JOIN invoices USING (client_id)	# 左连接
WHERE invoice_id IS NULL
```

以上两者功能的区分就是告诉我们，在SQL语言中，同时也需要去考虑程序的执行效率等信息，包括书写规范等等，都是比较重要的习惯；

### 相关子查询

从定义上来理解就是，某一段的子查询和外查询存在着一定的相关性，代码如下：

```sql
-- Find employees whose salary is above the average in their office
SELECT *
FROM employees e 
WHERE salary > (
	SELECT avg(salary)
	FROM employees e2 
	WHERE office_id = e.office_id 	-- 与外查询中的employees存在相关性
)
```

- **EXISTS运算符**

  之所以要将该运算符写在这部分章节，是因为接下来的代码结合了这两者：

  ```sql
  USE sql_invoicing;
  
  SELECT *
  FROM clients c 
  WHERE EXISTS  (	-- 对clients中的每一客户都会做检查
  	SELECT client_id 
  	FROM invoices i  
  	WHERE client_id  = c.client_id  -- 相关子查询
  )
  ```

  会更建议使用EXISTS运算符，因为<font color="red">他只返回一个结果(True Or False)给外查询，而不是像IN直接返回一整个列表</font>；

## 视图(Views)

### 视图的定义

视图不存储数据，数据存储在表中，视图可以认为是表的一个虚拟存在，可以简化我们书写，不必每次都写一大串SELECT语句；

创建视图代码：

```sql
USE sql_invoicing;

CREATE VIEW sales_by_client as	-- 创建了一张视图，即VIEW
SELECT 
	c.client_id,
	c.name,
	sum(invoice_total) AS total_sales 
FROM clients c 
JOIN invoices i USING(client_id)
GROUP BY client_id, name 
```

**视图的优势：**

- 减少改动带来的影响；
- 限制对基础数据的访问权限；

### 更改或删除视图

- 删除再重建

- 使用REPLACE方法

  ```sql
  USE sql_invoicing;
  
  CREATE OR REPLACE VIEW sales_by_client as
  SELECT 
  	c.client_id,
  	c.name,
  	sum(invoice_total) AS total_sales 
  FROM clients c 
  JOIN invoices i USING(client_id)
  GROUP BY client_id, name 
  ORDER BY total_sales DESC
  ```

### 可更新视图(Updatable Views)

可更新视图是，没有一些关键字在其中的视图，这些关键字包括：

```sql
-- DISTINCT
-- 聚合函数中的关键字
-- GROUP BY/HAVing
-- UNION
```

当视图中没有这些关键字时，我们称该视图为**可更新视图**，我们可以在其中插入、更新或者删除数据；

**应用场景：**出于安全原因，我们可能没有某张表的直接权限，此时只能使用可更新视图去修改数据；

- **WITH OPTION CHECK子句**

  教程中用的是MySQL自带编辑器，在进行UPDATE的过程中，相应的行会消失；为了避免这种情况，可以在创建视图的源码中加入：`WITH OPTION CHECK`子句；

  但经我测试，DBeaver是不存在这种情况的，而且<font color="red">而且加了这行会报错</font>；

## 存储过程(Stored Procedure)

**存储过程的定义：**存储过程是一个包含一堆SQL代码的数据库对象；

我们不会想着将SQL代码嵌入到应用程序，这会使得代码看起来繁杂且难以维护，此外有些编程语言涉及到编译，每次对SQL的修改都需要重新编译，很是繁琐，因此设计之时，尝试将SQL放进一个专用存储库，或者放进专门的函数中，以便这个过程更有效率；

**存储过程的几个优势：**

- 在应用代码中直接调用这些过程来获取或保存数据；
- DBMS对存储过程中的代码有优化；
- 在权限方面，存储过程能增强数据安全性；

### 存储过程的创建

看代码：

```sql
delimiter $$	-- 定界符，这一步很重要
CREATE PROCEDURE get_clients()
begin
	SELECT * FROM  clients c;
END$$

DELIMITER;	 -- 改回来
```

还可以直接在编辑器那边进行创建；

- **删除存储过程**

  ```sql
  DROP PROCEDURE IF exists get_payments；	-- 删除的语法
  ```

### 存储过程的参数

通过这段代码看参数如何使用：

```sql
DROP PROCEDURE IF exists get_clients_by_state;

DELIMITER $$
CREATE PROCEDURE get_clients_by_state(state char(2))	-- 定义参数
BEGIN
	SELECT * FROM sql_invoicing.clients sc
	WHERE sc.state = state;		-- 代码内使用参数
END $$

delimiter ;

CALL get_clients_by_state("CA") 	-- 参数不能为空，一定得有东西，且为2个字符的字符串
```

- **带默认值的参数**

  即便是带默认值的参数，也就是说存储过程不需要任何参数，你也得告诉MySQL参数是NULL，否则SQL会不高兴；

  ```sql
  DROP PROCEDURE IF exists get_clients_by_state;
  
  DELIMITER $$
  CREATE PROCEDURE get_clients_by_state(state char(2))
  BEGIN
  	IF state IS NULL THEN 
  		SET state = 'CA';
  	END IF ;	-- IF的结束语句
  	SELECT * FROM sql_invoicing.clients sc
  	WHERE sc.state = state;
  END $$
  
  delimiter ;
  
  CALL get_clients_by_state(NULL) 	-- 即便是空值，你也得告诉MySQL
  
  -- 如果我们想在默认情况下返回所有的州的信息呢？
  
  DELIMITER $$
  CREATE PROCEDURE get_clients_by_state(state char(2))
  BEGIN
  	IF state IS NULL THEN 
  		SELECT * FROM clients;	-- 默认返回所有信息
  	ELSE
          SELECT * FROM sql_invoicing.clients sc
          WHERE sc.state = state;
  	END IF ;	-- IF的结束语句
  END $$
  
  delimiter ;
  
  -- 一个更优雅的写法
  
  DELIMITER $$
  CREATE PROCEDURE get_clients_by_state(state char(2))
  BEGIN
  	SELECT * FROM clients c;	-- 默认返回所有信息
  	WHERE c.state = IFNULL(state, c.state);	-- 完美利用IFNULL关键字
  END $$
  
  delimiter ;
  ```

- **参数验证(Parameter Validation)**

  **参数验证**的作用主要是，当我们输入一些不合理的参数时，可以给出我们提示信息以便纠正：

  ```sql
  CREATE PROCEDURE sql_invoicing.make_payment
  (	
  	invoice_id INT,
  	payment_amount DECIMAL(9, 2),
  	payment_date DATE
  )
  BEGIN
  	IF payment_amount <= 0 THEN		-- 参数验证部分
  		SIGNAL SQLSTATE '22003'		-- 输出22003错误
  			SET message_text = 'Invalid payment amount';	-- 紧跟着让人类看得懂的语言
  	END IF;
  		
  	UPDATE sql_invoicing.invoices si
  	SET 
  		si.payment_total = payment_amount,	-- 更新两列
  		si.payment_date = payment_date
  	WHERE si.invoice_id = invoice_id; 
  END
  ```

- **输出参数(Output Parameters)**

  输入某个参数，获取到我们想要的结果，然后将这些结果以所参数中的**输出参数**展现出来；(<font color="red">这样理解是不是有点绕</font>)

  ```sql
  CREATE PROCEDURE sql_invoicing.get_unpaid_invoices_for_client(
  	client_id INT,
  	OUT invoices_count INT,			-- MySQL的输出处理
  	OUT invoices_total DECIMAL(9, 2)	-- 即使用OUT关键字
  )
  BEGIN
  	SELECT count(*), sum(invoice_total)
  	INTO invoices_count, invoices_total
  	FROM invoices i
  	WHERE i.client_id = client_id AND payment_total = 0;
  END
  ```

  <font color="red">这部分MySQL与DBeaver的图形界面的处理方式很不同，真的，很不同....</font>

### 存储过程的变量(Variables)

变量主要是分两大类型：用户变量，本地变量；

```sql
-- User or session variables：用户变量或者说会话变量
SET @invoices_count = 0		-- 用户变量

-- Local Variable	-- 本地变量
DECLARE some_Variable INT;	-- 设置本地变量，命名为some_Variable

-- 本地变量用法
CREATE PROCEDURE sql_invoicing.get_risk_factor()
BEGIN
	DECLARE risk_factor decimal(9, 2);
	DECLARE invoices_total decimal(9, 2);
	DECLARE invoices_count INT;
	SELECT count(*), sum(invoice_total)  
	INTO invoices_count, invoices_total
	FROM invoices;
	-- GROUP BY client_id;
	SET risk_factor = invoices_total / invoices_count * 5;
	SELECT risk_factor; 
END
```

### 函数(Functions)

函数这部分之所以放入存储过程的章节，是因为学习的时候**函数**与变量是相互紧密联系的；

定义一个函数：

```sql
CREATE FUNCTION sql_invoicing.get_risk_factor_for_client(client_id INT)
RETURNS INT
-- DETERMINISTIC 	-- 保证返回结果的唯一性
READS SQL DATA 	-- 可读取表格
-- MODIFIES SQL DATA	-- 可修改表格
BEGIN	-- 下面是函数体部分
	DECLARE risk_factor decimal(9, 2);	-- 定义变量
	DECLARE invoices_total decimal(9, 2);
	DECLARE invoices_count INT;
	SELECT count(*), sum(invoice_total)  -- 选择数据
	INTO invoices_count, invoices_total
	FROM invoices i
	WHERE i.client_id = client_id;
	-- GROUP BY client_id;
	SET risk_factor = invoices_total / invoices_count * 5;
	RETURN risk_factor;
END
```

## 触发器(Triggers)

触发器是在插入、更新和删除语句前后自动执行的一堆SQL代码，试想一个应用场景：

- 某一列是某个产品或者某个人的付款数据集合，我们要统计这些付款的总数目，那么：

  - 在每新增一位客户之后，我们都需要自动计算总数目之和

  这时候就体现出**触发器**的应用场景了。

代码：

```sql
DELIMITER $$

CREATE TRIGGER payments_after_insert
	AFTER INSERT ON payments
	FOR EACH ROW 	-- 生效于插入的每一行
	
BEGIN 
	UPDATE invoices i		-- 不可以改payments，触发器本身不被允许触发自身
	SET i.payment_total = payment_total + NEW.amount	-- new指的是插入于payments的每一行
	WHERE invoice_id = NEW.invoice_id;	-- 满足插入的id相同的条件
END $$

delimiter;
-- -------------------------------
USE sql_invoicing;	-- 选定表格，查看触发器
SHOW triggers
-- ------------------------------------------------
DROP TRIGGER IF EXISTS payment_after_insert	-- 删除触发器
```

上面的不可以修改自身也可以这么理解：BEGIN～END部分的代码就是对相应表格的修改，如果修改自己，每新增一行就要变化这部分，执行变化的部分又是新的变化，死循环！

### 使用触发器进行审计(Using Triggers for Auditing)

简单来说就是，记录一些对数据库进行删改的行为，以便后续审阅！

具体用法：我们先创建一张专门对行为进行记录的表格，然后在触发器中新增对表格行为的记录语句，每次引起触发器的执行都会将行为写入到mysql表格中；

```sql
DELIMITER $$

DROP TRIGGER IF EXISTS payment_after_insert;	-- DBeaver中这得放第一行，否则报错

CREATE TRIGGER payments_after_insert
	AFTER INSERT ON payments
	FOR EACH ROW 
	
BEGIN 
	UPDATE invoices i
	SET i.payment_total = payment_total + NEW.amount
	WHERE invoice_id = NEW.invoice_id;

	INSERT INTO payments_audit 
	VALUES (NEW.client_id, NEW.date, NEW.amount, 'Insert', now());	-- NEW指的还是新插入的行
END $$

delimiter ;
```

### 事件(MySQL Events)

事件是根据计划执行的任务或者一堆SQL代码：

- 可以只执行一次；
- 也可以按照某种规律执行；
- 实现自动化维护数据库；

创建一个事件的代码：

```sql
DELIMITER $$

CREATE EVENT yearly_delete_stale_audit_rows
ON schedule
	EVERY 1 YEAR STARTS '2019-01-01' ENDS '2029-01-01'
DO BEGIN 
	DELETE FROM payments_audit
	WHERE action_date < dateadd(NOW(), INTERVAL -4 YEAR);
END $$
```

## 事务(Transaction)

**事务**是代表单个工作单元的一组SQL语句，所有这些语句都应成功完成，否则事务会运行失败，比如银行存取款；

- 存款之后银行那边需要有反馈，否则就必须把存的款项吐出来；

事务的几个属性：

- 事务具有原子性(Atomicity)，不可分割，不论它包含多少语句；
- 事务具有一致性(Consistency)，意思就是说事务中(表格)内容的变化是一致的；
- 事务具有隔离性(Isolation)，比如说多个事务想要修改一张表，那么每个事务对其的操作是互不影响的；
- 事务具有永久性(Durability)，事务对数据的改变时永久的；

即ACID；

### 事务创建

事务创建的代码：

```sql
USE sql_store;

START TRANSACTION;

INSERT INTO orders (customer_id, order_date, status)
VALUES (1, '2019-01-01', 1);

INSERT INTO order_items
VALUES (last_insert_id(), 1, 1, 1);		-- 上面每一步都需要执行完成，才能保证该事务被提交

COMMIT;		-- 当MySQL看到该指令，会将所有更改保存，但如果有执行失败的，它会退回所有的更改
ROLLBACK;	-- 当我们想要执行一些错误检查，可以使用ROLLBACK手动退回所有的更改
```

***Notes:***我们写这些代码的那个窗口就是通过MySQL中的事务来控制的；

### 并发和锁定

**并发：**两个及以上的事务对同一张表中的内容做修改，这样就产生了并发问题；

**锁定：**MySQL默认会对上述这种情况上锁，如果另一个事务尝试修改同一行，那么则会锁定，锁定到修改完成；

**常见类型：**

- **丢失更新(Lost Updates)：**事务A、B分别需要对表中`Part A`、`Part B`信息做修改，事件B提交较晚，导致事件A的修改被覆盖，即丢失更新；
  - **解决方案：**使用锁，任何一方在修改时另一方都不能修改；
- **脏读(Dirty Reads)：**事件B读取了事务A的修改，但是事务A对这部分修改并未做提交，万一退回，就形成了**Dirty Reads**；
  - **解决方案：**建立隔离级别，即在A未做提交时不可读，SQL定义了四个事务隔离级别；(<font color=red>后面会学</font>)
- **不可重复读(Non-repeating Reads)：**事务A在先前读写某项信息，而此时事务B更新了那部分信息，事务A又读这部分信息，读出不一样的信息，即导致了不可重复(不一致)读的结果；
  - **解决方案：**按照最新的读；此外SQL定义了另一个隔离级别，"可重复读"，即会在最先读取的部分形成一个快照，保证一致！

- **幻读(Phantom Reads)：**事务A需要读取顾客某范围内的信息，但在这个过程中事务B更新了一条符合这个范围的新信息，但是最终事务B的这部分信息没读到；
  - **解决方案：**保证事务A在读取的过程中没有其他事务在更新<font color=red>影响这部分读取</font>的信息；SQL中有一个"序列化"隔离级别；这是可以应用于一个事务的最高隔离级别；

**四个隔离级别：**

- **读未提交(READ UNCOMMITTED)**：不存在隔离性，可以读取彼此未提交的更改；

  `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;`

- **读已提交(READ COMMITTED)：**给予了一定的隔离性，只允许读取已提交的数据，防止了**脏读**；但是无法处理另一个事务在两次读取之间更新数据的情况；

  `SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`

- **可重复读(REPEATABLE READ)：**即会在最先读取的部分形成一个快照，保证一致！这是MySQL的默认事务隔离级别；

  `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;`

- **序列化(SERIALIZABLE):**解决上述所有类型的问题，但是增加开销；

  `SET TRANSACTION ISOLATION LEVEL READ SERIALIZABLE;`

级别越低、并发性越强、遇到问题的概率也越大；级别越高、并发性越弱、遇到问题的概率小、但是开销极大；

```sql
SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE; 	-- 在当前会话中设置序列化隔离级别
SET GLOBAL TRANSACTION ISOLATION LEVEL SERIALIZABLE; 	-- 在新会话中全局设置序列化隔离级别
```

### 死锁(Deadlocks)

以代码举例：

```sql
-- 事务1
USE sql_store;
START TRANSACTION;
UPDATE customers SET state = 'VA' WHERE customer_id = 1;	-- 执行，上锁
UPDATE orders SET status = 1 WHERE order_id = 1;			-- 被事务2上锁，等待事务2完成
COMMIT;

-- 事务2
USE sql_store;
START TRANSACTION;
UPDATE orders SET status = 1 WHERE order_id = 1;			-- 执行，上锁
UPDATE customers SET state = 'VA' WHERE customer_id = 1;	-- 被事务1上锁，等待事务1完成
COMMIT;
```

以上就造成了死锁，一般有这些方案：

- 为了减少死锁，在更新多条记录的时候可以遵照相同的顺序；
- 尽量简化事务，缩小事务运行时长；

## DML语句

DML是**数据操纵语言(Data Manipulation Language)**的缩写，用于改变数据库中的数据，包括插入、删除、修改；

### 行插入(Insert Row)

**插入单行**

```sql
INSERT INTO customers (
    first_name,
    last_name,
    birth_date,
    address,
    city,
    state)
VALUES (
    'John',
    'Smith',
    '1990-01-01',
    'address',
    'city',
    'CA')
```

**插入多行**

```sql
INSERT INTO shippers (name)
VALUES ('Shipper1'),
    ('Shipper2'),
    ('Shipper3')    -- 可以插入这三行
    
-- -----------------------------------
INSERT INTO products (name, quantity_in_stock, unit_price)
VALUES ('Product1', 10, 1.95),
		('Product2', 5, 1.03),
		('Product3', 14, 2.15)
```

**插入分层行(Hierarchical Rows)**

实质意思就是往多表插入数据

```sql
INSERT INTO orders (customer_id, order_date, status)
VALUES (1, '2019-01-02', 1);

INSERT INTO order_items
VALUES (LAST_INSERT_ID(), 1, 1, 2.95),
		(LAST_INSERT_ID(), 2, 1, 3.95)
```

### 行更新(Updating Row)

**更新单行**

```sql
UPDATE invoices 	-- UPDATE命令进行更新
SET payment_total = 10, payment_date = '2019-03-01'	-- 设置值
WHERE invoice_id = 1	-- 成立的条件
```

**更新多行**

```sql
UPDATE invoices 
SET 
	payment_total = invoice_total * 0.5,
	payment_date = due_date 
WHERE client_id IN (3, 4)	-- IN表示一种可迭代的操作，即client_id为3或者4的都进行更新
```

- **在UPDATE中用子查询**

  通俗来说就是，对WHERE中条件的指定：

  ```sql
  UPDATE invoices 
  SET 
  	payment_total = invoice_total * 0.5,
  	payment_date = due_date 
  WHERE client_id IN (SELECT client_id
                     FROM clients
                     WHERE state IN ('CA', 'NY'))
                    
   /* 上面更新了家在CA以及NY两地的客户的信息 */
  UPDATE invoices 
  SET 
  	payment_total = invoice_total * 0.5,
  	payment_date = due_date 
  WHERE payment_date IS NULL
  ```

### 删除行(Deleting Rows)

将记录进行删除的命令：

```sql
DELETE FROM invoices
WHERE client_id = (
	SELECT *
	FROM clients
	WHERE name = 'Myworks'
)
```

## DDL语句

DDL是**数据定义语言(Data Definition Language)**的缩写，对数据库内部的对象进行创建、删除、修改等操作的语言。

### 创建和删除数据库

了解数据库创建的脚本，可以帮助我们徒手对数据库进行创建或修改，而不需要依赖GUI界面；

代码：

```sql
-- 创建数据库
create database IF NOT EXISTS dbname;    -- 创建名为dbname的数据库，一般会建议加上"IF NOT EXISTS" 

-- 删除数据库
drop database IF EXISTS dbname;    -- 删除名为dbname的数据库，一般会建议加上"IF EXISTS" 
```

### 创建表(Creating Tables)

创建表的代码如下：

```sql
-- 通用格式
create table tablename(
column_name_1 column_type_1 constraints,    -- constraints代表了这个列的约束条件。
column_name_2 column_type_2 constraints,
....
column_name_n column_type_n constraints,);
-- -----------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS sql_store2;
USE sql_store2;
DROP TABLE IF EXISTS customers;
CREATE TABLE customers	-- 创建表的写法
(	
    customer_id int PRIMARY KEY AUTO_INCREMENT,	-- 以下是各列
	first_name  varchar(50) NOT NULL,
	points		int NOT NULL DEFAULT 0,
	email		varchar(255) NOT NULL UNIQUE
);	
```

### 修改表(Altering Tables)

修改表的代码：

```sql
-- 修改/增加/删除/更名表字段核心命令
alter table tablename (modify / add / drop / change)
-- -------------------------------------------------------
ALTER TABLE customers	
	ADD last_name varchar(50) NOT NULL AFTER first_name,	-- 在first_name这一列增加列
	ADD city	  varchar(50) NOT NULL,						-- 单纯增加一列
	MODIFY COLUMN first_name varchar(55) DEFAULT '',		-- 修改一列
	DROP points												-- 删除一列
	;
```

### 创建关系(Creating Relationships)

创建两张表之间的关系，使用customer_id应用外键约束：

```sql
CREATE DATABASE IF NOT EXISTS sql_store2;
USE sql_store2;

CREATE TABLE IF NOT EXISTS customers	-- 先创建customers表格
(	
    customer_id int PRIMARY KEY AUTO_INCREMENT,	-- 以下是各列
	first_name  varchar(50) NOT NULL,
	points		int NOT NULL DEFAULT 0,
	email		varchar(255) NOT NULL UNIQUE
);		

DROP TABLE IF EXISTS orders;	-- 创建orders，且定义两表之间的关系
CREATE TABLE orders
( 	
	order_id	int PRIMARY KEY,	-- order_id默认做主键，一旦成为主键则默认非空
	customer_id int NOT NULL,		-- 创建customer_id列
	FOREIGN KEY fk_orders_customers (customer_id)	-- 设置外键
		REFERENCES customers (customer_id)			-- 基于customer_id	
		ON UPDATE CASCADE							-- 当customer_id更新时，跟着更新
		ON DELETE NO ACTION							-- 当customer_id删了时，这边先不删
);	
```

从上面的代码可以看出，主键是本表格内部的列，外键是其他表格中与本表格进行联系的列；

接下来我们看看如何更改主键和外键约束；

### 更改主键和外键约束

代码：

```sql
ALTER TABLE orders
	ADD PRIMARY KEY (order_id),	-- 添加主键
	DROP PRIMARY KEY,			-- 删除主键，主键不需要指定列名，因为主键唯一
	DROP FOREIGN KEY fk_orders_customers,	-- 删除外键，要指定列名，外键不唯一
	ADD FOREIGN KEY fk_orders_customers (customer_id)	-- 添加外键....
		REFERENCES customers (customer_id)
		ON UPDATE CASCADE
		ON DELETE NO ACTION;
```

以上就是对主键外键的更改方式；

### 字符集和排序规则(Character Sets and Collactions)

通过`SHOW CHARSET`可以展示MySQL所有支持的字符集，以及一系列的排序规则，以及存储每个字符时候的字节长度；

之所以对这部分的内容需要了解，是因为MySQL中包括了很多支持的字符集，但是在我们实际的工作当中，我们并不需要支持那么多地区的字符，因此可以通过自定义选择的方式去按需调整，从而减少空间占用；

- 更改数据库级别的字符集需要通过SQL语言；
- 只通过鼠标我们只能支持到表格或者列级别的字符集；

通过SQL语言：

```sql
CREATE DATABASE db_name
	CHARACTER SET latin1;	-- 创建db_name数据库，且字符集为latin1

-- --------------------------
ALTER DATABASE db_name
	CHARACTER SET latin1;	-- 更改db_name数据库字符集为latin1
	
-- 对于表格，对于列，同理，只需要在后面加上character set即可
```

### 存储引擎(Storage Engines)

在MySQL中存在主要介绍存储引擎：

- **MyISAM：**在MySQL 5.5版本以前很流行的一个存储引擎；
- **InnoDB：**现今MySQL版本中默认的存储引擎；

```sql
ALTER TABLE customers
ENGINE = InnoDB		-- 更改customers表格引擎为InnoDB
```

***Notes：***更改一张表的存储引擎可能会花很大功夫，因为在生产环境中要谨慎处理；

### 创建表复制

将一张表的内容复制到另一张表，核心命令：

```sql
CREATE TABLE orders_archived AS		-- 快速创建一张表，orders_archived代表新建的表名
SELECT * 
FROM orders
WHERE order_date < '2019-01-01'
```

这样就会将orders中符合要求的内容复制到orders_archived中，但是有一个细节：

- 该复制操作并不会复制键属性，即会忽略键属性；

```sql
-- 创建部分记录的复制
USE sql_invoicing;

CREATE TABLE invoices_archived AS
SELECT
	i.invoice_id,
	i.number,
	c.name as client,
	i.invoice_total,
	i.payment_total,
	i.invoice_date,
	i.payment_date,
	i.due_date 
FROM invoices i 
JOIN clients c
	USING (client_id)
WHERE payment_date IS NOT NULL 
```

以上将两张表的内容做拼接并基于这些内容创建新的invoices_archived表格；

## DCL语句

DCL是**数据控制语言(Data Control Language)**的缩写，用来控制数据库对象访问权限的语言，主要包括授权、回收权限和修改密码等操作；DCL可以保证数据库的安全性，防止未经授权的人员访问敏感数据，同时也可以控制用户对数据的访问权限和修改权限。

### 用户的创建、查询、删除

**用户创建**

```sql
CREATE USER Ping IDENTIFIED BY '1234';	-- 创建一个用户Ping，密码是1234
CREATE USER Ping@127.0.0.1 IDENTIFIED BY '1234';	-- 创建一个用户Ping，只有本机可访问，密码是1234
CREATE USER Ping@localhost IDENTIFIED BY '1234';	-- 创建一个用户Ping，只有本机可访问，密码是1234
CREATE USER Ping@"baidu.com" IDENTIFIED BY '1234';	-- 创建一个用户Ping，只有该域名下的计算机可连接，密码是1234
```

不能远程连接并以根用户登录；

```sql
-- 数据库用户登录
mysql -u root -p -- mysql代表客户端命令，'-u'后跟数据库用户，'-p'表示需要输入密码。
```

**查看用户**

```sql
SELECT * FROM mysql.user;	-- 列出用户
```

**删除用户**

```sql
DROP USER Ping@baidu.com;	-- 删除这个用户
```

**用户密码的修改**

```sql
SET PASSWORD FOR Ping = '1234';	-- 用Ping设置一个新密码
SET PASSWORD = '1234';			-- 给自个儿设置一个新密码
```

### 权限的授予、查看、撤销

**权限的授予**

```sql
-- 针对APP，让APP仅仅可在数据库中读写数据
CREATE USER moon_app IDENTIFIED BY '1234';	-- 授予APP用户密码
GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE;	-- 授予选择、插入、更新和删除数据以及执行存储过程的权限
ON sql_store.customers	-- 指定表
TO moon_app;
-- 针对管理员的权限
GRANT ALL
ON *.*
TO Ping;	-- 授予Ping最高权限
```

**权限的查看**

```sql
SHOW GRANTS FOR Ping;	-- 查询给予Ping的权限
SHOW GRANTS;	-- 查询当前用户的权限
```

**权限的撤销**

```sql
REVOKE CREATE VIEW
ON sql_store.*
FROM moon_app;	-- 撤销moon_app用户的创建视图的权限
```



  ```sql
  EXPLAIN SELECT customer_id FROM customers c WHERE c.state = 'CA';	-- EXPLAIN关键字会展示SQL查询的过程
  
  CREATE INDEX idx_state ON customers (state);	-- 通过该索引去查找，看看是否有优化					
  ```

- **查看索引**

  指令：`SHOW indexes IN orders;		-- 展示索引`

  索引类型：

  - 主键，也称为"聚集索引"；

  - 二级索引，<font color=red>MySQL也会自动将id或主键列纳入到二级索引中；(没懂)</font>

接下来针对**各类索引**进行详细介绍：

#### 前缀索引(Prefix Indexes)

为字符串列建立索引：

```sql
CREATE INDEX IF NOT EXISTS idx_lastname ON customers (last_name(20));

SELECT
	count(DISTINCT LEFT(last_name, 1)),	-- 取前面1个字符
	count(DISTINCT LEFT(last_name, 5)),	-- 取前面5个字符
	count(DISTINCT LEFT(last_name, 10))	-- 取前面10个字符
FROM customers;
```

我们的目标是最大化索引中唯一值的数量，即，选定一个索引，我们可以尽可能多的确定这个索引中要包含的数量：

- 如果索引值能包含的范围越小，那我们所需要的索引就也越多，需要的空间就越大，对索引的查找就越多；

#### 全文索引(Full-text Indexes)

全文索引可以让我们在应用程序中制作快速灵活的搜索引擎，像上述的前缀索引最好用于像"名字" 和 "地址"这样较短的字符串列；

全文索引包含整个字符串列，而不仅仅是存储前缀，即本质上存储了一个单词列表，对于每个单词又存储了一列这个单词会出现的行或记录；

```sql
-- 假设我们建立了一个博客网站，需要进行搜索，常规方案：
USE sql_blog;
SELECT *
FROM posts p 
WHERE title LIKE '%react redux%' OR
	body LIKE '%react redux%';
	
-- 如果考虑使用前缀索引，前缀索引的特点就是只能控制到前缀，我们无法处理右边的字符
-- 此外仅仅返回这两个单词顺序排列的关键词的文章
```

<font color=red>全文搜索不在乎顺序</font>，只要有我们所需包含的单词就会返回相关结果；

全文搜索有两种模式：自然语言模式以及布尔模式：

```sql
-- 自然语言模式
CREATE FULLTEXT INDEX IF NOT EXISTS idx_title_body ON posts (title, body);

SELECT *, MATCH(title, body) against('react redux')
FROM posts
WHERE MATCH(title, body) against('react redux');	-- MATCH以及AGAINST都是SQL内置函数，其中MATCH部分必须以创建的索引列相匹配

-- 布尔模式
CREATE FULLTEXT INDEX IF NOT EXISTS idx_title_body ON posts (title, body);

SELECT *, MATCH(title, body) against('react redux')
FROM posts
WHERE MATCH(title, body) against('react - redux' IN boolean mode);	-- 布尔模式，包含react但又排除redux，还可以
WHERE MATCH(title, body) against('react - redux + form' IN boolean mode);	-- 再加上form单词
WHERE MATCH(title, body) against('"handling a form"' IN boolean mode);		-- 返回准确包含该短语的文章
```

#### 复合索引(Composite Indexes)

复合索引，就是对多列建立索引，从而减少索引空间的占用并且可以加快查询的速度；

```sql
USE sql_store;
CREATE INDEX idx_state_points ON customers (state, points);		-- 添加复合索引(即同时为两列建立索引)
EXPLAIN SELECT customer_id FROM customers
WHERE state = 'CA' AND points > 1000;
```

复合索引在优化查询方面做得最好；因为一个查询可以有多个筛选器；

索引可以对数据进行排序，如果某个索引中存在多列，那么数据排序也会加快；

复合索引建议在4~6列之间，可以达到很好的性能，但这部分的信息并不是一定的，需要立足于实际环境；

**复合索引中的列顺序**

遵循几条原则：

- 先对列进行排序，让更频繁使用的列排在最前面；
  - 因为更频繁使用，所以出现的概率更大，先查询概率更高的；
- 把基数更高的列排在最前面；
  - 基数表示索引中唯一值的数量；
  - 基数越高，该列的区分度就越高，更容易区分出不同的行；

但需要注意的是，这些原则并不是绝对的，对于每个情况，<font color=red>需要具体情况具体分析来确定最佳的索引策略</font>。

```sql
EXPLAIN SELECT customer_id
FROM customers
WHERE state = 'CA' AND last_name LIKE 'A%';

DROP INDEX idx_lastname_state ON customers;
CREATE INDEX idx_lastname_state ON customers
(last_name, state);
```

以上面的例子来看，单论基数，是`last_name`更多，按照上面的准则，我们应该把`last_name`放前面，但是考虑到在`where`中：

- state使用了`=`号，这个约束性更强，相比`last_name`部分要处理一个范围，显然会效率会更高，因此<font color=red>原则上需要根据实际情况灵活变通</font>；

### 索引无效的处理

首先需要明确的一个细节，你有一张表，有1000行，你的主键有1000个，但是对表的查询与对主键的查询是完全不一样的，主键本身可以作为索引，在内存中查询；但表格得读取磁盘，所以时间效率上肯定不一样；

```sql
EXPLAIN SELECT customer_id FROM customers
WHERE state = 'CA' OR points > 1000;	-- 仍然要读取1000个主键(即便主键已作为聚集索引放入内存)
```

这种情况下就需要重写查询，以尽可能最好的方式利用索引；

```sql
-- 假设已有复合索引idx_state_lastname
CREATE INDEX idx_points ON customers (points);	-- 为points新建的索引
EXPLAIN 
	SELECT customer_id FROM customers
	WHERE state = 'CA'	-- 根据复合索引来查询，很快
    UNION
    SELECT customer_id FROM customers
    WHERE points > 1000;	-- 这边仅仅查points，已有的复合索引用处不大，因此要考虑新建索引
-- 经过上述处理，就能得到显著提升
```

此外，也建议在查询时把列单独提出来，这样查询效率更高，更高效利用到索引

```sql
SELECT customer_id FROM customers
WHERE points + 10 > 2020;	-- 并未为(points + 10)建立索引，因此仍然是扫描全表
WHERE points > 2000;		-- 提高效率
```

### 使用索引排序

不存在索引时，MySQL会扫描全表进行排序，耗时，因此在排序时要遵循以下几点原则：

- ORDER BY子句中的列的顺序，应该与索引中列的顺序相同(<font color=red>我想，是针对复合索引吧</font>)；
  - 顺序反了，创建的索引就没什么意义了；
- 多列中排序的顺序应该一致；
  - 列1如果设定是逆序排序，那么列2也要逆序排序；
  - 否则索引又没用上；
- 不要按一个索引中的第2列或者3列...排序，因为在索引中，会先依据索引的第一列来排序；
  - 仅仅按第2列排序，那么MySQL则无法利用第一列排好的序，同时第2列的序列也不是我们想要的序列；

### 覆盖索引

**定义：**一个包含所有满足查询需要的数据的索引；

通过**覆盖索引**，MySQL可以在不读取表的情况下就执行查询；

### 索引维护

索引极大的方便了我们的查询，但是我们也需要注意到：

- **重复索引：**同一组列上且顺序一致的索引；
  - MySQL允许重复索引，因此我们需要自行考虑到这个问题；
  - 因此在创建新索引之前记得检查现有索引；
- **多余索引：**比较抽象，举例说明：比如我们有一个复合索引(A, B)，但我们又创建了一个索引(A)，此即多余索引，(B)、(B, A)不算；
  - 同样在创建新索引之前记得检查现有索引；
