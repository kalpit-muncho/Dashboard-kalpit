import React, { useState } from "react";
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";

const HiddenInput = styled("input")({
  display: "none",
});

const FileInput = ({ placeholder, multiple = false, onFilesChange, accept="image/*,video/*" }) => {
  const [files, setFiles] = useState(multiple ? [] : null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const images = selectedFiles.filter((file) => file.type.startsWith("image/"));
    const videos = selectedFiles.filter((file) => file.type.startsWith("video/"));

    if (videos.length > 1 || images.length > 3) {
      toast.error("You can only upload up to 3 images and 1 video at a time.", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }

    setFiles(selectedFiles);
    if (onFilesChange) {
      onFilesChange(selectedFiles);
    }
  };

  return (
    <label className="flex flex-col items-center justify-center w-full h-full bg-[#F8F7FA] rounded-xl cursor-pointer">
      <HiddenInput
        type="file"
        multiple={multiple}

        accept={accept}
        onChange={handleFileChange}
        id="fileInput"
      />
      <FileUploadOutlinedIcon className="text-[#201F33] mb-2" fontSize="medium" />
      <p className="text-md text-center w-[80px] font-medium text-[#201F33]">Upload File</p>
      <p className="text-xs text-[#797C8F] font-medium text-center">{placeholder}</p>
    </label>
  );
};

export default FileInput;
