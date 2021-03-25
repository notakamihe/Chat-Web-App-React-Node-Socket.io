const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const mongoose = require("mongoose")
const cors = require("cors")

const routes = require("./routes")
const Chat = require("./models/Chat")

mongoose.connect( 'mongodb://localhost/chat2', {
    useNewUrlParser: true, 
    useCreateIndex: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.on("error", (error) => console.log(error))
db.once("open", () => console.log("Connected to the database"))

app.use(cors())
app.use(express.json())

app.use("/api", routes)

io.on("connection", socket => {
    console.log("User connected.");

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("message", async (chatId, message) => {
        console.log(chatId, message);
        let newMsg = await Chat.Schema.statics.addMessage(chatId, message);
        io.emit("message", newMsg);
    });
});

http.listen(8000, () => console.log("Listening on port 8000."))