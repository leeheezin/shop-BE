const Order = require("../model/Order")
const Product = require("../model/Product")
const { randomStringGenerator } = require("../utils/randomStringGenerator")
const productController = require("./product.controller")

const orderController = {}
orderController.createOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { shipTo, contact, totalPrice, orderList } = req.body;

        // 재고 확인
        const insufficientStockItems = await productController.checkItemListStock(orderList);

        // 재고가 충분하지 않은 아이템이 있다면 => 에러
        if (insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total, item) => total += item.message, "");
            throw new Error(errorMessage);
        }

        const contactString = `${contact.firstName} ${contact.lastName} (${contact.contact})`;
        
        // 재고 충분하면 오더 만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact: contactString, // 문자열로
            items: orderList,
            orderNum: randomStringGenerator()
        });

        // 주문 저장
        await newOrder.save();

        // 재고 감소 로직 추가
        await Promise.all(
            orderList.map(async (item) => {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock[item.size] -= item.qty;
                    await product.save();
                }
            })
        );

        // 주문 후 성공 응답
        res.status(200).json({ status: 'success', orderNum: newOrder.orderNum });
    } catch (error) {
        return res.status(400).json({ status: 'fail', error: error.message });
    }
}

orderController.getOrder = async (req, res) => {
    try {
        const { userId } = req;
        const { ordernum, page = 1 } = req.query;
        const PAGE_SIZE = 3; // 한 페이지에 보여줄 아이템 수
        const query = { userId };

        if (ordernum) {
            query.orderNum = new RegExp(ordernum, "i");
        }

        const totalOrders = await Order.countDocuments(query);
        const totalPageNum = Math.ceil(totalOrders / PAGE_SIZE);

        const orderList = await Order.find(query)
            .populate({
                path: 'items.productId',
                model: 'Product',
                select: 'name price image status',
            })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);

        res.status(200).json({ status: 'success', orders: orderList, totalPageNum });
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message });
    }
};

orderController.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { status } = req.body; 
        //상태검증
        const validStatuses = ["preparing", "shipping", "delivered", "refund"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ status: "fail", message: "Invalid status" });
        }
        //상태업데이트
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ status: "fail", message: "Order not found" });
        }

        res.status(200).json({ status: "success", order: updatedOrder });
    } catch (error) {
        res.status(500).json({ status: "fail", error: error.message });
    }
};

module.exports = orderController