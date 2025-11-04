import { createContext, useState } from "react";

const AuthContext = createContext({});

export function AuthProvider({children}){
    const [auth,setAuth] = useState({});
    const [expire, setExpire] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);

    return(
        <AuthContext.Provider value={{auth,setAuth,expire,setExpire,deletePopup,setDeletePopup}}>
            {children}
        </AuthContext.Provider>
    )
};

export default AuthContext;