require('dotenv').config();
const express = require('express');
const axios = require('axios');
const StoreModel = require('../Models/storeSchema')
const mongoose = require('mongoose');
const router = express.Router();





const addTagToShopifyOrder = async (orderId, accessToken, apiVersion, shopURL) => {
    // console.log('form the mutation : ----', orderId, accessToken, apiVersion, shopURL)
    const query = `
      mutation tagsAdd($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node {
             
            ... on Order {
                id
                tags
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
        id: orderId,
        tags: ["Confirmed"],
    };
    // console.log(variables)

    // Use the provided shopURL, apiVersion and accessToken instead of constants
    const response = await axios.post(
        `${shopURL}/admin/api/${apiVersion}/graphql.json`,
        { query, variables },
        {
            headers: {
                "Content-Type": "application/json",
                "X-Shopify-Access-Token": accessToken,
            },
        }
    );

    const data = response.data;
    // console.log(data)

    // Uncomment error handling for production use
    if (data.errors || (data.data && data.data.tagsAdd.userErrors.length > 0)) {
        throw new Error("Shopify API Error: " + JSON.stringify(data.errors || data.data.tagsAdd.userErrors));
    }

    return data.data.tagsAdd;
};


// ===== Controller Function =====
const addTagToOrder = async (req, res) => {
    const { orderId, shopDomain, userInfo } = req.body;
    
    if (!orderId || !shopDomain || !userInfo) {
        return res.status(400).json({ error: "Order ID is required" });
    }
    
    const shopURL = `https://${shopDomain}.myshopify.com`;
    // console.log(shopURL);
    
    function extractOrderId(shopifyId) {
        // Split by "/" and take the last element
        const parts = shopifyId.split('/');
        return parts[parts.length - 1];
    }
    
    const IdNum = extractOrderId(orderId);
    // console.log(IdNum);

    try {
        // Find the store in the database using shopDomain and userInfo
        const storeData = await StoreModel.findOne({ 
            storeUrl: shopURL,
            user: userInfo
        });

        if (!storeData) {
            return res.status(404).json({ error: "Store not found" });
        }

        // Extract access token and API version from the store data
        const { accessToken, apiVersion } = storeData;
        
        if (!accessToken) {
            return res.status(400).json({ error: "Store access token not found" });
        }

        // Now pass these parameters to the function that adds tags
        const result = await addTagToShopifyOrder(orderId, accessToken, apiVersion, shopURL);
        // console.log(accessToken, apiVersion)
        res.json(result);
    } catch (error) {
        console.error("Error adding tag to order:", error.message);
        res.status(500).json({ error: "Failed to add tag" });
    }
};

// ===== Router =====
router.post("/add-tag", addTagToOrder);




module.exports = router