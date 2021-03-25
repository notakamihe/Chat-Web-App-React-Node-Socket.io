import React, { useContext, useEffect, useState, useRef } from 'react'
import { UserContext } from '../context/UserContext'
import {useHistory} from "react-router-dom"
import axios from 'axios'
import moment from 'moment'
import io from "socket.io-client"
import colors from "../colors"

const socket = io();

const ChatPage = (props) => {
    const history = useHistory(0)

    const [text, setText] = useState("")
    const [chat, setChat] = useState({})
    const [messages, setMessages] = useState([])
    const [participants, setParticipants] = useState([])

    const {user, setUser} = useContext(UserContext)
    const bottomRef = useRef()
    

    const getChat = () => {
        return chat
    }

    const handleSendText = (e) => {
        e.preventDefault()
        
        if (!text)
            return

        socket.emit("message", chat._id, {
            content: text,
            sentOn: Date.now(),
            user: user._id
        })

        setText("")
    }

    useEffect(() => {
        axios.get(axios.defaults.baseURL + `api/chats/${props.id}`).then(res => {
            console.log(res.data);
            setChat(res.data)
            setMessages(res.data.messages)

            if (user && !res.data.participants.includes(user._id))
                history.push("/")

            setParticipants([])

            res.data.participants.forEach(p => {
                axios.get(axios.defaults.baseURL + `api/users/${p}`).then(r => {
                    setParticipants(participants => [...participants, r.data])
                }).catch(err => console.log(err))
            })
        }).catch(err => history.push("/"))

        if (user === null)
            history.push("/login")

        
    }, [user])

    useEffect(() => {
        socket.on("message", async (response) => {
            const theChat = (await axios.get(axios.defaults.baseURL + `api/chats/${props.id}`)).data
            
            if (theChat._id == response.chat)
                setMessages(messages => [...messages, response.msg])
        })
    }, [])  
    
    useEffect(() => bottomRef.current.scrollIntoView())
    
    return (
        <div>
            <div className="p-5 d-flex" style={{flexDirection: 'column', marginBottom: 96}}>
                {
                    messages.map((item, idx) => (
                        user && item.user == user._id ?

                        <div 
                            className="bg-dark text-light p-4 rounded my-2" 
                            style={{alignSelf: "flex-start", maxWidth: "60%"}}
                            key={idx}
                        >
                            <p>
                                {item.content}
                            </p>
                            <p>You on {moment(item.sentOn).format(`MMM DD [at] h:mm:ss A`)}</p>
                        </div> :

                        <div 
                            key={idx}
                            className="text-light p-4 rounded my-2" 
                            style={{alignSelf: "flex-end", maxWidth: "60%",
                             backgroundColor: colors[participants.map(p => p._id).indexOf(item.user)]}}
                        >
                            <p>
                                {item.content}
                            </p>
                            <p>{participants.find(p => p._id == item.user) ? 
                                participants.find(p => p._id == item.user).alias : null} on {moment(item.sentOn).format("MMM DD [at] h:mm:ss A")}</p>
                        </div>
                    ))
                }

            </div>
            <div ref={bottomRef}></div>
            <form 
                style={{minHeight: 65}} 
                className="bg-dark fixed-bottom d-flex align-items-center p-2"
                onSubmit={handleSendText}
            >
                <div style={{flex: 0.9}} className="mx-4">
                    <input
                        type="text"
                        className="rounded bg-transparent p-2 text-light col-12"
                        style={{
                            border: "1px solid white",
                            outline: "none"
                        }}
                        onChange={e => setText(e.target.value)}
                        value={text}
                    />
                </div>
                <button style={{flex: 0.1}} className="btn btn-info">Send</button>
            </form>
        </div>
    )
}

export default ChatPage
