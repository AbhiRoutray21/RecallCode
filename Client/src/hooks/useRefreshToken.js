import { axiosBase } from '../api/customAxios.jsx';
import useAuth from './useAuth.js';

const useRefreshToken = () => {
  const { setAuth } = useAuth();

    const refresh = async () => {
      try {
        const response = await axiosBase.get("/refresh");
        setAuth(prev => {
            return { 
              ...prev,
              name: response.data.name,
              accessToken: response.data.accessToken 
            }
        }); 
        return response.data.accessToken;
      } catch (error) {
        
      }
    }

  return refresh;
};

export default useRefreshToken;
