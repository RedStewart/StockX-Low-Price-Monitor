const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const priceArr = [];
const sizeArr = [];
const urlArr = [];

const config = require(path.join(__dirname, 'config.json'));

var today = new Date(),
h = checkTime(today.getHours()),
m = checkTime(today.getMinutes()),
s = checkTime(today.getSeconds());
ms = checkTime(today.getMilliseconds());
var time = "[" + h + ":" + m + ":" + s + ":" + ms + "]";

function checkTime(i) {
  return (i < 10) ? "0" + i : i;
}

for(x = 0; x < config.shoeURL.length; x++){
  urlArr.push(config.shoeURL[x]);
  console.log(urlArr[x]);
}


function requestURL(url) {
  console.log(time + " Sending request...");
  request("https://stockx.com/" + url, function (error, response, body){
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(body);
      var title = $('h1').text();

      console.log(title);
      
      //prices
      $('div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.subtitle').each((i, el) => {
        
        price = $(el).text();
        priceArr.push(price);
      });
      //size
      $('div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.title').each((i, el) => {
        size = $(el).text();
        sizeArr.push(size);
      });  

      for(var i = 0; i < sizeArr.length; i++){
        console.log(sizeArr[i]);
        console.log(priceArr[i]);
      }    
    }
    else{
      console.log("[ERROR] " + error);
    }
  })
}

for(x = 0; x < urlArr.length; x++){
  requestURL(urlArr[x]);
}


function askPrice(size, price){
  this.size = size;
  this.price = price;
}
