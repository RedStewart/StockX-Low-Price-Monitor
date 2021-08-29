class Product {
  constructor(
    name,
    brand,
    sku,
    imgURL,
    productKey,
    highestBid,
    lowestAsk,
    offerTotals,
    salesData,
    sizeArr
    // prices,
    // url,
    // image
  ) {
    this.name = name;
    this.brand = brand;
    this.sku = sku;
    this.imgURL = imgURL;
    this.productKey = productKey;
    this.highestBid = highestBid;
    this.lowestAsk = lowestAsk;
    this.offerTotals = offerTotals;
    this.salesData = salesData;
    this.sizeArr = sizeArr;
    // this.prices = prices;
    // this.url = url;
    // this.image = image;
  }
}

module.exports = Product;
