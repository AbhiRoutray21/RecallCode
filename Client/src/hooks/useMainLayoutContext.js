import { useContext } from "react";
import MainLayoutContext from "../context/MainLayoutContext";

const useMainLayoutContext = () =>{
    return useContext(MainLayoutContext);
}

export default useMainLayoutContext;