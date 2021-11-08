const express = require("express")
const app = express()
const router = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const config = require("./config")

const User = require("./models/User")
const Chat = require("./models/Chat").Model

router.post("/register", async (req, res) => {
    const {email, password, alias} = req.body

    if (!email)
        return res.status(400).send("Email must not be blank.")
    else if (!email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*/))
        return res.status(400).send("Email not valid.")

    if (!password)
        return res.status(400).send("Password must not be blank.")
    else if (password.length < 8)
        return res.status(400).send("Password must be 8+ characters.")

    if (!alias)
        return res.status(400).send("Alias must not blank.")

    var hashedPassword = bcrypt.hashSync(password, 8)
    const payload = {email, password: hashedPassword, alias}

    User.collection.insertOne(payload).then(result => {
        var token = jwt.sign({ id: result.ops[0]._id }, config.secret, {
            expiresIn: 86400
        });

        return res.status(201).json({ auth: true, token: token });
    }).catch(err => {
        if (err.keyPattern && err.keyPattern.email) {
            return res.status(400).send("Email not available.")
        } else {
            return res.status(500).send(err.message)
        }
    })
})

router.post("/login", async (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err)
            return res.status(500).send(err.message)

        if (!user)
            return res.status(400).send("No user found with this email.")

        if (!req.body.password)
            return res.status(400).send("Password must not be blank.")
        else if (!(bcrypt.compareSync(req.body.password, user.password)))
            return res.status(401).send("Password is invalid")

        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400
        });
        
        return res.status(200).send({ auth: true, token: token })
    })
})

router.get("/user", async (req, res) => {
    var token = req.headers["x-access-token"]

    if (!token)
        return res.status(401).send({auth: false, message: "No token provided."})

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err)
            return res.status(401).send({auth: false, message: "User not authenticated."})

        User.findById(decoded.id).then(result => {
            return res.json(result)
        }).catch((err) => {
            return res.status(400).send("User not found.")
        })
    })
})

router.get("/users", async (req, res) => {
    return res.send(await User.find())
})

router.get("/users/:id", async (req, res) => {
    let user

    try {
        user = await User.findById(req.params.id)

        if (user == null)
            return res.status(400).send("Could not find user.")

        return res.json(user)
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.put("/users/:id", async (req, res) => {
    let user

    try {
        user = await User.findById(req.params.id)

        if (user == null)
            return res.status(400).send("Could not find user.")

        if (!req.body.alias)
            return res.status(400).send("Alias must not be blank.")

        user.alias = req.body.alias
        return res.json(await user.save())
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.delete("/users/:id", async (req, res) => {
    let user

    try {
        user = await User.findById(req.params.id)

        if (user == null)
            return res.status(400).send("Could not find user.")

        user.remove()
        return res.send("Deletion successful.")
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.get("/chats", async (req, res) => {
    return res.json(await Chat.find())
})

router.get("/chats/:id", async (req, res) => {
    let chat

    try {
        chat = await Chat.findById(req.params.id)

        if (chat == null)
            return res.status(400).send("Could not find chat.")

        return res.json(chat)
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.post("/chats", async (req, res) => {
    const {messages, participants} = req.body
    const users = await User.find()

    if (messages && messages.some(msg => !users.map(u => u._id.toString()).includes(msg.user))) {
        return res.status(400).send("Message has invalid user.")
    }

    if (!participants || participants.length < 2) {
        return res.status(400).send("At least two participants needed for conversation.")
    } else if (participants.some(p => !users.map(u => u._id.toString()).includes(p))) {
        return res.status(400).send("A participant is not valid.")
    } else if (participants.some(p => participants.filter(x => x === p).length > 1)) {
        return res.status(400).send("Duplicate participants not allowed.")
    }

    const payload = {messages: messages || [], participants}

    Chat.collection.insertOne(payload).then(result => {
        return res.json(result.ops[0])
    }).catch(err =>  {
        return res.status(500).send(err.message)
    })
})

router.put("/chats/:id", async (req, res) => {
    const {messages, participants} = req.body
    const users = await User.find()

    if (messages && messages.some(msg => !users.map(u => u._id.toString()).includes(msg.user))) {
        return res.status(400).send("Message has invalid user.")
    }

    if (!participants || participants.length < 2) {
        return res.status(400).send("At least two users needed for conversation.")
    } else if (participants.some(p => !users.map(u => u._id.toString()).includes(p))) {
        return res.status(400).send("A participant is not valid.")
    } else if (participants.some(p => participants.filter(x => x === p).length > 1)) {
        return res.status(400).send("Duplicate participants not allowed.")
    }

    let chat

    try {
        chat = await Chat.findById(req.params.id)

        if (chat == null)
            return res.status(400).send("Could not find chat.")

        chat.messages = messages || []
        chat.participants = participants
        return res.json(await chat.save())
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

router.delete("/chats/:id", async (req, res) => {
    let chat

    try {
        chat = await Chat.findById(req.params.id)

        if (chat == null)
            return res.status(400).send("Could not find chat.")

        chat.remove()
        return res.send("Deletion successful.")
    } catch (err) {
        return res.status(500).send(err.message)
    }
})

module.exports = router