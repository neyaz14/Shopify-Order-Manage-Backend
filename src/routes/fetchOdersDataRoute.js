require('dotenv').config();
const express = require('express');
const axios = require('axios');
const StoreModel = require('../Models/storeSchema');

const verifyToken = require('../Middleware/jwtMiddleware');


const router = express.Router();

router.get('/storeOrders/:storeId',async (req, res) => {
  const storeId = req.params.storeId;
  const cursor = req.query.cursor || null;
  // const requestedEmail = req.query.email;
  
  // // Verify that the authenticated user matches the requested email
  // if (requestedEmail && req.user.email !== requestedEmail) {
  //   return res.status(403).json({ message: 'Forbidden access: Email mismatch' });
  // }

  try {
    const store = await StoreModel.findById(storeId);

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const { storeUrl, accessToken, apiVersion } = store;
    // console.log(storeUrl, accessToken, apiVersion)

    const graphqlQuery = {
      query: `
              query GetOrders($cursor: String) {
                shop {
                  name
                  myshopifyDomain
                  primaryDomain {
                    url
                  }
                }
                
                orders(first: 50, after: $cursor, reverse: true) {
                  pageInfo {
                    hasNextPage
                    hasPreviousPage
                    startCursor
                    endCursor
                  }
                  edges {
                    cursor
                    node {
                      id
                      name
                      tags

                      note

                      processedAt
                      totalPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      customer {
                        firstName
                        lastName
                        email
                        phone
                      }
                      shippingAddress {
                        address1
                        address2
                        city
                        province
                        country
                        zip
                        phone
                      }
                      displayFulfillmentStatus
                      displayFinancialStatus
                      tags
                      lineItems(first: 50) {
                        edges {
                          node {
                            title
                            quantity
                            sku
                            variantTitle
                            originalUnitPriceSet {
                              shopMoney {
                                amount
                                currencyCode
                              }
                            }
                          }
                        }
                      }
                      fulfillmentOrders(first: 50) {
                      
                        edges {
                          node {
                            
                            id
                            status
                            lineItems(first: 50) {
                              edges {
                                node {
                                
                                  id
                                  lineItem {
                                    quantity
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            `,
      variables: {
        cursor: cursor || null,
      },
    };
 
    const response = await axios.post(
      `${storeUrl}/admin/api/${apiVersion}/graphql.json`,
      JSON.stringify(graphqlQuery),
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    const orders = response.data.data;
    res.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error.message);
    // DNS error হলে স্পষ্ট মেসেজ দাও
    if (errMsg.includes('ENOTFOUND')) {
      return res.status(400).json({ error: `Store domain not found: ${storeUrl}` });
    }

    res.status(500).json({ error: 'Failed to fetch store orders' });
  
  }
});

module.exports = router;
