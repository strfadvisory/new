 # Enterprise Admin Dashboard Style Guide

Version: 1.0  
Design System: Enterprise Minimal Corporate UI  
Framework Target: React + MUI  

---

# 1. Design Principles

- Clean, corporate, minimal
- Flat UI (no heavy shadows)
- Soft neutral background
- Clear typography hierarchy
- Strong blue primary header
- Subtle borders instead of heavy cards
- 8px spacing grid system

---

# 2. Color System

## Primary Colors

| Token | Value | Usage |
|--------|--------|--------|
| primary.main | #1F4E8C | Top navbar background |
| primary.dark | #173B6C | Hover / active |
| primary.light | #2E6EB5 | Buttons / highlights |

## Background Colors

| Token | Value | Usage |
|--------|--------|--------|
| background.default | #F4F6F8 | Page background |
| background.paper | #FFFFFF | Content panels |
| sidebar.bg | #EEF1F5 | Sidebar background |

## Text Colors

| Token | Value | Usage |
|--------|--------|--------|
| text.primary | #1C1C1C | Main headings |
| text.secondary | #6B7280 | Sub text |
| text.muted | #9CA3AF | Labels |
| text.link | #1F4E8C | Links / actions |

## Badge Colors

| Token | Value |
|--------|--------|
| badge.bg | #F1F5F9 |
| badge.text | #334155 |

---

# 3. Layout Structure

## Navbar

- Height: 64px
- Background: primary.main
- Text color: #FFFFFF
- Font weight: 500
- Horizontal padding: 24px

---

## Page Layout

---

## Sidebar

- Width: 280px
- Background: sidebar.bg
- Border-right: 1px solid #E5E7EB
- Item padding: 12px 20px

### Active Item
- Background: #FFFFFF
- Left border: 3px solid #1F4E8C
- Font-weight: 500

---

## Main Content

- Padding: 32px
- Background: #FFFFFF
- Section spacing: 24px

---

# 4. Typography Scale

Font Family: Inter, Roboto, sans-serif  
Line Height: 1.5  

| Usage | Size | Weight |
|--------|--------|--------|
| Page Title | 20px | 600 |
| Section Title | 16px | 600 |
| Card Title | 14px | 600 |
| Body Text | 14px | 400 |
| Small Text | 12px | 400 |
| Label | 12px | 500 |

---

# 5. Company List Row Style

## Row Container

- Padding: 16px 0
- Border-bottom: 1px solid #E5E7EB
- Hover background: #F9FAFB
- Cursor: pointer

---

## Company Name

- Font size: 14px
- Font weight: 600
- Color: text.primary

---

## Description Text

- Font size: 12px
- Color: text.secondary

---

# 6. Badge Style (Members / Models)

Example:

- Background: #F1F5F9
- Border-radius: 16px
- Padding: 4px 10px
- Font-size: 12px
- Font-weight: 500
- Color: #334155
- No border

---

# 7. Search & Filters

## Search Input

- Height: 36px
- Border: 1px solid #D1D5DB
- Border-radius: 6px
- Font-size: 14px
- Padding-left: 12px

## Dropdown

- Height: 36px
- Minimal arrow
- No heavy shadow

---

# 8. Buttons

## Primary Button

- Background: #1F4E8C
- Height: 36px
- Border-radius: 6px
- Text-transform: none
- Font-weight: 500

## Text Button (Edit)

- Color: primary.main
- Font-size: 14px
- Font-weight: 500

---

# 9. MUI Theme Base Configuration

```js
import { createTheme } from "@mui/material/styles";

export const enterpriseTheme = createTheme({
  palette: {
    primary: {
      main: "#1F4E8C",
      dark: "#173B6C",
      light: "#2E6EB5",
    },
    background: {
      default: "#F4F6F8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C1C1C",
      secondary: "#6B7280",
    },
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
    h6: { fontSize: "20px", fontWeight: 600 },
    subtitle1: { fontSize: "16px", fontWeight: 600 },
    body1: { fontSize: "14px" },
    body2: { fontSize: "12px" },
  },
});