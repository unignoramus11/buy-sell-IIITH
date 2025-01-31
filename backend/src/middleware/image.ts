import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { promisify } from "util";

const access = promisify(fs.access);
const stat = promisify(fs.stat);

// Configure Sharp
sharp.cache(false);
sharp.concurrency(1);

// Image size limit from environment variable (default: 250KB)
const IMAGE_SIZE_LIMIT_KB = parseInt(
  process.env.IMAGE_SIZE_LIMIT_KB || "250",
  10
);

const DEFAULT_IMAGES = {
  items: path.join(__dirname, "../../uploads/items", "default-item.jpg"),
  users: path.join(__dirname, "../../uploads/users", "default-avatar.png"),
};

// Helper function to get file size in KB
const getFileSizeInKB = async (filePath: string): Promise<number> => {
  const stats = await stat(filePath);
  return stats.size / 1024;
};

// Helper function to compress image with memory optimization
const compressImage = async (
  inputPath: string,
  quality: number = 80,
  maxSize: number = 1000
): Promise<Buffer> => {
  const image = sharp(inputPath, {
    limitInputPixels: 40000000, // 40 megapixels limit
    sequentialRead: true,
  });

  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Could not read image dimensions");
  }

  // Calculate resize dimensions while maintaining aspect ratio
  const aspectRatio = metadata.width / metadata.height;
  let width = metadata.width;
  let height = metadata.height;

  if (width > maxSize || height > maxSize) {
    if (width > height) {
      width = maxSize;
      height = Math.round(maxSize / aspectRatio);
    } else {
      height = maxSize;
      width = Math.round(maxSize * aspectRatio);
    }
  }

  // Always resize to reasonable dimensions first
  image.resize(width, height, {
    fit: "inside",
    withoutEnlargement: true,
  });

  // Determine format and compress accordingly
  const format = metadata.format;
  switch (format) {
    case "jpeg":
    case "jpg":
      return image.jpeg({ quality, progressive: true }).toBuffer();
    case "png":
      return image.png({ quality, progressive: true }).toBuffer();
    case "webp":
      return image.webp({ quality }).toBuffer();
    default:
      return image.jpeg({ quality, progressive: true }).toBuffer();
  }
};

// Compression middleware
const compressionMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filePath = path.join(__dirname, "../../uploads/", req.path);

    // Check if file exists
    try {
      await access(filePath, fs.constants.F_OK);
    } catch {
      return next();
    }

    // Get file size
    const fileSize = await getFileSizeInKB(filePath);

    // If file is already under the limit, continue
    if (fileSize <= IMAGE_SIZE_LIMIT_KB) {
      return next();
    }

    try {
      // First attempt: try with default quality and size reduction
      let compressedBuffer = await compressImage(filePath, 80, 1500);
      let compressedSize = compressedBuffer.length / 1024;

      // If still too large, try more aggressive compression
      if (compressedSize > IMAGE_SIZE_LIMIT_KB) {
        compressedBuffer = await compressImage(filePath, 60, 1000);
        compressedSize = compressedBuffer.length / 1024;

        // If still too large, try maximum compression
        if (compressedSize > IMAGE_SIZE_LIMIT_KB) {
          compressedBuffer = await compressImage(filePath, 40, 800);
        }
      }

      // Save the compressed image
      await fs.promises.writeFile(filePath, compressedBuffer);
    } catch (compressionError) {
      console.error("Error compressing image:", compressionError);
      // Continue without compression if there's an error
      return next();
    }

    next();
  } catch (error) {
    console.error("Error in compression middleware:", error);
    next(error);
  }
};

// Main image middleware
const handleImageRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const filePath = path.join(__dirname, "../../uploads/", req.path);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      const pathSegments = req.path.split("/");
      const category = pathSegments[1] as "items" | "users";

      if (category === "items" || category === "users") {
        const defaultPath = DEFAULT_IMAGES[category];
        fs.access(defaultPath, fs.constants.F_OK, (defaultErr) => {
          if (defaultErr) {
            res.status(404).send("Image not found");
          } else {
            res.sendFile(defaultPath);
          }
        });
      } else {
        res.status(404).send("Image not found");
      }
    } else {
      next();
    }
  });
};

// Export combined middleware
export const imageMiddleware = [compressionMiddleware, handleImageRequest];
