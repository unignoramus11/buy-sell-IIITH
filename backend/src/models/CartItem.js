import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    cartOwnerEmail: {
      type: String,
      required: true,
      trim: true,
      match: /^[a-zA-Z0-9._%+-]+@[^\s]+\.iiit\.ac\.in$/, // Allows any subdomain of iiit.ac.in
    },
    itemID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    isSavedForLater: {
      type: Boolean,
      required: true,
    },
    bargainedPrice: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// TODO: whenever a cart item is added, update the cart list of the user

const CartItem = mongoose.model("CartItem", cartItemSchema);

export default CartItem;
