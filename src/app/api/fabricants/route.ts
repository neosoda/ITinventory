import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const fabricants = await db.fabricant.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            modeles: true,
          },
        },
      },
    });

    return NextResponse.json(fabricants);
  } catch (error) {
    console.error('Error fetching fabricants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fabricants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const fabricant = await db.fabricant.create({
      data: {
        nom: data.nom,
        url: data.url,
        support: data.support,
        commentaire: data.commentaire,
      },
    });

    return NextResponse.json(fabricant, { status: 201 });
  } catch (error) {
    console.error('Error creating fabricant:', error);
    return NextResponse.json(
      { error: 'Failed to create fabricant' },
      { status: 500 }
    );
  }
}