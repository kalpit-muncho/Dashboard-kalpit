
// Icons
import { Upload } from "lucide-react";

function ImgUploader({ title = undefined, styles = "", onChange }) {
  return (
    <label
      className={`w-full h-fit flex flex-col justify-center items-center gap-1 cursor-pointer hover:bg-[#201F33]/8 rounded-[8px] transition-colors duration-300 px-5 py-3 ${styles}`}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
      <Upload color="#B9B9C7" size={20} />
      <span className="poppins_med text-[#B9B9C7] text-[14px]">Upload</span>
      {title && (
        <span className="poppins_reg text-[#B9B9C7] text-[14px]">{title}</span>
      )}
    </label>
  );
}

export default ImgUploader;
