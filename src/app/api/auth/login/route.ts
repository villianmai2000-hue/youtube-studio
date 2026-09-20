import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const identifier = body.identifier || body.username;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(identifier, password);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือบัญชียังไม่ได้รับอนุมัติ' },
        { status: 401 }
      );
    }

    // Return user info (exclude sensitive data from response)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
