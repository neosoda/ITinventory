import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const etablissementId = searchParams.get('etablissementId');

    const where: any = {};
    
    if (etablissementId) {
      where.etablissementId = parseInt(etablissementId);
    }

    const localisations = await db.localisation.findMany({
      where,
      include: {
        etablissement: {
          select: {
            id: true,
            nom: true,
          },
        },
        _count: {
          select: {
            equipements: true,
          },
        },
      },
      orderBy: [
        { etablissement: { nom: 'asc' } },
        { nom: 'asc' },
      ],
    });

    return NextResponse.json(localisations);
  } catch (error) {
    console.error('Error fetching localisations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch localisations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const localisation = await db.localisation.create({
      data: {
        nom: data.nom,
        batiment: data.batiment,
        etage: data.etage,
        salle: data.salle,
        commentaire: data.commentaire,
        etablissementId: data.etablissementId,
      },
      include: {
        etablissement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
    });

    return NextResponse.json(localisation, { status: 201 });
  } catch (error) {
    console.error('Error creating localisation:', error);
    return NextResponse.json(
      { error: 'Failed to create localisation' },
      { status: 500 }
    );
  }
}