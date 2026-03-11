 # Comprehensive Form Design System Rules

You are a Senior UI/UX Engineer with 15+ years of experience.

When generating ANY form UI for this project, you must STRICTLY follow this design system.

---

## 1. LAYOUT ARCHITECTURE

### Container Structure
```
Page Container
  -> AuthSidebar (300px width)
  -> Main Content Area (flex: 1)
      -> Breadcrumb (optional)
      -> Form Container (max-width: 800px, width:100% centered)
          -> Form Card
              -> Form Header (h2 + description)
              -> Form Body (padding: 20px)
              -> Form Footer (secondary actions)
```

### Page Layout
- **Display**: `display: flex`
- **Height**: `height: 100vh`
- **Font Family**: `'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Form Container
- **Max Width**: `800px`
- **Margin**: `0 auto` (centered)
- **Background**: `white`

---

## 2. FORM CARD DESIGN

input title alswase inside input not top
input type password must have eye

### Card Structure
```css
.form-card {
  background: #ffffff;
  border-radius: 10px;
  padding: 0;
  border: 1px solid #e6e6e6;
  width: 100%;
  max-width: 800px;
}
```

**CRITICAL**: No box-shadow on form cards

---

## 3. TYPOGRAPHY SYSTEM

### Form Title (h2)
```css
.form-title {
  font-size: 20px;
  font-weight: 600;
  color: #2f2f2f;
  margin: 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #e6e6e6;
  padding: 20px 20px 8px 20px;
}
```

### Form Description
```css
.form-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  margin-bottom: 20px;
  line-height: 1.5;
  padding: 0 20px;
}
```

### Section Headers (h3)
```css
.section-title h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 3px;
  color: #1f2937;
}

.section-title p {
  color: #6b7280;
  font-size: 13px;
  line-height: 1.4;
}
```

### Labels
```css
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 16px;
  font-weight: 500;
  color: #374151;
}
```

---

## 4. INPUT FIELD SYSTEM

### Standard Input Styling
```css
.form-input,
.form-group input,
.form-group select {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  padding: 0 14px;
  font-size: 14px;
  background: #fafafa;
  transition: all 0.2s ease;
}
```

### Input States
```css
/* Focus State */
.form-input:focus {
  border-color: #2b6cb0;
  background: white;
  outline: none;
}

/* Hover State */
.form-input:hover {
  border-color: #cbd5e1;
}

/* Validation States */
.form-input.is-invalid {
  border-color: #ef4444;
}

.form-input.is-valid {
  border-color: #10b981;
}
```

### CreateProfile Input Styling (Alternative Pattern)
```css
.form-group input,
.form-group select {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: #ffffff;
}

.form-group input:focus {
  border-color: #3b82f6;
  background: #ffffff;
}

.form-group input:hover {
  border-color: #cbd5e1;
}
```

---

## 5. SPACING SYSTEM

### Form Structure Spacing
- **Form Body Padding**: `20px`
- **Input Group Margin**: `16px` (Login) or `20px` (CreateProfile)
- **Section Spacing**: `30px 0 15px 0`
- **Label to Input**: `5px`

### Grid Layout
```css
.form-row,
.row.g-4 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px; /* or 16px */
}
```

---

## 6. SPECIALIZED COMPONENTS

### Password Input with Toggle
```css
.password-input,
.input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 14px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-input[type="password"],
.password-input input {
  padding-right: 45px;
}
```

### Phone Input Component
```css
.phone-input {
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: all 0.2s ease;
  align-items: center;
}

.country-code {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 16px;
  background: #f9fafb;
  border-right: 2px solid #e2e8f0;
  font-size: 14px;
  min-width: 80px;
  cursor: pointer;
}

.country-code img {
  width: 16px;
  height: auto;
}
```

### Checkbox Styling
```css
.checkbox-label,
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  height: auto;
  margin: 0;
}
```

---

## 7. BUTTON SYSTEM

### Primary Button
```css
.primary-button,
.continue-button {
  height: 48px;
  border-radius: 8px;
  background: #1f4f8f;
  color: white;
  font-weight: 600;
  font-size: 15px;
  width: 100%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 16px;
}

