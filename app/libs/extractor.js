'use strict';
const cheerio = require('cheerio');
const xpath = require('xpath'), dom = require('xmldom').DOMParser;
class extractor{
    constructor(text,selector) {
        this._text = text;
        this._selector = selector;
        this._extract = null;
        this.init();
    }
    init(){
        switch (this._selector){
            case 'xpath':
                this._extract = new dom().parseFromString(this._text);
                break;
            case 'regex':
                this._extract = this._text;
                break;
            case 'css':
            default:
                this._extract = cheerio.load(this._text);
        }
    }
    xpath(select){
        this.before('xpath');
        return xpath.select(select, this._extract);
    }
    css(select){
        this.before('css');
        //自定义 css选取规则
        //: 为提取符号
        //attr 为提取方式
        //[x,y] 其中 x和y 是提取内容

        let matches = select.match(/:attr\[([a-zA-Z,_-]+)\]/)
        if(matches){
            select = select.split(":attr[")[0];
        }

        let results = this._extract(select);

        let data = [];
        if(results.length > 0){
            if(matches){
                for(let i =0; i< results.length;i++){
                    data[i] = this._extract(results[i]).attr("href");
                }
            }else{
                for(let i =0; i< results.length;i++){
                    data[i] = this._extract(results[i]).text();
                }
            }
        }

        return data;
    }
    regex(pattern){
        this.before('regex');
        return this._extract.match(pattern);
    }
    before(selector){
        if(this._selector !== selector){
            this._selector = selector;
            this.init();
        }
    }
    text(text){
        this._text = text;
        return this;
    }
}
module.exports = extractor;
