import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchBar from '../../components/SearchBar';
import { Link } from 'react-router-dom';
import { getPopupAds } from '../../models/PopupsModel';
import { useOutletContext } from 'react-router-dom';

const PopupAds = () => {
    const [popupAds, setPopupAds] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [ads, setAds] = useState([]);
    const [filteredAds, setFilteredAds] = useState(ads);
    const [loading, setLoading] = useState(true); // New state for loading
    const [menu, setMenu] = useState([]);
    const { menuData } = useOutletContext();

    useEffect(() => {
        setFilteredAds(popupAds);
    }, [popupAds]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true); // Set loading to true before fetching
                setMenu(menuData);
                const data = await getPopupAds();
                setPopupAds(data);
                setAds(data);
            } catch (error) {
                setLoading(false); // Set loading to false on error
                console.error("Error fetching banners:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };
        fetchBanners();
    }, []);

    const onChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = popupAds.filter(ad =>
            ad.title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAds(filtered);
    };

    const PopupAdCard = ({ title, cta, image, id, type, typeData}) => {
        const [value, setValue] = useState();
        useEffect(() => {
            if( type === "url" ) {
                setValue(typeData);
            } else if( type === "category_id" ) {
                const categoryName = menu.categories.find((category) => category.id === typeData)?.name;
                setValue(categoryName);
            } else if( type === "dish_id" ) {
                const dishName = menu.dishes.find((dish) => dish.id === typeData)?.name;
                setValue(dishName);
            }
        },[type, typeData]);
        return (
            <div className="relative flex flex-col w-full h-full rounded-xl overflow-hidden bg-white" key={id} >
                <Link
                    to={`/dashboard/banners/popup-ads/${id}`}
                    state={{
                        menu: menu
                    }}
                    >
                    <button
                        className='absolute top-2 right-2 z-10 flex justify-center items-center rounded-full bg-white p-2 cursor-pointer hover:bg-[#4B21E2] hover:text-white transition-colors duration-300'
                    >
                        <EditIcon fontSize='small' className="text-sm" />
                    </button>
                </Link>
                <div className="w-full h-full aspect-4/5 overflow-hidden rounded-xl">
                    <img
                        src={image}
                        alt={`Banner Ad - ${title}`}
                        className="w-full h-full object-fill transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <div className="flex justify-between pt-2 px-2 w-full">
                    <h3 className="font-medium text-[16px] w-[60%] truncate">{title}</h3>
                    <p className="text-[12px] ml-2 w-fit truncate">{cta}</p>
                </div>
                <div className='px-2'>
                    <span className='text-gray-500 text-[12px]'>{value}</span>
                </div>
            </div>
        );
    };

    if (loading) {
        return <Loading />; // Show loading spinner during initial fetch
    }

    return (
        <section className="flex flex-col gap-4 w-full h-full sticky top-0 z-50">
            <div className="flex w-full flex-col gap-4 px-[24px] pt-2 pb-2 bg-white">
                {/* <div className="flex w-full items-center">
                    <h1 className="font-medium text-2xl text-[#201F33]">Pop Up Ads</h1>
                </div> */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Link
                        to="/dashboard/banners/create-popup-ad"
                        state={{
                            menu: menu
                        }}
                    >
                        <Button variant="primary" size="medium" className="sm:w-auto w-full font-medium">
                            <AddIcon className="mr-1" />
                            Add New
                        </Button>
                    </Link>
                    <div className="w-full sm:w-1/2 md:w-1/2">
                        <SearchBar
                            placeholder="Search Ads"
                            onChange={onChange}
                            value={searchTerm}
                        />
                    </div>
                </div>
            </div>

            {popupAds.length === 0 ? (
                <div className="flex justify-center items-center h-64 w-full text-gray-500 px-[24px]">
                    No banner ads found matching "{searchTerm}"
                </div>
            ) : (
                <div className="w-full h-full overflow-y-scroll px-[24px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-2 sm:gap-6">
                        {filteredAds.map((ad, index) => (
                            <div key={index}>
                                <PopupAdCard
                                    keyId={ad.id}
                                    title={ad.title}
                                    cta={ad.cta_text}
                                    image={ad.image_url}
                                    adUrl={ad.ad_url}
                                    id={ad.id}
                                    type={ad.type}
                                    typeData={ad.type_data}
                                />       
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default PopupAds;