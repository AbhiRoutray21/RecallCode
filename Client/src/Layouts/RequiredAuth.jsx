import { Outlet, Navigate} from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { jwtDecode } from "jwt-decode";

const RequireAuth = ({allowedRoles}) =>{
     const {auth} = useAuth();
     const decode = auth?.accessToken 
        ? jwtDecode(auth.accessToken)
        : undefined

     const roles = decode?.UserInfo?.roles || [];
     
     return(
        roles.find(role => allowedRoles?.includes(role))
            ? <Outlet/>
            : auth?.accessToken
                ? <Navigate to={'/'}/>
                : <Navigate to={'/#login'}/>  
     )
};

export default RequireAuth;

export const GoToHome = () =>{
     const {auth} = useAuth();

     return(
        auth?.accessToken
            ? <Outlet/>
            : <Navigate to="/"/>
     )
}
