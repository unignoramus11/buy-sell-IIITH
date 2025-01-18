import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[^\s]+\.iiit\.ac\.in$/, // Allows any subdomain of iiit.ac.in
    },
    age: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    overallRating: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    itemID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[^\s]+\.iiit\.ac\.in$/, // Allows any subdomain of iiit.ac.in
    },
    sellerEmail: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[^\s]+\.iiit\.ac\.in$/, // Allows any subdomain of iiit.ac.in
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
    deliveredAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "DELIVERED", "CANCELLED"],
    },
    OTP: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
