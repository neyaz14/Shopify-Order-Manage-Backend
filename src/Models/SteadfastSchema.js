// Models/steadfastCredentialSchema.js
const mongoose = require('mongoose');

const steadfastCredentialSchema = new mongoose.Schema({
  api_url: {
    type: String,
    required: true,
    default: 'https://api.steadfast.com' // Default API URL (you can change this)
  },
  api_key: {
    type: String,
    required: true
  },
  secret_key: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('SteadfastCredential', steadfastCredentialSchema);