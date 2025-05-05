const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courierInfoSchema = new Schema({
    consignment_id: {
      type: Number,
      required: true,
      unique: true
    },
    invoice: {
      type: String,
      required: true
    },
    tracking_code: {
      type: String,
      required: true,
      unique: true
    },
    recipient_name: {
      type: String,
      required: true
    },
    recipient_phone: {
      type: String,
      required: true
    },
    recipient_address: {
      type: String,
      required: true
    },
    cod_amount: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      required: true
    },
    note: {
      type: String
    },
    shopifyId: { 
      type: String,
     
    },
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order'  
     
    },
  }, {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  });
// Create and export the model
const CourierInfo = mongoose.model('CourierInfo', courierInfoSchema);
module.exports = CourierInfo;