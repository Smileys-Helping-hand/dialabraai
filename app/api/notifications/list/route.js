import { NextResponse } from 'next/server';
import { getNotifications, getUnreadCount } from '@/lib/notifications';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('user_email');
  const userType = searchParams.get('user_type') || 'customer';
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  if (!userEmail) {
    return NextResponse.json({ error: 'user_email is required' }, { status: 400 });
  }

  try {
    const notifications = await getNotifications(userEmail, userType, limit);
    const unreadCount = await getUnreadCount(userEmail, userType);

    return NextResponse.json(
      { notifications, unreadCount },
      { status: 200 }
    );
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
