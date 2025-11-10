import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const statuts = await db.statut.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            equipements: true,
          },
        },
      },
    });

    return NextResponse.json(statuts);
  } catch (error) {
    console.error('Error fetching statuts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statuts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const statut = await db.statut.create({
      data: {
        nom: data.nom,
        type: data.type,
        couleur: data.couleur,
        description: data.description,
      },
    });

    return NextResponse.json(statut, { status: 201 });
  } catch (error) {
    console.error('Error creating statut:', error);
    return NextResponse.json(
      { error: 'Failed to create statut' },
      { status: 500 }
    );
  }
}