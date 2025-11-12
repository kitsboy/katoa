# QR Code Setup Instructions

## CRITICAL: Replace the Placeholder QR Code

The donation QR code currently shows a placeholder. You MUST replace it with your actual QR code for it to be scannable.

## Step-by-Step Instructions:

### 1. Extract Your QR Code
From your screenshot "Screenshot 2025-10-10 at 4.24.08 PM.png":
- Open the image in any image editor (Preview, Photoshop, GIMP, etc.)
- Crop ONLY the QR code square (the black and white pattern)
- Make sure to include the white border around the QR code
- Save the cropped image

### 2. Image Requirements
Your QR code file MUST be:
- **Format**: PNG (with transparency or white background)
- **Resolution**: At least 400x400 pixels (higher is better)
- **Quality**: Sharp, crisp edges - NO compression artifacts
- **Colors**: Pure black (#000000) and pure white (#FFFFFF)
- **File name**: `donation-qr.png` (exactly this name)

### 3. File Location
Place your QR code file here:
```
public/donation-qr.png
```

### 4. The Code is Already Configured
The website is already set up to:
- Display the QR code at 144x144px (perfect scan size)
- Use `crisp-edges` rendering for maximum sharpness
- Show it in the sliding donation panel
- Maintain aspect ratio and quality

### 5. Verify It Works
After replacing the file:
1. Rebuild the project: `npm run build`
2. Test the donation panel by clicking the heart in the footer
3. Try scanning the QR code with your Bitcoin Lightning wallet
4. The QR code should scan instantly and clearly

## Technical Details

The QR code is rendered with:
- `imageRendering: 'crisp-edges'` - Prevents blur
- `object-contain` - Maintains aspect ratio
- White background container - Ensures proper scanning
- Adequate size (144px) - Standard scannable size

## Troubleshooting

**QR code looks blurry?**
- Ensure source image is high resolution (at least 400x400px)
- Save as PNG, not JPG (JPG adds compression)
- Use "Export for Web" or similar quality-preserving export

**QR code won't scan?**
- Verify the QR code is valid by testing the original image
- Ensure there's white padding around the QR code
- Check that the BOLT12 address matches the QR code

**File not showing?**
- Ensure filename is exactly `donation-qr.png` (case sensitive)
- Clear browser cache and rebuild
- Check file is in `public/` folder, not `src/`

## Current BOLT12 Address
The displayed address is:
```
lno1pg257enxv4ezqcneype82um50ynhxgrwdajx293pqe5zv4ezqmnw33j
```

Make sure your QR code encodes this exact address, or update the address in:
`src/components/Footer.tsx` (line 12)
