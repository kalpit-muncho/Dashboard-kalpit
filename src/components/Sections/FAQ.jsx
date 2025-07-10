import React, { useState, useEffect } from "react";
import {
  fetchFAQ,
  postFAQ,
  addQuestionToFAQ,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";

// Components
import TabHeading from "../Common/TabHeading";
import SmButton from "../Common/SmButton";
import Spinner from "../Common/Spinner";

// Icons
import { ChevronsUpDown, Pencil, ChevronDown } from "lucide-react";

// FAQ Card Component
const FaqCard = ({
  title,
  description,
  isActive = false,
  inEditMode = false,
  onClick,
  onClickEdit,
  onTitleInputChange,
  onDescriptionInputChange,
  titleInputValue = "",
  descriptionInputValue = "",
  onSaveFaq,
}) => (
  <div
    className={`w-[380px] p-4 rounded-[8px] overflow-hidden ${
      isActive || inEditMode
        ? "bg-[#EEEBFA]"
        : "bg-transparent hover:bg-[#EEEBFA] transition-colors duration-300"
    }`}
  >
    {!inEditMode ? (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <ChevronsUpDown
            color="#5C5C7A"
            size={24}
            className="cursor-s-resize"
          />
          <span className="inter_med text-[14px] text-[#0D0D0D]">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClickEdit}
            className="p-2 rounded-full bg-white cursor-pointer"
          >
            <Pencil color="#5C5C7A" size={20} />
          </button>
          <button
            onClick={onClick}
            className="p-2 rounded-full bg-white cursor-pointer"
          >
            <ChevronDown color="#5C5C7A" size={20} />
          </button>
        </div>
      </div>
    ) : (
      <div>
        <div className="flex gap-8">
          <input
            name="title"
            type="text"
            placeholder="Question"
            value={titleInputValue}
            onChange={onTitleInputChange}
            className="inter_reg w-full bg-white text-[14px] text-[#0D0D0D] placeholder:text-[#222222] border-2 border-black rounded-[8px] px-2 py-2 focus:outline-none"
          />
          <SmButton onClick={onSaveFaq} title={"Save"} />
        </div>

        <textarea
          name="description"
          rows={4}
          placeholder="Answer"
          value={descriptionInputValue}
          onChange={onDescriptionInputChange}
          className="inter_reg w-full mt-4 bg-white text-[14px] text-[#5C5C7A] placeholder:text-[#5C5C7A] border-2 border-black rounded-[8px] px-2 py-2 resize-none focus:outline-none"
        />
      </div>
    )}

    {isActive && !inEditMode && (
      <p className="inter_med text-[14px] text-[#5C5C7A] mt-4">{description}</p>
    )}
  </div>
);

// Main FAQ Component
function Faq() {
  const [faqs, setFaqs] = useState([]);
  const [faqId, setFaqId] = useState(null); // Store FAQ doc id
  const [activeFaq, setActiveFaq] = useState(null);
  const [activeEditFaq, setActiveEditFaq] = useState(null);
  const [faqData, setFaqData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getFAQ = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchFAQ(userId);
        if (data && data.questions) setFaqs(data.questions);
        if (data && data._id) setFaqId(data._id); // Save FAQ doc id
      } catch (err) {
        setError("Failed to fetch FAQ data");
      } finally {
        setLoading(false);
      }
    };
    getFAQ();
  }, []);

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setFaqData((prev) => ({ ...prev, [name]: value }));
    if (activeEditFaq !== null) {
      setFaqs((prev) =>
        prev.map((faq, idx) =>
          idx === activeEditFaq ? { ...faq, [name]: value } : faq
        )
      );
    }
  };

  const handleAddFaq = async () => {
    resetFaqData();
    const newIndex = faqs.length;
    setActiveFaq(newIndex);
    setActiveEditFaq(newIndex);
    setFaqs((prev) => [...prev, { title: "", description: "" }]);
    // If FAQ doc exists, add question via PATCH
    if (faqId) {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const userId = getUserId();
        const newQuestion = { title: "", description: "" };
        await addQuestionToFAQ(faqId, userId, newQuestion);
        setSuccess(true);
      } catch (err) {
        setError("Failed to add FAQ question");
      } finally {
        setLoading(false);
        setTimeout(() => setSuccess(false), 2000);
      }
    }
  };

  const handleUpdateFaq = async (index) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const userId = getUserId();
      await postFAQ({ heading: "FAQ", questions: faqs }, userId);
      setSuccess(true);
    } catch (err) {
      setError("Failed to save FAQ data");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(false), 2000);
      resetFaqData();
      setActiveEditFaq(null);
    }
  };

  const resetFaqData = () => {
    setFaqData({ title: "", description: "" });
  };

  return (
    <div className="w-full min-h-fit flex flex-col gap-10 pb-20">
      {/* Header */}
      <div className="w-[380px] flex items-center gap-5">
        <TabHeading title={"FAQs Section"} />
        <SmButton title={"Save"} />
      </div>

      {/* FAQs */}
      <div className="flex flex-col gap-4">
        {faqs.map(({ title, description }, index) => (
          <FaqCard
            key={index}
            title={title}
            description={description}
            isActive={activeFaq === index}
            inEditMode={activeEditFaq === index}
            titleInputValue={faqData.title}
            descriptionInputValue={faqData.description}
            onClick={() => setActiveFaq(activeFaq === index ? null : index)}
            onClickEdit={() => {
              setActiveFaq(null);
              setActiveEditFaq(activeEditFaq === index ? null : index);
              setFaqData({ title, description });
            }}
            onTitleInputChange={handleChangeInput}
            onDescriptionInputChange={handleChangeInput}
            onSaveFaq={() => handleUpdateFaq(index)}
          />
        ))}

        <SmButton title={"Add FAQs"} onClick={handleAddFaq} />
      </div>

      {/* Loading, Error, Success States */}
      {loading && (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner />
        </div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && (
        <p className="text-green-500 text-center">Saved successfully!</p>
      )}
    </div>
  );
}

export default Faq;
