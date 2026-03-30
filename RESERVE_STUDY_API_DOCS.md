# Reserve Study Editor - Backend API Documentation

## Overview
Professional-grade backend implementation for the Reserve Study Editor with comprehensive CRUD operations, file management, template generation, and data validation.

## API Endpoints

### 1. Template Management

#### Download Template
```
GET /api/reserve-studies/template/download
```
**Description:** Generates and downloads a pre-formatted Excel template for reserve studies.

**Response:** Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Features:**
- Pre-configured configuration section
- Sample data rows
- Proper column formatting
- Ready-to-use structure

---

### 2. Reserve Study CRUD Operations

#### Create Reserve Study
```
POST /api/reserve-studies
Content-Type: multipart/form-data
```
**Body:**
- `excelFile`: File (required)
- `studyName`: String (required)
- `associationName`: String (optional)

**Response:**
```json
{
  "message": "Reserve study created successfully",
  "data": {
    "id": "study_id",
    "studyName": "Study Name",
    "fileName": "file.xlsx",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Reserve Studies List
```
POST /api/reserve-studies/list
```
**Body:**
```json
{
  "associationId": "association_id"
}
```

**Response:**
```json
{
  "message": "Reserve studies retrieved successfully",
  "data": [
    {
      "_id": "study_id",
      "studyName": "Study Name",
      "fileName": "file.xlsx",
      "fileSize": 12345,
      "uploadedBy": { "firstName": "John", "lastName": "Doe" },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Single Reserve Study
```
GET /api/reserve-studies/:id
```

**Response:**
```json
{
  "message": "Reserve study retrieved successfully",
  "data": {
    "_id": "study_id",
    "studyName": "Study Name",
    "fileName": "file.xlsx",
    "fileSize": 12345,
    "uploadedBy": { ... },
    "createdBy": { ... },
    "associationId": { ... }
  }
}
```

#### Get Reserve Study Data (Parsed Excel)
```
GET /api/reserve-studies/:id/data
```

**Response:**
```json
{
  "message": "Reserve study data retrieved successfully",
  "studyName": "Study Name",
  "fileName": "file.xlsx",
  "data": {
    "config": {
      "Beginning Fiscal Year of the Report": 2024,
      "Number of Years Covered in the Report": 30,
      "Beginning Reserve Funds (Dollar Amount)": 100000,
      "Average Monthly Fee per Unit": 250,
      "Total Number of Housing Units": 100,
      "Inflation Rate Used in the Report": 0.03,
      "Suggested Rate of Return on Investments": 0.05
    },
    "items": [
      {
        "itemName": "Asphalt Mill and Overlay",
        "expectedLife": 25,
        "remainingLife": 25,
        "replacementCost": 15072,
        "sirsType": 0
      }
    ],
    "sheetName": "Manual entry",
    "metadata": {
      "totalRows": 20,
      "headerRow": 15,
      "itemsFound": 5,
      "configKeys": 7
    }
  },
  "metadata": {
    "studyId": "study_id",
    "fileSize": 12345,
    "uploadedBy": "user_id",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update Reserve Study Metadata
```
PUT /api/reserve-studies/:id
```
**Body:**
```json
{
  "studyName": "Updated Study Name",
  "associationName": "Association Name",
  "allowUser": ["user_id_1", "user_id_2"]
}
```

#### Delete Reserve Study
```
DELETE /api/reserve-studies/:id
```

**Response:**
```json
{
  "message": "Reserve study deleted successfully"
}
```

---

### 3. Data Update Operations

#### Update Reserve Study Data
```
PUT /api/reserve-studies/:id/data
```
**Body:**
```json
{
  "studyName": "Updated Study Name",
  "items": [
    {
      "itemName": "Item Name",
      "expectedLife": 25,
      "remainingLife": 20,
      "replacementCost": 15000,
      "sirsType": 0,
      "comment": "Optional comment"
    }
  ],
  "config": {
    "Beginning Fiscal Year of the Report": 2024,
    "Number of Years Covered in the Report": 30,
    ...
  }
}
```

**Response:**
```json
{
  "message": "Reserve study updated successfully",
  "data": {
    "id": "study_id",
    "studyName": "Updated Study Name",
    "fileName": "file.xlsx",
    "fileSize": 12345,
    "itemsCount": 10,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Features:**
- Creates new Excel file with updated data
- Replaces old file in GridFS
- Maintains proper Excel formatting
- Updates database record

---

### 4. Document Management

#### Upload Additional Document
```
POST /api/reserve-studies/:id/documents
Content-Type: multipart/form-data
```
**Body:**
- `document`: File (required)

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "data": {
    "fileName": "document.pdf",
    "fileSize": 54321,
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get Study Documents
```
GET /api/reserve-studies/:id/documents
```

**Response:**
```json
{
  "message": "Documents retrieved successfully",
  "data": [
    {
      "_id": "doc_id",
      "fileName": "document.pdf",
      "fileSize": 54321,
      "mimeType": "application/pdf",
      "uploadedBy": { "firstName": "John", "lastName": "Doe" },
      "uploadedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Download Document
```
GET /api/reserve-studies/:id/documents/:documentId/download
```

**Response:** File blob

---

### 5. Item Operations

#### Duplicate Item
```
POST /api/reserve-studies/:id/items/duplicate
```
**Body:**
```json
{
  "itemIndex": 2
}
```

**Response:**
```json
{
  "message": "Reserve study updated successfully",
  "data": { ... }
}
```

---

## Excel Parsing Features

### Smart Sheet Detection
The parser uses multiple strategies to find the correct data sheet:
1. Exact "Manual entry" match
2. Case-insensitive variations
3. Keyword search (manual, entry, data)
4. First available sheet fallback

### Robust Header Detection
Multiple strategies to locate the data table:
1. Exact "Item Name" match
2. Header variations (Item, Component, Asset, etc.)
3. Pattern recognition for table structures
4. Intelligent fallback positioning

### Configuration Parsing
- Automatically extracts key-value pairs from top rows
- Handles various formatting styles
- Validates data types
- Provides sensible defaults

### Item Parsing
- Validates data integrity
- Skips empty rows and totals
- Handles missing values gracefully
- Supports multiple data formats

### Error Handling
- Comprehensive error messages
- Detailed logging for debugging
- Graceful degradation
- Timeout protection (30 seconds)
- File validation

---

## Database Schema

### ReserveStudy Model
```javascript
{
  studyName: String (required),
  fileName: String (required),
  fileId: ObjectId (required) // GridFS reference,
  fileSize: Number (required),
  mimeType: String (required),
  uploadedBy: ObjectId (ref: User),
  createdBy: ObjectId (ref: User),
  allowUser: [ObjectId] (ref: User),
  associationId: ObjectId (ref: Association),
  documents: [{
    fileName: String,
    fileId: ObjectId,
    fileSize: Number,
    mimeType: String,
    uploadedBy: ObjectId (ref: User),
    uploadedAt: Date
  }],
  status: String (enum: active, inactive, archived),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **Authentication:** All endpoints require JWT authentication
2. **Authorization:** User-based access control via `allowUser` array
3. **File Validation:** MIME type and size validation
4. **Input Sanitization:** All inputs are validated and sanitized
5. **Error Handling:** Sensitive information is never exposed in errors

---

## Performance Optimizations

1. **GridFS Streaming:** Efficient file handling for large files
2. **Chunked Downloads:** 1MB chunks for optimal memory usage
3. **Timeout Protection:** 30-second timeout for file operations
4. **Buffer Management:** Proper memory cleanup
5. **Indexed Queries:** Optimized database queries

---

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `408` - Request Timeout (operation took too long)
- `422` - Unprocessable Entity (invalid file format)
- `500` - Internal Server Error (unexpected error)

---

## Usage Examples

### Frontend Integration

```typescript
import reserveStudyApi from './services/reserveStudyApi';

// Download template
const blob = await reserveStudyApi.downloadTemplate();
const url = window.URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'Reserve_Study_Template.xlsx';
link.click();

// Upload study
const file = event.target.files[0];
const response = await reserveStudyApi.uploadStudy(
  file,
  'My Reserve Study',
  'Association Name'
);

// Get study data
const data = await reserveStudyApi.getStudyData(studyId);

// Update study data
await reserveStudyApi.updateStudyData(studyId, {
  studyName: 'Updated Name',
  items: updatedItems,
  config: updatedConfig
});

// Upload document
await reserveStudyApi.uploadDocument(studyId, documentFile);
```

---

## Testing Recommendations

1. **Unit Tests:** Test each controller function independently
2. **Integration Tests:** Test complete workflows
3. **File Upload Tests:** Test various file formats and sizes
4. **Error Handling Tests:** Test all error scenarios
5. **Performance Tests:** Test with large files (>10MB)
6. **Security Tests:** Test authentication and authorization

---

## Maintenance Notes

- Excel parsing logic is in `parseReserveStudyFromBuffer()`
- GridFS bucket name: `reserve-studies`
- File size limit: Configured in upload middleware
- Supported formats: .xlsx, .xls
- Template structure: Matches manual entry format

---

## Future Enhancements

1. Batch operations for multiple items
2. Version history tracking
3. Collaborative editing
4. Real-time updates via WebSockets
5. Advanced search and filtering
6. Export to multiple formats (PDF, CSV)
7. Automated backup system
8. Analytics and reporting
