import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ColorPicker.css';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const Select = ({ onChange, value }) => {
    const [isOpen, setIsOpen] = useState(false);
    const options = ["RGB", "HEX"];

    const handleOptionClick = (option) => {
        if (onChange) {
            onChange(option);
        }
    }

    return (
        <div className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-2 py-1 bg-transparent border-none outline-none"
            >
                <ArrowDropDownIcon className={isOpen ? 'transition-transform duration-300 rotate-180 ' : ''} />
                <span className="text-black font-semibold">{value}</span>
            </button>

            {isOpen && (
                <ul className="absolute left-0 mt-1 w-24 z-30 bg-white rounded-[8px] overflow-hidden">
                    {options.map((option) => (
                        <li
                            key={option}
                            onClick={() => {
                                setIsOpen(false);
                                handleOptionClick(option);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const ColorPicker = ({ color: initialColor = '#123AAA', onChange }) => {
    const [hue, setHue] = useState(0);
    const [saturation, setSaturation] = useState(100);
    const [lightness, setLightness] = useState(50);
    const [opacity, setOpacity] = useState(100);
    const [colorFormat, setColorFormat] = useState('RGB');
    const [currentColor, setCurrentColor] = useState(initialColor);
    const [colorValue, setColorValue] = useState({
        RGB: { r: 0, g: 0, b: 0 },
        HSL: { h: 0, s: 100, l: 50 },
        HEX: '#000000'
    });

    const hueSliderRef = useRef(null);
    const opacitySliderRef = useRef(null);

    // Convert HSL to Hex
    const hslToHex = (h, s, l) => {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hueToRgb(p, q, h + 1/3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1/3);
        }

        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Convert HSL to RGB
    const hslToRgb = (h, s, l) => {
        h /= 360;
        s /= 100;
        l /= 100;

        let r, g, b;
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hueToRgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hueToRgb(p, q, h + 1/3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    };

    // Convert Hex to HSL
    const hexToHsl = (hex) => {
        // Remove # if present
        hex = hex.replace('#', '');

        // Parse r, g, b values
        let r, g, b;
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            return { h: 0, s: 0, l: 0 };
        }

        // Normalize r, g, b to 0-1 range
        r /= 255;
        g /= 255;
        b /= 255;

        // Find min and max
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }

            h /= 6;
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const updateAllColorValues = () => {
        const hex = hslToHex(hue, saturation, lightness);
        const rgb = hslToRgb(hue, saturation, lightness);
        
        setColorValue({
            RGB: rgb,
            HSL: { h: hue, s: saturation, l: lightness },
            HEX: hex
        });
    };

    // Call updateAllColorValues whenever hue, saturation, or lightness changes
    useEffect(() => {
        updateAllColorValues();
    }, [hue, saturation, lightness]);

    // Update color when sliders change
    useEffect(() => {
        const hex = hslToHex(hue, saturation, lightness);
        const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, '0');
        const colorWithOpacity = `${hex}${opacity < 100 ? opacityHex : ''}`;
    
        // Only update state if the color has changed
        if (colorWithOpacity !== currentColor) {
            setCurrentColor(colorWithOpacity);
    
            // Call the onChange callback if provided
            if (onChange) {
                onChange(colorWithOpacity);
            }
        }
    }, [hue, saturation, lightness, opacity, currentColor, onChange]);

    useEffect(() => {
        if (initialColor && initialColor !== currentColor) {
            // Handle both 6-digit and 8-digit (with alpha) hex colors
            const hexColor = initialColor.length === 9 ? initialColor.substring(0, 7) : initialColor;
            const hsl = hexToHsl(hexColor);
            
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
            
            // Handle opacity if present in hex (8 digits)
            if (initialColor.length === 9) {
                const opacityHex = initialColor.substring(7, 9);
                setOpacity(Math.round(parseInt(opacityHex, 16) / 2.55));
            } else {
                setOpacity(100);
            }
            
            // Update all color values
            const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            setColorValue({
                RGB: rgb,
                HSL: hsl,
                HEX: hexColor
            });
            
            setCurrentColor(initialColor);
        }
    }, [initialColor]);

    const handleColorFormatChange = (option) => {
        setColorFormat(option);
    };

    const handleHueChange = (e) => {
        setHue(parseInt(e.target.value));
    };

    const handleOpacityChange = (e) => {
        setOpacity(parseInt(e.target.value));
    };

    const rgbToHsl = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
    
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    };

    const handleRGBChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseInt(value) || 0;
        const clampedValue = Math.max(0, Math.min(255, numValue));
        
        const updatedRGB = {
            ...colorValue.RGB,
            [name]: clampedValue
        };
        
        setColorValue({
            ...colorValue,
            RGB: updatedRGB
        });
        
        // Convert RGB to HSL and update sliders
        const hsl = rgbToHsl(updatedRGB.r, updatedRGB.g, updatedRGB.b);
        setHue(hsl.h);
        setSaturation(hsl.s);
        setLightness(hsl.l);
    };

    const handleHexChange = (e) => {
        const { value } = e.target;
        let cleanValue = value.startsWith('#') ? value : `#${value}`;
        
        // Basic validation for hex format (3 or 6 digits after #)
        const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/i;
        
        if (hexRegex.test(cleanValue)) {
            // Update the input value
            setColorValue({
                ...colorValue,
                HEX: cleanValue
            });
            
            // Convert to HSL and update sliders
            const hsl = hexToHsl(cleanValue.substring(1)); // Remove #
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
        } else {
            // Just update the input value without converting
            setColorValue({
                ...colorValue,
                HEX: cleanValue
            });
        }
    };

    const getHueBackground = () => {
        return 'linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)';
    };

    const getOpacityBackground = () => {
        const baseColor = hslToHex(hue, saturation, lightness);
        return `linear-gradient(to right, transparent, ${baseColor})`;
    };

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    };

    const updateColor = useCallback(() => {
        const hex = hslToHex(hue, saturation, lightness);
        const opacityHex = Math.round(opacity * 2.55).toString(16).padStart(2, '0');
        const colorWithOpacity = `${hex}${opacity < 100 ? opacityHex : ''}`;
    
        // Only update state if the color has changed
        if (colorWithOpacity !== currentColor) {
            setCurrentColor(colorWithOpacity);
            
            // Update all color values
            const rgb = hslToRgb(hue, saturation, lightness);
            setColorValue({
                RGB: rgb,
                HSL: { h: hue, s: saturation, l: lightness },
                HEX: hex
            });
    
            // Call the onChange callback if provided
            if (onChange) {
                onChange(colorWithOpacity);
            }
        }
    }, [hue, saturation, lightness, opacity, currentColor, onChange]);
    
    // Call updateColor when any color property changes
    useEffect(() => {
        updateColor();
    }, [hue, saturation, lightness, opacity, updateColor]);
    useEffect(() => {
        updateColor();
    }, [hue, saturation, lightness, opacity, updateColor]);

    

    return (
        <div className="w-full p-4 space-y-2">
            {/* Hue Slider */}
            <div className="flex gap-3 items-center w-full space-y-1">
                <label className="block text-sm font-medium text-right w-[58px]">Hue</label>
                <div className="relative h-6 w-full">
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={hue}
                        onChange={handleHueChange}
                        ref={hueSliderRef}
                        className="absolute w-full h-2 bg-transparent appearance-none focus:outline-none"
                        style={{
                            background: getHueBackground(),
                            borderRadius: '9999px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    />
                </div>
            </div>

            {/* Opacity Slider */}
            <div className="flex gap-3 items-center w-full space-y-1">
                <label className="block text-sm font-medium w-[58px]">Opacity</label>
                <div className="relative h-6 w-full">
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={opacity}
                        onChange={handleOpacityChange}
                        ref={opacitySliderRef}
                        className="absolute w-full h-2 bg-transparent appearance-none focus:outline-none"
                        style={{
                            background: getOpacityBackground(),
                            borderRadius: '9999px',
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    />
                </div>
            </div>

            <div className='flex gap-3 justify-center items-center w-full space-y-1'>
                <div className='w-fit h-fit flex'>
                    <Select value={colorFormat} onChange={(option) => { handleColorFormatChange(option) }} />
                </div>
                <div className='w-fit h-fit flex gap-1 items-center'>
                    {colorFormat === 'RGB' && (
                        <>
                            <input
                                type="text"
                                name='r'
                                value={colorValue.RGB.r}
                                onChange={handleRGBChange}
                                className='w-10 h-fit outline-none text-sm px-1'
                            />
                            <input
                                type="text"
                                name='g'
                                value={colorValue.RGB.g}
                                onChange={handleRGBChange}
                                className='w-10 h-fit outline-none text-sm px-1'
                            />
                            <input
                                type="text"
                                name='b'
                                value={colorValue.RGB.b}
                                onChange={handleRGBChange}
                                className='w-10 h-fit outline-none text-sm px-1'
                            />
                        </>
                    )}
                    {colorFormat === 'HEX' && (
                        <input
                            type="text"
                            name='hex'
                            value={colorValue.HEX}
                            onChange={handleHexChange}
                            className='w-20 h-fit outline-none text-sm px-1'
                        />
                    )}
                    {/* {colorFormat === 'HSL' && (
                        <>
                            <input
                                type="text"
                                name='h'
                                value={colorValue.HSL.h}
                                onChange={handleHSLChange}
                                className='w-10 h-fit outline-none text-sm border border-gray-200 px-1'
                            />
                            <input
                                type="text"
                                name='s'
                                value={colorValue.HSL.s}
                                onChange={handleHSLChange}
                                className='w-10 h-fit outline-none text-sm border border-gray-200 px-1'
                            />
                            <input
                                type="text"
                                name='l'
                                value={colorValue.HSL.l}
                                onChange={handleHSLChange}
                                className='w-10 h-fit outline-none text-sm border border-gray-200 px-1'
                            />
                        </>
                    )} */}
                </div>
            </div>

            {/* Preview */}
            <div className='w-full h-fit py-2 flex items-center justify-center'>
                <div
                    className="w-17 h-17 rounded-full border-[12px] border-white shadow-sm"
                    style={{ backgroundColor: currentColor, boxShadow: '0px 0px 2.8px 0px rgba(0, 0, 0, 0.25)' }}
                ></div>
            </div>
        </div>
    );
};

export default ColorPicker;