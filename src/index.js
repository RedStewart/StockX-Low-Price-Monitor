const axios = require('axios');
const cheerio = require('cheerio');
const Webhook = require('webhook-discord');
// const webhookColour = config.webhookColour;
// const shoeUrl = Config.productIdArr;

const Config = require('../config/Config.json');
const Logger = require('../tools/Logger');
const Product = require('./Product');
const StockXAPI = require('./StockX');

const getProduct = async (productKey) => {
  try {
    const data = await StockXAPI.getData(productKey);

    if (!data) throw 'Failed to fetch Product data';

    const sizeAskArr = data['variants'].map((el) => {
      return {
        size: el['traits']['size'],
        askPrice: el['market']['bidAskData']['lowestAsk']
      };
    });

    return new Product(
      data['title'],
      data['brand'],
      data['styleId'],
      `https://stockx.com/${productKey}`,
      data['media']['imageUrl'],
      data['urlKey'],
      {
        price: data['market']['bidAskData']['highestBid'],
        size: data['market']['bidAskData']['highestBidSize']
      },
      {
        price: data['market']['bidAskData']['lowestAsk'],
        size: data['market']['bidAskData']['lowestAskSize']
      },
      {
        totalNumAsks: data['market']['bidAskData']['numberOfAsks'],
        totalNumBids: data['market']['bidAskData']['numberOfBids']
      },
      data['market']['salesInformation'],
      sizeAskArr
    );
  } catch (e) {
    Logger.error(e);
    return;
  }
};

const comapreShoePrices = async (savedProduct, productKey) => {
  Logger.log('Scraping comparison prices');
  // Use while loop to make sure the objects thats returned doesnt have any errors
  let compareProduct;
  while (!compareProduct) compareProduct = await getProduct(productKey);

  savedProduct.sizeAskArr.forEach((el) => {
    const savedAskPrice = el.askPrice;
    const compareAskPrice = compareProduct.sizeAskArr.find(
      (ele) => ele.size === el.size
    ).askPrice;

    if (compareAskPrice < savedAskPrice) {
      // set the saved price to the compare price
      // send webhook
    }

    if (compareAskPrice > savedAskPrice) {
      // set the saved price to the compare price
    }

    // if(sizeAskObj.askPrice  el.askPrice)
    console.log(sizeAskObj);
  });

  return;

  Logger.log('Comparing prices...');
  // for (let x = 0; x < 1; x++) {
  for (let x = 0; x < savedProduct.shoes.length; x++) {
    // for (let i = 0; i < 1; i++) {
    for (let i = 0; i < savedProduct.shoes[x].sizePrice.length; i++) {
      let initialPrice = savedProduct.shoes[x].sizePrice[i].price;
      let comparePrice = comparePrices.shoes[x].sizePrice[i].price;

      // let initialPrice = 1025;
      // let comparePrice = 917;

      //no need to compare if the price is 0
      if (comparePrice !== 0) {
        // if the new price found is lower than the price thats stored
        if (comparePrice < initialPrice) {
          // figure out the price difference
          const priceDiff =
            ((initialPrice - comparePrice) / initialPrice) * 100;
          // round the price difference to a readable number
          const priceDiffRound = Math.round(priceDiff * 10) / 10;

          // Check if the price difference is greater than 5%
          if (priceDiffRound > 5) {
            console.log(
              `${logTime()}\nSENDING WEBHOOK\n=============================\n${
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
          savedProduct.shoes[x].sizePrice[i].price =
            comparePrices.shoes[x].sizePrice[i].price;
        } else if (comparePrice > initialPrice) {
          //if the compare price is more than the initial, set the inital to the compare
          savedProduct.shoes[x].sizePrice[i].price =
            comparePrices.shoes[x].sizePrice[i].price;
        } else {
          // console.log('No change found');
        }
      }
    }
  }
};

const checkConfig = () => {
  let errArr = [];

  if (!Config.webhookURL)
    errArr.push('Please enter a valid Discord webhook URL');

  if (Config.productKeyArr.length < 1)
    errArr.push("Please enter product ID's in your Config.json file");

  if (errArr.length > 0) {
    errArr.forEach((el) => Logger.error(el));
    process.exit();
  }
};

const main = async () => {
  checkConfig();

  Logger.log('Monitor starting...');
  Logger.log('Scraping initial prices');

  let savedProduct;
  while (!savedProduct)
    savedProduct = await getProduct('adidas-yeezy-boost-350-v2-light');

  Logger.log('Initial prices gathered');

  setInterval(async () => {
    await comapreShoePrices(savedProduct, 'adidas-yeezy-boost-350-v2-light');
  }, Config.interval);
};

main();
