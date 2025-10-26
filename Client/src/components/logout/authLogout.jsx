import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axios from "axios";
import useAuth from "../../hooks/useAuth";
import { toast } from "react-toastify"

/*-----------Logout and Goback to Homepage-------------*/
const AuthLogout = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        if (auth?.accessToken) {
          const response = await axiosPrivate.post("/logout",
            { signal: controller.signal }
          );
          if (isMounted && (response.status === 200 || response.status === 204)) {
            await setAuth({});
            sessionStorage.clear();
          }
          navigate('/');
        } else {
          navigate('/');
        }
      }
      catch (error) {
        if (!error?.response) {
          toast.error('no server response');
        } else if (error.response?.status === 403) {
          toast.error('Something went wrong.');
        } else{
          toast.error('Something went wrong.');
        }
        if (axios.isCancel(error)) return;
      }
    })();

    return () => {
      isMounted = false;
      controller.abort();
    }
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%', backgroundColor: 'var(--bg-p-color)' }}></div>
  )
};

export default AuthLogout;