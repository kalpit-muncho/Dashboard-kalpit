import React, { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Globe,
  CirclePlus,
  LockKeyhole,
  CirclePlay,
  RefreshCcw,
  ChevronsUpDown,
} from "lucide-react";
import Appearance from "../../components/Sections/appearance";

// Components
import Nav from "../../components/Sections/Nav";
import Hero from "../../components/Sections/Hero";
import Footer from "../../components/Sections/Footer";
import Gallery from "../../components/Sections/Gallery";
import Locations from "../../components/Sections/Locations";
import Faq from "../../components/Sections/Faq";
import SectionTab from "../../components/SectionTab";
import SectionMenu from "../../components/SectionMenu";
import Features from "../../components/Sections/Features";
import Reviews from "../../components/Sections/Reviews";
import Dishes from "../../components/Sections/Dishes";
import GiftCards from "../../components/Sections/GiftCard";
import {
  fetchSectionList,
  saveSectionList,
} from "../../services/sectionListService";
import {
  uploadImageToMuncho,
  fetchAppearance,
  postAppearance,
  updateAppearance,
  deleteAppearance,
} from "../../services/websiteTemplate";
import { getUserId } from "../../utils/user";
import Cards from "../../components/Sections/cards";

// Section component mapping
const sectionComponentMap = {
  Nav,
  Hero,
  Footer,
  Gallery,
  Locations,
  Faq,
  Features,
  Reviews,
  Menu: Dishes,
  GiftCards,
  Cards,
};

