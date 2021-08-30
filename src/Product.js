class Product {
  constructor(
    name,
    brand,
    sku,
    url,
    imgURL,
    productKey,
    highestBid,
    lowestAsk,
    offerTotals,
    salesData,
    sizeAskArr
    // prices,
    // url,
    // image
  ) {
    this.name = name;
    this.brand = brand;
    this.sku = sku;
    this.url = url;
    this.imgURL = imgURL;
    this.productKey = productKey;
    this.highestBid = highestBid;
    this.lowestAsk = lowestAsk;
    this.offerTotals = offerTotals;
    this.salesData = salesData;
    this.sizeAskArr = sizeAskArr;
    // this.prices = prices;
    // this.url = url;
    // this.image = image;
  }
}

module.exports = Product;
