const Logger = require('../tools/Logger');
const QueryJSON = require('../config/GraphQLQuery.json');

const axios = require('axios');

class StockXAPI {
  static async getData(productId) {
    QueryJSON['variables']['id'] = productId;
    try {
      const res = await axios({
        method: 'POST',
        url: 'https://stockx.com/api/graphql',
        headers: {
          accept: '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'apollographql-client-name': 'Iron',
          'content-type': 'application/json',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36'
        },
        data: QueryJSON
      });
      if (res.status === 200) return res.data.data.product;
      throw 'Unexpected API response';
    } catch (e) {
      Logger.error(e);
      return;
    }
  }
}

module.exports = StockXAPI;
