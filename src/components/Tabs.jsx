import React, { useState, useEffect } from "react";

const Tabs = ({ tabs, activeTabIndex = 0, onTabChange, activeColor = "#4B21E2", size = "small" }) => {
    const [activeTab, setActiveTab] = useState(activeTabIndex);

    useEffect(() => {
        setActiveTab(activeTabIndex);
    }, [activeTabIndex]);

    const handleTabClick = (index) => {
        setActiveTab(index);
        if (onTabChange) onTabChange(index);
    };

    const getSizeClasses = () => {
        switch (size) {
            case "medium":
                return "py-4 px-4 md:px-6 text-base md:text-lg";
            case "large":
                return "py-5 px-5 md:px-8 text-lg md:text-xl";
            default: // small
                return "py-3 px-3 md:px-4 text-sm md:text-md";
        }
    };

    return (
        <div className="w-fit overflow-x-auto">
            <div role="tablist" className="flex w-fit">
                {tabs.map((tab, index) => (
                    <button
                        key={index}
                        role="tab"
                        aria-selected={activeTab === index}
                        className={`${getSizeClasses()} font-medium relative whitespace-nowrap transition-colors duration-300 cursor-pointer hover:bg-[#F8F7FA] hover:rounded-[8px]
                            ${activeTab === index ? "text-[#4B21E2] hover:bg-white hover:rounded-none" : "text-[#201F33] "}`}
                        style={activeTab === index ? { borderBottom: `3px solid ${activeColor}`, color: activeColor } : {}}
                        onClick={() => handleTabClick(index)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;