function App() {
  const [sections, setSections] = useState([]);
  const [currentSection, setCurrentSection] = useState({
    index: 0,
    section: "Nav",
  });
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoId, setLogoId] = useState(null); // for update/delete
  const [logoLoading, setLogoLoading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        let data = await fetchSectionList(userId);
        // Ensure Nav, Hero, Footer are always present
        const requiredSections = [
          {
            id: "nav",
            name: "Navigation Bar",
            isLocked: true,
            section: "Nav",
            priority: 0,
          },
          {
            id: "hero",
            name: "Hero Section",
            isLocked: true,
            section: "Hero",
            priority: 1,
          },
          {
            id: "footer",
            name: "Footer",
            isLocked: true,
            section: "Footer",
            priority: 9999,
          },
        ];
        // Remove duplicates and ensure order
        // const sectionMap = new Map();
        // // Add required sections first
        // requiredSections.forEach((sec) => sectionMap.set(sec.section, sec));
        // // Add user sections, skipping required ones
        // data.forEach((sec) => {
        //   if (!sectionMap.has(sec.section)) sectionMap.set(sec.section, sec);
        // });
        // // Convert back to array and sort by priority
        // const finalSections = Array.from(sectionMap.values()).sort(
        //   (a, b) => (a.priority ?? 0) - (b.priority ?? 0)
        // );
        // setSections(finalSections);
        // Instead, merge required sections by id, but allow multiple galleries
        const mergedSections = [
          ...requiredSections,
          ...data.filter(
            (sec) => !requiredSections.some((req) => req.id === sec.id)
          ),
        ].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
        setSections(mergedSections);
      } catch (err) {
        setError("Failed to fetch sections");
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  useEffect(() => {
    // Fetch logo for appearance tab
    const fetchLogo = async () => {
      try {
        const userId = String(getUserId());
        const data = await fetchAppearance(userId);
        if (data && data.logo) {
          setLogo(data.logo);
          setLogoId(data._id || data.id);
        }
      } catch (e) {
        // ignore if not found
      }
    };
    fetchLogo();
  }, []);

  const toggleSectionMenu = () => setIsSectionMenuOpen((prev) => !prev);

  const handleDelete = async (index, isLocked) => {
    // Prevent deleting Nav, Hero, Footer
    const section = sections[index];
    if (isLocked || ["Nav", "Hero", "Footer"].includes(section.section)) return;
    const newSections = [...sections];
    newSections.splice(index, 1);
    const userId = getUserId();
    await saveSectionList(userId, newSections);
    setSections(newSections);
  };

  const lockedTop = sections.filter(
    (s) => s.isLocked && s.section !== "Footer"
  );
  const lockedBottom = sections.filter(
    (s) => s.isLocked && s.section === "Footer"
  );
  const unlocked = sections.filter((s) => !s.isLocked);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(unlocked);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    const newTabs = [...lockedTop, ...reordered, ...lockedBottom];
    const userId = getUserId();
    await saveSectionList(userId, newTabs);
    setSections(newTabs);
  };

  const handleSectionAdded = async (sectionKey) => {
    // If adding a Gallery, ensure a truly unique id
    let newId = `${sectionKey.toLowerCase()}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 5)}`;
    // Ensure no duplicate id in sections
    while (sections.some((s) => s.id === newId)) {
      newId = `${sectionKey.toLowerCase()}-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 5)}`;
    }
    const newSection = {
      id: newId,
      name: `${sectionKey} Section`,
      isLocked: false,
      section: sectionKey,
      priority: sections.length,
    };
    const newSections = [...sections, newSection];
    const userId = getUserId();
    await saveSectionList(userId, newSections);
    setSections(newSections);
    setCurrentSection({ index: newSections.length - 1, section: sectionKey });
  };

  const getSectionObj = (index) => sections[index];

  if (loading) return <div>Loading sections...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#FAFAFC]">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-5 py-3 bg-white shadow-sm border-b sticky top-0 z-30">
        {/* Tabs */}
        <div className="flex gap-4">
          <button
            className={`rounded-t-md px-3 py-1.5 transition-colors duration-150 ${
              currentSection.section === "Nav"
                ? "bg-[#F3F0FF] text-[#4B21E2] border-b-[3px] "
                : ""
            }`}
            onClick={() => setCurrentSection({ index: 0, section: "Nav" })}
          >
            <span
              className={`poppins_med text-sm ${
                currentSection.section === "Nav"
                  ? "text-[#4B21E2]"
                  : "text-[#201F33]"
              }`}
            >
              Sections
            </span>
          </button>
          <button
            className={`rounded-t-md px-3 py-1.5 transition-colors duration-150 ${
              currentSection.section === "Appearance"
                ? "bg-[#F3F0FF] text-[#4B21E2] border-b-[3px] text-"
                : "hover:bg-[#F3F0FF] bg-transparent text-[#201F33]"
            }`}
            onClick={() =>
              setCurrentSection({ index: -1, section: "Appearance" })
            }
          >
            <span
              className={`poppins_med text-sm ${
                currentSection.section === "Appearance"
                  ? "text-[#4B21E2]"
                  : "text-[#201F33]"
              }`}
            >
              Appearance
            </span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="flex items-center bg-black text-white px-4 py-2 rounded-lg gap-2 hover:scale-[1.03] transition-transform">
            <span className="text-sm">Preview</span>
            <CirclePlay size={20} />
          </button>
          <button className="flex items-center bg-[#4B21E2] text-white px-4 py-2 rounded-lg gap-2 hover:bg-[#3a18b4] transition-colors">
            <RefreshCcw size={20} />
            <span className="text-sm">Update Website</span>
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[300px] h-full border-r border-[#E8E6ED] px-5 py-6 overflow-y-auto">
          <h1 className="poppins_med text-2xl text-[#201F33] mb-4">Website</h1>

          {/* Add Section Button and Menu (wrapped in relative container) */}
          <div className="relative">
            <button
              onClick={toggleSectionMenu}
              className="w-full flex justify-between items-center bg-black text-white px-4 py-3 rounded-lg mb-4"
            >
              <span className="text-sm">Add Section</span>
              <CirclePlus size={20} />
            </button>
            {isSectionMenuOpen && (
              <SectionMenu
                setIsSectionMenuOpen={setIsSectionMenuOpen}
                onSectionAdded={handleSectionAdded}
                sectionTabs={sections}
                onAddSection={async (data) => {
                  const newSections = [...sections, data];
                  const userId = getUserId();
                  await saveSectionList(userId, newSections);
                  setSections(newSections);
                  setCurrentSection({
                    index: newSections.length - 1,
                    section: data.section,
                  });
                }}
              />
            )}
          </div>

          {/* Locked Top */}
          <div className="flex flex-col gap-3 mb-6">
            {lockedTop.map((sec, index) => (
              <SectionTab
                key={sec.id}
                Icon={LockKeyhole}
                title={sec.name}
                isActive={sec.id === sections[currentSection.index]?.id}
                onClick={() =>
                  setCurrentSection({
                    index: sections.findIndex((s) => s.id === sec.id),
                    section: sec.section,
                  })
                }
                showDelete={false}
              />
            ))}
          </div>

          {/* Draggable Unlocked */}
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sectionTabs">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-3 mb-6"
                >
                  {unlocked.map((sec, idx) => (
                    <Draggable key={sec.id} draggableId={sec.id} index={idx}>
                      {(provided) => (
                        <div
                          className="w-full"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <SectionTab
                            Icon={ChevronsUpDown}
                            title={sec.name}
                            isActive={
                              sec.id === sections[currentSection.index]?.id
                            }
                            onClick={() =>
                              setCurrentSection({
                                index: sections.findIndex(
                                  (s) => s.id === sec.id
                                ),
                                section: sec.section,
                              })
                            }
                            showDelete
                            onDelete={() =>
                              handleDelete(
                                sections.findIndex((s) => s.id === sec.id),
                                false
                              )
                            }
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Locked Bottom */}
          <div className="flex flex-col gap-3">
            {lockedBottom.map((sec) => (
              <SectionTab
                key={sec.id}
                Icon={LockKeyhole}
                title={sec.name}
                isActive={sec.id === sections[currentSection.index]?.id}
                onClick={() =>
                  setCurrentSection({
                    index: sections.findIndex((s) => s.id === sec.id),
                    section: sec.section,
                  })
                }
                showDelete={false}
              />
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 h-full overflow-y-auto p-10 bg-[#FAFAFC]">
          {currentSection.section === "Appearance" ? (
            <Appearance />
          ) : (
            (() => {
              const sectionObj = getSectionObj(currentSection.index);
              if (!sectionObj) return null;
              if (
                sectionObj.section &&
                sectionObj.section.toLowerCase() === "gallery"
              ) {
                return (
                  <Gallery
                    key={sectionObj.id}
                    sectionId={sectionObj.id}
                    sectionObj={sectionObj}
                    uniqueKey={sectionObj.id}
                  />
                );
              }
              // Special handling for Cards section
              if (
                sectionObj.section &&
                sectionObj.section.toLowerCase() === "cards"
              ) {
                return (
                  <Cards
                    key={sectionObj.id}
                    sectionId={sectionObj.id}
                    sectionObj={sectionObj}
                  />
                );
              }
              const SectionComponent = sectionComponentMap[sectionObj.section];
              if (!SectionComponent) return null;
              if (["Locations", "Faq"].includes(sectionObj.section)) {
                return (
                  <SectionComponent
                    sectionId={sectionObj.id}
                    sectionObj={sectionObj}
                  />
                );
              }
              return <SectionComponent />;
            })()
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
