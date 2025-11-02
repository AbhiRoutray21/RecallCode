import '../settings.css';
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useState, useEffect,useRef } from "react";
import { useForm } from "react-hook-form";
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { toast } from 'react-toastify';
import useOutsideClick from '../../../hooks/useOutsideClick';
import useAuth from '../../../hooks/useAuth';
import Spinner from '../../../loader/spinner';

function PassChangeBox({ userData,setOpenPassBox }) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    const [currentPassword, newPassword] = watch(["currentPassword", "newPassword"]);

    const axiosPrivate = useAxiosPrivate();
    const {setAuth} = useAuth();
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setshowCurrentPassword] = useState(false);
    const [showNewPassword, setshowNewPassword] = useState(false);
    const [showConfirmPassword, setshowConfirmPassword] = useState(false);
    
    // const refContainer = useRef();
    // useOutsideClick(refContainer, ()=>{ 
    // });

    const passChange = async () => {
        try {
            const response = await axiosPrivate.post("/forgotpass", { email: userData.email });
            if (response.status === 200) {
                toast.success(`Reset email sent. (${response.data.remain} attempt remaining)`);
            }
        } catch (error) {
            if (!error?.response) {
                toast.error('no server response')
            } else if (error.response?.status === 429) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 500) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Somthing went wrong');
            }
        }
    }

    const onConfirm = async (data) => {
        reset();
        setLoading(true);
        try {
            const response = await axiosPrivate.post("/passChange", {oldPass:data.currentPassword, newPass:data.newPassword});
            if (response.status === 200) {
                toast.success(response.data.message);
                setAuth({});
            }
        } catch (error) {
            if (!error?.response) {
                toast.error('no server response');
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 409) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 500) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Somthing went wrong');
            }
        } finally{
            setLoading(false);
        }
    }

    return (
        <div className='passChangeBox'>
            <form className="changepass-auth" onSubmit={handleSubmit(onConfirm)}>

                {/* current Password */}
                <label htmlFor="currentPassword">Current Password</label>
                <div className="password-wrapper-forCurrent">
                    <input
                        id="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter a current password"
                        {...register("currentPassword", {
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
                        className="toggle-password-icon"
                        onClick={() => setshowCurrentPassword((prev) => !prev)}
                        title={showCurrentPassword ? "Hide Password" : "Show Password"}
                    >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {errors.currentPassword && <p className="errorMessage">{errors.currentPassword.message}</p>}
                
                {/* new Password */}
                <label htmlFor="newPassword">New Password</label>
                <div className="password-wrapper-forNew">
                    <input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter a new password"
                        {...register("newPassword", {
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
                            },
                            validate: (value) => value !== currentPassword || "New password must be different from the current password.",
                        })}
                    />
                    <span
                        className="toggle-password-icon"
                        onClick={() => setshowNewPassword((prev) => !prev)}
                        title={showNewPassword ? "Hide Password" : "Show Password"}
                    >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {errors.newPassword && <p className="errorMessage">{errors.newPassword.message}</p>}
                
                {/* confirm Password */}
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-wrapper-forConfirm">
                    <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...register("confirmPassword", {
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
                            },
                            validate: (value) => value === newPassword || "Passwords do not match",
                        })}
                    />
                    <span
                        className="toggle-password-icon"
                        onClick={() => setshowConfirmPassword((prev) => !prev)}
                        title={showConfirmPassword ? "Hide Password" : "Show Password"}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                </div>
                {errors.confirmPassword && <p className="errorMessage">{errors.confirmPassword.message}</p>}

                {/* Buttons */}
                <div className="form-button-auth">
                    <p onClick={()=>{passChange();setOpenPassBox(false)}}>Forgot password?</p>
                    {loading 
                        ?<Spinner size='20px' color='var(--text-color)' speed='1.6s'/>
                        :<button type="button" onClick={()=>setOpenPassBox(false)} className="cancle-btn-auth">
                            Cancle
                        </button>
                    }
                    <button type="submit" className="confirm-btn-auth">
                        Confirm
                    </button>
                </div>
            </form>
        </div>
    )
}

export default PassChangeBox
