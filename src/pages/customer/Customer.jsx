import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchBar from '../../components/SearchBar'
import CustomerTable from '../../components/CustomerTable'
import Loading from '../../components/Loading'
import Button from '../../components/Button'
import './Customer.css'
import { fetchCustomers } from '../../models/CustomersModel';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const Customer = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    // API call function to fetch data for the given date range
    const handleFetchData = async () => {
        try {
            setLoading(true);
            const fromISO = fromDate ? fromDate.format('YYYY-MM-DD') : "";
            const toISO = toDate ? toDate.format('YYYY-MM-DD') : "";
            console.log("fromISO", fromISO);
            console.log("toISO", toISO);
            const res = fetchCustomers(fromISO, toISO);
            toast.promise(
                res,
                {
                    pending: 'Loading...',
                    success: 'Customers fetched successfully',
                    error: 'Failed to fetch customers'
                },
                {
                    position: "top-center",
                    autoClose: 2000,
                    theme: "dark",
                }
            );
            const response = await res;
            const data = response.data;
            setCustomers(data);
        } catch (error) {
            setLoading(false);
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch for last 30 days on first load
    useEffect(() => {
        const initFrom = dayjs().subtract(30, 'day');
        const initTo = dayjs();
        setFromDate(initFrom);
        setToDate(initTo);
        handleFetchData();
    }, []);

    // Filter customers based on the search term
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm) ||
        customer.date.includes(searchTerm)
    );

    // Excel export function
    const handleExportToExcel = () => {
        if (filteredCustomers.length === 0) {
            toast.error('No data to export', {
                position: "top-center",
                autoClose: 2000,
                theme: "dark",
            });
            return;
        }

        const exportData = filteredCustomers.map(customer => ({
            'Name': customer.name || 'N/A',
            'Type': customer.type || 'N/A',
            'Date': customer.date || 'N/A',
            'Sub Total': customer.subTotal || '0',
            'Tax Total': customer.taxTotal || '0',
            'Phone Number': customer.phoneNumber || 'N/A'
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        
        // Set column widths
        const colWidths = [
            { wch: 20 }, // Name
            { wch: 15 }, // Type
            { wch: 15 }, // Date
            { wch: 12 }, // Sub Total
            { wch: 12 }, // Tax Total
            { wch: 15 }  // Phone Number
        ];
        worksheet['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
        
        const fileName = `customers_${fromDate?.format('YYYY-MM-DD')}_to_${toDate?.format('YYYY-MM-DD')}.xlsx`;
        XLSX.writeFile(workbook, fileName);
        
        toast.success('Excel file exported successfully', {
            position: "top-center",
            autoClose: 2000,
            theme: "dark",
        });
    };

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <main className="flex flex-col items-center w-full">
            <div className='flex flex-col w-full px-[24px] pb-8 pt-4 sticky top-0 bg-white z-50'>
                <div className='flex items-center justify-between w-full'>
                    <h2 className='text-2xl text-[#201F33] font-medium'>Customer</h2>
                    <div className='flex items-center gap-2 '>
                        <LocalizationProvider dateAdapter={AdapterDayjs} className="gap-2" >
                            <DatePicker
                                label="From"
                                format='DD/MM/YYYY'
                                value={fromDate}
                                onChange={(newValue) => setFromDate(newValue)}
                                slotProps={{
                                    textField: {
                                        size: "small",
                                        sx: {
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '6px 12px',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: "#F8F7FC",
                                                borderRadius: "8px",
                                            }
                                        }
                                    }
                                }}
                                disableFuture
                            />
                            <DatePicker
                                label="To"
                                format='DD/MM/YYYY'
                                value={toDate}
                                onChange={(newValue) => setToDate(newValue)}
                                slotProps={{
                                    textField: {
                                        outline: "none",
                                        size: "small",
                                        sx: {
                                            '& .MuiInputBase-input': {
                                                fontSize: '14px',
                                                padding: '6px 12px',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: "#F8F7FC",
                                                borderRadius: "8px",
                                            }
                                        }
                                    },
                                }}
                                disableFuture
                            />
                        </LocalizationProvider>
                        <button
                            onClick={handleFetchData}
                            className="bg-[#201F33] text-white px-3 py-1.5 rounded-[8px] text-[14px] cursor-pointer">
                            Fetch
                        </button>
                        <Button 
                            variant='primary' 
                            size='small' 
                            className='px-3 py-1.5' 
                            disabled={loading || filteredCustomers.length === 0}
                            onClick={handleExportToExcel}
                        >
                            Export to Excel
                        </Button>
                    </div>
                </div>
                <div className='flex items-center space-x-4 mt-4'>
                    <SearchBar placeholder='Search Customer by name, phone number, date' onChange={handleSearchChange} disabled={loading} />
                </div>
            </div>
            {
                loading ?
                <div className='flex items-center justify-center w-full h-full'>
                    <Loading />
                </div>
                :
                <div className='flex w-full h-full px-[24px]'>
                    <CustomerTable customers={filteredCustomers} />
                </div>
            }
        </main>
    )
}

export default Customer