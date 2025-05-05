const { GraphQLObjectType, GraphQLID, GraphQLString, GraphQLSchema, GraphQLList, GraphQLNonNull, GraphQLEnumType, GraphQLInputObjectType, GraphQLInt } = require('graphql')

const { UserType, StoreInfoType, PathaoCredentialType, SteadfastCredentialType, OrderType, CourierInfoType } = require('../GraphqlSchema/UserStoreSchema')

const UserModel = require('../Models/userSchema.js')
const StoreModel = require('../Models/storeSchema.js')
const PathaoModel = require('../Models/PathaoSchema.js')
const SteadfastModel = require('../Models/SteadfastSchema.js')
const OrderModel = require('../Models/OrderDataSchema.js')
const { default: axios } = require('axios')
const CourierInfo = require('../Models/CurrierSchema.js')

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        // Add a new user
        addUser: {
            type: UserType,
            args: {
                displayName: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
            },
            async resolve(parent, args) {
                const newUser = new UserModel({
                    displayName: args.displayName,
                    email: args.email,

                });
                return newUser.save();
            }
        },

        // Add a new store
        addStore: {
            type: StoreInfoType,
            args: {
                storeName: { type: new GraphQLNonNull(GraphQLString) },
                storeUrl: { type: new GraphQLNonNull(GraphQLString) },
                accessToken: { type: new GraphQLNonNull(GraphQLString) },
                apiVersion: { type: new GraphQLNonNull(GraphQLString) },

                user: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                const newStore = new StoreModel({
                    storeName: args.storeName,
                    storeUrl: args.storeUrl,
                    accessToken: args.accessToken,
                    apiVersion: args.apiVersion,
                    user: args.user
                });

                // Add this store's ID to the user's storeIDs array
                const savedStore = await newStore.save();
                await UserModel.findByIdAndUpdate(
                    args.user,
                    { $push: { storeIDs: savedStore._id } },
                    { new: true }
                );
                return savedStore;
            }
        },

        // Delete a user
        deleteUser: {
            type: UserType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return UserModel.findByIdAndDelete(args.id);
            }
        },

        // Delete a store
        deleteStore: {
            type: StoreInfoType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                const store = await StoreModel.findByIdAndDelete(args.id);
                if (store) {
                    await UserModel.findByIdAndUpdate(
                        store.user,
                        { $pull: { storeIDs: store._id } }
                    );
                }
                return store;
            }
        },

        // ! --------------

        addPathaoCredential: {
            type: PathaoCredentialType,
            args: {
                base_url: { type: new GraphQLNonNull(GraphQLString) },
                client_id: { type: new GraphQLNonNull(GraphQLString) },
                client_secret: { type: new GraphQLNonNull(GraphQLString) },
                user: { type: new GraphQLNonNull(GraphQLID) },
                // storeId: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                const newCred = new PathaoModel({
                    base_url: args.base_url,
                    client_id: args.client_id,
                    client_secret: args.client_secret,
                    user: args.user,
                    //   storeId: args.storeId
                });

                const newPathao = newCred.save();
                await UserModel.findByIdAndUpdate(
                    args.user,
                    { pathaoId: newPathao._id },
                    { new: true }
                );
                return newPathao;
            }
        },

        deletePathaoCredential: {
            type: PathaoCredentialType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return PathaoModel.findByIdAndDelete(args.id);
            }
        },


        // ! ------------   Steadfast credentials

        addSteadfastCredential: {
            type: SteadfastCredentialType,
            args: {
                api_url: { type: new GraphQLNonNull(GraphQLString) },
                api_key: { type: new GraphQLNonNull(GraphQLString) },
                secret_key: { type: new GraphQLNonNull(GraphQLString) },
                user: { type: new GraphQLNonNull(GraphQLID) }
            },
            async resolve(parent, args) {
                const newCred = new SteadfastModel({
                    api_url: args.api_url,
                    api_key: args.api_key,
                    secret_key: args.secret_key,
                    user: args.user
                });
                const newSteadfast = newCred.save();
                await UserModel.findByIdAndUpdate(
                    args.user,
                    { SteadfastId: newSteadfast._id },
                    { new: true }
                );
                return newSteadfast;
            }
        },

        updateSteadfastCredential: {
            type: SteadfastCredentialType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                api_url: { type: GraphQLString },
                api_key: { type: GraphQLString },
                secret_key: { type: GraphQLString }
            },
            resolve(parent, args) {
                const updateData = {};
                if (args.api_url) updateData.api_url = args.api_url;
                if (args.api_key) updateData.api_key = args.api_key;
                if (args.secret_key) updateData.secret_key = args.secret_key;

                return SteadfastModel.findByIdAndUpdate(
                    args.id,
                    { $set: updateData },
                    { new: true }
                );
            }
        },
        deleteSteadfastCredential: {
            type: SteadfastCredentialType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve(parent, args) {
                return SteadfastModel.findByIdAndDelete(args.id);
            }
        },


        // ? ----------------- currier add mutation -----------------

        addCourier: {
            type: CourierInfoType,
            args: {
                consignment_id: { type: GraphQLNonNull(GraphQLInt) },
                invoice: { type: GraphQLNonNull(GraphQLString) },
                tracking_code: { type: GraphQLNonNull(GraphQLString) },
                recipient_name: { type: GraphQLNonNull(GraphQLString) },
                recipient_phone: { type: GraphQLNonNull(GraphQLString) },
                recipient_address: { type: GraphQLNonNull(GraphQLString) },
                cod_amount: { type: GraphQLNonNull(GraphQLInt) },
                status: { type: GraphQLNonNull(GraphQLString) },
                note: { type: GraphQLString },
                shopifyId: { type: GraphQLString },
                orderId: { type: GraphQLString },
            },
            async resolve(_, args) {
                try {
                    //  Save the new courier info
                    const courier = new CourierInfo(args);
                    const savedCourier = await courier.save();

                    //  Find the order by shopifyId
                    const order = await OrderModel.findOne({ shopifyId: args.shopifyId });
                    if (!order) {
                        throw new Error('Order not found with the provided Shopify ID');
                    }

                    //  Update the order with the new courierId
                    order.courierId = savedCourier._id;
                    await order.save();

                    //  Update the courier with the order's _id
                    savedCourier.orderId = order._id;
                    await savedCourier.save();

                    return savedCourier;
                } catch (err) {
                    throw new Error(err.message);
                }
            }
        },













        // ! ----------------  add order --------------------------------



        addOrder: {
            type: OrderType,
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                note: { type: GraphQLString },
                processedAt: { type: new GraphQLNonNull(GraphQLString) },
                shopDomain: { type: new GraphQLNonNull(GraphQLString) },
                displayFinancialStatus: { type: new GraphQLNonNull(GraphQLString) },
                displayFulfillmentStatus: { type: new GraphQLNonNull(GraphQLString) },
                shopifyId: { type: GraphQLString },
                courierId: { type: GraphQLID }, // Optional - allows null
                ownerId: { type: GraphQLID },
                customer: {
                    type: new GraphQLInputObjectType({
                        name: 'CustomerInput',
                        fields: {
                            email: { type: new GraphQLNonNull(GraphQLString) },
                            firstName: { type: new GraphQLNonNull(GraphQLString) },
                            lastName: { type: new GraphQLNonNull(GraphQLString) },
                            phone: { type: GraphQLString }
                        }
                    })
                },
                shippingAddress: {
                    type: new GraphQLInputObjectType({
                        name: 'ShippingAddressInput',
                        fields: {
                            address1: { type: new GraphQLNonNull(GraphQLString) },
                            address2: { type: GraphQLString },
                            city: { type: new GraphQLNonNull(GraphQLString) },
                            province: { type: GraphQLString },
                            country: { type: new GraphQLNonNull(GraphQLString) },
                            zip: { type: new GraphQLNonNull(GraphQLString) },
                            phone: { type: GraphQLString }
                        }
                    })
                },
                tags: { type: new GraphQLList(GraphQLString) },
                totalPriceSet: {
                    type: new GraphQLInputObjectType({
                        name: 'PriceSetInput',
                        fields: {
                            shopMoney: {
                                type: new GraphQLInputObjectType({
                                    name: 'MoneyInput',
                                    fields: {
                                        amount: { type: new GraphQLNonNull(GraphQLString) },
                                        currencyCode: { type: new GraphQLNonNull(GraphQLString) },
                                    }
                                })
                            }
                        }
                    })
                },
                lineItems: {
                    type: new GraphQLList(
                        new GraphQLInputObjectType({
                            name: 'LineItemEdgeInput',
                            fields: {
                                node: {
                                    type: new GraphQLInputObjectType({
                                        name: 'LineItemNodeInput',
                                        fields: {
                                            title: { type: new GraphQLNonNull(GraphQLString) },
                                            quantity: { type: new GraphQLNonNull(GraphQLInt) },
                                            sku: { type: GraphQLString },
                                            variantTitle: { type: GraphQLString },
                                            originalUnitPriceSet: {
                                                type: new GraphQLInputObjectType({
                                                    name: 'LineItemPriceSetInput',
                                                    fields: {
                                                        shopMoney: {
                                                            type: new GraphQLInputObjectType({
                                                                name: 'LineItemMoneyInput',
                                                                fields: {
                                                                    amount: { type: new GraphQLNonNull(GraphQLString) },
                                                                    currencyCode: { type: new GraphQLNonNull(GraphQLString) },
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            }
                        })
                    )
                }
            },
            async resolve(parent, args) {
                try {
                    const newOrder = new OrderModel({
                        name: args.name,
                        note: args.note,
                        processedAt: args.processedAt,
                        shopDomain: args.shopDomain,
                        displayFinancialStatus: args.displayFinancialStatus,
                        displayFulfillmentStatus: args.displayFulfillmentStatus,
                        shopifyId: args.shopifyId,
                        customer: args.customer,
                        shippingAddress: args.shippingAddress,
                        tags: args.tags,
                        totalPriceSet: args.totalPriceSet,
                        lineItems: { edges: args.lineItems },
                        courierId: args.courierId || null,
                        ownerId: args.ownerId
                    });

                    const savedOrder = await newOrder.save();

                    try {
                        // 🧠 Construct store URL safely
                        const storeUrl = `https://${args.shopDomain}.myshopify.com`;

                        // 🧠 Find store based on storeUrl and ownerId
                        const store = await StoreModel.findOne({
                            storeUrl: storeUrl,
                            user: args.ownerId
                        });

                        if (!store) {
                            console.warn('Store not found for URL and user:', storeUrl, args.ownerId);
                            // Optionally return the saved order without failing
                            return savedOrder;
                        }

                        // ✅ Safely add shopifyId to savedOrderGid in store
                        await StoreModel.findByIdAndUpdate(
                            store._id,
                            { $addToSet: { savedOrderGid: args.shopifyId } },
                            { new: true }
                        );

                    } catch (storeErr) {
                        console.error('Error updating store with savedOrderGid:', storeErr.message);
                        // Continue — don't block order save due to store update
                    }

                    return savedOrder;
                } catch (err) {
                    console.error('Failed to add order:', err);
                    throw new Error('Failed to add order: ' + err.message);
                }
            }

        }







    }
});



module.exports = mutation;