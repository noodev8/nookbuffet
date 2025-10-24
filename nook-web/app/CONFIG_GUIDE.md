# Home Page Configuration Guide

## Overview
The home page (`page.js`) has been refactored to be **much easier to understand and modify**. All content is now centralized in a `CONFIG` object at the top of the file.

## How to Make Changes

### 1. **Change Hero Section Content**
Edit the `CONFIG.hero` object in `page.js`:

```javascript
const CONFIG = {
  hero: {
    title: 'THE LITTLE NOOK BUFFET',           // Main title
    description: 'Crafting exceptional...',    // Subtitle text
    ctaText: 'Start Your Order',               // Button text
    ctaLink: '/order',                         // Button link
    backgroundImage: '/assets/nook.jpg',       // Hero background image
  },
  // ... rest of config
};
```

### 2. **Change Info Cards**
Edit the `CONFIG.infoCards` array to add, remove, or modify cards:

```javascript
infoCards: [
  {
    number: '01',
    title: 'Custom Buffets',
    description: 'Build your perfect buffet...',
  },
  {
    number: '02',
    title: 'Professional Service',
    description: 'White-glove setup...',
  },
  // Add more cards here
],
```

### 3. **Change Gallery Images**
Edit the `CONFIG.gallery.items` array:

```javascript
gallery: {
  title: 'Our Creations',
  items: [
    { src: '/assets/fullbuffet1.png', alt: 'Buffets' },
    { src: '/assets/fullbuffet2.png', alt: 'Sandwiches' },
    // Add or modify gallery items here
  ],
},
```

## CSS Class Names (Simplified)

All class names have been simplified for easier styling:

| Old Name | New Name |
|----------|----------|
| `.hero-section-option3` | `.hero-section` |
| `.hero-title-option3` | `.hero-title` |
| `.cta-button-option3` | `.cta-button` |
| `.info-card-option3` | `.info-card` |
| `.gallery-item` | `.gallery-item` |
| `.scroll-indicator-option3` | `.scroll-indicator` |

## CSS Customization

All styling is in `page.css`. Key sections:
- **Hero Section** (lines 5-94): Background, title, button styling
- **Scroll Indicator** (lines 96-135): Bounce animation and appearance
- **Info Section** (lines 137-198): Card styling and layout
- **Gallery Section** (lines 200-242): Image grid and hover effects
- **Responsive Design** (lines 244-284): Mobile breakpoints

## Key Improvements

✅ **Centralized Configuration** - All content in one place  
✅ **Cleaner Class Names** - Removed "option3" suffixes  
✅ **Better Organization** - Clear section comments  
✅ **Easy to Extend** - Add new cards/gallery items by editing arrays  
✅ **Maintainable** - Less repetitive code, more readable  

## Example: Adding a New Info Card

1. Open `page.js`
2. Find the `CONFIG.infoCards` array
3. Add a new object:

```javascript
{
  number: '04',
  title: 'Your New Card Title',
  description: 'Your card description here.',
},
```

That's it! The card will automatically render.

## Example: Changing Hero Title

1. Open `page.js`
2. Find `CONFIG.hero.title`
3. Change the text:

```javascript
title: 'YOUR NEW TITLE HERE',
```

Done! No need to touch the JSX.

