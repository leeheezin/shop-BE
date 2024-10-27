const User = require("../model/User")
const bcrypt = require('bcryptjs')
const userController = {}

userController.createUser = async (req,res) =>{
    try {
        const {email, password, name, level} = req.body
        const user = await User.findOne({email})
        if(user) {
            throw new Error('이미 가입된 이메일 입니다.')
        }
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password,salt)
        const newUser = new User({email,password:hash,name,level:level?level:'customer'})
        await newUser.save()
        res.status(200).json({status: 'success'})
    } catch (error) {
        res.status(400).json({status: 'fail',error: error.message})
    }
}
userController.loginUser = async (req,res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(user) {
            const pwMath = bcrypt.compareSync(password, user.password)
            if(pwMath){
                const token = user.generateToken()
                return res.status(200).json({status: 'login success', user, token})
            }
        }
        throw new Error('이메일 또는 패스워드가 일치하지 않습니다.')
    } catch (error) {
        res.status(400).json({status: 'login fail', message: error.message})
    }
}
userController.getUser= async (req,res)=>{
    try {
        const {userId} = req 
        const user = await User.findById(userId)
        if(!user){
            throw new Error("can not find user")
        }
        res.status(200).json({status:"success", user})
    } catch (error) {
        res.status(400).json({status:"fail", message: error.message})
    }
}
module.exports = userController