// Models/pathaoCredentialSchema.js
const mongoose = require('mongoose');

const pathaoCredentialSchema = new mongoose.Schema({
  base_url: {
    type: String,
    required: true,
    default: 'https://api-hermes.pathao.com'
  },
  client_id: {
    type: String,
    required: true
  },
  client_secret: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('PathaoCredential', pathaoCredentialSchema);
