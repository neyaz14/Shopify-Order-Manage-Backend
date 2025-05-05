const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType, GraphQLInt, GraphQLBoolean } = require('graphql')


const UserModel = require('../Models/userSchema.js')
const StoreModel = require('../Models/storeSchema.js')
const SteadfastCredentialModel = require('../Models/SteadfastSchema')
const PathaoCredentialModel = require('../Models/PathaoSchema.js')
const OrderDataSchema = require('../Models/OrderDataSchema.js')
const CourierInfo = require('../Models/CurrierSchema.js')

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        displayName: { type: GraphQLString },
        email: { type: GraphQLString },
        storeIDs: {
            type: new GraphQLList(StoreInfoType),
            async resolve(parent) {
                return await StoreModel.find({ _id: { $in: parent.storeIDs } });
            }
        },
        SteadfastId: {
            type: SteadfastCredentialType,
            async resolve(parent) {
                return await SteadfastCredentialModel.findById(parent.SteadfastId);
            }
        },
        pathaoId: {
            type: PathaoCredentialType,
            async resolve(parent) {
                return await PathaoCredentialModel.findById(parent.pathaoId);
            }
        },
       
    })
});

const StoreInfoType = new GraphQLObjectType({
    name: 'StoreInfo',
    fields: () => ({
        id: { type: GraphQLID },
        storeName: { type: GraphQLString },
        accessToken: { type: GraphQLString },
        apiVersion: { type: GraphQLString },
        storeUrl: { type: GraphQLString },

        user: {
            type: UserType,
            resolve(parent, args) {
                return UserModel.findById(parent.user);
            }
        },
        savedOrderGid: { type: new GraphQLList(GraphQLString) }, // ✅ New field
    })
});



const PathaoCredentialType = new GraphQLObjectType({
    name: 'PathaoCredential',
    fields: () => ({
        id: { type: GraphQLID },
        base_url: { type: GraphQLString },
        client_id: { type: GraphQLString },
        client_secret: { type: GraphQLString },
        user: {
            type: UserType,
            resolve(parent, args) {
                return UserModel.findById(parent.user);
            }
        }
    })
});





const SteadfastCredentialType = new GraphQLObjectType({
    name: 'SteadfastCredential',
    fields: () => ({
        id: { type: GraphQLID },
        api_url: { type: GraphQLString },
        api_key: { type: GraphQLString },
        secret_key: { type: GraphQLString },
        user: {
            type: UserType, // Make sure UserType is imported or defined above
            resolve(parent, args) {
                return UserModel.findById(parent.user);
            }
        }
    })
});

// ! ----------  Store Order schema 
// --- Money ---
const MoneyType = new GraphQLObjectType({
  name: 'Money',
  fields: () => ({
    amount: { type: GraphQLString },
    currencyCode: { type: GraphQLString },
  })
});

// --- PriceSet ---
const PriceSetType = new GraphQLObjectType({
  name: 'PriceSet',
  fields: () => ({
    shopMoney: { type: MoneyType }
  })
});

// --- LineItemNode ---
const LineItemNodeType = new GraphQLObjectType({
  name: 'LineItemNode',
  fields: () => ({
    title: { type: GraphQLString },
    quantity: { type: GraphQLInt },
    sku: { type: GraphQLString },
    variantTitle: { type: GraphQLString },
    originalUnitPriceSet: { type: PriceSetType }
  })
});

// --- LineItemEdge ---
const LineItemEdgeType = new GraphQLObjectType({
  name: 'LineItemEdge',
  fields: () => ({
    node: { type: LineItemNodeType }
  })
});

// --- LineItemsConnection ---
const LineItemsConnectionType = new GraphQLObjectType({
  name: 'LineItemsConnection',
  fields: () => ({
    edges: { type: new GraphQLList(LineItemEdgeType) }
  })
});

// --- ShippingAddress ---
const ShippingAddressType = new GraphQLObjectType({
  name: 'ShippingAddress',
  fields: () => ({
    address1: { type: GraphQLString },
    address2: { type: GraphQLString },
    city: { type: GraphQLString },
    province: { type: GraphQLString },
    country: { type: GraphQLString },
    zip: { type: GraphQLString },
    phone: { type: GraphQLString }
  })
});

// --- Customer ---
const CustomerType = new GraphQLObjectType({
  name: 'Customer',
  fields: () => ({
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    phone: { type: GraphQLString }
  })
});

const OrderType = new GraphQLObjectType({
  name: 'Order',
  fields: () => ({
    id: { type: GraphQLID }, // MongoDB ID
    name: { type: GraphQLString },
    note: { type: GraphQLString },
    processedAt: { type: GraphQLString },
    shopDomain: { type: GraphQLString },
    displayFinancialStatus: { type: GraphQLString },
    displayFulfillmentStatus: { type: GraphQLString },
    shopifyId: { type: GraphQLString }, // Optional if using Shopify GID
    customer: { type: CustomerType },
    shippingAddress: { type: ShippingAddressType },
    tags: { type: new GraphQLList(GraphQLString) },
    totalPriceSet: { type: PriceSetType },
    lineItems: { type: LineItemsConnectionType },
    // Fixed field definition - returns CourierInfoType through resolver
    courier: {
      type: CourierInfoType,
      resolve(parent, _) {
        return CourierInfo.findById(parent.courierId);
      }
    },
    // Add this field to also return the raw ID when needed

    courierId: { type: GraphQLID },
    ownerId: { type: GraphQLID },
    owner: {
      type: UserType, // define this if you haven't
      resolve(parent, _) {
        return User.findById(parent.ownerId);
      }
    }
  })
});

const CourierInfoType = new GraphQLObjectType({
  name: 'CourierInfo',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLString) },
    consignment_id: { type: GraphQLNonNull(GraphQLInt) },
    invoice: { type: GraphQLNonNull(GraphQLString) },
    tracking_code: { type: GraphQLNonNull(GraphQLString) },
    recipient_name: { type: GraphQLNonNull(GraphQLString) },
    recipient_phone: { type: GraphQLNonNull(GraphQLString) },
    recipient_address: { type: GraphQLNonNull(GraphQLString) },
    cod_amount: { type: GraphQLNonNull(GraphQLInt) },
    status: { type: GraphQLNonNull(GraphQLString) },
    note: { type: GraphQLString },
    created_at: { type: GraphQLString },
    updated_at: { type: GraphQLString },
    shopifyId: { type: GraphQLString },
    orderId: { 
      type: GraphQLString  // Not required
    },
    order: {  // Added a new field for the actual reference relationship
      type: OrderType,
      resolve(parent, _) {
        return OrderDataSchema.findById(parent.orderId);
      }
    },
  })
});






module.exports = { UserType, StoreInfoType, PathaoCredentialType, SteadfastCredentialType,OrderType , CourierInfoType}