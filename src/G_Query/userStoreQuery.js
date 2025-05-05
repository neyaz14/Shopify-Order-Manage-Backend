const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType } = require('graphql')


const { UserType, StoreInfoType, PathaoCredentialType, SteadfastCredentialType, CourierInfoType , OrderType} = require('../GraphqlSchema/UserStoreSchema')


const UserModel = require('../Models/userSchema.js')
const StoreModel = require('../Models/storeSchema.js')
const PathaoModel = require('../Models/PathaoSchema.js');
const SteadfastModel = require('../Models/SteadfastSchema.js');
const CourierInfo = require('../Models/CurrierSchema.js');
const OrderDataSchema = require('../Models/OrderDataSchema.js');


const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return UserModel.findById(args.id);
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return UserModel.find();
      },
    },

    userByEmail: {
      type: UserType,
      args: { email: { type: GraphQLString } },
      resolve(parent, args) {
        return UserModel.findOne({ email: args.email });
      },
    },
    userByEmailFull: {
      type: UserType,
      args: { email: { type: GraphQLString } },
      resolve(parent, args) {
        return UserModel.findOne({ email: args.email });
      },
    },


    // ! Store query ---------


    store: {
      type: StoreInfoType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return StoreModel.findById(args.id);
      },
    },
    stores: {
      type: new GraphQLList(StoreInfoType),
      resolve(parent, args) {
        return StoreModel.find();
      },
    },

    storeByUserEmail: {
      type: new GraphQLList(StoreInfoType),
      args: { email: { type: GraphQLString } },
      async resolve(parent, args) {
        const user = await UserModel.findOne({ email: args.email });
        if (!user) return [];
        return StoreModel.find({ user: user.id });
      },
    },

    // ! ------------- Pathao Query

    pathaoCredential: {
      type: PathaoCredentialType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return PathaoModel.findById(args.id);
      }
    },
    pathaoCredentials: {
      type: new GraphQLList(PathaoCredentialType),
      resolve() {
        return PathaoModel.find();
      }
    },
    pathaoCredentialsByEmail: {
      type: new GraphQLList(PathaoCredentialType),
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args) {
        const user = await UserModel.findOne({ email: args.email });
        if (!user) throw new Error('এই ইমেইলের কোনো ইউজার পাওয়া যায়নি');

        return PathaoModel.find({ user: user._id });
      }
    },





    // ! -------------   Steadfast Query 

    steadfastCredential: {
      type: SteadfastCredentialType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return SteadfastModel.findById(args.id);
      }
    },
    steadfastCredentials: {
      type: new GraphQLList(SteadfastCredentialType),
      resolve() {
        return SteadfastModel.find();
      }
    },
    steadfastCredentialsByEmail: {
      type: new GraphQLList(SteadfastCredentialType),
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args) {
        const user = await UserModel.findOne({ email: args.email });
        if (!user) throw new Error('এই ইমেইল দিয়ে কোন ইউজার খুঁজে পাওয়া যায়নি');

        return SteadfastModel.find({ user: user._id });
      }
    },



    // ? ------------- currier 
    couriers: {
      type: new GraphQLList(CourierInfoType),
      resolve() {
        return CourierInfo.find();
      }
    },
    courier: {
      type: CourierInfoType,
      args: { id: { type: GraphQLNonNull(GraphQLString) } },
      resolve(_, args) {
        return CourierInfo.findById(args.id);
      }
    },


    // 🔍 Get courier by shopifyId
    courierByShopifyId: {
      type: CourierInfoType,
      args: { shopifyId: { type: GraphQLNonNull(GraphQLString) } },
      resolve(_, args) {
        return CourierInfo.findOne({ shopifyId: args.shopifyId });
      }
    },

    // 🔍 Get courier by orderId (assuming one-to-one)
    courierByOrderId: {
      type: CourierInfoType,
      args: { orderId: { type: GraphQLNonNull(GraphQLString) } },
      resolve(_, args) {
        return CourierInfo.findOne({ orderId: args.orderId });
      }
    },







    // ? ------------- to get saved data 
    shopDomainByUserEmail : {
      type: new GraphQLList(StoreInfoType),
      args: { email: { type: GraphQLString } },
      async resolve(parent, args) {
        const user = await UserModel.findOne({ email: args.email });
        if (!user) return [];
        return StoreModel.find({ user: user._id }); 
      },
    },

    orderByShopDomain: {
      type: new GraphQLList(OrderType),
      args: {
        shopDomain: { type: GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, args) {
        return OrderDataSchema.find({ shopDomain: args.shopDomain });
      }
    },

    courierInfoByShopifyId: {
      type: CourierInfoType,
      args: {
        shopifyId: { type: GraphQLString },
      },
      resolve: async (_, { shopifyId }) => {
        if (!shopifyId) throw new Error('shopifyId is required');
        return await CourierInfo.findOne({ shopifyId });
      },
    },
    courierInfosByShopifyIds: {
      type: new GraphQLList(CourierInfoType),
      args: {
        shopifyIds: { type: new GraphQLList(GraphQLString) },
      },
      resolve: async (_, { shopifyIds }) => {
        if (!shopifyIds || !Array.isArray(shopifyIds)) {
          throw new Error('shopifyIds (array) is required');
        }
        return await CourierInfo.find({ shopifyId: { $in: shopifyIds } });
      },
    }

















  },
});



module.exports = RootQuery