import '../settings.css';
import { TbEdit } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import {useState,useEffect} from "react";
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import axios from "axios";
import { toast } from 'react-toastify';
import Spinner from '../../../loader/spinner';
import AutoGrowInput from './autogrowinput';
import { jwtDecode } from "jwt-decode";

export default function Profile({setSettingsPop}){
    const navigate = useNavigate();
    const {auth,setAuth} = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const [change,setChange] = useState(false);

    const decode = auth?.accessToken 
        ? jwtDecode(auth.accessToken)
        : undefined

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        (async () => {
            try {
                const res = await axiosPrivate.get(`/users/${decode.UserInfo.id}`,
                    { signal: controller.signal }
                );
                if (res.data.user) {
                    if (isMounted){ 
                        setUserData(res.data.user);
                        setAuth((prev) =>({...prev,name:res.data.user.name}));
                    }
                }
            } catch (error) {
                if (!error?.response) {
                    // toast.error('no server response');
                    return;
                } else if (error.response?.status === 403) {
                    toast.error('Not Found!');
                } else {
                    toast.error('Somthing went wrong');
                }
                if (axios.isCancel(error)) {
                    return
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, []);

    const passChange = async () =>{
        try {
            const response = await axiosPrivate.post("/forgotpass", {email:userData.email});
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

    const userDelete = async () =>{
        try {
            const response = await axiosPrivate.delete(`/users/${decode.UserInfo.id}`);
            if (response.status === 200) {
                toast.success(response.data.message);
                setAuth({});
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
        }
    }

    return (
        <div className='settings-profile-box'>
            <div className='settings-profile-box-header'>
                <div>Profile</div>
                <IoClose className='settings-closeicon' onClick={() => { setSettingsPop(false);navigate(location.pathname);}} />
            </div>

            {loading
                ? <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <Spinner size='20px' color="var(--text-color)"/>
                </div>
                :<>
                <div className='profile-avatar-div'>
                    <div className="settings-profile-avatar">
                        {auth?.accessToken ? auth.name[0] : 'U'}
                    </div>
                    <div className='profile-userName'>
                        {change
                        ? <AutoGrowInput setChange={setChange}/>
                        :<>
                            <span>
                                {auth?.accessToken ? auth.name : 'User'}
                            </span>
                            <TbEdit className='editname-icon' onClick={()=>setChange(true)}/>
                        </>
                        }
                    </div>
                </div>
                <div className='settings-userDetails-div'>
                    <div className='profile-userDetail'>
                        <span className='profile-infoField'>Email: </span>
                        <span className='profile-userData'>{userData.email}</span>
                    </div>
                    <div className='profile-userDetail'>
                        <div>
                            <span className='profile-infoField'>Password: </span>
                            <span className='profile-userData'>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span>
                            {userData?.passwordChangedAt && 
                                <p className='passLastChange'>(Last change: {userData.passwordChangedAt})</p>
                            }
                        </div>
                        <button className='profile-passChange-btn' onClick={passChange}>Change</button>
                    </div>
                    <div className='profile-userDetail delete'>
                        <span>Delete Account</span>
                        <button className='profile-accDelete-btn' onClick={userDelete}>Delete</button>
                    </div>
                </div>
                </>
            }
        </div>
    )
}


