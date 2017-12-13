'use strict';
const fs = require("fs");
const http = require("http");
const path = require("path");
const Promise = require('bluebird');
const crypt = require("./crypt");

let Log = require('winston');
const Downloader = require("./downloader");
const Extractor = require("./extractor");

//常量
const crawled_collection_name = "crawled_hub";
const attach_collection_name = "attach_hub";
const upload_dir = "./attachments/";
const downloader = new Downloader();
class crawler {
    constructor(config) {
        this.config(config);
    }

    config(config){
        this._config = config || {};
        this._nextPageUrl = "";
        //分页游标
        this._cursor = 0;
        this._maxPage = 0;
        this._basePageUrl = "";
        this._crawled_urls = [];
        this._pageUrlRules = {};

        //默认抓取时间间隔
        this._interval = 0;
        this._timeout = 30000;
        this._enableProxy = false;


        if(typeof this._config.interval === 'undefined'){
            this._config.interval = this.interval;
        }

        if(typeof this._config.timeout === 'undefined'){
            this._config.timeout = this.timeout;
        }
    }

    init(){

        if(isNaN(this._config.afterExtractField)){

        }
    }

    filter(){

    }
    async start(){
        let config = this._config;
        this.init();

        //beforeCrawl
        if(typeof config.beforeCrawl === 'function'){
            config.beforeCrawl();
        }

        let pageUrls = await this.getPageUrls();
        console.log(pageUrls);

    }
    async getPageUrls(){
      let config = this._config;
      let self = this;
      console.log(config);
      //根据分页规则抓取
      if(config.pageUrlRules && config.pageUrlRules.length > 0){
          let nextPageUrl = "";
          console.log(config.pageUrlRules);
          for(let i = 0; i < config.pageUrlRules.length; i++){
              console.log("page urls");
              if(!config.interval){
                  let crawlInterval = setInterval(function(){
                      nextPageUrl = self.getNextPageUrl(config.pageUrlRules[i]);
                  }, config.interval);

              }else{
                  this.doProcessContentUrls(config.pageUrlRules[i]);
              }
          }
          config.pageUrlRules.forEach((pageUrlRule,index) => {

          });
      }
      //根据指定URL,全站扫描 todo
      if(config.scanUrls && config.scanUrls.length > 0){

      }
    }
    //获取分页中的内容urls
    async getContentUrls(pageUrl){
        let config = this._config;
        let res = await downloader.get(pageUrl);
        let pageContent = res.text;

        let urls = [];
        //通过选择器匹配URL
        if(config.contentUrlSelector){
            //css默认选择器
            if(config.onProcessPageContent){
                pageContent = config.onProcessPageContent(pageContent);
            }
            if(config.onProcessPageContentUrl){
                let _urls = config.onProcessPageContentUrl(pageContent);
                if(_urls){
                    urls.concat(_urls);
                }
            }else{
                if(pageContent){
                    let extractor = new Extractor(pageContent);
                    console.log("dddddd:f");
                    for(let i = 0; i < config.contentUrlSelector.length; i++){
                        let urlSelector = config.contentUrlSelector[i];
                        console.log("ddddddddd"+urlSelector)

                        let urlSelectorReuslts = extractor.css(urlSelector);
                        console.log(config.contentUrlSelector);
                        if(urlSelectorReuslts){
                            for(let i = 0; i < urlSelectorReuslts.length;i++){
                                urls.push(urlSelectorReuslts[i]);
                            }
                        }
                    }

                }
            }
        }
        console.log(urls);
        console.log("urls:")
        return urls;
    }

    async doProcessContentUrls(pageUrlRule){
        let nextPageUrl = await this.getNextPageUrl(pageUrlRule);
        if(!nextPageUrl){
            return ;
        }
        let contentUrls = await this.getContentUrls(nextPageUrl);
        console.log(contentUrls);
        //加入到下载队列中
        if(contentUrls){
            for(let i=0;i<contentUrls.length;i++){
                downloader.enqueue({
                    app_id:(config.app_id ? config.app_id : config),
                    url:contentUrls[i]
                });
            }
        }
        await this.doProcessContentUrls(pageUrlRule);
    }

    //获取下一页url
    getNextPageUrl(pageUrlRule){
        //自定义翻页url优先
        if(this._config.nextPageUrls){
            return this._config.nextPageUrls();
        }else if(pageUrlRule){
            //初始化翻页规则
            let pageUrlRuleScheme = this.initPageUrlRule(pageUrlRule);
            //m-n
            if(pageUrlRuleScheme.cursor > this.maxPage){
                return false;
            }
            this.initPageUrlRule(pageUrlRule, ++pageUrlRuleScheme.cursor);
            return pageUrlRuleScheme.base ? pageUrlRuleScheme.base.replace("{%s}", pageUrlRuleScheme.cursor) : false;
        }else{
            return false;
        }
    }



    //add url to queue

    generateCrawlUrls(pageUrl){
        getCrawlUrls(pageUrl).then(function(urls){
           if(urls){
               urls.forEach(function(url,index){
                   let data = {
                       "url":url,
                       "type":"html",
                       "title":"Fetch Html",
                       "config":config
                   };
                   crawlerModel.checkDownload(url,"html").then(function(hasDownload){
                       if(!hasDownload){
                           let job = queue.create('crawl_download', data).removeOnComplete(true).save(function(err){
                               if( !err ) {
                                   Log.info(url+" add queue queue success:" + job.id);
                               }else{
                                   Log.error("add job queue err");
                                   Log.error(err);
                               }
                           });
                       }else{
                           Log.info(data.url+" has enqueued");
                       }
                   });
               });
           }
        });
    }

    getPageUrlRules(){
        return this._config.pageUrlRules ? this._config.pageUrlRules : false;
    }
    //目前只支持，0-1000这样的规则匹配
    //http://www.x.com/article/page/[1-2000].html
    initPageUrlRule(pageUrlRule, cursor){
        let key = crypt.md5(pageUrlRule);
        if(typeof this._pageUrlRules[key] === "undefined"){
          let match = pageUrlRule.match(/\[([0-9,-]+)\]/);
          let basePageUrl = "";
          let cursor = 0;
          let maxPage = 0;
          if(match){
              basePageUrl = pageUrlRule.replace(/\[([0-9,-]+)\]/,"{%s}");
              match = match[1].split("-");
              cursor = match[0];
              maxPage = match[match.length - 1];
          }else{
              basePageUrl = pageUrlRule;
          }
          this._pageUrlRules[key] = {
              base:basePageUrl,
              cursor:cursor,
              maxPage:maxPage
          };
        }
        if(cursor){
            this._pageUrlRules[key].cursor = cursor;
        }
        return this._pageUrlRules[key];
    }

}

module.exports = crawler;
