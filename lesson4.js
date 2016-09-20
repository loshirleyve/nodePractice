/**
 * Created by liliu on 2016/9/20.
 * 目标：输出CNode(https://cnodejs.org/)社区首页的所有主题的标题，链接和第一条评论，以json的格式。
 * 知识点：1，体会Node.js的callback hell之美；     2，学习使用eventproxy这一利器控制并发
 * 这一章我们来到了Node.js最牛逼的地方——异步并发的内容了
 * 上一课我们介绍了如何使用superagent和cheerio来取主页的内容，那只需要发起一次http get请求就能办到。但这次，我们需要取出每个主题的第一条评论，这就要求我们对每个主题的链接发起请求，并用cheerio去取出其中的第一条评论。
 * 这次要用到三个库：superagent cheerio eventproxy(https://github.com/JacksonTian/eventproxy）
 */

var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
//url模块是Node.js标准库里面的 http://nodejs.org/api/url.html
var url = require('url');

var cnodeUrl = 'https://cnodejs.org/';

superagent.get(cnodeUrl)
	.end(function(err, res){
		if(err){
			return console.error(err);
		}
		var topicUrls = [];
		var $ = cheerio.load(res.text);
		//获取所有的链接
		$('#topic_list .topic_title').each(function(idx, element){
			var $element = $(element);
			/** $element.attr('href')本来的样子是/topic/542acd7d5d28233425538b04
			 * 我们用url.resolve来自动推断出完整url,变成 https://cnodejs.org/topic/542acd7d5d28233425538b04
			 * 具体请看 http://nodejs.org/api/url.html#url_url_resolve_from_to 的示例
			*/
			var href = url.resolve(cnodeUrl, $element.attr('href'));
			topicUrls.push(href);
		});
		console.log(topicUrls);
		printComments(topicUrls);
	});

/**
* 介绍一下 eventproxy 这个库。
 用 js 写过异步的同学应该都知道，如果你要并发异步获取两三个地址的数据，并且要在获取到数据之后，对这些数据一起进行利用的话，常规的写法是自己维护一个计数器。
 先定义一个 var count = 0，然后每次抓取成功以后，就 count++。如果你是要抓取三个源的数据，由于你根本不知道这些异步操作到底谁先完成，那么每次当抓取成功的时候，就判断一下 count === 3。当值为真时，使用另一个函数继续完成操作。
 而 eventproxy 就起到了这个计数器的作用，它来帮你管理到底这些异步操作是否完成，完成之后，它会自动调用你提供的处理函数，并将抓取到的数据当参数传过来。

 eventproxy 提供了不少其他场景所需的 API(https://github.com/JacksonTian/eventproxy#%E9%87%8D%E5%A4%8D%E5%BC%82%E6%AD%A5%E5%8D%8F%E4%BD%9C)，但最最常用的用法就是这种，即：
 先 var ep = new eventproxy(); 得到一个 eventproxy 实例。
 告诉它你要监听哪些事件，并给它一个回调函数。ep.all('event1', 'event2', function (result1, result2) {})。
 在适当的时候 ep.emit('event_name', eventData)。
*/

function printComments(topicUrls){
//得到 topicUrls 之后

//得到一个 eventproxy 的实例
	var ep = new eventproxy();

//命令 ep 重复监听 topicUrls.length 次（在这里也就是40次）`topic_html` 事件再行动
	ep.after('topic_html', topicUrls.length, function(topics){
		// topics 是个数组，包含了 40 次 ep.emit('topic_html', pair） 中的那 40 个 pair
		topics = topics.map(function(topicPair){
			var topicUrl = topicPair[0];
			var topicHtml = topicPair[1];
			var $ = cheerio.load(topicHtml);
			return ({
				title: $('.topic_full_title').text().trim(),
				href: topicUrl,
				comment1: $('.reply_content').eq(0).text().trim()
			});
		});

		console.log('final:');
		console.log(topics);
	});

	topicUrls.forEach(function (topicUrl){
		superagent.get(topicUrl)
			.end(function(err, res){
				console.log('fetch ' + topicUrl + ' successful');
				ep.emit('topic_html', [topicUrl, res.text]);
			});
	});
}
