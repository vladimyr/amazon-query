'use strict';

var queryAmazon = require('./index.js'),
    argv        = require('yargs').argv;

var bookId = argv._[0] + '';

queryAmazon(bookId, function complete(err, data){
    console.log(JSON.stringify(data, null, 2));
});