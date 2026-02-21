const Item = require('../models/Item');

exports.getItems = async (req, res) => {
  const items = await Item.find();
  res.json(items);
};

exports.createItem = async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.json(item);
};
