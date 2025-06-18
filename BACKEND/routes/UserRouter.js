import express from 'express'
import { User,InterviewDataModel } from '../model/UserModel.js'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET =process.env.JWT_SECRET
const router=express.Router();

router.post("/getUsername",async(req,res)=>{
    const token=req.body.token
   try {
          const payload = jwt.verify(token, JWT_SECRET);
          console.log('Payload:', payload);
          const existingUser = await User.findOne({ email:payload.email });
          const Info={
            _id:existingUser._id,
            name:existingUser.name,
            email:existingUser.email,
          }
         return res.status(200).send({ message: 'User found', payload:Info});
    } catch{
        console.log("Token expired");
        
    }
})

router.post('/register',async(req,res)=>{
    const {name,email,password} = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ message: 'All field are required' });
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Email already registered' });
        }
       //lets Genrate Hash Bro 
       //First Salt
       const salt=await bcrypt.genSalt(10);
       const Hashedpassword=await bcrypt.hash(password,salt)

       const regisuser=new User({name,email,password:Hashedpassword})
       await regisuser.save();
       res.status(201).json({ message: 'User registered successfully' });
       
    } catch (err) {
        console.error('Error in /register:', err);
        res.status(500).json({ message: 'Server error' });
    }

})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password required' });
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email Is Incorrect' });
        }
       const match=await bcrypt.compare(password,user.password);
        if (!match) {
            return res.status(401).json({ message: 'Password Is Incorrect' });
        }
        
        //if match then 
         // Generate JWT token

         const token=jwt.sign({email:user.email,username:user.name},JWT_SECRET,{ expiresIn: '24h' })
         res.json({token,messege:`Login success as ${user.email}`});

    }catch (err) {
        console.error('Error in /login:', err);
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/saveprepcard',async(req,res)=>{
        const {username,role,description,data}=req.body;
        try {
            if (!username || !role || !description){
            return res.status(400).json({message:"All Fields Are Required"})
          }
          const SaveData=new InterviewDataModel({
                username,
                role,
                description,
                data
          })
          await SaveData.save();
          res.status(201).json({data:SaveData,message:'Userdata Saved To DataBase'})
        } catch (error) {
           res.status(500).json({ message: 'Server error',error:error });
        }
        
})

router.post("/saveprepcardbulk", async (req, res) => {
  const { cards,userId } = req.body;

  try {
    const newCards = cards.map(card => ({
      username:userId,
      role:card.role,
      description:card.topics
    }));

    await InterviewDataModel.insertMany(newCards);

    res.status(200).json({ message: "Cards saved to DB." });
  } catch (err) {
    res.status(500).json({ error:err});
  }
});

router.post('/getcarddata',async(req,res)=>{
        const {username}=req.body;
        try {
            if (!username){
            return res.status(400).json({message:"User Id Not Get"})
          }
         const datas=await InterviewDataModel.find({username})
        res.status(200).json({data:datas,message:'Fetch All Saved Data'})
        } catch (error) {
           res.status(500).json({ message: 'Server error',error:error });
        }
        
})

router.post("/delete", async (req, res) => {
  const { _id,username } = req.body;

  if (!_id) {
    return res.status(400).json({ error: "Card ID is required" });
  }

  try {
    const deletedCard = await InterviewDataModel.findByIdAndDelete(_id);
    if (!deletedCard) {
      return res.status(404).json({ error: "Card not found" });
    }
    const datas=await InterviewDataModel.find({username})
    res.status(200).json({ message: "Card deleted successfully", deletedCard,afterdeletedata:datas });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
