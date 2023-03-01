const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const middleware = require("./authmiddleware")


const app = express();
const port =3000;
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/assignment', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
app.listen(port,()=>{
    console.log("my backend applicaton running")
})
const postSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);

const Post = mongoose.model('Post', postSchema);



app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    try {
        await user.save();
        return res.status(201).json({ message: 'User Registered' });
    } catch (err) {
        return res.status(400).json({ message: 'Email Already Exists' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Invalid Email or Password' });
    }
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    return res.status(200).json({ token });
});

app.get('/posts', async (req, res) => {
    const posts = await Post.find().populate('user', 'name email');
    return res.status(200).json({ posts });
});

app.post('/posts', async (req,res) => {
    const { title, body, image } = req.body;
    const post = new Post({ title, body, image, user: req.user.id });
    try {
        await post.save();
        return res.status(201).json({ message: 'Post Created', post });
    } catch (err) {
        return res.status(400).json({ message: 'Error Creating Post' });
    }
});

app.put('/posts/:postId',middleware,async (req,res)=>{
    try{
      const id=req.params.postId
      const post=await Posts.findById(id)
      res.status(200).json({
        status:"Success"
      })
    }
    catch(err){
      res.status(400).json({message:err.message})
    }
  })
  app.delete('/posts/:postId',middleware,async (req,res)=>{
    try{
      const id=req.params.postId
      const deletedPost=await Posts.findByIdAndDelete(id)
      res.status(200).json({
        status:"Successfully deleted"
      })
    }
    catch(err){
      res.status(400).json({
        message:err.message
      })
    }
  })