import React, { useState, useEffect, useContext } from "react";
import io from "socket.io-client";
import {BrowserRouter, Switch, Route} from "react-router-dom"
import axios from "axios"
import { LoginPage, ChatListPage, ChatPage, RegisterPage } from "./pages";
import { UserContext } from "./context/UserContext";

const App = () => {
    axios.defaults.baseURL = "http://localhost:8000/"
    const {user, setUser} = useContext(UserContext)

    console.log(user);

    useEffect(() => {
        
    }, [])
    
    return (
        <div>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/" render={() => user ? <ChatListPage /> : <RegisterPage />} />
                    <Route exact path="/register" render={() => <RegisterPage />} />
                    <Route exact path="/login" render={() => <LoginPage />} />
                    <Route exact path="/chats" render={() => <ChatListPage />} />
                    <Route exact path="/chats/:id" render={({match}) => <ChatPage id={match.params.id} />} />
                </Switch>
            </BrowserRouter>
        </div>
    );
}

export default App;