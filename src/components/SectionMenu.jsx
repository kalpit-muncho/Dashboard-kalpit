import React from "react";

// Components
import SectionMenuOption from "./SectionMenuOption";

// Icons
import {
  Images,
  Book,
  SquareKanban,
  MessagesSquare,
  MapPinned,
  SquareChartGantt,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

function SectionMenu({
  setIsSectionMenuOpen,
  onSectionAdded,
  sectionTabs,
  onAddSection,
}) {
  // Function to handle adding a section on click
  const handleSection = (name, sectionKey) => {
    // Find next available priority (after Hero, before Footer)
    const dynamicSections = sectionTabs.filter(
      (s) => !s.isLocked && s.section !== "Footer"
    );
    const nextPriority =
      dynamicSections.length > 0
        ? Math.max(...dynamicSections.map((s) => s.priority || 2)) + 1
        : 2;
    const data = {
      id: uuidv4(),
      name: name,
      isLocked: false,
      section: sectionKey, // store as string
      priority: nextPriority,
    };
    if (onAddSection) onAddSection(data);
    if (onSectionAdded) onSectionAdded(sectionKey);
    setIsSectionMenuOpen((prev) => !prev);
  };
  return (
    <div className="absolute -left-5 top-full mt-3 w-[300px] h-fit grid grid-cols-2 gap-2 rounded-[8px] bg-white shadow p-2 z-50">
      <SectionMenuOption
        Icon={Images}
        label={"Gallery"}
        onClick={() => handleSection("Gallery Section", "Gallery")}
      />
      <SectionMenuOption
        Icon={SquareChartGantt}
        label={"Features"}
        onClick={() => handleSection("Features Section", "Features")}
      />
      <SectionMenuOption
        Icon={Book}
        label={"Menu"}
        onClick={() => handleSection("Menu Section", "Menu")}
      />
      <SectionMenuOption
        Icon={SquareKanban}
        label={"Reviews"}
        onClick={() => handleSection("Reviews Section", "Reviews")}
      />
      <SectionMenuOption
        Icon={MessagesSquare}
        label={"Faqs"}
        onClick={() => handleSection("FAQs Section", "Faq")}
      />
      <SectionMenuOption
        Icon={MapPinned}
        label={"Locations"}
        onClick={() => handleSection("Location Section", "Locations")}
      />
      <SectionMenuOption
        Icon={MapPinned}
        label={"Gift Cards"}
        onClick={() => handleSection("Gift Cards Section", "GiftCards")}
      />
      <SectionMenuOption
        Icon={SquareKanban}
        label={"Cards"}
        onClick={() => handleSection("Cards Section", "Cards")}
      />
    </div>
  );
}

export default SectionMenu;
