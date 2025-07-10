import React, { useState } from 'react';

const FontSelector = ({ heading, body, onFontChange }) => {
  const [headingFont, setHeadingFont] = useState({
    name: heading?.name || 'Times New Roman',
    preview: heading?.name || 'Times New Roman',
  });

  const [bodyFont, setBodyFont] = useState({
    name: body?.name || 'Verdana',
    preview: body?.name || 'Verdana',
  });

  const [isHeadingDropdownOpen, setIsHeadingDropdownOpen] = useState(false);
  const [isBodyDropdownOpen, setIsBodyDropdownOpen] = useState(false);

  const fonts = [
    { name: 'Arial', preview: 'Arial' },
    { name: 'Helvetica', preview: 'Helvetica' },
    { name: 'Times New Roman', preview: 'Times New Roman' },
    { name: 'Georgia', preview: 'Georgia' },
    { name: 'Verdana', preview: 'Verdana' },
    { name: 'Courier New', preview: 'Courier New' },
    // Add more fonts as needed
  ];

  // Helper function to notify parent of font changes
  const notifyParent = (updatedHeadingFont, updatedBodyFont) => {
    if (onFontChange) {
      onFontChange({
        heading: updatedHeadingFont.name,
        body: updatedBodyFont.name,
      });
    }
  };

  const handleHeadingFontChange = (font) => {
    setHeadingFont(font);
    setIsHeadingDropdownOpen(false);
    notifyParent(font, bodyFont); // Notify parent immediately
  };

  const handleBodyFontChange = (font) => {
    setBodyFont(font);
    setIsBodyDropdownOpen(false);
    notifyParent(headingFont, font); // Notify parent immediately
  };

  return (
    <div className="fllex w-full">
      <div className="relative flex flex-col gap-2">
        <div className="relative flex flex-col gap-2">
          <button
            onClick={() => setIsHeadingDropdownOpen(!isHeadingDropdownOpen)}
            className="flex justify-between items-center py-2 px-4 bg-[#F8F7FA] rounded-xl w-full text-md font-semibold"
          >
            <span style={{ fontFamily: headingFont.name }}>{headingFont.preview}</span>
            <span style={{ fontFamily: headingFont.name }}>HEADING</span>
          </button>

          {isHeadingDropdownOpen && (
            <div className="absolute top-full bg-gray-200 rounded-lg z-10 w-full">
              {fonts.map((font) => (
                <button
                  key={font.name}
                  onClick={() => handleHeadingFontChange(font)}
                  className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                >
                  <span style={{ fontFamily: font.name }}>{font.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex flex-col gap-2">
          <button
            onClick={() => setIsBodyDropdownOpen(!isBodyDropdownOpen)}
            className="flex justify-between items-center py-2 px-4 bg-[#F8F7FA] rounded-xl font-medium text-md w-full"
          >
            <span style={{ fontFamily: bodyFont.name }}>{bodyFont.preview}</span>
            <span style={{ fontFamily: bodyFont.name }}>Body</span>
          </button>

          {isBodyDropdownOpen && (
            <div className="absolute top-full bg-gray-200 rounded-lg z-10 w-full">
              {fonts.map((font) => (
                <button
                  key={font.name}
                  onClick={() => handleBodyFontChange(font)}
                  className="block w-full text-left py-2 px-4 hover:bg-gray-100"
                >
                  <span style={{ fontFamily: font.name }}>{font.preview}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FontSelector;