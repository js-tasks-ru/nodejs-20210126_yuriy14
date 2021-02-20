const Products = require('../models/Product');
const {clearDocumentsHelper} = require('../helpers/clearDocumentsHelper');

module.exports.productsByQuery = async function productsByQuery(ctx, next) {
  const query = ctx.query.query;

  if (! query) {
    return ctx.throw(404, 'wrong data');
  }

  const documents = await Products.find({$text: {$search: query}});

  if (documents) {
    const products = clearDocumentsHelper(documents, [
      'images',
      'title',
      'description',
      'price',
      'category',
      'subcategory'
    ]);

    ctx.body = {products};

  } else {
    ctx.throw(404, 'not found');
  }
};
