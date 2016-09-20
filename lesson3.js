/** 2016/9/20 
 *  author: shirley
 *  description: 使用superagent与cheerio完成简单爬虫
 *  目标：当在浏览器中访问 http://localhost:3000/ 时，输出 CNode(https://cnodejs.org/ ) 社区首页的所有帖子标题和链接，以 json 的形式。
 *  知识点：
 *      superagent(http://visionmedia.github.io/superagent/ ) 是个 http 方面的库，可以发起 get 或 post 请求。
 *      cheerio(https://github.com/cheeriojs/cheerio ) 大家可以理解成一个 Node.js 版的 jquery，用来从网页中以 css selector 取数据，使用方式跟 jquery 一样一样的。
 *  记得好好看看 superagent 的 API，它把链式调用的风格玩到了极致。
*/

var express = require('express');
var supergent = require('superagent');
var cheerio = require('cheerio');

var app = express();

app.get('/', function(req, res, next){
	//用superagent去抓取https://cnodejs.org/的内容
	supergent.get('https://cnodejs.org/')
		.end(function(err, sres){
			//常规的错误处理
			if(err){
				return next(err);
			}
			//sres.text里面存储着网页的html内容，将它传给cheerio.load之后
			//就可以得到一个实现了jquery接口的变量，我们习惯性地将它命名为`$`
			//剩下就都是jquery的内容了
			var $ = cheerio.load(sres.text);
			var items = [];
			$('#topic_list .topic_title').each(function(idx, element){
				var $element = $(element);
				items.push({
					title: $element.attr('title'),
					href: $element.attr('href')
				});
			});

			res.send(items);
		});
});

app.listen(8111);