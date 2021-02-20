const Category = require('../models/Category');
const {clearDocumentsHelper} = require('../helpers/clearDocumentsHelper');

module.exports.categoryList = async function categoryList(ctx, next) {
  const documents = await Category.find({});
  
  if (documents) {
    const categories = clearDocumentsHelper(
      documents, 
      ['title'], 
      [{
        name: 'subcategories', 
        columns: ['title']
      }]
    );

    ctx.body = {categories};

  } else {
    ctx.throw(404, 'not found');
  }
    
};


