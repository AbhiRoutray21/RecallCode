import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

/*-----------Goback to Homepage-------------*/
const NoSuchPage = () => {
  const navigate = useNavigate();

  useEffect(()=>{
    navigate('/');
  },[])

  return null
};

export default NoSuchPage;