const express=require("express");
const app=express();
const http=require('http');
const server=http.createServer(app);
const {Server}=require("socket.io");
const io=new Server(server);
const Group=require("./models/group");
const Chat=require("./models/chat");
const connect=require("./config/db-config");
app.set('view engine','ejs');
// app.use('/',express.static(__dirname+'/public'));

app.use(express.json());
app.use(express.urlencoded({extended:true}))

io.on("connection",(socket)=>{
    console.log("user connected",socket.id);
    socket.on("disconnect",()=>{console.log("user disconnected",socket.id)});

    // socket.on("from_client",()=>{
    //     console.log("recieved event from client")
    // })
    // setInterval(function f(){
    //     socket.emit("from_server");
    // },3000);
    socket.on('join_room',(data)=>{
        console.log("joining a room with data id",data.roomid);
        socket.join(data.roomid);
    })

    socket.on("new_msg",async(data)=>{
        const chat=await Chat.create({
            roomid:data.roomid,
            sender:data.sender,
            content:data.message
        })
       io.to(data.roomid).emit('msg_rcvd',data);

    })
})

app.get('/chat/:roomid/:user',async(req,res)=>{
    const chats=await Chat.find({
        roomid:req.params.roomid,

    });
    console.log(chats);
    const group=await Group.findById(req.params.roomid)
    res.render('index',{
        roomid:req.params.roomid,
        user:req.params.user,
        groupname:group.name,
        previousmsgs:chats,
    })
})

app.get('/group',async(req,res)=>{
    res.render('group');
})

app.post('/group',async(req,res)=>{
    console.log(req.body);
    await Group.create({
        name:req.body.name
    });
    const id=Group.find({name:req.body.name});
    res.redirect('/group');
})
server.listen(3000,async()=>{
    console.log("server is running on port 3000")
    await connect();
    console.log("db connected");

})