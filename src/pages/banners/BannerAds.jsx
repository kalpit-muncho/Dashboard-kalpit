import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SearchBar from '../../components/SearchBar';
import { useNavigate, Link } from 'react-router-dom';
import { getBanners } from '../../models/BannersModel';
import { useOutletContext } from 'react-router-dom';

const BannerAds = () => {
    const navigate = useNavigate();
    const [banners, setBanners] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAds, setFilteredAds] = useState(banners);
    const [loading, setLoading] = useState(true); // New state for loading
    const { menuData } = useOutletContext();
    const [menu, setMenu] = useState({});

    useEffect(() => {
        setFilteredAds(banners);
    }, [banners]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true); // Set loading to true before fetching
                setMenu(menuData);
                console.log("Menu Data: ", menuData);
                const data = await getBanners();
                setBanners(data);
            } catch (error) {
                console.error("Error fetching banners:", error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchBanners();
    }, []); // Empty dependency array runs this effect only once


    const onChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        const filtered = banners.filter(ad =>
            ad.title.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAds(filtered);
    };

    const BannerAdCard = ({ title, cta, image, id, type, typeData }) => {
        const [value, setValue] = useState();
        useEffect(() => {
            if (type === "url") {
                setValue(typeData);
            } else if (type === "category_id") {
                const categoryName = menu.categories.find((category) => category.id === typeData)?.name;
                setValue(categoryName);
            } else if (type === "dish_id") {
                const dishName = menu.dishes.find((dish) => dish.id === typeData)?.name;
                setValue(dishName);
            }
        }, [type, typeData]);
        return (
            <div className="relative flex flex-col w-full h-full rounded-xl overflow-hidden bg-white" key={id}>
                <Link
                    to={`/dashboard/banners/banner-ads/${id}`}
                    state={{ menu: menu }}
                >
                    <button
                        className='absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-white p-2 cursor-pointer hover:bg-[#4B21E2] hover:text-white transition-colors duration-300'
                        onClick={() => navigate(`/dashboard/banners/banner-ads/${id}`)}
                    >
                        <EditIcon fontSize='small' className="text-sm" />
                    </button>
                </Link>
                <div className="w-full h-[250px] overflow-hidden rounded-xl">
                    <img
                        src={image}
                        alt={`Banner Ad - ${title}`}
                        className="w-full h-full object-fill transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <div className="flex justify-between items-center p-1">
                    <h3 className="font-medium text-base truncate">{title}</h3>
                    <p className="text-sm font-medium whitespace-nowrap ml-2">{cta}</p>
                </div>
                <div className='px-2'>
                    <span className='text-gray-500 text-sm'>{value}</span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Loading />
        );
    }

    return (
        <section className="flex flex-col gap-4 w-full h-full">
            <div className="flex w-full flex-col gap-4 px-[24px] pt-2 pb-2 bg-white sticky top-0 z-50">
                {/* <div className="flex w-full items-center">
                    <h1 className="font-medium text-2xl text-[#201F33]">Banners</h1>
                </div> */}
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                    <Link
                        to="/dashboard/banners/create-banner-ad"
                        state={{ menu: menu }}
                    >
                        <Button variant="primary" size="medium" className="sm:w-auto w-full font-medium">
                            <AddIcon className="mr-1" />
                            Add Banner
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

            {banners.length === 0 ? (
                <div className="flex justify-center items-center h-64 w-full text-gray-500 px-[24px]">
                    No banner ads found
                </div>
            ) : (
                <div className="w-full h-full overflow-y-scroll px-[24px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                        {filteredAds.map((ad, index) => (
                            <BannerAdCard
                                key={index}
                                title={ad.title}
                                cta={ad.cta_text}
                                image={ad.image_url}
                                adUrl={ad.ad_url}
                                id={ad.id}
                                type={ad.type}
                                typeData={ad.type_data}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default BannerAds;