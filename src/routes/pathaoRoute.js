require('dotenv').config();
const express = require('express');
const { getToken } = require('../Pathao/pathaoToken');
const axios = require('axios');



const router = express.Router();


// !  get store id 
router.get('/getStoreId', async (req, res) => {
  try {
    const token = await getToken();

    const response = await axios.get(`${process.env.BASE_URL}/aladdin/api/v1/stores`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    // console.log('response of get request:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching store data:', error.message);
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data || null,
    });
  }
});



router.get('/pathao-token', async (req, res) => {
  try {
    const token = await getToken();
    console.log('token from the route ___________________', token)
    res.json({ token });
  } catch (err) {
    // res.json({ error: 'Token generation failed' })
    console.log(err.data);
  }
});

// Example: Create an order (use your endpoint here)
router.post('/pathao-order', async (req, res) => {
  try {
    const token = await getToken();
    if (!token) {
      return res.status(500).json({ error: 'Token generation failed' });
    }

    const orderResponse = await axios.post(
      `${process.env.BASE_URL}/aladdin/api/v1/orders`,
      req.body, // your order payload
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(orderResponse.data)

    res.json(orderResponse.data);
  } catch (err) {
    console.error("Order error:", err.response?.data || err.message);
    res.json({ error: 'Order creation failed' });
  }
});


// ? To get city 
router.get('/cities', async (req, res) => {
  try {
    const token = await getToken();

    const response = await axios.get(`${process.env.BASE_URL}/aladdin/api/v1/city-list`, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(response.data)
    res.json(response.data.data);
  } catch (error) {
    console.error('Error fetching city list:', error.message);
    res.json({
      error: error.message,
      details: error?.response?.data || null,
    });
  }
});


router.get('/cities/:cityId/zones', async (req, res) => {
  try {
    const { cityId } = req.params;
    console.log(cityId)
    const token = await getToken();

    const response = await axios.get(`${process.env.BASE_URL}/aladdin/api/v1/cities/${cityId}/zone-list`, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': `Bearer ${token}`
      }
    });

    res.json(response.data.data.data);
  } catch (error) {
    console.error('Error fetching zone list:', error.message);
    res.json({
      error: error.message,
      details: error?.response?.data || null,
    });
  }
});




// ! -------------- Pathao zone info 

// Helper: String Similarity



module.exports = router