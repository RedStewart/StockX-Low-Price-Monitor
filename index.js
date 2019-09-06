const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const Webhook = require('webhook-discord');
const shoe = require('./Shoe');
const Shoe = shoe.Shoe;

const config = require(path.join(__dirname, 'config.json'));
const Hook = new Webhook.Webhook(config.webhook);
var shoeUrl = config.shoeURL;

const requestURL = async () => {
  let url = `https://stockx.com/${shoeUrl[0]}`;

  try {
    let response = await axios.get('https://stockx.com/');
    // console.log(response.status);
    console.log('yozza');
  } catch (e) {
    console.error(e);
  }

  // var shoeArr = [];
  // for (let x = 0; x < shoeUrl.length; x++) {
  //   //let beforeTime = Date.now();
  //   let url = 'https://stockx.com/' + shoeUrl[x];
  //   let response = await axios.get(url);
  //   let $ = cheerio.load(response.data);

  //   let shoeName = $('h1').text();
  //   let sizeArr = getSizes($);
  //   let priceArr = getPrices($);
  //   let shoeImage = $('div.image-container > img').attr('src');

  //   shoeArr.push(new Shoe(shoeName, sizeArr, priceArr, url, shoeImage));

  //console.log("Time elapsed: [" + (Date.now() - beforeTime) / 1000 + "] " + shoeName);
  // }
  // return shoeArr;
};

async function comparePrices(initialArr) {
  let compareArr = await requestURL();
  console.log('Comparing prices...\n');

  //for (var x = 0; x < 2; x++) {
  for (var x = 0; x < initialArr.length; x++) {
    //for (var i = 0; i < 1; i++) {
    for (var i = 0; i < initialArr[x].prices.length; i++) {
      let initialPrice = initialArr[x].prices[i];
      let comparePrice = compareArr[x].prices[i];

      //let initialPrice = 1025;
      //let comparePrice = 917;

      //no need to compare if the price is 0
      if (comparePrice != 0) {
        if (comparePrice < initialPrice) {
          let priceDiff = ((initialPrice - comparePrice) / initialPrice) * 100;
          let priceDiffRound = Math.round(priceDiff * 10) / 10;

          if (priceDiffRound > 5) {
            console.log(
              'SENDING WEBHOOK\n================\n' +
                compareArr[x].name +
                '\nNew Low Price: $' +
                comparePrice +
                '.00' +
                '\nOld Price: $' +
                initialPrice +
                '.00' +
                '\nSize: ' +
                compareArr[x].sizes[i] +
                '\n' +
                priceDiffRound +
                '% decrease in price\n'
            );

            const hookMsg = new Webhook.MessageBuilder()
              .setName('StockX Low Price Monitor')
              .setTitle(compareArr[x].name)
              .addField('New Low Price: $' + comparePrice + '.00', '')
              .addField('', 'Old Price: $' + initialPrice + '.00')
              .addField('', 'Size: ' + compareArr[x].sizes[i])
              .addField('', priceDiffRound + '% decrease in price')
              .addField('Link: ' + compareArr[x].url)
              .setImage(compareArr[x].image);

            Hook.send(hookMsg);
          }
          initialArr[x].prices[i] = compareArr[x].prices[i];
        } else if (comparePrice > initialPrice) {
          //if the compare price is more than the initial, set the inital to the compare
          initialArr[x].prices[i] = compareArr[x].prices[i];
        } else {
          //console.log('No change found');
        }
      }
    }
  }
}

function getSizes($) {
  let sizeArr = [];
  $(
    'div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.title'
  ).each((i, el) => {
    let size = $(el).text();
    sizeArr.push(size);
  });
  return sizeArr;
}

//will return an array of prices
function getPrices($) {
  let priceArr = [];
  $(
    'div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.subtitle'
  ).each((i, el) => {
    //price of shoe
    let price = $(el).text();
    //check if it isnt 0
    if (price.startsWith('$')) {
      //strip the dollar sign
      priceFilter = price.substr(1);
      //make int so we can compare
      priceArr.push(parseInt(priceFilter.replace(',', '')));
    } else priceArr.push(0);
  });
  return priceArr;
}

const main = async () => {
  console.log('Monitor starting...');
  console.log('Scraping for initial prices');

  let initialArr = await requestURL();
  console.log('Initial prices gathered\n');

  // setInterval(async () => {
  //     await comparePrices(initialArr);
  // }, config.interval);
};

main();
