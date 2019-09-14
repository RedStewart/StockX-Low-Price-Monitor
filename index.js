const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const config = require(path.join(__dirname, 'config.json'));
const Webhook = require('webhook-discord');
const webhookColour = config.webhookColour;
const shoeUrl = config.shoeURL;

const logTime = () => {
  let date = new Date();
  let h = formatTime(date.getHours(), 2);
  let m = formatTime(date.getMinutes(), 2);
  let s = formatTime(date.getSeconds(), 2);
  let ms = formatTime(date.getMilliseconds(), 3);
  return (date = '[' + h + ':' + m + ':' + s + ':' + ms + '] ');
};

const formatTime = (x, n) => {
  while (x.toString().length < n) {
    x = '0' + x;
  }
  return x;
};

const requestURL = async () => {
  let shoeObj = {
    shoes: []
  };
  for (let x = 0; x < shoeUrl.length; x++) {
    try {
      const url = `https://stockx.com/${shoeUrl[x]}`;
      let response = await axios.get(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
          'Accept-Encoding': 'gzip, deflate, br',
          'sec-fetch-user': '?1'
        }
      });
      let $ = cheerio.load(response.data);
      let shoeName = $('h1').text();

      if (shoeName !== '') {
        let shoeImage = $('div.image-container > img').attr('src');
        let sizeArr = getSizes($);
        let priceArr = getPrices($);

        shoeObj.shoes[x] = {
          name: shoeName,
          url,
          imgSrc: shoeImage,
          sizePrice: []
        };
        for (let i = 0; i < sizeArr.length; i++) {
          shoeObj.shoes[x].sizePrice[i] = {
            size: sizeArr[i],
            price: priceArr[i]
          };
        }
      } else {
        return undefined;
      }
    } catch (e) {
      return undefined;
    }
  }
  return shoeObj;
};

const comapreShoePrices = async initialPrices => {
  console.log(logTime() + 'Scraping comparison prices');
  let comparePrices;
  const Hook = new Webhook.Webhook(config.webhook);

  // Use while loop to make sure the objects thats returned doesnt have any errors
  while (comparePrices === undefined) {
    comparePrices = await requestURL();
  }
  console.log(logTime() + 'Comparing prices...\n');

  for (let x = 0; x < 1; x++) {
    // for (let x = 0; x < initialPrices.shoes.length; x++) {
    for (let i = 0; i < 1; i++) {
      // for (let i = 0; i < initialPrices.shoes[x].sizePrice.length; i++) {
      // let initialPrice = initialPrices.shoes[x].sizePrice[i].price;
      // let comparePrice = comparePrices.shoes[x].sizePrice[i].price;

      let initialPrice = 1025;
      let comparePrice = 917;

      //no need to compare if the price is 0
      if (comparePrice !== 0) {
        // if the new price found is lower than the price thats stored
        if (comparePrice < initialPrice) {
          // figure out the price difference
          let priceDiff = ((initialPrice - comparePrice) / initialPrice) * 100;
          // round the price difference to a readable number
          let priceDiffRound = Math.round(priceDiff * 10) / 10;

          // Check if the price difference is greater than 5%
          if (priceDiffRound > 5) {
            console.log(
              `${logTime()}\n       SENDING WEBHOOK       \n=============================\n${
                comparePrices.shoes[x].name
              }\nSize: ${
                comparePrices.shoes[x].sizePrice[i].size
              }\nNew Low Price: $${comparePrice}.00\nOld Price: $${initialPrice}.00\n${priceDiffRound}% decrease in price`
            );
            // send webhook to discord
            const hookMsg = new Webhook.MessageBuilder()
              .setName('StockX Low Price Monitor')
              .setColor(
                webhookColour[Math.floor(Math.random() * webhookColour.length)]
              )
              .setTitle(comparePrices.shoes[x].name)
              .addField('Size: ' + comparePrices.shoes[x].sizePrice[i].size, '')
              .addField('New Low Price: $' + comparePrice + '.00', '')
              .addField('', 'Old Price: $' + initialPrice + '.00')
              .addField('', priceDiffRound + '% decrease in price')
              .addField('Link: ' + comparePrices.shoes[x].url)
              .setImage(comparePrices.shoes[x].imgSrc);

            Hook.send(hookMsg);
          }
          initialPrices.shoes[x].sizePrice[i].price =
            comparePrices.shoes[x].sizePrice[i].price;
        } else if (comparePrice > initialPrice) {
          //if the compare price is more than the initial, set the inital to the compare
          initialPrices.shoes[x].sizePrice[i].price =
            comparePrices.shoes[x].sizePrice[i].price;
        } else {
          console.log('No change found');
        }
      }
    }
  }
};

const getSizes = $ => {
  let sizeArr = [];
  $(
    'div.mobile-header-inner > div.options > div.form-group > div.select-control > div.select-options > ul.list-unstyled > li.select-option > div.inset > div.title'
  ).each((i, el) => {
    let size = $(el).text();
    sizeArr.push(size);
  });
  return sizeArr;
};

//will return an array of prices
const getPrices = $ => {
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
};

const main = async () => {
  if (config.webhook === '' || undefined) {
    console.error(
      'ERROR: Please enter a valid webhook URL in the config file\n'
    );
  } else {
    let initialPrices;
    console.log(logTime() + 'Monitor starting...');
    console.log(logTime() + 'Scraping for initial prices');

    while (initialPrices === undefined) {
      initialPrices = await requestURL();
    }
    console.log(logTime() + 'Initial prices gathered');

    setInterval(async () => {
      await comapreShoePrices(initialPrices);
    }, config.interval);
  }
};

main();
