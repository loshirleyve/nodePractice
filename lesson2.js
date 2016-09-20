/**
 * Created by liliu on 2016/9/20.
 * 目标：当在浏览器中访问 http://localhost:3000/?q=shirley 时，输出 shirley 的 md5 值，即 578117797814c9c4c1d62cf39f5d80ca。
 * 挑战：访问 http://localhost:3000/?q=shirley 时，输出 shirley 的 sha1 值
 * 注意：当我们不传入 q 参数时，req.query.q 取到的值是 undefined，utility.md5 直接使用了这个空值，导致下层的 crypto 抛错。
 */

//引入依赖
var express = require('express');
var utility = require('utility');

//建立express实例
var app = express();

app.get('/', function(req, res){
	/**从req.query中取出我们的q参数。
	* 如果是post传来的body数据，则是在req.body里面，不过express默认不处理body中的信息，需要引入 https://github.com/expressjs/body-parser这个中间件才会处理
	*/
	var q = req.query.q;
	/**
	* 调用utility.md5方法，得到md5之后的值
	 * utility的github地址：https://github.com/node-modules/utility
	 * 里面定义了很多常用且比较杂的辅助方法
	*/
	var md5Value = utility.md5(q);
	res.send(md5Value);
});

app.listen(8111, function(req, res){
	console.log('app is runnign at port 8111');
});