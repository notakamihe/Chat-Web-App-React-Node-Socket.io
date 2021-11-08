import React, { useContext, useEffect, useState } from 'react'
import axios from "axios"
import {useHistory, Link} from "react-router-dom"
import { UserContext } from '../context/UserContext'

const RegisterPage = () => {
    const history = useHistory()

    const [email, setEmail] = useState("")
    const [alias, setAlias] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const {user, setUser} = useContext(UserContext)

    useEffect(() => {
        if (user)
            history.push("/chats")
    }, [user])

    const handleRegister = (e) => {
        e.preventDefault()

        axios.post(axios.defaults.baseURL + "api/register", {
            email,
            alias,
            password
        }).then(res => {
            localStorage.setItem("token", res.data.token)

            axios.get(axios.defaults.baseURL + "api/user", {
                headers: {
                    "x-access-token": res.data.token
                }
            }).then(r => {
                setUser(r.data)
                history.push("/chats")
            }).catch(err => {
                console.log(err);
            })
        }).catch(err => {
            console.log(err);

            if (err.response && err.response.status === 400)
                setError(err.response.data)
        })
    }

    return (
        <div className="p-5">
            <h1 className="text-center mx-auto mb-5">Register</h1>
            {error ? <p className="my-4 alert alert-danger col-10 mx-auto text-center">{error}</p> : null}
            <form className="mx-auto text-center" onSubmit={handleRegister}>
                <div>
                    <input 
                        type="text" 
                        name="email" 
                        className="my-3 col-10 p-3" 
                        placeholder="Email"
                        onChange={e => setEmail(e.target.value)}
                        value={email} 
                    />
                </div>
                <div>
                    <input 
                        type="text" 
                        name="name" 
                        className="my-3 col-10 p-3" 
                        placeholder="Name" 
                        onChange={e => setAlias(e.target.value)}
                        value={alias} 
                    />
                </div>
                <div>
                    <input 
                        type="password" 
                        name="password" 
                        className="my-3 col-10 p-3" 
                        placeholder="Password"
                        onChange={e => setPassword(e.target.value)}
                        value={password}  
                    />
                </div>
                <div className="my-4">
                    <button className="btn btn-primary">Sign up</button>
                </div>
                <Link to="/login" >Or Log in</Link>
            </form>   
        </div>
    )
}

export default RegisterPage
