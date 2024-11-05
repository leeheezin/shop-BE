const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
const router = express.Router();

router.post("/",authController.authenticate,cartController.addItemToCart)
router.get("/",authController.authenticate,cartController.getItemCart)
router.get("/qty",authController.authenticate,cartController.getCartQty)
router.patch("/editQty",authController.authenticate,cartController.editItemQty)
router.delete("/:productId",authController.authenticate, cartController.delItemCart)
module.exports = router;