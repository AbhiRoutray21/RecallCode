import { axiosBase } from '../api/customAxios.jsx';
import useAuth from './useAuth.js';

const useRefreshToken = () => {
  const { setAuth } = useAuth();

    const refresh = async () => {
      const response = await axiosBase.get("/refresh");
      setAuth(prev => {
          return { 
            ...prev,
            name: response.data.name,
            accessToken: response.data.accessToken 
          }
      }); 
      return response.data.accessToken;
    }

  return refresh;
};

/* don't wrap this code into tryCatch block, 
because the error from this api call is handle inside useAxiosPrivate hook.  
and it is nessacery for session expire ditection and popup*/

export default useRefreshToken;
