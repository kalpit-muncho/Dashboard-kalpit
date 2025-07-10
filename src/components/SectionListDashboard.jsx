import React, { useEffect, useState } from "react";
import {
  fetchSectionList,
  saveSectionList,
} from "../services/sectionListService";
import { getUserId } from "../utils/user";
import Gallery from "./Sections/Gallery";

function generateUniqueId() {
  return "section-" + Math.random().toString(36).substr(2, 9);
}

export default function SectionListDashboard() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSections = async () => {
      setLoading(true);
      try {
        const userId = getUserId();
        const data = await fetchSectionList(userId);
        setSections(data);
      } catch (err) {
        setError("Failed to fetch sections");
      } finally {
        setLoading(false);
      }
    };
    loadSections();
  }, []);

  // Utility: Update priorities based on order
  const updatePriorities = (sectionsArr) =>
    sectionsArr.map((section, idx) => ({ ...section, priority: idx }));

  // Defensive: Always fetch latest before any save
  const getLatestSections = async () => {
    const userId = getUserId();
    try {
      return await fetchSectionList(userId);
    } catch {
      return sections;
    }
  };

  // Add new gallery section
  const addGallerySection = async () => {
    const newSection = {
      id: generateUniqueId(),
      section: "Gallery",
      name: "Gallery Section",
      isLocked: false,
      priority: sections.length,
    };
    const latestSections = await getLatestSections();
    const newSections = [...latestSections, newSection];
    const updated = await handleSave(newSections);
    setSections(updated || newSections);
  };

  // Example: Save sections (call this after editing sections)
  const handleSave = async (newSections) => {
    // Ensure all required fields are present for every section
    const validatedSections = newSections.map((section, idx) => ({
      id: section.id || generateUniqueId(),
      name: section.name || "Gallery Section",
      section: section.section || "Gallery",
      isLocked:
        typeof section.isLocked === "boolean" ? section.isLocked : false,
      priority: typeof section.priority === "number" ? section.priority : idx,
      ...section,
    }));
    try {
      // Update priorities before saving
      const prioritizedSections = updatePriorities(validatedSections);
      const userId = getUserId();
      const updated = await saveSectionList(userId, prioritizedSections);
      setSections(updated);
      return updated;
    } catch (err) {
      setError("Failed to save sections");
      return null;
    }
  };

  // Move section up
  const moveUp = async (idx) => {
    if (idx === 0) return;
    const latestSections = await getLatestSections();
    if (idx >= latestSections.length) return;
    const newSections = [...latestSections];
    [newSections[idx - 1], newSections[idx]] = [
      newSections[idx],
      newSections[idx - 1],
    ];
    const updated = await handleSave(newSections);
    setSections(updated || newSections);
  };

  // Move section down
  const moveDown = async (idx) => {
    const latestSections = await getLatestSections();
    if (idx === latestSections.length - 1) return;
    const newSections = [...latestSections];
    [newSections[idx], newSections[idx + 1]] = [
      newSections[idx + 1],
      newSections[idx],
    ];
    const updated = await handleSave(newSections);
    setSections(updated || newSections);
  };

  if (loading) return <div>Loading sections...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Section List (from DB, no Redux)</h2>
      <button onClick={addGallerySection}>Add Gallery Section</button>
      <ul>
        {sections.map((s, idx) => (
          <li key={s.id} style={{ marginBottom: 24 }}>
            {s.name} ({s.section})
            <button onClick={() => moveUp(idx)} disabled={idx === 0}>
              ↑
            </button>
            <button
              onClick={() => moveDown(idx)}
              disabled={idx === sections.length - 1}
            >
              ↓
            </button>
            {/* Render Gallery if section type is gallery (case-insensitive) */}
            {s.section && s.section.toLowerCase() === "gallery" && (
              <Gallery sectionId={s.id} sectionObj={s} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
