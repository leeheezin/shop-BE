const Order = require("../model/Order")
const { randomStringGenerator } = require("../utils/randomStringGenerator")
const productController = require("./product.controller")

const orderController = {}
orderController.createOrder = async (req,res) => {
    try {
        const {userId} = req
        const {shipTo,contact,totalPrice,orderList} = req.body

        //재고확인, 재고업데이트 먼저
        const insufficientStockItems = await productController.checkItemListStock(orderList)

        //재고가 충분하지 않는 아이템이 있다면 => 에러
        if(insufficientStockItems.length > 0) {
            const errorMessage = insufficientStockItems.reduce((total,item)=>total+=item.message,"")
            throw new Error(errorMessage);
            
        }
        const contactString = `${contact.firstName} ${contact.lastName} (${contact.contact})`;
        //재고 충분하면 오더 만들기
        const newOrder = new Order({
            userId,
            totalPrice,
            shipTo,
            contact:contactString, //문자열로
            items: orderList,
            orderNum: randomStringGenerator()
        })

        await newOrder.save()
        //save후 카트 비워주기

        res.status(200).json({status: 'success', orderNum: newOrder.orderNum})
    } catch (error) {
        return res.status(400).json({status:'fail',error: error.message})
    }
}
orderController.getOrder = async (req,res) => {
    try {
        const {userId} = req
        const { ordernum } = req.query;
        const query = { userId };
        if (ordernum) {
            query.orderNum = new RegExp(ordernum, "i");;  
        }
        const orderList = await Order.find(query).populate({
            path: 'items.productId',
            model: 'Product',
            select: 'name price image status'
        })
        res.status(200).json({ status: 'success', orders: orderList });
    } catch (error) {
        res.status(400).json({ status: 'fail', error: error.message });
    }
}
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