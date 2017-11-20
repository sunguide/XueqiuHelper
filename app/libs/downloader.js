'use strict';
const request = require('superaget');
class downloader {
    constructor(text,selector) {
        this._text = text;
        this._selector = selector;
        this._extract = null;
        this.init();
    }

    async get(){
        let response = await request.get(url,options);
        return this.processResponse(response);
    }

    async post(){
        let response = await request.post(url,options);
        return this.processResponse(response);
    }

    processResponse(){

    }
}
module.exports = downloader;
