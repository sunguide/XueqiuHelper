'use strict';
const fs = require("fs");
const http = require("http");
const path = require("path");
const Promise = require('bluebird');
const crypt = require("crypt");

let Log = require('winston');

let global_config = require('./config').config;

const Downloader = require("./downloader");
const Extractor = require("./extractor");

//job queue
let kue = require('kue'),
    queue = kue.createQueue();
//常量
const crawled_collection_name = "crawled_hub";
const attach_collection_name = "attach_hub";
const upload_dir = "./attachments/";

class crawler {
    constructor(config) {
        this.config = config;
        this.nextPageUrl = "";
        //分页游标
        this.cursor = 0;
        this.maxPage = 0;
        this.basePageUrl = "";
        this.crawlQuit = false;
        this.crawled_urls = [];

        //默认抓取时间间隔
        this.interval = 0;
        this.timeout = 30000;
        this.enableProxy = false;
    }

    init(){
        if(isNaN(config.afterExtractField)){

        }
    }

    config(config){
        this.config = config;
        if(typeof this.config.interval == 'undefined'){
            this.config.interval = interval;
        }

        if(typeof this.config.timeout == 'undefined'){
            this.config.timeout = timeout;
        }
    }

    filter(){

    }
    start(){
        let config = this.config;
        this.init();

        //beforeCrawl
        if(typeof config.beforeCrawl === 'function'){
            config.beforeCrawl();
        }

        let pageUrls = await this.getPageUrls();


    }
    async getPageUrls(){
      let config = this.config;
      let self = this;
      //根据分页规则抓取
      if(config.pageUrlRules && config.pageUrlRules.length > 0){
          let nextPageUrl = "";
          Promise.map(this.config.pageUrlRules, pageUrlRule => {
              return fs.readFileAsync(fileName).then(JSON.parse).catch(SyntaxError, function(e) {
                  e.fileName = fileName;
                  throw e;
              })
          }, {concurrency: concurrency}).then(function(parsedJSONs) {
              console.log(parsedJSONs);
          }).catch(SyntaxError, function(e) {
              console.log("Invalid JSON in file " + e.fileName + ": " + e.message);
          });
          //old
          config.pageUrlRules.forEach(function(pageUrlRule,index){

              if(config.interval){
                  let crawlInterval = setInterval(function(){
                      nextPageUrl = self.getNextPageUrl(pageUrlRule);
                  }, config.interval);

              }else{
                  while(nextPageUrl = getNextPageUrl(pageUrlRule)){

                  }
              }
          })
      }else
      //根据指定URL,全站扫描 todo
      if(config.scanUrls && config.scanUrls.length > 0){

      }
    }
    //获取分页中的内容urls
    async getContentUrls(pageUrl){
        let pageContent = await Downloader.get(pageUrl);
        let urls = [];
        //通过选择器匹配URL
        if(config.contentUrlSelector){
            //css默认选择器
            let pageContent = res.text;
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
                  config.contentUrlSelector.forEach((urlSelector,index) => {
                      let urlSelectorReuslts = extractor.css(urlSelector);
                      if(urlSelectorReuslts){
                        urlSelectorReuslts.forEach((element, index) => {
                            urls.push(element.text());
                        });
                      }
                  })
              }
            }
        }
        return urls;
    }

    //获取下一页url
    getNextPageUrl(pageUrlRule){
        //自定义翻页url优先
        if(config.nextPageUrls){
            return config.nextPageUrls();
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
                           let job = queue.create('crawl_download', data).removeOnComplete( true).save(function(err){
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
        return this.config.pageUrlRules ?: false;
    }
    //目前只支持，0-1000这样的规则匹配
    //http://www.x.com/article/page/[1-2000].html
    initPageUrlRule(pageUrlRule, cursor){
        let key = crypt.md5((pageUrlRule);
        if(!this.pageUrlRules[key]){
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
          this.pageUrlRules[key] = {
              base:basePageUrl,
              cursor:cursor;
              maxPage:maxPage
          };
        }
        if(cursor){
            this.pageUrlRules[key].cursor = cursor;
        }
        return this.pageUrlRules[key];
    }

}

module.exports = crawler;
