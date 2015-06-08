'use strict';

var url      = require('url'),
    request  = require('superagent'),
    cheerio  = require('cheerio');


function httpGet(url, callback){
    request.get(url).end(callback);
}

function trimString(str){
    str = str || '';
    return str.trim();
}

var baseUrl      = 'http://www.amazon.com/dp/',
    corsProxyUrl = 'http://crossorigin.me/';

var isBrowser = typeof 'window' !== void(0);

function queryAmazon(id, options, callback){
    if (arguments.length === 2 && typeof options === 'function') {
        callback = options;
        options = {};
    }

    options = options || {};

    var productDetails, 
        productImages;

    var queryUrl = url.resolve(baseUrl, id);

    if (isBrowser || options.useCorsProxy)
        queryUrl = corsProxyUrl + queryUrl;

    function queryCb(err, resp){
        if (err) {
            callback(err, resp);
            return;
        }

        var html = resp.text;

        var matches = html.match(/\[{"mainUrl":.*?}\]/);
        if (matches && matches[0])
            productImages = JSON.parse(matches[0]);

        var $ = cheerio.load(html),
            $props = $('#productDetailsTable .content ul > li > b');
        
        var title  = $('#productTitle').text(),
            author = $('.author .contributorNameID').text();

        productDetails = [{
            name: 'Title',
            value: title
        },{
            name: 'Author',
            value: author
        }];

        $props.each(function(){
            var b = this;

            var name  = trimString($(b).text()).replace(/:$/, ''),
                value = '';

            var el = b.next;
            while (el) {
                if (el.data)
                    value += trimString(el.data);
                else if (el.name === 'a' || el.name === 'span')
                    value += trimString($(el).text());

                el = el.next;
            }

            productDetails.push({
                name: name,
                value: value
            });

        });

        var result = {
            properties: productDetails,
            images: productImages
        };

        callback(null, result);
    }

    httpGet(queryUrl, queryCb);
}

module.exports = queryAmazon;