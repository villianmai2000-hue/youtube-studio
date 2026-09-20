import { NextResponse } from 'next/server';
import {
  getOwnerSecurity,
  saveOwnerSecurity,
  requestOwnerOtp,
  verifyOtpAndResetPassword,
  recoverOwnerPassword,
  DEFAULT_OWNER,
} from '@/lib/storage';

export const dynamic = 'force-dynamic';

// GET: Fetch current owner security info (for Owner inside the system)
export async function GET() {
  try {
    const sec = getOwnerSecurity();
    return NextResponse.json({
      success: true,
      ownerPhone: sec.phoneNumber,
      ownerEmail: sec.email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT: Owner updates bound phone and email inside system
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

    const updated = saveOwnerSecurity(phoneNumber, email);
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

// POST: Handles OTP Request & Verification
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const recoveryInput = body.recoveryInput || body.recoveryKey || body.phoneNumber || body.email;
    const action = body.action || (body.otpCode ? 'verify_otp' : (!body.newPassword ? 'send_otp' : 'direct_recover'));

    if (!recoveryInput) {
      return NextResponse.json(
        { success: false, error: 'กรุณากรอกเบอร์โทรศัพท์หรืออีเมลที่ผูกไว้กับบัญชี' },
        { status: 400 }
      );
    }

    // 1. Request OTP Code
    if (action === 'send_otp' || action === 'request_otp') {
      const res = await requestOwnerOtp(recoveryInput);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: res.message,
        maskedTarget: res.maskedTarget,
        otpCode: res.otpCode,
      });
    }

    // 2. Verify OTP & Reset Password
    if (action === 'verify_otp') {
      const { otpCode, newPassword } = body;
      if (!otpCode) {
        return NextResponse.json({ success: false, error: 'กรุณากรอกรหัส OTP 6 หลัก' }, { status: 400 });
      }
      if (!newPassword) {
        return NextResponse.json({ success: false, error: 'กรุณากรอกรหัสผ่านใหม่ที่ต้องการตั้ง' }, { status: 400 });
      }

      const res = await verifyOtpAndResetPassword(recoveryInput, otpCode, newPassword);
      if (!res.success) {
        return NextResponse.json({ success: false, error: res.message }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: res.message,
      });
    }

    // 3. Fallback direct recovery
    const newPassword = body.newPassword;
    if (newPassword) {
      const result = await recoverOwnerPassword(recoveryInput, newPassword);
      if (result.success) {
        return NextResponse.json({ success: true, message: result.message });
      } else {
        return NextResponse.json({ success: false, error: result.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: 'คำสั่งไม่ถูกต้อง' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Operation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
