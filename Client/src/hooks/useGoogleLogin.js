import { useGoogleLogin } from "@react-oauth/google";
import {useNavigate} from 'react-router-dom';
import { axiosBase } from "../api/customAxios";
import useAuth from "./useAuth";
    
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
		} catch (err) {
			console.log('Error while Google Login...', err);
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