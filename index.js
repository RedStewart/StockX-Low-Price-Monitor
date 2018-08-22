const request = require('request');
const cheerio = require('cheerio');
const path = require('path');
const urlArr = [];
const initShoeArr = [];
const compareShoeArr = [];
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

for (x = 0; x < config.shoeURL.length; x++) {
    urlArr.push(config.shoeURL[x]);
    //console.log(urlArr[x]);
}


function requestURL(url, index) {
    console.log(time + " Sending request...");
    request("https://stockx.com/" + url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var price, size;
            const shoeArr = [];
            const priceArr = [];
            const sizeArr = [];

            var $ = cheerio.load(body);
            console.log("Scraping " + $('h1').text());

            //prices
            $('div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.subtitle').each((i, el) => {
                price = $(el).text();
                if(price.startsWith("$")){
                    priceTest = price.substr(1);
                    priceArr.push(parseInt(priceTest));
                }
                else
                    priceArr.push(price);
            });
            //size
            $('div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.title').each((i, el) => {
                size = $(el).text();
                sizeArr.push(size);
            });
            
            shoeArr.push(sizeArr, priceArr);
            
            //add shoe data to respective array from index given (temporary until better fix)
            if(index == 1)
                initShoeArr.push(shoeArr);
            else
                compareShoeArr.push(shoeArr);
        }
        else {
            console.log("[ERROR] " + error);
        }
    })    
}



//main
function main() {
    for (x = 0; x < urlArr.length; x++) {
        var test = requestURL(urlArr[x], 1);
    }   
    
    //have to make timeout as request is async (temporary until better fix)
    setTimeout(function () {
        //console.log(initShoeArr);

        for(i = 0; i < initShoeArr[0][0].length; i++){
            console.log(initShoeArr[0][0][i]);
            console.log(initShoeArr[0][1][i]);
        }        
    }, 5000);
}

main();