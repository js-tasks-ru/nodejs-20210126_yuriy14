const mongoose = require('mongoose');
const Product = require('../models/Product');
const {clearDocumentsHelper} = require('../helpers/clearDocumentsHelper');

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  const subcategory = ctx.query.subcategory;

  if (subcategory) {
    const documents = await Product.find({subcategory});
    setProductsResponse(documents, ctx);
    
  } else {
    await next();
  }
  
};

module.exports.productList = async function productList(ctx, next) {
  const documents = await Product.find({});
  setProductsResponse(documents, ctx);
};

module.exports.productById = async function productById(ctx, next) {
  const productId = ctx.params.id;

  if (! mongoose.Types.ObjectId.isValid(productId)) {
    return ctx.throw(400, 'wrong data');
  }

  const document = await Product.findById(productId);

  if (document) {
    const [product] = getClearProducts([document]);
    ctx.body = {product};

  } else {
    ctx.throw(404, 'not found');
  }

};

function setProductsResponse (documents, ctx) {
  if (documents) {
    const products = getClearProducts(documents);
    ctx.body = {products};
  } else {
    ctx.throw(404, 'not found');
  }
}

function getClearProducts (documents) {
  return clearDocumentsHelper(documents, [
    'title',
    'description',
    'price',
    'category',
    'subcategory',
    'images'
  ]);
}

