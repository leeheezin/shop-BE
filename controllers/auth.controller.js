const authController = {};
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
require("dotenv").config();
authController.authenticate = (req, res, next) => {
    try {
        const tokenString = req.headers.authorization;
        if (!tokenString) {
            throw new Error("invalid token");
        }
        const token = tokenString.replace("Bearer ", "");
        jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
        if (error) {
            throw new Error("invalid token");
        }
        req.userId = payload._id;
        next();
        });
    } catch (error) {
        res.status(400).json({ status: "fail", message: error.message });
    }
};
module.exports = authController;