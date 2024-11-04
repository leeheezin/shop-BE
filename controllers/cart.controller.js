const Cart = require("../model/Cart");

const cartController = {};
cartController.addItemToCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, size, qty } = req.body;
        // 유저를 가지고 카트 찾기
        let cart = await Cart.findOne({ userId });
        // 유저가 만든 카트가 없다->만들어주기
        if (!cart) {
        cart = new Cart({ userId });
        await cart.save();
        }
        // 이미 카트에 들어가있는 아이템이냐? productId
        const existItem = cart.items.find(
        (item) => item.productId.equals(productId) && item.size === size
        );
        // 그렇다면 에러 ('이미 아이템이 카트에 있습니다')
        if (existItem) {
        throw new Error("이미 동일 아이템이 카트에 있습니다.");
        }
        // 카트에 아이템을 추가
        cart.items = [...cart.items, { productId, size, qty }];
        await cart.save();
        res
        .status(200)
        .json({ status: "success", data: cart, cartItemQty: cart.items.length });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
    };
    cartController.getItemCart = async (req, res) => {
    try {
        const { userId } = req;
        const cart = await Cart.findOne({ userId }).populate({
        path: "items",
        populate: {
            path: "productId",
            model: "Product",
        },
        });
        res.status(200).json({ status: "success", data: cart.items });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
    };
    cartController.delItemCart = async (req, res) => {
    try {
        const { userId } = req;
        const { productId } = req.params;
        const { size } = req.query;

        const cart = await Cart.findOne({ userId });
        if (!cart) throw new Error("카트를 찾을 수 없습니다.");

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item) => {
        const match =
            item.productId.toString() === productId && item.size === size;
        return !match;
        });

        // 삭제가 이루어졌는지 확인 (필터링 후 길이가 줄어들었는지 체크)
        if (cart.items.length === initialLength) {
        throw new Error("해당 아이템을 찾을 수 없거나 삭제에 실패했습니다.");
        }

        await cart.save();

        const updatedCart = await Cart.findOne({ userId }).populate({
        path: "items",
        populate: {
            path: "productId",
            model: "Product",
        },
        });
        res.status(200).json({ status: "success", data: updatedCart.items });
    } catch (error) {
        console.error("삭제 에러:", error.message);
        res.status(400).json({ status: "fail", error: error.message });
    }
    };

    cartController.editItemQty = async (req, res) => {
    try {
        const { userId } = req;
        const { productId, size, qty } = req.body;

        // 카트에서 해당 아이템을 찾아서 수량을 업데이트
        const cart = await Cart.findOne({ userId });
        if (!cart) throw new Error("카트를 찾을 수 없습니다.");

        const item = cart.items.find(
        (item) => item.productId.toString() === productId && item.size === size
        );

        if (!item) throw new Error("아이템을 찾을 수 없습니다.");

        item.qty = qty;
        await cart.save();

        res.status(200).json({ status: "success", data: cart });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
};

module.exports = cartController;
