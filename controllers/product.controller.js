const { response } = require("express");
const Product = require("../model/Product");
const productController = {};
productController.createProduct = async (req, res) => {
    try {
        const {
        sku,
        name,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
        } = req.body;
        const product = new Product({
        sku,
        name,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
        });
        await product.save();
        res.status(200).json({ status: "product success", product });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
    };
    productController.getProducts = async (req, res) => {
    try {
        const { page, name, pageSize } = req.query;
        const PAGE_SIZE = parseInt(pageSize) || 3; //설정안하면 3개만 보여주기

        const cond = {
        isDeleted: { $ne: true }, // 삭제되지 않은 상품만 조회
        ...(name ? { name: { $regex: name, $options: "i" } } : {}),
        };
        let query = Product.find(cond).sort({ createdAt: -1 });
        if (page) {
        query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);
        //최종 몇개 페이지
        //데이터가 총 몇개 있는지
        const totalItemNum = await Product.countDocuments(cond);
        //데이터 총 개수/ PAGE_SIZE
        const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
        response.totalPageNum = totalPageNum;
        }
        const productList = await query.exec();
        response.data = productList;
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
    };
    productController.getProductId = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) throw new Error("item doesn't exist");
        res.status(200).json({ status: "success", data: product });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
    };
    productController.editProducts = async (req, res) => {
    try {
        const productId = req.params.id;
        const {
        sku,
        name,
        size,
        image,
        category,
        description,
        price,
        stock,
        status,
        } = req.body;
        const product = await Product.findByIdAndUpdate(
        { _id: productId },
        { sku, name, size, image, category, description, price, stock, status },
        { new: true }
        );
        if (!product) throw new Error("item doesn't exist");
        res.status(200).json({ status: "success", data: product });
    } catch (error) {
        res.status(400).json({ status: "fail", error: error.message });
    }
    };
    productController.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const del = await Product.findByIdAndUpdate(
        { _id: productId },
        { isDeleted: true },
        { new: true }
        );
        if (!del) throw new Error("item doesn't exist");
        res.status(200).json({ status: "del success", data: del });
    } catch (error) {
        console.log("Deletion Error:", error.message);
        res.status(400).json({ status: "fail", error: error.message });
    }
};
productController.checkStock = async (item) => {
    //사려는 아이템 재고 정보 들고 오기
    const product = await Product.findById(item.productId)
    //사려는 아이템 수량,재고 비교
    if(product.stock[item.size] < item.qty){
    //재고가 불충분하면 불충분메시지와 함께 데이터 반환
        return {isVerify:false, message: `${product.name}의 ${item.size}재고가 부족합니다.`}
    }
    //충분 하다면 재고에서 -qty 성공 
    const newStock = {...product.stock}
    newStock[item.size]-=item.qty
    product.stock=newStock

    await product.save()
    return {isVerify:true}
}
productController.checkItemListStock = async (itemList) => {
    try {
        const insufficientStockItems = [] //재고 불충분한 아이템 저장
        //재고 확인
        await Promise.all(
            itemList.map(async (item)=>{
                const stockCheck = await productController.checkStock(item)
                if(!stockCheck.isVerify){
                    insufficientStockItems.push({item,message:stockCheck.message})
                }
                return stockCheck
            })
        )
        return insufficientStockItems
    } catch (error) {
        return res.status(400).json({status:'fail',error: error.message})
    }
}
module.exports = productController;
