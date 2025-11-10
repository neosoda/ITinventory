import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fabricantId = searchParams.get('fabricantId');
    const categorieId = searchParams.get('categorieId');

    const where: any = {};
    
    if (fabricantId) {
      where.fabricantId = parseInt(fabricantId);
    }
    
    if (categorieId) {
      where.categorieId = parseInt(categorieId);
    }

    const modeles = await db.modele.findMany({
      where,
      include: {
        fabricant: {
          select: {
            id: true,
            nom: true,
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
            icone: true,
          },
        },
        _count: {
          select: {
            equipements: true,
          },
        },
      },
      orderBy: [
        { fabricant: { nom: 'asc' } },
        { nom: 'asc' },
      ],
    });

    return NextResponse.json(modeles);
  } catch (error) {
    console.error('Error fetching modeles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modeles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const modele = await db.modele.create({
      data: {
        nom: data.nom,
        numero: data.numero,
        fabricantId: data.fabricantId,
        categorieId: data.categorieId,
        description: data.description,
        specs: data.specs,
      },
      include: {
        fabricant: {
          select: {
            id: true,
            nom: true,
          },
        },
        categorie: {
          select: {
            id: true,
            nom: true,
            icone: true,
          },
        },
      },
    });

    return NextResponse.json(modele, { status: 201 });
  } catch (error) {
    console.error('Error creating modele:', error);
    return NextResponse.json(
      { error: 'Failed to create modele' },
      { status: 500 }
    );
  }
}