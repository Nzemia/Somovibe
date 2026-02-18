# Slider Images

This folder contains the hero slider images for the Questy landing page.

## Current Images

- `slider1.jpg` - Students learning with quality materials
- `slider2.jpg` - Teachers sharing knowledge
- `slider3.jpg` - CBC curriculum resources
- `slider4.jpg` - Interactive learning experience

## Image Specifications

### Recommended Dimensions:
- **Width**: 1920px (minimum 1200px)
- **Height**: 1080px (minimum 600px)
- **Aspect Ratio**: 16:9 (preferred)
- **Format**: JPG or PNG
- **File Size**: < 500KB (optimized for web)

### Responsive Sizes:
- **Desktop**: 1200px × 600px (displayed)
- **Tablet**: 900px × 500px (displayed)
- **Mobile**: 100vw × 400px (displayed)

## Adding New Images

1. Place your image in this folder (`/public/images/`)
2. Name it descriptively (e.g., `slider5.jpg`)
3. Update the slider component at `components/HeroSlider.tsx`

### Example:
```tsx
const slides = [
    {
        image: "/images/slider1.jpg",
        alt: "Students learning with quality materials",
    },
    {
        image: "/images/slider2.jpg",
        alt: "Teachers sharing knowledge",
    },
    // Add your new image here
    {
        image: "/images/slider5.jpg",
        alt: "Your image description",
    },
];
```

## Image Optimization Tips

1. **Compress images** before uploading:
   - Use tools like TinyPNG, ImageOptim, or Squoosh
   - Target file size: 200-500KB per image

2. **Use appropriate dimensions**:
   - Don't upload images larger than 1920px wide
   - Maintain 16:9 aspect ratio for consistency

3. **Choose relevant images**:
   - Show students, teachers, or learning materials
   - Use bright, engaging photos
   - Ensure good contrast for text overlay

4. **Alt text**:
   - Write descriptive alt text for accessibility
   - Keep it concise but informative

## Current Slider Settings

- **Auto-rotation**: Every 3 seconds
- **Transition**: 1-second fade
- **Controls**: Previous/Next arrows + dot indicators
- **Overlay**: Dark gradient for text readability

## Troubleshooting

### Image not showing?
- Check file path is correct: `/images/filename.jpg`
- Verify file exists in `/public/images/`
- Check file extension matches (case-sensitive)
- Clear browser cache

### Image looks blurry?
- Upload higher resolution image
- Ensure image is at least 1200px wide
- Check image compression settings

### Slider not auto-rotating?
- Check browser console for errors
- Verify JavaScript is enabled
- Test in different browser

## License & Attribution

Ensure all images used have proper licensing:
- Own the images
- Have permission to use them
- Use royalty-free stock photos
- Provide attribution if required

## Recommended Stock Photo Sites

- Unsplash (free, no attribution required)
- Pexels (free, no attribution required)
- Pixabay (free, no attribution required)
- Freepik (free with attribution)

---

**Last Updated**: Implementation Complete
**Maintained By**: Questy Development Team
