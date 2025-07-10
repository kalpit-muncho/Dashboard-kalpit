// components
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function BigBtn({ title, styles }) {
  return (
    <div
      className={`flex justify-center items-center max-w-fit bg-[#06B906] rounded-[0.5rem] gap-1 px-3 py-2 ${styles}`}
    >
      <span className="text-[#022F02] inter_reg text-[12px]">{title}</span>
      <ChevronRight size={16} color="#323232" />
    </div>
  );
}

export default BigBtn;
