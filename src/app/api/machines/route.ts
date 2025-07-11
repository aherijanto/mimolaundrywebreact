import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET: Fetch all machines
export async function GET() {
  try {
    const machines = await prisma.machine.findMany();
    return NextResponse.json({ machines });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch machines', details: error }, { status: 500 });
  }
}

// POST: Create a new machine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // If request_by is not provided, try to get from headers (e.g., x-user-email)
    let {
      code_machine,
      name_machine,
      brand_machine,
      model_machine,
      year_machine,
      status_machine,
    } = body;
    
    const machine = await prisma.machine.create({
      data: {
        code_machine,
        name_machine,
        brand_machine,
        model_machine,
        year_machine,
        status_machine,
       
      }
    });
    return NextResponse.json({ machine });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create machine', details: error }, { status: 500 });
  }
}
