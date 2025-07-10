import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import Button from '../../components/Button';
import { FormControl, Select, MenuItem, styled } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowDownOutlinedIcon from '@mui/icons-material/KeyboardArrowDownOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { toPng } from "html-to-image";
import TimeSlotPicker from '../../components/TimeSlotPicker';
import DashboardContext from '../../contexts/dashboardContext';
import { toast } from 'react-toastify';
import { updateSettings } from '../../models/RestaurantModel';
import RadioDropdown from '../../components/RadioDropdown';
import QRRenderer from '../../components/QRRenderer';
import { uploadFiles } from '../../utils/fileUploader';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useOutletContext } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';

const Dropdown = ({ label, options, onChange, value, icon: Icon = KeyboardArrowDownOutlinedIcon }) => {
  const StyledSelect = styled(Select)(() => ({
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
    backgroundColor: '#F8F7FA',
    borderRadius: '8px',
    fontFamily: 'Satoshi, sans-serif',
    '& .MuiSelect-select': {
      padding: '8px 10px',
      fontSize: '14px',
      fontFamily: 'Satoshi, sans-serif', // Ensure the select text uses Satoshi
    },
    '& .MuiMenuItem-root': {
      fontFamily: 'Satoshi, sans-serif', // Apply Satoshi to dropdown items
    },
    '& .MuiSvgIcon-root': {
      color: '#000',
    },
  }));

  return (
    <FormControl fullWidth>
      <StyledSelect
        id={`${label}-select`}
        onChange={onChange}
        value={value}
        IconComponent={Icon}
        displayEmpty
      >
        <MenuItem value="" disabled>
          {label}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value} sx={{ fontFamily: 'Satoshi, sans-serif' }}>
            {option.label}
          </MenuItem>
        ))}
      </StyledSelect>
    </FormControl>
  );
};


