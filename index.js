const request = require('request');
const cheerio = require('cheerio');
const path = require('path');

const urlArr = [];
const initArr = [];
const compareArr = [];
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

function requestURL(url, index) {
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
                if (price.startsWith("$")) {
                    priceTest = price.substr(1);
                    priceArr.push(parseInt(priceTest));
                }
                else
                    priceArr.push(0);
            });
            //size
            $('div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.title').each((i, el) => {
                size = $(el).text();
                sizeArr.push(size);
            });

            shoeArr.push(sizeArr, priceArr);

            //add shoe data to respective array from index given (temporary until better fix)
            if (index == 1)
                initArr.push(shoeArr);
            else
                compareArr.push(shoeArr);
        }
        else {
            console.log("[ERROR] " + error);
        }
    })
}

function compareArrays() {
    console.log(time + ' Creating comparison array');
    //have to make timeout as request is async (temporary until better fix)
    setTimeout(function () {
        for (x = 0; x < urlArr.length; x++) {
            requestURL(urlArr[x], 0);
        }

        setTimeout(function () {
            console.log(time + ' Comparing prices');
            for (x = 0; x < initArr[0].length - 1; x++) {
                for (y = 0; y < initArr[x][1].length; y++) {
                    var initPrice = initArr[x][1][y];
                    var comparePrice = compareArr[x][1][y];

                    if (initPrice < comparePrice) {
                        console.log('less yeet');
                    }
                    else if (initPrice > comparePrice) {
                        console.log('more yeet');
                    }
                    else {
                        console.log('No change found');
                    }
                }
            }
        }, 3000);
    }, 3000);
}

//main
function main() {
    console.log(time + ' Starting...');
    var interval = config.interval;

    console.log(time + ' Finding requested shoes');
    for (x = 0; x < config.shoeURL.length; x++) {
        urlArr.push(config.shoeURL[x]);
    }

    console.log(time + ' Gathering initial prices');
    //populate initial array full of desired shoes
    for (x = 0; x < urlArr.length; x++) {
        requestURL(urlArr[x], 1);
    }
    //tick
    intervalTimer = setInterval(compareArrays, interval);
}

main();