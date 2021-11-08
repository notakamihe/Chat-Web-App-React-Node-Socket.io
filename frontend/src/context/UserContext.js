import React, { useState, useEffect } from "react";
import axios from "axios"

export const UserContext = React.createContext()

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(undefined)

    useEffect(() =>  {
        axios.get(axios.defaults.baseURL + "api/user", {
            headers: {
                'x-access-token': localStorage.getItem('token')
            }
        }).then(res => {
            setUser(res.data)
        }).catch(err => {
            setUser(null)
        })
    }, [])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
};