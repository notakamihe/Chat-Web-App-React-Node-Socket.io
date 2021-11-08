const mongoose = require("mongoose")
const User = require("./User")

const chatSchema = mongoose.Schema({
    messages: {
        type: [Object]
    },
    participants: {
        type: [mongoose.mongo.ObjectId],
        required: true
    }
})

chatSchema.statics.addMessage = async (chatId, msg) => {
    let chat
    const users = await User.find()
   
    try {
        chat = await ChatModel.findById(chatId)

        if (chat == null) {
            console.log("Chat not found.");
            return
        } else if (!users.map(u => u._id.toString()).includes(msg.user)) {
            console.log("Message has invalid user.")
            return
        }

        chat.messages.push(msg)
        chat.save()
        return {chat: chat._id, msg: msg}
    } catch (e) {
        console.log(e);
    }
}

const ChatModel = mongoose.model("Chat", chatSchema)

module.exports = {
    Schema: chatSchema,
    Model: ChatModel
}