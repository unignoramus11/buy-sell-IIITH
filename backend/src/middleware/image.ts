import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { promisify } from "util";

const access = promisify(fs.access);
const stat = promisify(fs.stat);

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

// Helper function to compress image
const compressImage = async (
  inputPath: string,
  quality: number = 80
): Promise<Buffer> => {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Determine format and compress accordingly
  const format = metadata.format;
  switch (format) {
    case "jpeg":
    case "jpg":
      return image.jpeg({ quality }).toBuffer();
    case "png":
      return image.png({ quality }).toBuffer();
    case "webp":
      return image.webp({ quality }).toBuffer();
    default:
      return image.jpeg({ quality }).toBuffer();
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

    // Start with quality 80 and reduce if needed
    let quality = 80;
    let compressedBuffer: Buffer;

    do {
      compressedBuffer = await compressImage(filePath, quality);
      const compressedSize = compressedBuffer.length / 1024;

      if (compressedSize <= IMAGE_SIZE_LIMIT_KB) {
        break;
      }

      quality -= 10;

      // Prevent infinite loop and ensure minimum quality
      if (quality < 10) {
        // If we can't compress enough with quality, try reducing dimensions
        compressedBuffer = await sharp(filePath)
          .resize(1000, 1000, { fit: "inside" })
          .jpeg({ quality: 60 })
          .toBuffer();
        break;
      }
    } while (true);

    // Save the compressed image
    await fs.promises.writeFile(filePath, compressedBuffer);

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
