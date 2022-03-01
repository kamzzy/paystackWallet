const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
    {
        amount: { type: Number, default:0 },
        // though user can be implied from wallet, 
        // let's double save it for security
        userId: {
            type: String,
            ref: "users",
            required:true,
        },

        isInflow: { type: Boolean },
        paymentMethod: { type: String, default: "paystack" },

        currency: {
            type: String,
            required: [true,"currency is required"],
            enum: ["NGN", "USD", "GHS", "ZAR"],
        },
        status: {
            type: String,
            required: [true, "payment status is required"],
            enum: ["successful", "pending", "failed"],
        },
    },
    { timestamp: true }
);

module.exports = mongoose.model("walletTransaction", walletTransactionSchema);