/**
 * 
 * @authors Zhou Guanqing (essamjo@163.com)
 * @date    2016-01-28 13:21:45
 * @version $Id$
 */
//添加appid 和 appsecret
var appId="wx7257908b33bb4d1a";
var appSecret="bfcc02065eba179a7fefe6ff1e85621a";


//生成签名随机串
var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

//生成时间戳
var createTimestamp = function () {
  return parseInt(new Date().getTime()/1000)
};

//转化为字符串
var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

//http:get 请求

var httpGet = function(url){
	var response = Meteor.http.get( url );
	if ( response.statusCode === 200 ) {
	  	//console.log(response.data);
	    return response.data; // { access_token, expires_in }
	} else {
	    return undefined;
	}
};

// 获取access_token
var getAccessToken = function(){
	
	var dbdate=WXtokenCollection.findOne();
	var nowtime=parseInt(new Date().getTime()/1000); //时间戳
	if(dbdate.expire_time < nowtime){
		var url='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appId+'&secret='+appSecret;
		var res=httpGet(url);
		var access_token=res.access_token;
		if(access_token){
			dbdate.access_token=res.access_token;
			dbdate.expire_time=nowtime+7000; //+7000秒
			//WXtockenCollection.upsert(dbdate);
			WXtokenCollection.upsert({_id:dbdate._id},{
				$set:{
					access_token:dbdate.access_token,
					expire_time:dbdate.expire_time
				}
			},(error) => {
				if(error){
					console.log('更新tocken不成功！')
				}
				else{
					console.log('更新tocken成功！')
				}
			})
		}else{
			WXtokenCollection.upsert({_id:dbdate._id},{
				$set:{
					jsapi_ticket:'i can not get the token',
					expire_time:0
				}
			},(error) => {
				if(error){
					console.log('获取不到get更新tocken不成功！')
				}
				else{
					console.log('获取不到get更新tocken成功！')
				}
			})
		}
	} else{
		access_token=dbdate.access_token;
	}
	return access_token;
};



// 获取jsapi_ticket
var getJsApiTicket = function(){
	
	var dbdate=WXticketCollection.findOne();
	var nowtime=parseInt(new Date().getTime()/1000); //时间戳
	var tokenstr=getAccessToken();
	if(dbdate.expire_time < nowtime){
		var url='https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+tokenstr+'&type=jsapi';
		var res=httpGet(url);
		var jsapi_ticket=res.ticket;	
		if(jsapi_ticket){
			dbdate.jsapi_ticket=jsapi_ticket;
			dbdate.expire_time=nowtime+7000; //+7000秒
			//WXticketCollection.upsert(dbdate);
			WXticketCollection.upsert({_id:dbdate._id},{
				$set:{
					jsapi_ticket:dbdate.jsapi_ticket,
					expire_time:dbdate.expire_time
				}
			},(error) => {
				if(error){
					console.log('更新JsApiTicket不成功！')
				}
				else{
					console.log('更新JsApiTicket成功！')
				}
			})
		}else{
			WXticketCollection.upsert({_id:dbdate._id},{
				$set:{
					jsapi_ticket:'i can not get the ticket',
					expire_time:0
				}
			},(error) => {
				if(error){
					console.log('获取不到get更新JsApiTicket不成功！')
				}
				else{
					console.log('获取不到get更新JsApiTicket成功！')
				}
			})
		}
	} else{
		jsapi_ticket=dbdate.jsapi_ticket;
	}
	return jsapi_ticket;
};



Meteor.publish("wxticket", function () {
	return WXticketCollection.find();
});
Meteor.publish("wxtoken",function(){
	return WXtokenCollection.find();
});


//Meteor加载完所有文件后将执行这个方法。具体使用请参考官方文档，比较简单。
Meteor.startup(function(){
	//jsapi_ticket 应该全局存储与更新 ,保存在mongoDB
	if(WXticketCollection.find().count() === 0 ){
		WXticketCollection.insert({jsapi_ticket:'abc',expire_time:0});
	}
	// access_token 应该全局存储与更新 ,保存在mongoDB
	if(WXtokenCollection.find().count() === 0 ){
		WXtokenCollection.insert({access_token:'abc',expire_time:0});
	}
	// getAccessToken();
	// getJsApiTicket();
	
});

/**
* @synopsis 签名算法 
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
Meteor.methods({
	sign: function (url) {
	  	var apiticket=getJsApiTicket();
	  	//console.log(apiticket);
	  	var ret = {
		    jsapi_ticket: apiticket,
		    nonceStr: createNonceStr(),
		    timestamp: createTimestamp(),
		    url: url
		  };
		  var string1 = raw(ret);
		      shaObj = new jsSHA(string1, 'TEXT');
		      ret.signature = shaObj.getHash('SHA-1', 'HEX');
		return ret;
	}

});


// Listen to incoming HTTP requests, can only be used on the server
WebApp.connectHandlers.use("/validateToken", function(req, res, next) {

  var query = req.query;
  //console.log("*** URL:" + req.url);
  //console.log(query);
  var signature = query.signature;
  var echostr = query.echostr;
  var timestamp = query['timestamp'];
  var nonce = query.nonce;
  var oriArray = new Array();
  oriArray[0] = nonce;
  oriArray[1] = timestamp;
  oriArray[2] = "cbb201512281359tiyanhao";//这里是你在微信开发者中心页面里填的token，而不是****
  oriArray.sort();
  var original = oriArray.join('');
  console.log("Original str : " + original);
  console.log("Signature : " + signature );
  //var scyptoString = sha1(original);

  var shaObj2 = new jsSHA(original, 'TEXT');
  scyptoString = shaObj2.getHash('SHA-1', 'HEX');
  if(signature == scyptoString){
    res.end(echostr);
    console.log("Confirm and send echo back");
  }else {
    res.end("false");
    console.log("Failed!");
  }
});