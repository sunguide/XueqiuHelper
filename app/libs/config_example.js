var configs = {
    site:"雷锋网",
    domains: ["leiphone.com"],
    scanUrls: ["http://www.leiphone.com"],
    //
    contentUrlRegexes: ["http://www\\.leiphone\\.com/news/\\d+/.+\\.html"],
    helperUrlRegexes: ["http://www\\.leiphone\\.com/search\\?s=%E5%B1%B1%E5%AF%A8%E6%89%8B%E6%9C%BA&site=article(&page=\\d+)?"],
    //

    contentUrlSelector:[".box h3 a"], //从抓取页面里匹配url
    pageUrlRegexes: ["http://www\\.leiphone\\.com/search\\?s=%E5%B1%B1%E5%AF%A8%E6%89%8B%E6%9C%BA&site=article(&page=\\d+)?"],
    pageUrlRules: ["http://www.leiphone.com/site/AjaxLoad/page/[1-2000]"],

    enableProxy: true,
    interval: 2000,
    timeout:30000,

    selector:"CSS",//选择器类型
    fields: [
        {
            // 抽取内容页的文章标题
            name: "article_title",
            selector: ".article-title h1",
            required: true
        },
        {
            // 抽取内容页的文章内容
            name: "article_content",
            selector: ".lph-article-comView",
            required: true
        },
        {
            // 抽取内容页的文章发布日期
            name: "article_publish_time",
            selector: ".article-title .time",
            required: true
        },
        {
            // 抽取内容页的文章作者
            name: "article_author",
            selector: ".article-title .aut a",
            default:"dsfsdf",
            required: true,
            repeated: true
        },
        {
            // 原网站
            name: "source",
            value: "雷锋网"
        }
    ],
//    selector:"XPath",
//    fields: [
//        {
//            // 抽取内容页的文章标题
//            name: "article_title",
//            selector: "//div[contains(@class,'pageTop')]/h1",
//            required: true
//        },
//        {
//            // 抽取内容页的文章内容
//            name: "article_content",
//            selector: "//div[contains(@class,'pageCont')]",
//            required: true
//        },
//        {
//            // 抽取内容页的文章发布日期
//            name: "article_publish_time",
//            selector: "//div[contains(@class,'pi-author')]/span[1]",
//            required: true
//        },
//        {
//            // 抽取内容页的文章作者
//            name: "article_author",
//            selector: "//div[contains(@class,'pi-author')]/a/text()",
//            required: true
//        }
//    ]
    imageUrlSelector:"",
    crawlType:'full',//incr,full
    webhook:["http://api.wolfunds.com/post?token=dfsdfds"]
};

//废弃
configs.onProcessScanPage = function(page, content, site) {
    var categorys=extractList(content, "//li[@data-node=\"category\"]");
    for(var i = 0; i < categorys.length; i++)
    {
        var category=categorys[i];
        category=exclude(category, "//a/span");
        var text1=extract(category, "//a/text()");
        var inputcategorys=keyword.split(",");
     for (var j = 0; j < inputcategorys.length; j++) {
          var querykey=inputcategorys[j];
          if(text1.indexOf(querykey)>-1)
          {
             var new_url =extract(category, "//a/@href");
             site.addUrl(new_url);
        	 }
     }
    }

    if(keyword.indexOf("社会")>-1)
    {
        return true;
    }
    return false;
};

//处理分页内容
configs.onProcessPageContent = function(content) {
    try{
        content = JSON.parse(content);
    }catch(e){
        console.log(e);
        content = false;
    }
    if(content){
        return content['html'];
    }
    return false;
}
configs.onProcessHelperUrl = function(url, content, site) {
    var urls = extractList(content, "//div[@class='tit']/a[not(contains(@class,'shop-branch'))]/@href");
    for (var i = 0; i < urls.length; i++) {
        site.addUrl(urls[i]+"/editmember");
    }
    var nextPage = extract(content,"//div[@class='page']/a[@class='next']/@href");
    if (nextPage) {
        site.addUrl(nextPage);
        var result = /\d+$/.exec(nextPage);
        if (result) {
            var data = result[0];
            var count = nextPage.length-data.length;
            var lll = nextPage.substr(0, count)+(parseInt(data)+1);
            site.addUrl(nextPage.substr(0, count)+(parseInt(data)+1));
            site.addUrl(nextPage.substr(0, count)+(parseInt(data)+2));
        }
    }
    return false;
}

//加载分页

//configs.nextPageUrl = function(url, content, site) {
//    var urls = extractList(content, "//div[@class='tit']/a[not(contains(@class,'shop-branch'))]/@href");
//    for (var i = 0; i < urls.length; i++) {
//        site.addUrl(urls[i]+"/editmember");
//    }
//    var nextPage = extract(content,"//div[@class='page']/a[@class='next']/@href");
//    if (nextPage) {
//        site.addUrl(nextPage);
//        var result = /\d+$/.exec(nextPage);
//        if (result) {
//            var data = result[0];
//            var count = nextPage.length-data.length;
//            var lll = nextPage.substr(0, count)+(parseInt(data)+1);
//            site.addUrl(nextPage.substr(0, count)+(parseInt(data)+1));
//            site.addUrl(nextPage.substr(0, count)+(parseInt(data)+2));
//        }
//    }
//    return false;
//}


// afterExtractField回调函数：将爬取到的时间转换为时间戳，以便发布数据时用
configs.afterExtractField = function(fieldName, data, page) {
    if (fieldName == "article_publish_time") {
        var timestamp = Date.parse(data);
        return isNaN(timestamp) ? "0" : timestamp/1000 + "";
    }
    return data;
};
configs.nextScanUrl = function(url) {
    var num = /\/(\d+)\//.exec(url);
    if (num && num[1] < 2323) {
      num[1]++;
      return "http://www.dianping.com/search/keyword/"+num[1]+"/0_"+keywords;
    }
    else {
      return null;
    }
}

exports.config  = configs;
