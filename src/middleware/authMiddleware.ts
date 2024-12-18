import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface DecodedToken {
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  try {
    // Periksa apakah ada token di header authorization
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verifikasi token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as DecodedToken;

      // Temukan user berdasarkan ID dari token
      req.user = await User.findById(decoded.userId).select("-password");

      if (!req.user) {
        res.status(401).json({ message: "User not found", decoded });
        return;
      }

      console.log(req.user);
      next();
    } else {
      res.status(401).json({ message: "Unauthorized, no token" }); // Kirim respons
    }
  } catch (error) {
    console.error("Error during token verification:", error);
    res.status(401).json({ message: "Not authorized, token failed" }); // Kirim respons
  }
};

export { protect };
