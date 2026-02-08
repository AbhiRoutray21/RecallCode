import {useState} from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash,FaTimes } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./login.css";
import { axiosBase } from "../../api/customAxios";
import useAuth from "../../hooks/useAuth";
import { Blurloader } from "../../loader/Loader";
import { toast } from "react-toastify"
import useGoolgeLogin from "../../hooks/useGoogleLogin";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {setAuth} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const onLogin = async (formData) => {
    setLoading(true);
    try {
      const response = await axiosBase.post("/auth",formData);
      if(response.status === 200){
        const {accessToken,name} = response?.data;
        // GA4 login tracking (safe)
        if (window.gtag) {
            window.gtag('event', 'login_success', {
                method: 'email'
            });
        }
        setAuth({accessToken,name});
        navigate(from, { replace: true });
      }
    } catch (error) {
      if(!error?.response){
        toast.error('no server response');
       }else if(error.response?.status === 401){
        toast.error(error.response.data.message);
       }else if(error.response?.status === 403){
        toast.error(error.response.data.message);
       }else if(error.response?.status === 409){
        navigate(`/otpverify?email=${formData.email}`, { state: { fromsignlog: true } });
        sessionStorage.setItem("fromsignlog", "true");
        toast.error(error.response.data.message);
       }else if(error.response?.status === 423){
        toast.error(error.response.data.message);
       }else if(error.response?.status === 429){
        toast.error(error.response.data.message);
       }else{
        toast.error('Login Failed');
       }
    } finally{
      setLoading(false);
    }
    reset();
  };

  const handleCancel = () => reset();

  const googleLogin = useGoolgeLogin(setLoading); 

  return (
         <div className="login-Page">
          <header>RecallCode</header>
          <div className="login-container">
              <form className="login-form" onSubmit={handleSubmit(onLogin)}>
                  <FaTimes className="close-icon" title="Close" onClick={()=>navigate('/')} />
                  
                  <h2>Login</h2>

                  {/* Email */}
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        {...register("email", {
                            required: "Email is required",
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: "Invalid email format",
                            },
                        })}
                    />
                    {errors.email && <p className="error">{errors.email.message}</p>}
                

                    {/* Password */}
                    <label htmlFor="password">Password</label>
                    <div className="password-wrapper">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter a password"
                            {...register("password", {
                                required: "Password is required",
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                                    message: "Password must contain uppercase, lowercase, number & special char",
                                },
                                minLength: {
                                    value: 6,
                                    message: "Password must be at least 6 characters",
                                },
                                maxLength: {
                                    value: 12,
                                    message: "Password max length is 12 characters",
                                }
                            })}
                        />
                        <span
                            className="toggle-password"
                            onClick={() => setShowPassword((prev) => !prev)}
                            title={showPassword ? "Hide Password" : "Show Password"}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    {errors.password && <p className="error">{errors.password.message}</p>}
       
                  {/* Buttons */}
                  <div className="form-buttons">
                      <button type="submit" className="login-btn">Login</button>
                      <button type="button" className="cancel-btn" onClick={handleCancel}>
                          Cancel
                      </button>
                  </div>

                  <Link className="forgot" to="/forgot_password">Forgot password?</Link>

                  <div className='login-or'>
                    <span>or</span>
                  </div>

                  <button className="google-button" onClick={(e) => {googleLogin(); e.preventDefault();}}>
                    <FcGoogle className="google-icon"/>
                    <span>Sign in with Google</span>
                  </button>

                  <p className="login-note">
                      New User?{" "}
                      <Link to="/signup" className="login-link">Sign up</Link>
                  </p>

              </form>
          </div>
          {loading && <Blurloader/>}
         </div>

  );
};

export default LoginForm;
