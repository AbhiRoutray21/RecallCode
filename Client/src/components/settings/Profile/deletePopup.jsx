import '../settings.css';
import { TbAlertTriangle } from "react-icons/tb";
import { useRef, useState } from "react";
import useOutsideClick from "../../../hooks/useOutsideClick";
import useAuth from "../../../hooks/useAuth";
import { motion } from 'framer-motion'
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';
import Spinner from '../../../loader/spinner';

function DeletePopup() {
    const {auth,setAuth,deletePopup,setDeletePopup} = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);
    const optionBoxRef = useRef();
    useOutsideClick(optionBoxRef, () => {!loading && setDeletePopup(false)});

    const decode = auth?.accessToken 
      ? jwtDecode(auth.accessToken)
      : undefined

    const userDelete = async () =>{
        setLoading(true);
        try {
            const response = await axiosPrivate.delete(`/users/${decode.UserInfo.id}`);
            if (response.status === 200) {
                toast.success(response.data.message);
                setAuth({});
                setDeletePopup(false);
            }
        } catch (error) {
            if (!error?.response) {
                toast.error('no server response')
            } else if (error.response?.status === 400) {
                toast.error(error.response.data.message);
            } else if (error.response?.status === 404) {
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
        <>
        {deletePopup && 
            <motion.div
                className="hidden-deletePopup-field"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    ref={optionBoxRef}
                    className="deletePopup-box"
                    initial={{ scale: 0.9, y: '-60%', x: '-50%' }}
                    animate={{ scale: 1, y: '-60%', x: '-50%' }}
                >

                    <span className='deletePopup-heading' >
                        <TbAlertTriangle className='expire-alert-icon' />
                        <span>Delete Account</span>
                    </span>
                    <p >
                        {`Deleting your account will permanently erase all your progress and data.
                    You’ll lose access to extra features and questions.
                    This action cannot be undone. Are you sure you want to continue?`}
                    </p>

                    <div className="deletePopup-buttons">
                        <button className="deletePopup-cancle" onClick={() => setDeletePopup(false)}>
                            Cancel
                        </button>
                        <button className="deletePopup-login" onClick={()=>userDelete()} disabled={loading}>
                            {loading?<Spinner/>:'Delete'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>}
        </>
    )
}

export default DeletePopup;
