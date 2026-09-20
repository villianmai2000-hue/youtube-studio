import { NextResponse } from 'next/server';
import { updateOwnerSecurity, recoverOwnerPassword, DEFAULT_OWNER } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// GET: Fetch current owner security info (masked phone & email)
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      ownerPhone: DEFAULT_OWNER.phoneNumber || '0962033005',
      ownerEmail: DEFAULT_OWNER.email || 'yutthakan2000@gmail.com',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Owner updates bound phone and email
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, email, requesterPassword } = body;

    if (requesterPassword !== DEFAULT_OWNER.password) {
      return NextResponse.json(
        { success: false, error: 'รหัสผ่านเจ้าของระบบไม่ถูกต้อง ไม่อนุญาตให้แก้ไขข้อมูลความปลอดภัย' },
        { status: 403 }
      );
    }

    const updated = await updateOwnerSecurity(phoneNumber, email);
    DEFAULT_OWNER.phoneNumber = updated.phoneNumber;
    DEFAULT_OWNER.email = updated.email;

    return NextResponse.json({
      success: true,
      message: 'อัปเดตเบอร์โทรศัพท์และอีเมลความปลอดภัยเรียบร้อยแล้ว!',
      phoneNumber: updated.phoneNumber,
      email: updated.email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST: Recover password using bound phone number or email
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recoveryInput, newPassword } = body;

    if (!recoveryInput || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกเบอร์โทรหรืออีเมลที่ผูกไว้ และรหัสผ่านใหม่' },
        { status: 400 }
      );
    }

    const result = await recoverOwnerPassword(recoveryInput, newPassword);
    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Recovery failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
