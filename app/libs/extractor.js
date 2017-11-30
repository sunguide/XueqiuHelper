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
        return this._extract(select);
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
