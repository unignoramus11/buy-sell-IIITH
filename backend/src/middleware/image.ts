import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";

const DEFAULT_IMAGES = {
  items: path.join(__dirname, "../../uploads/items", "default-item.jpg"),
  users: path.join(__dirname, "../../uploads/users", "default-avatar.png"),
};

export const imageMiddleware = (
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
