import { useGoogleLogin } from "@react-oauth/google";
import {useNavigate} from 'react-router-dom';
import { axiosBase } from "../api/customAxios";
import useAuth from "./useAuth";
import { toast } from "react-toastify";
    
const useGoolgeLogin = (setLoading) => {
	const navigate = useNavigate();
	const {setAuth} = useAuth();
	
    const responseGoogle = async (authResult) => {
		setLoading(true);
		try {
			if (authResult.code) {
				const response = await axiosBase.get(`/auth/google?code=${authResult.code}`);
				if(response.status === 200){
					const {accessToken,name} = response?.data;
					setAuth({accessToken,name});
					navigate('/',{ replace: true });
				}
			}
		} catch (error) {
			if (!error?.response) {
				toast.error('no server response');
			} else if (error.response?.status === 423) {
				toast.error(error.response.data.message);
			} else {
				toast.error('Login Failed');
			}
		}finally{
     		setLoading(false);
    	}
	};

	const googleLogin = useGoogleLogin({
		onSuccess: responseGoogle,
		onError: responseGoogle,
		flow: "auth-code",
	});

	return googleLogin;
};

export default useGoolgeLogin;