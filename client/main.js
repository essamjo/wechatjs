/**
 * 
 * @authors Zhou Guanqing (essamjo@163.com)
 * @date    2016-01-28 13:30:16
 * @version $Id$
 */



Meteor.subscribe("wxticket");
Meteor.subscribe("wxtoken");

//获取config 参数
var configPram='';
var locationhref=window.location.href;
Meteor.call('sign',locationhref,  function (error, retval) { 
        //console.log(retval); 
        configPram=retval;
        wx.config({
		    debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
		    appId: 'wx7257908b33bb4d1a', // 必填，公众号的唯一标识
		    timestamp: configPram.timestamp, // 必填，生成签名的时间戳
		    nonceStr: configPram.nonceStr, // 必填，生成签名的随机串
		    signature: configPram.signature,// 必填，签名，见附录1
		    jsApiList: ['chooseImage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
		});

 }); 

 Template.ticket.helpers({
    ticket: function () {
      return WXticketCollection.find({});
    },
    ticketcount: function(){
    	return WXticketCollection.find().count();
    },
    token: function(){
    	return WXtokenCollection.find({});
    }
  });


wx.ready(function(){

    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    var images = {
	    localId: [],
	    serverId: []
	  };
	  document.querySelector('#chooseImage').onclick = function () {
	    wx.chooseImage({
	      success: function (res) {
	        images.localId = res.localIds;
	        alert('已选择 ' + res.localIds.length + ' 张图片'); 
	      }
	    });
	  };
});