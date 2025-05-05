const express = require('express');
const axios = require('axios');
const router = express.Router();
const StoreModel = require('../Models/storeSchema')

const mongoose = require('mongoose');
// === Core Fulfillment Function ===
const fulfillShopifyOrder = async (fulfillmentOrderId, trackingInfo, fulfillmentOrderLineItems, accessToken,
    apiVersion,
    shopURL) => {
    // console.log("📦 Preparing Shopify Fulfillment Mutation...");
    // console.log("➡ fulfillmentOrderId:", fulfillmentOrderId);
    // console.log("➡ trackingInfo:", trackingInfo);
    // console.log("➡ fulfillmentOrderLineItems:", fulfillmentOrderLineItems);


    const mutation = `
    mutation CreateFulfillment($fulfillment: FulfillmentInput!) {
      fulfillmentCreate(fulfillment: $fulfillment) {
        fulfillment {
          id
          status
          trackingInfo {
            number
            url
            company
          }
          createdAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const variables = {
        fulfillment: {
            notifyCustomer: true,
            trackingInfo,
            lineItemsByFulfillmentOrder: [
                {
                    fulfillmentOrderId,
                    fulfillmentOrderLineItems,
                },
            ],
        },
    };

    try {
        // console.log("🚀 Sending fulfillment mutation to Shopify...");
        const response = await axios.post(
            `${shopURL}/admin/api/${apiVersion}/graphql.json`,
            { query: mutation, variables },
            {
                headers: {
                    "Content-Type": "application/json",
                    "X-Shopify-Access-Token": accessToken,
                },
            }
        );

        // console.log("✅ Shopify Response Received:");
        // console.log(JSON.stringify(response.data, null, 2));

        const responseData = response.data;

        if (!responseData?.data?.fulfillmentCreate) {
            console.error("❌ fulfillmentCreate is missing in Shopify response");
            throw new Error("Invalid response from Shopify API");
        }

        return responseData.data.fulfillmentCreate;

    } catch (error) {
        console.error("❌ Error during Shopify fulfillment mutation:", error.response?.data || error.message);
        throw error;
    }
};

// ?      === Express Controller ===
const fulfillOrder = async (req, res) => {
    const { shopDomain, userInfo, fulfillmentOrderId, trackingInfo, lineItems } = req.body;

    const shopURL = `https://${shopDomain}.myshopify.com`;
    // console.log(shopURL);

    // console.log("📥 Incoming fulfillment request...");
    // console.log("➡ Body:", JSON.stringify(req.body, null, 2));

    if (!fulfillmentOrderId || !trackingInfo?.number || !trackingInfo?.company || !Array.isArray(lineItems)) {
        console.error("❌ Missing required fields in request body");
        return res.status(400).json({
            error: "Missing fulfillmentOrderId, trackingInfo or lineItems",
        });
    }

    // Map input lineItems to Shopify format
    const fulfillmentOrderLineItems = lineItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
    }));

    // console.log("🔧 Constructed lineItems for mutation:", fulfillmentOrderLineItems);

    try {


        // ! - find shop details ----------------------------

        const objectUserId = mongoose.Types.ObjectId.isValid(userInfo)
            ? new mongoose.Types.ObjectId(userInfo)
            : userInfo;

        // Find the store in the database using shopDomain and userInfo
        const storeData = await StoreModel.findOne({
            storeUrl: shopURL,
            user: objectUserId
        });

        if (!storeData) {
            console.error("❌ Store not found for the given domain and user");
            return res.status(404).json({
                error: "Store not found for this user and domain."
            });
        }

        // Extract accessToken and apiVersion from store data
        const { accessToken, apiVersion } = storeData; // Using a default API version if none is specified

        if (!accessToken) {
            console.error("❌ No access token found for store");
            return res.status(400).json({
                error: "Store access token not found"
            });
        }

        // console.log(`✅ Found store with API version: ${apiVersion}`);










        const result = await fulfillShopifyOrder(fulfillmentOrderId, trackingInfo, fulfillmentOrderLineItems, accessToken,
            apiVersion,
            shopURL);

        if (result.userErrors.length > 0) {
            console.warn("⚠️ Shopify returned userErrors:", result.userErrors);
            return res.status(400).json({ errors: result.userErrors });
        }

        // console.log("✅ Fulfillment Success:", result.fulfillment);

        return res.json({
            status: "success",
            fulfillment: result.fulfillment,
        });
    } catch (error) {
        console.error("❌ Final Error Handler:", error.message || error);
        return res.status(500).json({ error: "Failed to fulfill order", details: error.message });
    }
};

// === Route Binding ===
router.post("/fulfill-order", fulfillOrder);

module.exports = router;
