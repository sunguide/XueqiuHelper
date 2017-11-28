/**
 * Created by sunguide on 16/11/27.
 */

const fs = require("fs");
const http = require("http");
const path = require("path");
const Promise = require('bluebird');
const cheerio = require('cheerio');
const redis = require("redis");
const xpath = require('xpath'), dom = require('xmldom').DOMParser;
const Mongo = require('mongodb');
let Log = require('winston');

let global_config = require('./config').config;

let Downloader = require("./downloader.js");

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


    }
    getPageUrl(){
      let config = this.config;
      //根据分页规则抓取
      if(config.pageUrlRules && config.pageUrlRules.length > 0){
          //new
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
                      nextPageUrl = getNextPageUrl(pageUrlRule);
                      generateCrawlUrls(nextPageUrl);
                      // getCrawlUrls(nextPageUrl)
                      //     .then(function (urls) {
                      //         for (i = 0; i < urls.length; i++) {
                      //             extract(urls[i])
                      //         }
                      //     }).catch(function (err) {
                      //         crawlQuit = true;
                      //         Log.error(err);
                      //         Log.info("quit");
                      //     });

                      if(crawlQuit){
                          clearInterval(crawlInterval);
                          process.exit();
                      }

                  },config.interval)

              }else{
                  while(nextPageUrl = getNextPageUrl(pageUrlRule)){

                      generateCrawlUrls(nextPageUrl);
                      if(crawlQuit){
                          Log.info("exit");
                      }
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
        let Extract = new Extract();
        //通过选择器匹配URL
        if(config.contentUrlSelector){
            let pageContent = res.text;
            if(config.onProcessPageContent){
                pageContent = config.onProcessPageContent(pageContent);
            }
            if(pageContent){
                let $ = cheerio.load(pageContent);
                config.contentUrlSelector.forEach((urlSelector,index) => {
                    Log.info(urlSelector);
                    $(urlSelector).each(function (idx, element) {
                        let $element = $(element);
                        if($element){
                            urls.push($element.attr('href'));
                        }
                    });
                })
            }else{
                reject("can not extract content url");
            }

        }else{
            Log.info(urls);
        }
        Log.info(urls);
        resolve(urls);
    }
});
    }
    //获取下一页
    getNextPageUrl(pageUrlRule){
        //自定义翻页url优先
        if(config.nextPageUrl){
            return config.nextPageUrl();
        }else if(pageUrlRule){
            if(cursor > maxPage){
                cursor = maxPage = 0;
                basePageUrl = "";
                return false;
            }else if(cursor === 0 && maxPage === 0){
                let match = pageUrlRule.match(/\[([0-9,-]+)\]/);
                if(match){
                    basePageUrl = pageUrlRule.substring(0,match['index']);
                    match = match[1].split("-");
                    cursor = match[0];
                    maxPage = match[match.length - 1];
                }else{
                    return false;
                }
            }
            let url = basePageUrl + (cursor++);
            Log.info(url);
            return url;

        }else{
            Log.info('input page url rule');
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


}

module.exports = crawler;
