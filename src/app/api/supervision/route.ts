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

    const supervisions = await db.supervision.findMany({
      where,
      include: {
        etablissement: {
          select: {
            id: true,
            nom: true,
          },
        },
      },
      orderBy: {
        etablissement: { nom: 'asc' },
      },
    });

    return NextResponse.json(supervisions);
  } catch (error) {
    console.error('Error fetching supervisions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supervisions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const supervision = await db.supervision.create({
      data: {
        etablissementId: data.etablissementId,
        switchFederateur: data.switchFederateur || 0,
        switchExtremite: data.switchExtremite || 0,
        bornesWifi: data.bornesWifi || 0,
        gtcGtb: data.gtcGtb || 0,
        serveursPhysiques: data.serveursPhysiques || 0,
        nbVm: data.nbVm || 0,
        nbPostes: data.nbPostes || 0,
        commentaire: data.commentaire,
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

    return NextResponse.json(supervision, { status: 201 });
  } catch (error) {
    console.error('Error creating supervision:', error);
    return NextResponse.json(
      { error: 'Failed to create supervision' },
      { status: 500 }
    );
  }
}