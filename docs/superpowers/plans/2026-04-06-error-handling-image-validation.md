# Error Handling & Image Validation Standardization

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all forms to use toast notifications for API error/success messages, and enforce context-specific image upload limits (icons: 500KB/512x512, logos: 2MB/1024x1024, profile pics: 2MB/2048x2048).

**Architecture:** Create a shared `imageValidation.ts` utility with per-context validation (including resolution checks via Image API). Replace all `alert()` calls with `toast.error()`/`toast.success()`. Replace all silent `console.error()` with user-facing toast messages. Add backend image validation in upload middleware.

**Tech Stack:** React 18, TypeScript, react-toastify, Express.js, Multer

---

## File Structure

- **Create:** `client/src/utils/imageValidation.ts` — shared image validation utility with size/resolution checks per context
- **Modify:** `client/src/components/ProfileModal.tsx` — add toast import, image validation, error messages
- **Modify:** `client/src/components/ChangePasswordModal.tsx` — replace alert() with toast
- **Modify:** `client/src/components/DeleteAccountModal.tsx` — replace alert() with toast
- **Modify:** `client/src/components/ChangeCompanyModal.tsx` — replace console.error with toast
- **Modify:** `client/src/components/AddAssociationPopup.tsx` — replace alert() with toast, add resolution validation
- **Modify:** `client/src/components/ReserveStudyEditorModal.tsx` — replace alert() with toast
- **Modify:** `client/src/pages/UserRoleManagerLayout.tsx` — replace alert() with toast, add resolution validation
- **Modify:** `client/src/pages/AssociationControl.tsx` — replace alert() with toast
- **Modify:** `client/src/CompanyProfile.tsx` — add resolution validation
- **Modify:** `client/src/components/SimulatorSubheader.tsx` — replace alert() with toast
- **Modify:** `client/src/components/FundGraph.tsx` — replace alert() with toast
- **Modify:** `client/src/components/YearPriorityPopup.tsx` — replace alert() with toast
- **Modify:** `server/middleware/upload.jsx` — add backend image validation for profile images

---

### Task 1: Create shared image validation utility

**Files:**
- Create: `client/src/utils/imageValidation.ts`

- [ ] **Step 1: Create imageValidation.ts**

```typescript
export type ImageContext = 'icon' | 'logo' | 'profile';

interface ImageLimits {
  maxSizeBytes: number;
  maxSizeLabel: string;
  maxWidth: number;
  maxHeight: number;
}

const IMAGE_LIMITS: Record<ImageContext, ImageLimits> = {
  icon: { maxSizeBytes: 500 * 1024, maxSizeLabel: '500KB', maxWidth: 512, maxHeight: 512 },
  logo: { maxSizeBytes: 2 * 1024 * 1024, maxSizeLabel: '2MB', maxWidth: 1024, maxHeight: 1024 },
  profile: { maxSizeBytes: 2 * 1024 * 1024, maxSizeLabel: '2MB', maxWidth: 2048, maxHeight: 2048 },
};

export function validateImageFile(file: File, context: ImageContext): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please upload a valid image file (JPG, PNG, GIF, or WebP)';
  }

  const limits = IMAGE_LIMITS[context];
  if (file.size > limits.maxSizeBytes) {
    return `File size must be less than ${limits.maxSizeLabel}. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`;
  }

  return null;
}

export function validateImageResolution(file: File, context: ImageContext): Promise<string | null> {
  const limits = IMAGE_LIMITS[context];
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      if (img.width > limits.maxWidth || img.height > limits.maxHeight) {
        resolve(`Image resolution must be ${limits.maxWidth}x${limits.maxHeight}px or smaller. Your image is ${img.width}x${img.height}px`);
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve('Unable to read image file. The file may be corrupted');
    };
    img.src = URL.createObjectURL(file);
  });
}
```

- [ ] **Step 2: Commit**

---

### Task 2: Fix ProfileModal — add toast + image validation

**Files:**
- Modify: `client/src/components/ProfileModal.tsx`

- [ ] **Step 1: Add imports and validation to ProfileModal**

Add `import { toast } from 'react-toastify';` and `import { validateImageFile, validateImageResolution } from '../utils/imageValidation';`.

Replace `handleImageUpload` to validate file type, size (2MB), and resolution (2048x2048) before uploading. Show toast.error for validation failures and API errors. Show toast.success on successful upload.

Add toast.error in `fetchUserProfile` catch block.

- [ ] **Step 2: Commit**

---

### Task 3: Fix ChangePasswordModal — replace alert() with toast

**Files:**
- Modify: `client/src/components/ChangePasswordModal.tsx`

