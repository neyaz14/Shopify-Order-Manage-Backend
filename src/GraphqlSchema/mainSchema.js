const { GraphQLSchema } = require('graphql');
const RootQuery = require('../G_Query/userStoreQuery');
const Mutation = require('../G_Mutation/userStoreMutation');

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});

module.exports = schema;
