const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub-schemas
const ShopMoneySchema = new Schema({
  amount: { type: String, required: true },
  currencyCode: { type: String, required: true }
}, { _id: false });

const PriceSetSchema = new Schema({
  shopMoney: { type: ShopMoneySchema, required: true }
}, { _id: false });

const LineItemNodeSchema = new Schema({
  originalUnitPriceSet: { type: PriceSetSchema },
  quantity: { type: Number, required: true },
  sku: { type: String },
  title: { type: String, required: true },
  variantTitle: { type: String }
}, { _id: false });

const LineItemSchema = new Schema({
  node: { type: LineItemNodeSchema, required: true }
}, { _id: false });

const CustomerSchema = new Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String }
}, { _id: false });

const ShippingAddressSchema = new Schema({
  address1: { type: String, required: true },
  address2: { type: String },
  city: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  province: { type: String },
  zip: { type: String, required: true }  // Fixed the syntax error here (* to :)
}, { _id: false });

// Main Order Schema
const OrderSchema = new Schema({
  name: { type: String, required: true },
  note: { type: String },
  processedAt: { type: String, required: true },  // Changed to String to match GraphQL
  
  // Customer information
  customer: { type: CustomerSchema, required: true },
  
  // Shop & Status information
  shopDomain: { type: String, required: true },
  displayFinancialStatus: { type: String, required: true },
  displayFulfillmentStatus: { type: String, required: true },
  
  // Unique identifiers
  shopifyId: { type: String },  // This field should be shopifyId, not id
  
  // Line items
  lineItems: {
    edges: [{ type: LineItemSchema }]
  },
  
  // Shipping information
  shippingAddress: { type: ShippingAddressSchema, required: true },
  
  // Tags
  tags: [{ type: String }],
  
  // Price information
  totalPriceSet: { type: PriceSetSchema, required: true },
  // Reference to CourierInfo
  courierId: { type: Schema.Types.ObjectId, ref: 'CourierInfo' }  ,
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);