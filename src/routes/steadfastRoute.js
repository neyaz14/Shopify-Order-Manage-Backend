require('dotenv').config();
const express = require('express');
const router = express.Router();
const axios = require('axios');
const SteadfastModel = require('../Models/SteadfastSchema');
const mongoose = require('mongoose');



// POST /api/steadfast/order

router.post('/steadfastOrder', async (req, res) => {
  const { userId, ...orderInfo } = req.body;
  // console.log(orderInfo, userId)

  if (!orderInfo  || !userId) {
    return res.status(400).json({ error: "Order ID is required" });
  }








  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Match using `user`, not `userId`
    const steadfastAccount = await SteadfastModel.findOne({ user: objectUserId });
    if (!steadfastAccount) {
      return res.status(404).json({ message: 'Steadfast account not found for this user.' });
    }

    // console.log(steadfastAccount)

    const response = await axios.post(`${process.env.STEADFAST_API_URL}/create_order`, orderInfo,
      {
        headers: {
          'Api-Key': steadfastAccount?.api_key,
          'Secret-Key': steadfastAccount?.secret_key,
          'Content-Type': 'application/json'
        }
      }
    );
    // console.log(response.data)
    res.json(response.data);
  } catch (error) {
    console.error('Steadfast order error:', error.message);
    res.json(error);
  }
});

module.exports = router;
