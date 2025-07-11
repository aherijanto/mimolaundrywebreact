import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  try {
    if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        return NextResponse.json({ user });
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    } else {
      const users = await prisma.user.findMany();
      return NextResponse.json({ users });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user(s)', details: error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, pass, fcmid } = body;

  try {
    // Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }
    const user = await prisma.user.create({
      data: { name, email, pass, fcmid },
    });
    return NextResponse.json({ message: 'User created', user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user', details: error }, { status: 500 });
  }
}