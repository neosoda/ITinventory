import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const categories = await db.categorie.findMany({
      orderBy: { nom: 'asc' },
      include: {
        _count: {
          select: {
            modeles: true,
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const categorie = await db.categorie.create({
      data: {
        nom: data.nom,
        icone: data.icone,
        description: data.description,
      },
    });

    return NextResponse.json(categorie, { status: 201 });
  } catch (error) {
    console.error('Error creating categorie:', error);
    return NextResponse.json(
      { error: 'Failed to create categorie' },
      { status: 500 }
    );
  }
}