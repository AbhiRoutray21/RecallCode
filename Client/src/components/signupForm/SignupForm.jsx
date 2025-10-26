import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import styles from "./SignupForm.module.css"; // CSS Module import
import { Link, useNavigate } from "react-router-dom";
import { axiosBase } from "../../api/customAxios.jsx";
import { Blurloader } from "../../loader/Loader.jsx";
import { toast } from "react-toastify"
import useGoolgeLogin from "../../hooks/useGoogleLogin";

const SignupForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => { 
    setLoading(true);
    try {
      const response = await axiosBase.post("/register",data);
      if(response.status == 200){
        toast.success(response.data.message);
        navigate(`/otpverify?email=${data.email}`, { state: { fromsignlog: true } });
        sessionStorage.setItem("fromsignlog", "true");
      }   
    } catch (error) {
      if(!error?.response){
        toast.error('no server response');
       }else if(error.response?.status === 500){
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
    <div className={styles['signup-page']}>
      <header>RecallCode</header>
      <div className={styles['signup-container']}>
        <form className={styles["signup-form"]} onSubmit={handleSubmit(onSubmit)}>
          <FaTimes className={styles["signup-close-icon"]} title="Close" onClick={()=>navigate('/')} />

          <h2>Create Account</h2>

          {/* Name */}
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 3,
                message: "Name must be at least 3 characters.."
              },
              pattern: {
                value: /^[A-Za-z]+$/,
                message: "Name only contain aphabets"
              },
            })}
          />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}

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
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}

          {/* Password */}
          <label htmlFor="password">Password</label>
          <div className={styles["password-wrapper"]}>
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
              className={styles["toggle-password"]}
              onClick={() => setShowPassword((prev) => !prev)}
              title={showPassword ? "Hide Password" : "Show Password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && <p className={styles.error}>{errors.password.message}</p>}

          {/* Buttons */}
          <div className={styles["form-buttons"]}>
            <button type="submit" className={styles["signup-btn"]}>Sign Up</button>
            <button type="button" className={styles["cancel-btn"]} onClick={handleCancel}>
              Cancel
            </button>
          </div>

          <div className={styles['signup-or']}>
            <span>or</span>
          </div>

          <button className={styles["signup-google-button"]} onClick={(e) => {googleLogin(); e.preventDefault();}}>
            <FcGoogle className={styles["signup-google-icon"]} />
            <span>Sign up with Google</span>
          </button>

          <p className={styles["login-note"]}>
            Already have an account?{" "}
            <Link to="/login" className={styles["login-link"]}>Login</Link>
          </p>
        </form>
      </div>
      {loading && <Blurloader/>}
    </div>
  );
};

export default SignupForm;
