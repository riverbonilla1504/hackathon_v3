# Supabase Setup for CV Storage

## Quick Setup

### Option 1: Using SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase_setup.sql` in this directory
4. Copy and paste the entire SQL script into the SQL Editor
5. Click **Run** to execute the script

This will automatically:
- Create the `cvs` storage bucket
- Add `cv_path` and `cv_url` columns to the `profile` table
- Set up storage policies (RLS)
- Create necessary indexes
- Grant required permissions

### Option 2: Manual Setup

#### 1. Create Storage Bucket

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Name: `cvs`
5. Make it **Public** (or configure RLS policies as needed)
6. Click **Create**

#### 2. Update Profile Table Schema

The `profile` table needs to support CV storage paths. Add these columns if they don't exist:

```sql
ALTER TABLE public.profile 
ADD COLUMN IF NOT EXISTS cv_path TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT;
```

#### 3. Storage Policies

See the `supabase_setup.sql` file for complete policy setup, or use the simplified version below:

```sql
-- Allow authenticated users to upload CVs
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cvs');

-- Allow public read access to CVs
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'cvs');
```

### 3. Environment Variables

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For server-side operations
OPENAI_KEY=your_openai_key
```

**Note:** The `SUPABASE_SERVICE_ROLE_KEY` is required for the upload API route to work. This key has admin access and should only be used server-side. You can find it in your Supabase project settings under **API** → **Service Role Key**.

## Features Implemented

1. **Bulk CV Upload**: Upload a ZIP file containing multiple CVs (PDF, DOC, DOCX)
2. **AI Processing**: Automatically extracts information from CVs using OpenAI
3. **Storage**: CVs are stored in Supabase Storage bucket
4. **CV Viewer**: View CVs inline without downloading
5. **Database Integration**: Applicant data is saved to the `profile` table

## API Routes

- `/api/upload-cvs` - Handles ZIP file upload, extraction, and AI processing
- `/api/get-cv` - Retrieves CV files from Supabase Storage

## Components

- `BulkCVUpload` - Component for uploading ZIP files
- `CVViewer` - Modal component for viewing CVs inline
- `ApplicantsTable` - Updated to show CV viewer instead of download links

## Notes

- The AI processing currently uses a simplified approach. For production, consider:
  - Using PDF parsing libraries (pdf-parse, pdf.js)
  - Using DOC/DOCX parsing libraries (mammoth, docx)
  - Extracting text first, then sending to OpenAI for better accuracy

