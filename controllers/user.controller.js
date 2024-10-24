const User = require("../model/User")
const bcrypt = require('bcryptjs')
const userController = {}

userController.createUser = async (req,res) =>{
    try {
        const {email, password, name, level} = req.body
        const user = await User.findOne({email})
        if(user) {
            throw new Error('User already exist')
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
module.exports = userController