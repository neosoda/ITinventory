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
            localisations: true,
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
    const nom = typeof data.nom === 'string' ? data.nom.trim() : '';

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom de l\'établissement est requis.' },
        { status: 400 }
      );
    }

    const etablissement = await db.etablissement.create({
      data: {
        nom,
        uai: data.uai?.trim() || null,
        adresse: data.adresse?.trim() || null,
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        commentaire: data.commentaire?.trim() || null,
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