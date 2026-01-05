import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Submission type
interface Submission {
  id: string;
  name: string;
  email: string;
  title: string;
  genre: string;
  synopsis: string;
  sampleChapter: string;
  manuscriptFileName?: string;
  manuscriptFileSize?: number;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  submittedAt: string;
  notes?: string;
}

// Path to submissions JSON file (in production, use a database)
const SUBMISSIONS_FILE = path.join(process.cwd(), 'data', 'submissions.json');

// Ensure the data directory and file exist
async function ensureDataFile() {
  const dataDir = path.dirname(SUBMISSIONS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
  
  try {
    await fs.access(SUBMISSIONS_FILE);
  } catch {
    await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
  }
}

// Read all submissions
async function getSubmissions(): Promise<Submission[]> {
  await ensureDataFile();
  const data = await fs.readFile(SUBMISSIONS_FILE, 'utf-8');
  return JSON.parse(data);
}

// Save submissions
async function saveSubmissions(submissions: Submission[]) {
  await ensureDataFile();
  await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
}

// Generate unique ID
function generateId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// POST - Create new submission
export async function POST(request: NextRequest) {
  try {
    // Check if it's FormData (with file) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    let name: string, email: string, title: string, genre: string, synopsis: string, sampleChapter: string;
    let manuscriptFileName: string | undefined;
    let manuscriptFileSize: number | undefined;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with file upload
      const formData = await request.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      title = formData.get('title') as string;
      genre = formData.get('genre') as string;
      synopsis = formData.get('synopsis') as string;
      sampleChapter = formData.get('sampleChapter') as string;
      
      const manuscriptFile = formData.get('manuscript') as File | null;
      if (manuscriptFile && manuscriptFile.size > 0) {
        manuscriptFileName = manuscriptFile.name;
        manuscriptFileSize = manuscriptFile.size;
        
        // Save the file to disk (in production, upload to cloud storage)
        const uploadsDir = path.join(process.cwd(), 'data', 'manuscripts');
        try {
          await fs.access(uploadsDir);
        } catch {
          await fs.mkdir(uploadsDir, { recursive: true });
        }
        
        const fileBuffer = Buffer.from(await manuscriptFile.arrayBuffer());
        const safeFileName = `${Date.now()}_${manuscriptFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await fs.writeFile(path.join(uploadsDir, safeFileName), fileBuffer);
        manuscriptFileName = safeFileName;
      }
    } else {
      // Handle JSON (backwards compatibility)
      const body = await request.json();
      name = body.name;
      email = body.email;
      title = body.title;
      genre = body.genre;
      synopsis = body.synopsis;
      sampleChapter = body.sampleChapter;
    }

    // Validate required fields (synopsis OR sample chapter OR file required)
    if (!name || !email || !title || !genre) {
      return NextResponse.json(
        { error: 'Name, email, title, and genre are required' },
        { status: 400 }
      );
    }
    
    if (!synopsis && !sampleChapter && !manuscriptFileName) {
      return NextResponse.json(
        { error: 'Please provide a synopsis, sample chapter, or upload your manuscript' },
        { status: 400 }
      );
    }

    // Create new submission
    const newSubmission: Submission = {
      id: generateId(),
      name,
      email,
      title,
      genre,
      synopsis: synopsis || '',
      sampleChapter: sampleChapter || '',
      manuscriptFileName,
      manuscriptFileSize,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    // Get existing submissions and add new one
    const submissions = await getSubmissions();
    submissions.unshift(newSubmission); // Add to beginning
    await saveSubmissions(submissions);

    // In production, you would also:
    // 1. Send confirmation email to author
    // 2. Send notification email to admin
    // 3. Store in a proper database

    return NextResponse.json(
      { message: 'Submission received successfully', id: newSubmission.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    );
  }
}

// GET - Retrieve all submissions (for admin)
export async function GET(request: NextRequest) {
  try {
    // In production, add authentication check here
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let submissions = await getSubmissions();

    // Filter by status if provided
    if (status && status !== 'all') {
      submissions = submissions.filter(s => s.status === status);
    }

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// PATCH - Update submission status (for admin)
export async function PATCH(request: NextRequest) {
  try {
    // In production, add authentication check here
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      );
    }

    const submissions = await getSubmissions();
    const index = submissions.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    submissions[index].status = status;
    if (notes) {
      submissions[index].notes = notes;
    }

    await saveSubmissions(submissions);

    return NextResponse.json({ message: 'Submission updated', submission: submissions[index] });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

// DELETE - Delete submission (for admin)
export async function DELETE(request: NextRequest) {
  try {
    // In production, add authentication check here
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    const submissions = await getSubmissions();
    const filteredSubmissions = submissions.filter(s => s.id !== id);

    if (filteredSubmissions.length === submissions.length) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    await saveSubmissions(filteredSubmissions);

    return NextResponse.json({ message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
