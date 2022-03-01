const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"user",
        },
        reference: {
            type: String,
            trim: true,
        },
        name: {
            type: String,
            required: [true, "name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "email is required"],
            trim: true,
        },
        phone: {
            type: String,
        },
        amount: {
            type: Number,
            required: [true, "amount is required"],
        },
        currency: {
            type: String,
            required: [true, "currency is required"],
            enum: ["NGN","USD","GHS", "ZAR"],
        },
        paymentStatus: {
            type: String,
            enum: ["successful", "pending", "failed"],
            default: "pending",
        },
        paymentGateway: {
            type: String,
            required:[true, "Payment gateway is required"],
            enum: ["paystack"], // Payment gateway might differs as the application grows
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Transaction", transactionSchema);