const mongoose = require('mongoose');

const storeDetails = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  storeUrl: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  apiVersion: {
    type: String,
    required: true,
  },
  savedOrderGid: [String],
 
}, {
  timestamps: true,
});



module.exports = mongoose.model('UserStoreDetail', storeDetails);