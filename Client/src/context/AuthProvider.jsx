import { createContext, useState } from "react";

const AuthContext = createContext({});

export function AuthProvider({children}){
    const [auth,setAuth] = useState({});
    const [expire, setExpire] = useState(false);

    return(
        <AuthContext.Provider value={{auth, setAuth,expire,setExpire}}>
            {children}
        </AuthContext.Provider>
    )
};

export default AuthContext;