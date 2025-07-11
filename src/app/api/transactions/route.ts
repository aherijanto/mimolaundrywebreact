import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code_machine,
      request_by,
      date_trans,
      payment_status,
      order_from,
    } = body;

    // Generate sequential transaction number for today
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = now.getFullYear();
    const m = pad(now.getMonth() + 1);
    const d = pad(now.getDate());

    // Count existing transactions for today
    const todayStart = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
    const todayEnd = new Date(`${y}-${m}-${d}T23:59:59.999Z`);
    const countToday = await prisma.trans_Laundry.count({
      where: {
        date_trans: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });
    const seq = countToday + 1;
    const no_trans = `Mimo${y}${m}${d}.${seq}`;

    if (!code_machine || !request_by || !date_trans) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transaction = await prisma.trans_Laundry.create({
      data: {
        no_trans,
        code_machine,
        request_by,
        date_trans: new Date(new Date(date_trans).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })),
        payment_status: Boolean(payment_status),
        order_from: order_from || 'web',
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create transaction', details: error?.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');
    const orderFrom = searchParams.get('order_from');
    if (all) {
      // Return all transactions (paid and unpaid)
      const transactions = await prisma.trans_Laundry.findMany({
        orderBy: { date_trans: 'asc' },
      });
      return NextResponse.json({ transactions });
    }

    if (orderFrom) {
      // Return transactions where order_from matches the query
      const transactions = await prisma.trans_Laundry.findMany({
        where: { order_from: orderFrom },
        orderBy: { date_trans: 'asc' },
      });
      return NextResponse.json({ transactions });
    }

    const date = searchParams.get('date');
    let where: any = {};
    if (date) {
      // Filter by date (YYYY-MM-DD)
      where = {
        date_trans: {
          gte: new Date(date + 'T00:00:00.000Z'),
          lt: new Date(date + 'T23:59:59.999Z'),
        },
      };
    }
    // Only return unpaid transactions
    where = { ...where, payment_status: false };
    const transactions = await prisma.trans_Laundry.findMany({
      where,
      orderBy: { date_trans: 'asc' },
    });
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch transactions', details: error?.message }, { status: 500 });
  }
}