- [ ] **Step 1: Replace all alert() with toast**

Add `import { toast } from 'react-toastify';`. Replace:
- `alert('Passwords do not match')` → `toast.error('Passwords do not match')`
- `alert('Password changed successfully')` → `toast.success('Password changed successfully')`
- `alert(data.message || 'Failed to change password')` → `toast.error(data.message || 'Failed to change password')`
- `alert('Failed to change password')` → `toast.error('Failed to change password. Please try again.')`

- [ ] **Step 2: Commit**

---

### Task 4: Fix DeleteAccountModal — replace alert() with toast

**Files:**
- Modify: `client/src/components/DeleteAccountModal.tsx`

- [ ] **Step 1: Replace all alert() with toast**

Add `import { toast } from 'react-toastify';`. Replace:
- `alert(data.message || 'Failed to delete account')` → `toast.error(data.message || 'Failed to delete account')`
- `alert('Failed to delete account')` → `toast.error('Failed to delete account. Please try again.')`

- [ ] **Step 2: Commit**

---

### Task 5: Fix ChangeCompanyModal — replace console.error with toast

**Files:**
- Modify: `client/src/components/ChangeCompanyModal.tsx`

- [ ] **Step 1: Add toast and show user-facing errors**

Add `import { toast } from 'react-toastify';`. Add toast.error messages:
- `fetchUserData` catch: `toast.error('Failed to load companies. Please try again.')`
- `handleCompanySwitch` catch: `toast.error('Failed to switch company. Please try again.')`
- `handleRequestAction` catch: `toast.error('Failed to process request. Please try again.')`

- [ ] **Step 2: Commit**

---

### Task 6: Fix AddAssociationPopup — toast + icon validation

**Files:**
- Modify: `client/src/components/AddAssociationPopup.tsx`

- [ ] **Step 1: Replace alert() with toast, add resolution check**

Add `import { toast } from 'react-toastify';` and `import { validateImageFile, validateImageResolution } from '../utils/imageValidation';`.

Replace handleIconUpload to use the shared validation with context='icon' (500KB/512x512). Replace all alert() in handleSubmit with toast.error/toast.success.

- [ ] **Step 2: Commit**

---

### Task 7: Fix ReserveStudyEditorModal — replace alert() with toast

**Files:**
- Modify: `client/src/components/ReserveStudyEditorModal.tsx`

- [ ] **Step 1: Replace all alert() with toast**

Add `import { toast } from 'react-toastify';`. Replace all alert() calls with toast.error() or toast.success() as appropriate.

- [ ] **Step 2: Commit**

---

### Task 8: Fix UserRoleManagerLayout — toast + icon validation

**Files:**
- Modify: `client/src/pages/UserRoleManagerLayout.tsx`

- [ ] **Step 1: Replace alert() with toast, add resolution check**

Add `import { toast } from 'react-toastify';` and `import { validateImageFile, validateImageResolution } from '../utils/imageValidation';`.

Replace handleIconUpload to use shared validation with context='icon'. Replace all other alert() calls with toast.

- [ ] **Step 2: Commit**

---

### Task 9: Fix AssociationControl — replace alert() with toast

**Files:**
- Modify: `client/src/pages/AssociationControl.tsx`

- [ ] **Step 1: Replace alert() with toast**

- [ ] **Step 2: Commit**

---

### Task 10: Fix CompanyProfile — add resolution validation

**Files:**
- Modify: `client/src/CompanyProfile.tsx`

- [ ] **Step 1: Add resolution check to handleLogoChange**

Add `import { validateImageFile, validateImageResolution } from './utils/imageValidation';` and use context='logo' (2MB/1024x1024).

- [ ] **Step 2: Commit**

---

### Task 11: Fix SimulatorSubheader — replace alert() with toast

**Files:**
- Modify: `client/src/components/SimulatorSubheader.tsx`

- [ ] **Step 2: Commit**

---

### Task 12: Fix FundGraph and YearPriorityPopup — replace alert() with toast

**Files:**
- Modify: `client/src/components/FundGraph.tsx`
- Modify: `client/src/components/YearPriorityPopup.tsx`

- [ ] **Step 1: Replace all alert() with toast.error()**
- [ ] **Step 2: Commit**

---

### Task 13: Add backend image validation for profile images

**Files:**
- Modify: `server/middleware/upload.jsx`

- [ ] **Step 1: Extend fileFilter to validate image uploads for profileImage field**

Add MIME type validation for `profileImage` field (same as logo). Update file size limits per field name.

- [ ] **Step 2: Commit**
