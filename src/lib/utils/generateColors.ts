export const generateRandomColor = () => {
   return `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
};

// acc to w3c ratio we need to contrast text color in our nodes based on content type
const getLuminance = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
  
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};
  
const getContrastRatio = (color1: string, color2: string) => {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const getContrastColor = (backgroundColor: string) => {
  const blackContrast = getContrastRatio(backgroundColor, '#000000');
  const whiteContrast = getContrastRatio(backgroundColor, '#FFFFFF');
  
  return blackContrast > whiteContrast ? '#000000' : '#FFFFFF';
};