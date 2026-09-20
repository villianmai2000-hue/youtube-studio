import { NextResponse } from 'next/server';
import { getAllUsers, saveUser, deleteUser, updateUserCredentials, DEFAULT_OWNER } from '@/lib/storage';
import { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getAllUsers();
    // Return sanitized users (omit passwords)
    const sanitized = users.map((u) => ({
      id: u.id,
      username: u.username,
      displayName: u.displayName,
      role: u.role,
      isActive: u.isActive,
      createdAt: u.createdAt,
      createdBy: u.createdBy,
    }));
    return NextResponse.json({ success: true, users: sanitized });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, displayName, role = 'creator', requesterRole, requesterName } = body;

    // Verify only owner can add users
    if (requesterRole !== 'owner' && requesterName !== DEFAULT_OWNER.displayName && requesterName !== DEFAULT_OWNER.username) {
      return NextResponse.json(
        { success: false, error: 'สงวนสิทธิ์เฉพาะเจ้าของระบบ (คุณยุทธการ คำกลอน) เท่านั้นที่สามารถเพิ่มผู้ใช้ได้' },
        { status: 403 }
      );
    }

    if (!username || !password || !displayName) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อผู้ใช้ รหัสผ่าน และชื่อที่แสดงให้ครบถ้วน' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();
    const existingUsers = await getAllUsers();
    if (existingUsers.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `ชื่อผู้ใช้ "${cleanUsername}" มีอยู่ในระบบแล้ว` },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      password: password.trim(),
      displayName: displayName.trim(),
      role: role || 'creator',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: requesterName || DEFAULT_OWNER.displayName,
    };

    await saveUser(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        role: newUser.role,
        isActive: newUser.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, username, password, displayName, requesterRole, requesterName } = body;

    // Verify only owner can edit users
    if (requesterRole !== 'owner' && requesterName !== DEFAULT_OWNER.displayName && requesterName !== DEFAULT_OWNER.username) {
      return NextResponse.json(
        { success: false, error: 'สงวนสิทธิ์เฉพาะเจ้าของระบบ (คุณยุทธการ คำกลอน) เท่านั้นที่สามารถแก้ไขข้อมูลผู้ใช้ได้' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await updateUserCredentials(id, username, password, displayName);
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'ไม่พบผู้ใช้นี้ในระบบ' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const requesterRole = searchParams.get('requesterRole');
    const requesterName = searchParams.get('requesterName');

    if (requesterRole !== 'owner' && requesterName !== DEFAULT_OWNER.displayName) {
      return NextResponse.json(
        { success: false, error: 'สงวนสิทธิ์เฉพาะเจ้าของระบบเท่านั้น' },
        { status: 403 }
      );
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    if (id === DEFAULT_OWNER.id) {
      return NextResponse.json({ success: false, error: 'ไม่สามารถลบเจ้าของระบบได้' }, { status: 400 });
    }

    const success = await deleteUser(id);
    return NextResponse.json({ success });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
