import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const etablissements = await db.etablissement.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            equipements: true,
            supervisions: true,
          },
        },
      },
    });

    return NextResponse.json(etablissements);
  } catch (error) {
    console.error('Error fetching etablissements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch etablissements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const etablissement = await db.etablissement.create({
      data: {
        nom: data.nom,
        uai: data.uai,
        commentaire: data.commentaire,
      },
    });

    return NextResponse.json(etablissement, { status: 201 });
  } catch (error) {
    console.error('Error creating etablissement:', error);
    return NextResponse.json(
      { error: 'Failed to create etablissement' },
      { status: 500 }
    );
  }
}