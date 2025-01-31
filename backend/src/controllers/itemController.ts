import { Request, Response } from "express";
import Item from "../models/Item";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, price, quantity, categories } = req.body;
    const images = (req.files as Express.Multer.File[]).map(
      (file) => file.filename
    );

    // Check if user ID exists
    if (!req.user?.id) {
      res.status(401).json({ message: "Unauthorized - User ID missing" });
      return;
    }

    // Check verification status
    const user = await User.findById(req.user.id);
    if (!user || !user.isVerified) {
      res.status(403).json({
        message:
          "Forbidden - account not verified. Please verify your email first.",
      });
      return;
    }

    const item = new Item({
      name,
      description,
      price,
      quantity,
      categories: categories.split(","),
      images,
      seller: req.user!.id,
    });

    await item.save();

    res.status(201).json({
      message: "Item created successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getItems = async (req: Request, res: Response) => {
  try {
    const { search, categories, minPrice, maxPrice } = req.query;

    let query: any = { isAvailable: true };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (categories) {
      query.categories = { $in: (categories as string).split(",") };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const items = await Item.find(query)
      .populate("seller", "firstName lastName email overallRating")
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate(
      "seller",
      "firstName lastName email overallRating avatar"
    );

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const updateItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      seller: req.user!.id,
    });

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    const updates = req.body;
    if (req.files?.length) {
      updates.images = (req.files as Express.Multer.File[]).map(
        (file) => file.filename
      );
    }

    Object.assign(item, updates);
    await item.save();

    res.json({
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      seller: req.user!.id,
    });

    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
