import '../settings.css';
import { TbEdit } from "react-icons/tb";
import { IoClose } from "react-icons/io5";
import {useState,useEffect} from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosPrivate from '../../../hooks/useAxiosPrivate';
import axios from "axios";
import { toast } from 'react-toastify';
import Spinner from '../../../loader/spinner';
import { jwtDecode } from "jwt-decode";
import { lazy,Suspense } from 'react';
const PassChangeBox = lazy(() => import('./passChangeBox'));
const AutoGrowInput = lazy(() => import('./autogrowinput'));


export default function Profile({setSettingsPop}){
    const navigate = useNavigate();
    const location = useLocation()
    const {auth,setAuth,setDeletePopup} = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const [userData, setUserData] = useState({});
    const [loading, setLoading] = useState(true);
    const [change,setChange] = useState(false);
    const [openPassBox,setOpenPassBox] = useState(false);

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

    function openDeletePopup(){
        setSettingsPop(false);
        navigate(location.pathname);
        setDeletePopup(true);
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
                        ? <Suspense fallback={''}><AutoGrowInput setChange={setChange}/></Suspense> 
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
                        <div className='profile-password-div'>
                            <span className='profile-infoField'>Password: </span>
                            <span className='profile-userData'>&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;</span>
                            {userData?.passwordChangedAt && 
                                <p className='passLastChange'>(Last change: {userData.passwordChangedAt})</p>
                            }
                            {openPassBox && <Suspense fallback={''}><PassChangeBox userData={userData} setOpenPassBox={setOpenPassBox}/></Suspense> }
                        </div>
                        {!openPassBox && <button className='profile-passChange-btn' onClick={() => setOpenPassBox(true)}>Change</button>}
                    </div>
                    <div className='profile-userDetail delete'>
                        <span>Delete Account</span>
                        <button className='profile-accDelete-btn' onClick={openDeletePopup}>Delete</button>
                    </div>
                </div>
                </>
            }
        </div>
    )
}


