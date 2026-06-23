const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, sort, limit, skip } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    let products = Product.find(query);

    if (sort === 'price-low') {
      products = products.sort({ price: 1 });
    } else if (sort === 'price-high') {
      products = products.sort({ price: -1 });
    } else if (sort === 'newest') {
      products = products.sort({ createdAt: -1 });
    }

    const total = await Product.countDocuments(query);
    products = await products.skip(parseInt(skip) || 0).limit(parseInt(limit) || 20);

    res.json({
      success: true,
      total,
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create product (Admin)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update product (Admin)
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete product (Admin)
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { description: { $regex: req.params.query, $options: 'i' } }
      ]
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