const Settings = () => {
  const [id, setId] = useState('');
  const [restName, setRestName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [logo, setLogo] = useState(null);
  const [workingHours, setWorkingHours] = useState({});
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [activeOutlet, setActiveOutlet] = useState({});
  const [dineInTable, setDineInTable] = useState('');
  const [tableList, setTableList] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [allOutletsData, setAllOutletsData] = useState([]); // Store full outlet data
  const [qrUrls, setQrUrls] = useState([]);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [fileNames, setFileNames] = useState([]);
  const [isApplyEverywhere, setIsApplyEverywhere] = useState(false);

  const { setImageModal, setImageModalProps, cropData, setCropData, setResetPasswordModal } = useContext(DashboardContext);

  const prevWorkingHours = useRef(null);

  const { restaurant } = useOutletContext();

  useEffect(() => {
    if (!cropData || !(cropData instanceof File)) {
      console.log("Skipping handleImageCrop, invalid cropData:", cropData);
      return;
    }
    handleImageCrop(cropData);
    return () => {
      //cleanup function
      setLogo(null);
      setImageModal(false);
      setImageModalProps(null);
      setCropData(null);
    }
  }, [cropData]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = restaurant;
        setId(settings.id);
        setRestName(settings.name);

        // Store all outlets data for later use
        setAllOutletsData(settings.outlets);

        // Set active outlet to the first one initially
        if (settings.outlets && settings.outlets.length > 0) {
          setActiveOutlet(settings.outlets[0]);
        }

        // Extract outlet names for the dropdown
        const outletNames = settings.outlets.map((outlet) => outlet.name);
        setSelectedOutlet(outletNames[0]);
        setOutlets(outletNames);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);
  useEffect(() => {
    if (activeOutlet && Object.keys(activeOutlet).length > 0) {
      console.log("Setting data for active outlet:", activeOutlet);

      // Reset checkbox state when outlet changes
      setIsApplyEverywhere(false);

      // Update all relevant state with active outlet data
      setDisplayName(activeOutlet.displayName || '');
      setName(activeOutlet.displayName || '');
      setImageUrl(activeOutlet.logo || null);
      setLogo(activeOutlet.logo || null);

      // Ensure working hours are properly set
      if (activeOutlet.workingHours && Object.keys(activeOutlet.workingHours).length > 0) {
        console.log("Setting working hours:", activeOutlet.workingHours);
        setWorkingHours({
          sunday: activeOutlet.workingHours?.sunday || [],
          monday: activeOutlet.workingHours?.monday || [],
          tuesday: activeOutlet.workingHours?.tuesday || [],
          wednesday: activeOutlet.workingHours?.wednesday || [],
          thursday: activeOutlet.workingHours?.thursday || [],
          friday: activeOutlet.workingHours?.friday || [],
          saturday: activeOutlet.workingHours?.saturday || [],
        });
        prevWorkingHours.current = activeOutlet.workingHours;
      } else {
        console.log("No working hours found for outlet");
        setWorkingHours({});
        prevWorkingHours.current = {};
      }

      // Handle table list
      const tableList = activeOutlet.tableList;
      if (Array.isArray(tableList)) {
        const tableNames = tableList.map((table) => table.tableNumber);
        // Sort table names numerically
        const sorted = tableNames.sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10);
          const numB = parseInt(b.replace(/\D/g, ''), 10);
          return numA - numB;
        });
        // Set sorted table names
        setTableList(sorted);

        // Reset selected tables when changing outlets
        setDineInTable('');
      } else {
        setTableList([]);
      }
    }
  }, [activeOutlet]);
  const createUrls = () => {
    // Check if activeOutlet and tableList exist
    if (!activeOutlet || !activeOutlet.tableList || !Array.isArray(activeOutlet.tableList)) {
      console.error("Invalid activeOutlet or tableList:", activeOutlet);
      toast.error("No tables found for this outlet", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      return [];
    }

    const urls = [];
    const tableNumbers = [];
    
    // Reset file names
    setFileNames([]);
    setQrUrls([]);
    
    let outletTables = [...activeOutlet.tableList]; // Create a copy to avoid mutating original
    
    // Sort the tables numerically
    outletTables.sort((a, b) => {
      const numA = parseInt(a.tableNumber.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.tableNumber.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });
    
    outletTables.forEach((table) => {
      const tableNumber = table.tableNumber;
      tableNumbers.push(tableNumber);
      
      const fileName = `${activeOutlet.displayName}_${tableNumber}`;
      // Remove any special characters from fileName and replace spaces with underscores
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_');
      setFileNames((prev) => [...prev, `${sanitizedFileName}.png`]);
      
      // Fix URL construction - ensure proper fragment separator
      const url = `${import.meta.env.VITE_QR_URL}/#/home/${activeOutlet.externalLink}/${tableNumber}`;
      urls.push(url);
    });
    
    // Update table list to match the sorted order used in QR generation
    setTableList(tableNumbers);
    setQrUrls(urls);
    setTriggerDownload(true);
    return urls;
  }
  // Modified useEffect with batch processing
  useEffect(() => {
    if (triggerDownload && qrUrls.length > 0) {
      setIsDineInQrLoading(true);
      setProgressPercent(0);

      const zip = new JSZip();
      const batchSize = 3; // Reduced batch size for better stability

      const processBatch = async (startIndex) => {
        const endIndex = Math.min(startIndex + batchSize, qrUrls.length);
        const batch = qrUrls.slice(startIndex, endIndex);

        // Add a small delay to ensure DOM elements are ready
        await new Promise(resolve => setTimeout(resolve, 200));

        const batchPromises = batch.map(async (url, batchIndex) => {
          const index = startIndex + batchIndex;
          
          // Wait a bit longer and retry if node is not found
          let node = document.getElementById(`qr-${index}`);
          let retryCount = 0;
          
          while (!node && retryCount < 5) {
            await new Promise(resolve => setTimeout(resolve, 100));
            node = document.getElementById(`qr-${index}`);
            retryCount++;
          }
          
          if (!node) {
            console.error(`QR node not found for index ${index}`);
            return null;
          }

          try {
            // Add additional delay before capturing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const dataUrl = await toPng(node, {
              quality: 1.0,
              backgroundColor: 'white',
              pixelRatio: 1
            });
            
            const imgData = dataUrl.split(",")[1];
            const tableId = url.split("/").pop();
            const fileName = `table-${tableId}.png`;

            return {
              fileName,
              imgData,
            };
          } catch (err) {
            console.error(`Error processing QR code ${index}:`, err);
            toast.error(`Failed to process QR code for table ${url.split("/").pop()}`, {
              position: "top-center",
              autoClose: 2000,
              theme: "dark",
            });
            return null;
          }
        });

        const results = await Promise.all(batchPromises);
        const successfulResults = results.filter(result => result !== null);
        
        successfulResults.forEach((result) => {
          zip.file(result.fileName, result.imgData, { base64: true });
        });

        const completed = endIndex;
        const percent = Math.round((completed / qrUrls.length) * 100);
        setProgressPercent(percent);

        if (endIndex < qrUrls.length) {
          // Continue with next batch
          setTimeout(() => processBatch(endIndex), 300);
        } else {
          // All batches processed
          try {
            if (zip.files && Object.keys(zip.files).length > 0) {
              const content = await zip.generateAsync({ type: "blob" });
              const fileName = `qr-codes_outlet_${activeOutlet.code || 'unknown'}_${Date.now()}.zip`;
              saveAs(content, fileName);              toast.success(`Successfully downloaded ${Object.keys(zip.files).length} QR codes!`, {
                position: "top-center",
                autoClose: 3000,
                theme: "dark",
              });
              
              // Clear QR components after a short delay to ensure ZIP is fully processed
              setTimeout(() => {
                setQrUrls([]);
                setFileNames([]);
              }, 1000);
            } else {              toast.error("No QR codes were generated successfully", {
                position: "top-center",
                autoClose: 3000,
                theme: "dark",
              });
              
              // Clear QR components even if generation failed
              setQrUrls([]);
              setFileNames([]);
            }
          } catch (err) {
            console.error("Error generating ZIP:", err);            toast.error("Failed to generate ZIP file", {
              position: "top-center",
              autoClose: 3000,
              theme: "dark",
            });
            
            // Clear QR components even on error
            setQrUrls([]);
            setFileNames([]);
          } finally {
            setIsDineInQrLoading(false);
            setTriggerDownload(false);
            setProgressPercent(0);
            // Reset file names
            setFileNames([]);
            // Clear QR URLs to remove rendered QR components
            setQrUrls([]);
          }
        }
      };

      // Start processing with a small initial delay
      setTimeout(() => processBatch(0), 500);
    }
  }, [triggerDownload, qrUrls, activeOutlet.code]);  // Add cleanup effect for when component unmounts or activeOutlet changes
  useEffect(() => {
    return () => {
      // Cleanup when outlet changes or component unmounts
      setIsDineInQrLoading(false);
      setTriggerDownload(false);
      setProgressPercent(0);
      setFileNames([]);
      setQrUrls([]); // Clear QR components immediately
    };
  }, [activeOutlet.id]);

  // Reset QR generation state when outlet changes
  useEffect(() => {
    if (activeOutlet.id) {
      setIsDineInQrLoading(false);
      setTriggerDownload(false);
      setProgressPercent(0);
      setFileNames([]);
      setQrUrls([]); // Clear QR components when switching outlets
    }
  }, [activeOutlet.id]);
  const handleWorkingHoursChange = useCallback((updatedHours) => {
    // Only update if the data has actually changed
    if (JSON.stringify(workingHours) !== JSON.stringify(updatedHours)) {
      setWorkingHours(updatedHours);
    }  }, [workingHours]);

  // Function to check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (!activeOutlet || Object.keys(activeOutlet).length === 0) return false;

    // Check if display name has changed
    const nameChanged = name !== (activeOutlet.displayName || '');

    // Check if logo has changed (new file uploaded)
    const logoChanged = logo instanceof File || (logo?.file instanceof File);

    // Check if working hours have changed
    const workingHoursChanged = JSON.stringify(workingHours) !== JSON.stringify(activeOutlet.workingHours || {});

    return nameChanged || logoChanged || workingHoursChanged;
  };
  const handleOutletChange = (outletName) => {
    console.log("Changing to outlet:", outletName);

    // Check if there are unsaved changes before switching outlets
    if (hasUnsavedChanges()) {
      const confirmChange = window.confirm(
        "You have unsaved changes that will be lost if you change outlets. Please save your changes before switching outlets. Do you want to continue without saving?"
      );

      if (!confirmChange) {
        // User chose to stay, don't change the outlet
        return;
      }
    }

    // Reset checkbox state when changing outlets
    setIsApplyEverywhere(false);

    // Update selected outlet in dropdown
    setSelectedOutlet(outletName);

    // Find the full outlet data from our stored outlet data
    const selectedOutletData = allOutletsData.find(outlet => outlet.name === outletName);

    if (selectedOutletData) {
      console.log("Found outlet data:", selectedOutletData);
      setActiveOutlet(selectedOutletData);
    } else {
      console.error("Could not find outlet data for:", outletName);
    }
  };

  // Loading states for QR downloads
  const [isDineInQrLoading, setIsDineInQrLoading] = useState(false);
  const handleChange = (e) => {
    setName(e.target.value);
  };  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !(file instanceof File)) {
      console.error("Invalid file:", file);
      return;
    }
    
    // Clean up previous preview URL if it exists
    if (logo?.preview) {
      URL.revokeObjectURL(logo.preview);
    }

    // Store the original file name before resetting
    const originalFileName = file.name;

    // Reset states when selecting a new image
    setImageUrl(null);
    setLogo(null);

    console.log("Selected file:", file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageModalProps({
        image: reader.result,
        cropWidth: 220,
        cropHeight: 220,
        originalFileName: originalFileName, // Pass the filename to modal props
      });
      setImageModal(true);
    };
    reader.readAsDataURL(file);
  };  const handleImageCrop = async (croppedImage) => {
    try {
      // Get the original filename from context if available
      const fileName = "cropped-logo.jpg"; // Use a default name for consistency
      
      const newFile = new File([croppedImage], fileName, {
        type: croppedImage.type,
        lastModified: Date.now(),
      });
      
      // Create a preview URL for the cropped image
      const previewUrl = URL.createObjectURL(newFile);
      const newFileWithPreview = Object.assign(newFile, {
        file: newFile,
        preview: previewUrl,
      });
      
      setLogo(newFileWithPreview);
      setImageUrl(previewUrl); // Set imageUrl to the new cropped image preview
      setImageModal(false);
      
      toast.success("Image cropped successfully", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Error cropping image", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  // Generate URLs
  const dineInUrl = `${import.meta.env.VITE_QR_URL}/#/home/${activeOutlet.externalLink}/${dineInTable}`;
  const downloadUrls = () => {
    try {
      // Validate data before proceeding
      if (!activeOutlet || !activeOutlet.tableList || !Array.isArray(activeOutlet.tableList)) {
        toast.error("No tables found for this outlet", {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        return;
      }

      const urls = createUrls();
      
      if (!urls || urls.length === 0) {
        toast.error("No URLs generated", {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        return;
      }

      // Join the array elements with newlines
      const content = urls.join('\n');

      // Define the filename
      const filename = `${activeOutlet.code || 'outlet'}_table_urls_${Date.now()}`;

      // Create a Blob with the content
      const blob = new Blob([content], { type: 'text/plain' });

      // Create a URL for the Blob
      const url = URL.createObjectURL(blob);

      // Create a download link
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `${filename}.txt`;

      // Append the link to the body (not visible)
      document.body.appendChild(downloadLink);

      // Programmatically click the link to trigger the download
      downloadLink.click();

      // Clean up
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${urls.length} URLs successfully!`, {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error downloading URLs:", error);
      toast.error("Failed to download URLs", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });    } finally {
      setQrUrls([]);
      setFileNames([]);
      // Reset table list to avoid stale data
      if (activeOutlet?.tableList) {
        const tableNames = activeOutlet.tableList.map((table) => table.tableNumber);
        const sorted = tableNames.sort((a, b) => {
          const numA = parseInt(a.replace(/\D/g, ''), 10);
          const numB = parseInt(b.replace(/\D/g, ''), 10);
          return numA - numB;
        });
        setTableList(sorted);
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);

      let imageUrl = '';
      if (logo instanceof File || logo?.file instanceof File) {
        const fileToUpload = logo.file || logo;
        const path = `image/logo/${activeOutlet.id}`;
        imageUrl = await uploadFiles(fileToUpload, path);
      }

      // If "Apply to every outlet" is checked and we have a new logo
      if (isApplyEverywhere && imageUrl) {
        // Update all outlets with the new logo
        const updatePromises = allOutletsData.map(async (outlet) => {
          const outletData = {
            id: outlet.id,
            displayName: outlet.id === activeOutlet.id ? name : outlet.displayName,
            logo: imageUrl,
            workingHours: outlet.id === activeOutlet.id ? workingHours : outlet.workingHours,
          };
          return await updateSettings(outletData);
        });

        const responses = await Promise.all(updatePromises);
        
        // Update all outlets in local state
        setAllOutletsData(prevOutlets =>
          prevOutlets.map((outlet, index) => ({
            ...outlet,
            displayName: responses[index]?.display_name || outlet.displayName,
            logo: responses[index]?.logo || imageUrl,
            workingHours: responses[index]?.operating_hours || outlet.workingHours
          }))
        );

        // Update active outlet
        const activeResponse = responses.find(response => response?.id === activeOutlet.id);
        if (activeResponse) {
          setActiveOutlet(prevActiveOutlet => ({
            ...prevActiveOutlet,
            displayName: activeResponse.display_name,
            logo: activeResponse.logo,
            workingHours: activeResponse.operating_hours
          }));
        }

        // Reset the checkbox after applying to all outlets
        setIsApplyEverywhere(false);

        toast.success("Update successfull for all outlets",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          }
        );
      } else {
        // Update only the current outlet
        const data = {
          id: activeOutlet.id,
          displayName: name,
          logo: imageUrl ? imageUrl : activeOutlet.logo || null,
          workingHours: workingHours,
        }; 
        const response = await updateSettings(data);
        if (response) {
          // Update the local state with the new outlet data
          setAllOutletsData(prevOutlets =>
            prevOutlets.map(outlet =>
              outlet.id === response.id
                ? {
                  ...outlet,
                  displayName: response.display_name,
                  logo: response.logo,
                  workingHours: response.operating_hours
                }
                : outlet
            )
          );

          // Also update the active outlet with the new data
          setActiveOutlet(prevActiveOutlet => ({
            ...prevActiveOutlet,
            displayName: response.display_name,
            logo: response.logo,
            workingHours: response.operating_hours
          }));

          toast.success("Settings updated successfully",
            {
              position: "top-right",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            }
          );
        }
      }
    } catch (error) {
      setIsUpdating(false);
      console.error('Error updating settings:', error);
      toast.error(`error updating settings: ${error.message}`,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        }
      );
    } finally {
      setIsUpdating(false);
    }
  }
  
  const handleDownloadSingleQr = async () => {
    if (!dineInTable || !activeOutlet) {
      toast.error("Please select a table first", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      return;
    }

    try {
      setIsDineInQrLoading(true);

      // Create URL for the single table
      const url = `${import.meta.env.VITE_QR_URL}/#/home/${activeOutlet.externalLink}/${dineInTable}`;
      
      // Set up QR for rendering
      setQrUrls([url]);
      setFileNames([`${activeOutlet.displayName}_${dineInTable}.png`]);

      // Wait a bit for the QR component to render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the QR node
      const node = document.getElementById('qr-0');
      if (!node) {
        throw new Error('QR code not found');
      }

      // Generate the image
      const dataUrl = await toPng(node, {
        quality: 1.0,
        backgroundColor: 'white',
        pixelRatio: 1
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `${activeOutlet.displayName}_${dineInTable}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR code downloaded successfully!", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });

      // Clear QR components after download
      setTimeout(() => {
        setQrUrls([]);
        setFileNames([]);
      }, 1000);

    } catch (error) {
      console.error("Error downloading single QR:", error);
      toast.error("Failed to download QR code", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      
      // Clear QR components on error
      setQrUrls([]);
      setFileNames([]);
    } finally {
      setIsDineInQrLoading(false);
    }
  };

  const handleDownloadQr = (e) => {
    e.preventDefault();
    
    // Clear any existing QR components first
    setQrUrls([]);
    setFileNames([]);
    
    // Validate outlet and table data
    if (!activeOutlet || !activeOutlet.tableList || !Array.isArray(activeOutlet.tableList)) {
      toast.error("No outlet or tables available. Please select an outlet first.", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (activeOutlet.tableList.length === 0) {
      toast.error("No tables found for this outlet", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    if (isDineInQrLoading) {
      toast.warning("QR generation already in progress...", {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      return;
    }

    try {
      createUrls();
      toast.info(`Starting QR generation for ${activeOutlet.tableList.length} tables...`, {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
    } catch (error) {
      console.error("Error starting QR download:", error);
      toast.error("Failed to start QR generation", {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      // Clear QR components on error
      setQrUrls([]);
      setFileNames([]);
    }
  }

  return (
    <main className='flex flex-col w-full h-screen bg-white'>
      <div className='flex w-full h-fit px-[24px] py-4'>
        <h1 className='text-2xl font-medium'>Settings</h1>
      </div>

      <div className='flex flex-col md:flex-row w-full h-full px-[24px]  gap-8'>
        {/* Left Column */}
        <div className='flex flex-col gap-5 w-full md:w-[50%] pb-8 md:pb-0 border-b-2 md:border-b-0 md:border-r-2 border-[#E8E6ED] md:pr-8'>

          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="restaurantName" className='text-sm font-medium'>Restaurant Name</label>
            <h3 className='text-[18px]'>{restName}</h3>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <span className='text-sm font-medium' > Outlet </span>
            <div className='flex w-full h-fit relative'>
              <RadioDropdown
                options={outlets}
                value={selectedOutlet}
                onChange={handleOutletChange}
                backgroundColor='#201F33'
                textColor='#FFFFFF'
                selectedTextColor='#201F33'
              />
            </div>
          </div>

          <div className='flex flex-col gap-2 w-full'>
            <label htmlFor="displaytName" className='text-sm font-medium'>Display Name</label>
            <div className='flex w-full h-fit relative'>
              <div className='absolute z-30 top-1.5 right-2'>
                <EditOutlinedIcon fontSize='small' />
              </div>
              <input type="text" className='bg-[#F8F7FA] rounded-[12px] py-2 pl-3 text-[14px] outline-none w-full' value={name} placeholder="Restaurant Name" onChange={handleChange} />
            </div>
          </div>

          <div className='flex flex-col gap-2 w-full'>

            <label htmlFor="restaurantLogo" className='text-sm font-medium'>Logo</label>
            <div className='w-full max-w-[180px] h-[180px] bg-[#F8F7FA] rounded-lg flex items-center justify-center'>
              {imageUrl ? (
                <img src={imageUrl} alt="Logo" className='w-full h-full object-contain rounded-lg' />
              ) : logo?.preview ? (
                <img src={logo.preview} alt="Logo" className='w-full h-full object-contain rounded-lg' />
              ) : logo && typeof logo === 'string' ? (
                <img src={logo} alt="Logo" className='w-full h-full object-contain rounded-lg' />
              ) : activeOutlet?.logo ? (
                <img src={activeOutlet.logo} alt="Logo" className='w-full h-full object-contain rounded-lg' />
              ) : (
                <img src="https://placehold.co/180x180" alt="Logo" className='w-full h-full object-cover rounded-lg' />
              )}
            </div>

            <div className='flex w-full h-fit mt-1 gap-2'>
              <Button variant="secondary" size="small" className="font-medium relative">
                <EditOutlinedIcon className="mr-1" fontSize='small' />
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer "
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ zIndex: 10 }}
                  id="fileInput"
                />
                Upload
              </Button>
              { logo && (logo instanceof File || logo?.file instanceof File) && 
                <div className='flex items-center gap-1'>
                  <Checkbox
                    checked={isApplyEverywhere}
                    sx={{
                      padding: 0,
                      margin: 0,
                      "& .MuiSvgIcon-root": { fontSize: 18 },
                      "&.Mui-checked": { color: "#65558F" },
                    }}
                    onChange={(e) => setIsApplyEverywhere(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                  <span className='text-xs font-medium text-[#5C5C7A]'>Apply to every outlet</span>
                </div>
              }
            </div>

          </div>

          <div className='flex flex-col gap-2 w-full'>

            <label htmlFor="dineInQr generator" className='text-sm font-medium'>Dine In</label>

            <div className='flex flex-col md:flex-row gap-x-6 w-full'>

              <div className='flex flex-col gap-1 w-[100px]'>
                <label htmlFor="dineInTable" className='font-medium text-xs'>Table no.</label>
                <div className='font-medium w-[100px]'>
                  <Dropdown
                    label="Table no."
                    options={tableList.map((table) => ({ value: table, label: table }))}
                    onChange={(e) => setDineInTable(e.target.value)}
                    value={dineInTable}
                  />
                </div>
              </div>

              {dineInTable && (
                <div className='flex flex-col gap-1 w-full'>
                  <label htmlFor="dineInLink" className='font-medium text-xs '>Link</label>
                  <div className='flex justify-between items-center w-full h-[40px] rounded-xl bg-[#F8F7FA] py-1 px-4'>
                    <span className='text-[#5C5C7A] font-medium truncate mr-2 overflow-clip text-xs'>{dineInUrl}</span>
                    <button
                      className='cursor-pointer text-[#5C5C7A]'
                      onClick={() => {
                        navigator.clipboard.writeText(dineInUrl);
                        toast.success("URL copied to clipboard", {
                          position: "top-right",
                          autoClose: 2000,
                          theme: "dark",
                        });
                      }}
                      size="small"
                    >
                      <ContentCopyOutlinedIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className='flex flex-wrap gap-4 pt-1 w-full h-fit mt-1 pb-4'>              {
                dineInTable && 
                <Button
                  variant='secondary'
                  size='small'
                  onClick={() => handleDownloadSingleQr()}
                  disabled={isDineInQrLoading}
                >
                  {isDineInQrLoading ? 'Downloading...' : 'Download QR'}
                </Button>
              }
              <Button
                variant='secondary'
                size='small'
                onClick={(e) => handleDownloadQr(e)}
                disabled={isDineInQrLoading}
              >
                {isDineInQrLoading ? 'Generating...' : 'Download all QRs'}
              </Button>
              <Button
                variant='secondary'
                size='small'
                onClick={() => downloadUrls()}
                disabled={isDineInQrLoading}
              >
                Download URLs
              </Button>
            </div>

            <div className='flex flex-col gap-1 w-full'>
              {(progressPercent > 0 && progressPercent < 100) && (
                <div className="w-full">
                  <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4B21E2] h-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-semibold drop-shadow-sm">
                      {progressPercent}%
                    </span>
                  </div>
                  <p className="text-center text-sm mt-2 font-medium text-red-400 animate-pulse">
                    Generating QRs Please dont quit this window ...
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column */}
        <div className='flex w-full md:w-[50%] h-full pt-4 md:pt-0 md:pl-4'>
          <div className='flex flex-col w-full h-[calc(100vh - 84px)]'>
            <div className='flex w-full justify-end pl-4 py-2'>
              <Button variant='primary' size='small' className="font-medium" disabled={isUpdating} onClick={(e) => { handleSubmit(e) }} >{isUpdating ? "Updating..." : "Save"}</Button>
            </div>
            <div className='flex flex-col gap-6 w-[360px] h-[660px] overflow-auto'>
              <div className='w-full h-fit sticky top-0 bg-white z-50'>
                <h2 className="text-md font-medium flex items-center">
                  Operating Hours
                </h2>
              </div>
              <TimeSlotPicker
                workingHours={workingHours}
                onChange={handleWorkingHoursChange}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Hidden QR Renderer */}
      <QRRenderer urls={qrUrls} />
    </main>
  );
};

export default Settings;