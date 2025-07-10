import React, { useEffect, useContext } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Tabs from '../../components/Tabs'
import Button from '../../components/Button'
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { useOutletContext } from 'react-router-dom'
import DashboardContext from '../../contexts/dashboardContext'

const Banners = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const tabs = ['Banner Ads', 'Pop Up Ads'];
    const location = useLocation();
    const { restaurant, menuData } = useOutletContext();
    const { setUpdateMenuModal, setModalData } = useContext(DashboardContext);

    const path = location.pathname;
    const pathParts = path.split('/');
    const currentTab = pathParts[3]; // Returns the part after '/dashboard/'

    useEffect(() => {
        if (currentTab === 'popup-ads') {
            setActiveIndex(1);
        } else if (currentTab === 'banner-ads') {
            setActiveIndex(0);
        }
    }, [currentTab]);

    const onTabChange = (index) => {
        if (index === 0) {
            return navigate('banner-ads');
        } else if (index === 1) {
            return navigate('popup-ads');
        }
    }

    const handleUpdateMenu = async () => {
        setUpdateMenuModal(true);
        setModalData({ outlets: restaurant.outlets });
    }

    return (
        <main className='flex flex-col h-full w-full'>
            <div className='flex w-full justify-between items-center px-[24px] pt-2 pb-2 h-fit'>
                <Tabs tabs={tabs} onTabChange={onTabChange} activeTabIndex={activeIndex} size='medium' />
                <Button variant="primary" size="small" className="font-medium" onClick={handleUpdateMenu} >
                    <AutorenewIcon /> Update Menu
                </Button>
            </div>
            <Outlet context={{ menuData }} />
        </main>
    )
}

export default Banners