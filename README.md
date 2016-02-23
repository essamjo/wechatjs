# wechatjs
项目包括：
- 验证token的demo
- 获取config的demo

##验证token的实施步骤
### 1. meteor新建项目
以jhwx为例
![新建项目](http://7xr0mq.com1.z0.glb.clouddn.com/20160218_step1.png)

### 2. 整理文件夹，编写代码
#### 1.删除meteor生成 的，html、css、js 文件。建立文件夹如图
![整理文件夹](http://7xr0mq.com1.z0.glb.clouddn.com/20160218_step2.png)

为什么这样？参考了官方推荐的第二种文件组织方法。[相关参考:Organizing Your Project](http://docs.meteor.com/#/full/structuringyourapp)
#### 2.把加密sha算法文件在server文件夹里
在微信jssdk说明文档里下载官方的[示例代码](http://demo.open.weixin.qq.com/jssdk/sample.zip) ，解压里面的文件,在node\node_modules\jssha\src 文件家里，找到sha.js 。将其放到项目的server文件夹下。

#### 3.在server文件夹内新建main.js，代码如下
```
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
  oriArray[2] = "cbb201512281359tiyanhao";//这里是你在微信开发者中心页面里填的token
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
```
### 3. 部署发布
运行命令
> meteor deploy jhwx.meteor.com

ps: 有时候会很慢，不容易成功。翻墙是最好的选择。

### 3. 在公众号后台设置接口配置信息
已测试号为例
![设置接口配置信息](http://7xr0mq.com1.z0.glb.clouddn.com/20160218_step4.png)
<font color=red>token的值与上面代码oriArray[2]的值要一样 </font>
点击提交，多试几下，有可能是网络太慢导致无法配置成功。

##鸣谢
1. 隐约雷鸣 的[NodeJS验证微信开发平台的token](https://segmentfault.com/a/1190000003012131)
2. NoGrief 的[（一）验证微信公众平台](http://blog.csdn.net/nogrief/article/details/9774773)