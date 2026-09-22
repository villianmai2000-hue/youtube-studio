import { NextResponse } from 'next/server';
import { getProjectById, saveProject, deleteProject } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await getProjectById(params.id);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          },
        }
      );
    }
    return NextResponse.json(
      { success: true, project },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error fetching project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const existing = await getProjectById(params.id);

    const updated = existing
      ? {
          ...existing,
          ...body,
          id: params.id,
          updatedAt: new Date().toISOString(),
        }
      : {
          ...body,
          id: params.id,
          updatedAt: new Date().toISOString(),
        };

    await saveProject(updated);
    return NextResponse.json({ success: true, project: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error updating project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteProject(params.id);
    return NextResponse.json({ success });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error deleting project';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
