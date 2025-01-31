"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageMiddleware = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const util_1 = require("util");
const access = (0, util_1.promisify)(fs_1.default.access);
const stat = (0, util_1.promisify)(fs_1.default.stat);
// Image size limit from environment variable (default: 250KB)
const IMAGE_SIZE_LIMIT_KB = parseInt(process.env.IMAGE_SIZE_LIMIT_KB || "250", 10);
const DEFAULT_IMAGES = {
    items: path_1.default.join(__dirname, "../../uploads/items", "default-item.jpg"),
    users: path_1.default.join(__dirname, "../../uploads/users", "default-avatar.png"),
};
// Helper function to get file size in KB
const getFileSizeInKB = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield stat(filePath);
    return stats.size / 1024;
});
// Helper function to compress image
const compressImage = (inputPath_1, ...args_1) => __awaiter(void 0, [inputPath_1, ...args_1], void 0, function* (inputPath, quality = 80) {
    const image = (0, sharp_1.default)(inputPath);
    const metadata = yield image.metadata();
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
});
// Compression middleware
const compressionMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filePath = path_1.default.join(__dirname, "../../uploads/", req.path);
        // Check if file exists
        try {
            yield access(filePath, fs_1.default.constants.F_OK);
        }
        catch (_a) {
            return next();
        }
        // Get file size
        const fileSize = yield getFileSizeInKB(filePath);
        // If file is already under the limit, continue
        if (fileSize <= IMAGE_SIZE_LIMIT_KB) {
            return next();
        }
        // Start with quality 80 and reduce if needed
        let quality = 80;
        let compressedBuffer;
        do {
            compressedBuffer = yield compressImage(filePath, quality);
            const compressedSize = compressedBuffer.length / 1024;
            if (compressedSize <= IMAGE_SIZE_LIMIT_KB) {
                break;
            }
            quality -= 10;
            // Prevent infinite loop and ensure minimum quality
            if (quality < 10) {
                // If we can't compress enough with quality, try reducing dimensions
                compressedBuffer = yield (0, sharp_1.default)(filePath)
                    .resize(1000, 1000, { fit: "inside" })
                    .jpeg({ quality: 60 })
                    .toBuffer();
                break;
            }
        } while (true);
        // Save the compressed image
        yield fs_1.default.promises.writeFile(filePath, compressedBuffer);
        next();
    }
    catch (error) {
        console.error("Error in compression middleware:", error);
        next(error);
    }
});
// Main image middleware
const handleImageRequest = (req, res, next) => {
    const filePath = path_1.default.join(__dirname, "../../uploads/", req.path);
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, (err) => {
        if (err) {
            const pathSegments = req.path.split("/");
            const category = pathSegments[1];
            if (category === "items" || category === "users") {
                const defaultPath = DEFAULT_IMAGES[category];
                fs_1.default.access(defaultPath, fs_1.default.constants.F_OK, (defaultErr) => {
                    if (defaultErr) {
                        res.status(404).send("Image not found");
                    }
                    else {
                        res.sendFile(defaultPath);
                    }
                });
            }
            else {
                res.status(404).send("Image not found");
            }
        }
        else {
            next();
        }
    });
};
// Export combined middleware
exports.imageMiddleware = [compressionMiddleware, handleImageRequest];
