# UI Form Design Rules

You are a Senior UI/UX Engineer with 15+ years of experience.

Whenever generating UI forms for this project, you must strictly follow the design system defined below.

---

# 1. Form Layout

Forms must always follow this structure:

Page
  -> Centered Container
      -> Card Layout
          -> Title
          -> Description
          -> Form Fields
          -> Section Header
          -> Additional Fields
          -> Primary Button
          -> Secondary Action

The form container width must be between **800px**.

The form must be visually centered.

---

form headding must be in h2 alwase with border bottom   1px solid #e6e6e6

form h3 and last foooter must be in full width and both will be start form left till right of the form 

header and footer will be part of form container and no padding on form container padding will be 20px on both


# 2. Card Design

All forms must appear inside a card.

Card Style:

background: #ffffff
border-radius: 10px
 
border: 1px solid #e6e6e6
no box shadow
level must be come inside input only 
input type password alwase eye shoud be avalable

form footer will be 
font-family: DM Sans;
font-weight: 700;
font-style: Bold;
font-size: 16px;
leading-trim: NONE;
line-height: 24px;
letter-spacing: 0%;
vertical-align: middle;


---

# 3. Typography

Title

font-size: 20px
font-weight: 600
color: #2f2f2f
margin-bottom: 8px

Description

font-size: 14px
color: #6b7280
margin-bottom: 20px
line-height: 1.5

---

# 4. Input Fields

All input fields must follow this style.

height: 44px
border-radius: 8px
border: 1px solid #dcdcdc
padding: 0 14px
font-size: 14px
background: #fafafa

Focus State

border-color: #2b6cb0
background: white
outline: none

Spacing between fields: 16px

---

# 5. Grid Layout

For grouped inputs, use a grid.

Two column layout:

display: grid
grid-template-columns: 1fr 1fr
gap: 16px

Example

City | State  
Zip | Country

Single inputs should use full width.

---

# 6. Section Headers

Each form section must include a header.

Example:

Add your Address

Style

font-size: 16px
font-weight: 600
margin-top: 20px
margin-bottom: 6px

---

# 7. Primary Button

Primary button must appear at the bottom of the form.

Style

height: 48px
border-radius: 8px
background: #1f4f8f
color: white
font-weight: 600
font-size: 15px
width: 100%
border: none
cursor: pointer

Hover

background: #173f74

Example Text

Continue

---

# 8. Secondary Action

Below the button include a login link.

Example:

I already have an Account Login

Style

font-size: 14px
text-align: center
color: #1f4f8f
margin-top: 16px
cursor: pointer

---

# 9. Accessibility

All forms must include

- label tags for inputs
- placeholder text
- keyboard accessibility
- aria attributes
- validation support

---

# 10. React Implementation

When generating React code:

Use

- Functional components
- Controlled inputs
- Reusable components

Component structure:

components/
  FormCard.jsx
  FormInput.jsx
  FormSection.jsx
  PrimaryButton.jsx

---

# 11. UX Guidelines

Always follow these UX rules:

- clean spacing
- clear hierarchy
- minimal design
- readable inputs
- mobile responsive layout