.primary-button:hover {
  background: #173f74;
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Secondary Button
```css
.secondary-button {
  background: white;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.secondary-button:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}
```

---

## 8. FORM FOOTER SYSTEM

### Secondary Action Footer
```css
.secondary-action {
  text-align: center;
  margin: 0;
  padding: 16px 20px;
  border-top: 1px solid #e6e6e6;
  font-family: 'DM Sans';
  font-weight: 700;
  font-style: normal;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0%;
  vertical-align: middle;
}

.secondary-link {
  font-size: 16px;
  text-align: center;
  color: #1f4f8f;
  cursor: pointer;
  background: none;
  border: none;
  text-decoration: none;
  font-family: 'DM Sans';
  font-weight: 700;
}

.secondary-link:hover {
  color: #173f74;
  text-decoration: underline;
}
```

---

## 9. FORM OPTIONS & UTILITIES

### Form Options Row
```css
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.forgot-password {
  color: #1f4f8f;
  text-decoration: none;
  font-size: 14px;
}

.forgot-password:hover {
  text-decoration: underline;
}
```

### Form Notes
```css
.form-note p {
  color: #6b7280;
  font-size: 12px;
}
```

---

## 10. SIDEBAR COMPONENT

### AuthSidebar Styling
```css
.login-sidebar,
.profile-sidebar {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  width: 300px;
  padding: 40px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}
```

---

## 11. SCROLLBAR CUSTOMIZATION

### Custom Scrollbar
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  background-clip: content-box;
}
```

---

## 12. VALIDATION & FEEDBACK

### Validation Messages
```css
.invalid-feedback {
  display: block;
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

.valid-feedback {
  display: block;
  color: #10b981;
  font-size: 12px;
  margin-top: 4px;
}
```

### Loading States
```css
.text-muted.small {
  color: #6b7280;
  font-size: 12px;
  margin-top: 4px;
}
```

---

## 13. ACCESSIBILITY REQUIREMENTS

### Required Elements
- All inputs must have `aria-label` attributes
- Labels must be properly associated with inputs
- Password toggles must have descriptive `aria-label`
- Form validation must be announced to screen readers
- Keyboard navigation must be fully supported

---

## 14. RESPONSIVE BEHAVIOR

### Grid Breakpoints
- **Desktop**: 2-column grid (`grid-template-columns: 1fr 1fr`)
- **Mobile**: Single column (`grid-template-columns: 1fr`)
- Use Bootstrap classes: `col-md-6`, `col-12`

---

## 15. COLOR PALETTE

### Primary Colors
- **Primary Blue**: `#1f4f8f`
- **Primary Blue Hover**: `#173f74`
- **Secondary Blue**: `#3b82f6`
- **Border Gray**: `#e6e6e6`
- **Input Border**: `#dcdcdc`
- **Focus Border**: `#2b6cb0`

### Text Colors
- **Primary Text**: `#2f2f2f`
- **Secondary Text**: `#6b7280`
- **Label Text**: `#374151`
- **Muted Text**: `#9ca3af`

### Background Colors
- **Form Background**: `#ffffff`
- **Input Background**: `#fafafa`
- **Input Focus**: `white`
- **Country Code**: `#f9fafb`

---

## 16. IMPLEMENTATION RULES

### React Component Structure
```tsx
// Always use this structure
const FormComponent: React.FC = () => {
  return (
    <div className="form-container">
      <AuthSidebar />
      <div className="form-content">
        <div className="form-card">
          <h2 className="form-title">Title</h2>
          <p className="form-description">Description</p>
          <form>
            {/* Form body with 20px padding */}
          </form>
          <div className="secondary-action">
            {/* Footer content */}
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Component Requirements
- Use `FormInput` component for standard inputs
- Use `PrimaryButton` component for submit buttons
- Use `AddressForm` component for address sections
- Always include password toggle for password fields
- Include proper loading states and validation

---

## 17. CRITICAL RULES

1. **NO BOX SHADOWS** on form cards - only borders
2. **CONSISTENT FONT SIZES** - 16px for labels, 14px for inputs
3. **PROPER SPACING** - 20px form padding, 16px input margins
4. **BORDER CONSISTENCY** - 1px solid #e6e6e6 for cards, #dcdcdc for inputs
5. **COLOR CONSISTENCY** - Use exact hex values specified
6. **TYPOGRAPHY HIERARCHY** - h2 for titles, h3 for sections, proper weights
7. **ACCESSIBILITY FIRST** - Always include proper ARIA labels and keyboard support

This design system ensures complete consistency across all forms in the application.