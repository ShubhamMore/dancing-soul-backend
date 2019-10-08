const mongoose = require('mongoose')

const receiptSchema = new mongoose.Schema({
    student : {
        type : String,
        required : true
    },
    amount : {
        type : String,
        required : true
    },
    feeDescription : {
        type : String,
        required : true
    },
    receiptDate : {
        type : String,
        required : true
    },
    paymentMode : {
        type : String,
        required : true
    },
    feeType : {
        type : String,
        default: '0'
    }
})

const Receipt = mongoose.model('receipts', receiptSchema)

module.exports = Receipt