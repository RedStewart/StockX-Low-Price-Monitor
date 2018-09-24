try {
    const request = require('request');
    const cheerio = require('cheerio');
    const path = require('path');
    const Webhook = require('webhook-discord');

    const urlArr = [];
    const initArr = [];
    var compareArr = [];
    var infoArr = [];
    const colourArr = ['FF3855', 'FF7A00', 'FDFF00', '87FF2A', '4F86F7', 'DB91EF', '6F2DA8'];


    const config = require(path.join(__dirname, 'config.json'));
    const Hook = new Webhook(config.webhook.webhookUrl);

    function getTime() {
        var today = new Date();
        h = checkTime(today.getHours());
        m = checkTime(today.getMinutes());
        s = checkTime(today.getSeconds());
        ms = checkTime(today.getMilliseconds());
        return time = "[" + h + ":" + m + ":" + s + ":" + ms + "]";
    }
    function checkTime(i) {
        return (i < 10) ? "0" + i : i;
    }

    function requestURL(url, index) {
        try {
            setTimeout(function () {
                request("https://stockx.com/" + url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        var price, size;
                        const shoeArr = [];
                        const priceArr = [];
                        const sizeArr = [];

                        var $ = cheerio.load(body);
                        var shoeTitle = $('h1').text();
                        var shoeImg = $('div.image-container > img').attr('src');
                        var shoeURLLink = "https://stockx.com/" + url;
                        infoArr.push(shoeTitle, shoeImg, shoeURLLink);
                        console.log(getTime() + " Scraping " + shoeTitle);

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

                        shoeArr.push(sizeArr, priceArr, infoArr);

                        //add shoe data to respective array from index given (temporary until better fix)
                        if (index == 1) {
                            initArr.push(shoeArr);
                            //console.log(initArr);
                        }
                        else {
                            compareArr.push(shoeArr);
                            //console.log(compareArr);
                        }
                        infoArr = [];
                    }
                    else {
                        console.log("[ERROR] " + error);
                    }
                })
            }, 1000);
        } catch (err) {
            console.log('[ERROR] ' + err);
        }
    }

    function compareArrays() {
        initArr.sort();
        console.log(getTime() + ' Creating comparison array');
        //have to make timeout as request is async (temporary until better fix)
        setTimeout(function () {
            for (x = 0; x < urlArr.length; x++) {
                requestURL(urlArr[x], 0);
            }
            setTimeout(function () {
                compareArr.sort();
                //console.log(compareArr);
                console.log(getTime() + ' Comparing prices');
                for (x = 0; x < compareArr.length; x++) {
                    if (typeof compareArr[x] !== 'undefined') {
                        //for (y = 0; y < 1; y++) {
                        //this is to compare all prices but using the above loop for testing 1 until better
                        for (y = 0; y < initArr[x][1].length; y++) {
                            var initPrice = initArr[x][1][y];
                            var comparePrice = compareArr[x][1][y];

                            if (comparePrice < initPrice) {
                                var difference = (comparePrice / initPrice) * 100;
                                var decreasePer = 100 - difference;

                                Hook.custom('Captain Hook', 'New low price found!\nSize: ' + compareArr[x][0][y] + '\nPrice: ' + comparePrice + '\n Difference: ' + decreasePer + '%\nLink: ' + compareArr[x][2][2], compareArr[x][2][0], '#' + (colourArr[Math.floor(Math.random() * colourArr.length)]), compareArr[x][2][1]);


                                initArr[x][1][y] = compareArr[x][1][y];
                                console.log('less yeet');
                            }
                            else if (comparePrice > initPrice) {
                                console.log('more yeet');
                                //initArr[x][1][y] = comparePrice;
                            }
                            else {
                                //Hook.custom('Captain Hook', 'New low price found!\nSize: ' + compareArr[x][0][y] + '\nPrice: ' + comparePrice + '\nLink: ' + compareArr[x][2][2], compareArr[x][2][0], '#' + (colourArr[Math.floor(Math.random() * colourArr.length)]), compareArr[x][2][1]);
                                //console.log('No change found');
                            }

                        }
                    }
                }
            }, 10000);

        }, 5000);
        compareArr = [];
    }

    //main
    function main() {
        console.log(getTime() + ' Starting...');
        var interval = config.interval;

        console.log(getTime() + ' Finding requested shoes');
        for (x = 0; x < config.shoeURL.length; x++) {
            urlArr.push(config.shoeURL[x]);
        }

        console.log(getTime() + ' Gathering initial prices');
        //populate initial array full of desired shoes
        for (x = 0; x < urlArr.length; x++) {
            requestURL(urlArr[x], 1);
        }
        //tick
        intervalTimer = setInterval(compareArrays, interval);
    }

    main();

} catch (err) {
    console.log('[ERROR] ' + err);
}
