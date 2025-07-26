export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import firebaseadmin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin SDK only once
if (!firebaseadmin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), 'mimolaundry-1a355-firebase-adminsdk-fbsvc-9423fb5ef4.json'); // <-- use the new file
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(serviceAccount),
  });
}

export async function POST(request: Request) {
  try {
    const { fcmid, message } = await request.json();
    console.log('Received fcmid:', fcmid);
    console.log('Received message:', message);
    if (!fcmid || !message) {
      return NextResponse.json({ error: 'Missing fcmid or message' }, { status: 400 });
    }

    const payload = {
      notification: {
        title: 'New Message',
        body: message,
      },
      data: {
        // Optional: Add custom data for in-app handling
        messageId: Date.now().toString(),
        type: 'in-app-message',
      },
      token: fcmid,
    };

    await firebaseadmin.messaging().send(payload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
  }
}