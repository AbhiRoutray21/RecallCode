import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import "./changepassword.css";
import { useNavigate, useParams } from "react-router-dom";
import { axiosBase } from '../../api/customAxios.jsx'
import NoSuchPage from "../noSuchPage.jsx";
import { Pageloader } from "../../loader/Loader.jsx";
import { toast } from "react-toastify";

const ChangePasswordForm = () => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({ mode: "onChange" });

    const newPassword = watch("newPassword"); // watch the new password field

    const [showNewPassword, setshowNewPassword] = useState(false);
    const [showConfirmPassword, setshowConfirmPassword] = useState(false);
    const [isverify, setisverify] = useState(false);
    const [ispasschange, setispasschange] = useState(false)
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { resetId, token } = useParams();

    /* --- Initial token verification --- */
    useEffect(() => {
        const confirmToken = async () => {
            try {
                const response = await axiosBase.post("/forgotpass/verify", { resetId, token });
                if (response?.status === 200) {
                    setisverify(true);
                    sessionStorage.setItem("email", response.data.email);
                }
            } catch (error) {
                if (!error?.response) {
                    navigate('/login',{ replace: true });
                    toast.error('no server response')
                } else if (error.response?.status === 400) {
                    navigate('/login',{ replace: true });
                    toast.error(error.response.data.message);
                } else if (error.response?.status === 500) {
                    navigate('/login',{ replace: true });
                    toast.error(error.response.data.message);
                } else {
                    navigate('/login',{ replace: true });
                    toast.error('user link verify failed');
                }
            } finally{
                setLoading(false);
            }
        }

        confirmToken();

    }, [])

    /* --- Password change API call --- */
    const onConfirm = async (formData) => {
        reset();
        const email = sessionStorage.getItem('email');

        const alreadychanged = sessionStorage.getItem("ispasschange");

        if (alreadychanged) {
            setispasschange(true);
            return;
        }

        try {
            const response = await axiosBase.post("/forgotpass/change", { password: formData.confirmPassword, resetId, token });
            if (response.status === 200) {
                setispasschange(true);
                sessionStorage.removeItem('email');
                sessionStorage.setItem('ispasschange', true);
                toast.success(response.data.message);
            }
        } catch (error) {
            if (!error?.response) {
                toast.error('no server response')
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 429) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 409) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 500) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Somthing went wrong');
            }
        }
    };

    return (
        <>
            {loading
                ? <Pageloader />
                : isverify
                    ? <div className="changepass-page">
                        <header>RecallCode</header>
                        <div className="changepass-container">
                            {sessionStorage.getItem('ispasschange')
                                ? <div className="passChange-confirm">
                                    Your password has been changed successfully. You can now close this tab.
                                </div>
                                : <form className="changepass-form" onSubmit={handleSubmit(onConfirm)}>
                                    <FaTimes className="Changepass-close-icon" title="Close" onClick={() => navigate('/login')} />

                                    <h2>Change your Password</h2>

                                    <div className="password-info">
                                        <p>Password must</p>
                                        <ul>
                                            <li>Be at least 6 characters long</li>
                                            <li>Contain uppercase and lowercase letters</li>
                                            <li>Contain a number and special character</li>
                                        </ul>
                                    </div>

                                    {/* Password */}
                                    <label htmlFor="newPassword">New Password</label>
                                    <div className="password-wrapper-first">
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
                                                }
                                            })}
                                        />
                                        <span
                                            className="toggle-password"
                                            onClick={() => setshowNewPassword((prev) => !prev)}
                                            title={showNewPassword ? "Hide Password" : "Show Password"}
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    {errors.newPassword && <p className="error">{errors.newPassword.message}</p>}

                                    <label htmlFor="confirmPassword">Confirm Password</label>
                                    <div className="password-wrapper-second">
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
                                            className="toggle-password"
                                            onClick={() => setshowConfirmPassword((prev) => !prev)}
                                            title={showConfirmPassword ? "Hide Password" : "Show Password"}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                    </div>
                                    {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}

                                    {/* Buttons */}
                                    <div className="form-buttons">
                                        <button type="submit" className="confirm-btn">
                                            Confirm
                                        </button>
                                    </div>
                                </form>
                            }
                        </div>
                    </div>
                    : <NoSuchPage/>
            }
        </>
    );
};

export default ChangePasswordForm;
