import React, { useState, useEffect } from "react";
import { SketchPicker } from "react-color";

const ColorPicker = ({
    color: initialColor = "#ffffff",
    onChange = () => { },
}) => {
    const [color, setColor] = useState(initialColor);
    const [displayColor, setDisplayColor] = useState(initialColor);

    useEffect(() => {
        setColor(initialColor);
        setDisplayColor(initialColor);
    }, [initialColor]);

    // Handle immediate color change during dragging
    const handleColorChange = (colorResult) => {
        setDisplayColor(colorResult.hex);
        // Include alpha channel if available
        if (colorResult.rgb && colorResult.rgb.a !== undefined) {
            const { r, g, b, a } = colorResult.rgb;
            setDisplayColor(`rgba(${r}, ${g}, ${b}, ${a})`);
        }
    };

    const handleChangeComplete = (colorResult) => {
        let newColor;
    
        // Handle when colorResult is already a string
        if (typeof colorResult === 'string') {
            newColor = colorResult.length === 8 ? colorResult : colorResult + 'FF';
        }
        // Handle when colorResult is an object from the color picker
        else if (colorResult.rgb) {
            const { r, g, b, a = 1 } = colorResult.rgb;
            const toHex = (val) => Math.round(val).toString(16).padStart(2, '0');
            newColor = `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(Math.round(a * 255))}`;
        }
        // Fallback to hex value if available
        else if (colorResult.hex) {
            newColor = colorResult.hex.length === 8 ? colorResult.hex : colorResult.hex + 'FF';
        }
        
        setColor(newColor);
        setDisplayColor(newColor);
        onChange(newColor);
    };

    // Format color for display
    const getDisplayValue = () => {
        if (displayColor.startsWith('rgba')) {
            return displayColor;
        } else {
            return displayColor.toUpperCase();
        }
    };

    return (
        <div className="bg-white w-full font-sans flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Color picker with improved handling */}
            <div className="w-full md:w-64">
                <SketchPicker
                    styles={{

                        default: {
                            picker: {
                                paddingLeft: '0px',
                                paddingRight: '0px',
                                paddingTop: '0px',
                                paddingBottom: '0px',
                                background: '#FFFFFF',
                                borderRadius: '8px',
                                boxShadow: 'none',
                            },
                            saturation: {
                                borderRadius: '6px'
                            },
                            hue: {
                                borderRadius: '6px'
                            }
                        }
                    }}
                    color={displayColor}
                    onChange={handleColorChange}
                    onChangeComplete={handleChangeComplete}
                    presetColors={[
                        "#D0021B", "#F5A623", "#F8E71C", "#8B572A",
                        "#7ED321", "#417505", "#BD10E0", "#9013FE"
                    ]}
                    disableAlpha={false}
                />
            </div>

            {/* Color preview circle */}
            <div className="flex flex-col items-center mt-4 md:mt-0">
                <div
                    className="w-17 h-17 rounded-full border-[12px] border-white shadow-sm"
                    style={{ backgroundColor: displayColor, boxShadow: '0px 0px 2.8px 0px rgba(0, 0, 0, 0.25)' }}
                ></div>
            </div>
        </div>
    );
};

export default ColorPicker;