import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const etablissementId = searchParams.get('etablissementId');
    const categorieId = searchParams.get('categorieId');
    const fabricantId = searchParams.get('fabricantId');
    const statutId = searchParams.get('statutId');
    const search = searchParams.get('search');

    const filters: Prisma.EquipementWhereInput[] = [];

    if (etablissementId) {
      filters.push({ etablissementId: parseInt(etablissementId, 10) });
    }

    if (categorieId) {
      filters.push({ modele: { categorieId: parseInt(categorieId, 10) } });
    }

    if (fabricantId) {
      filters.push({ modele: { fabricantId: parseInt(fabricantId, 10) } });
    }

    if (statutId) {
      filters.push({ statutId: parseInt(statutId, 10) });
    }

    if (search) {
      filters.push({
        OR: [
          { nom: { contains: search, mode: 'insensitive' } },
          { assetTag: { contains: search, mode: 'insensitive' } },
          { serial: { contains: search, mode: 'insensitive' } },
          { ip: { contains: search, mode: 'insensitive' } },
          { hostname: { contains: search, mode: 'insensitive' } },
          { mac: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { commentaire: { contains: search, mode: 'insensitive' } },
          { modele: { nom: { contains: search, mode: 'insensitive' } } },
          { modele: { fabricant: { nom: { contains: search, mode: 'insensitive' } } } },
        ],
      });
    }

    const where: Prisma.EquipementWhereInput = filters.length ? { AND: filters } : {};

    const equipements = await db.equipement.findMany({
      where,
      include: {
        modele: {
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
        },
        etablissement: {
          select: {
            id: true,
            nom: true,
          },
        },
        localisation: {
          select: {
            id: true,
            nom: true,
            batiment: true,
            etage: true,
            salle: true,
          },
        },
        statut: {
          select: {
            id: true,
            nom: true,
            type: true,
            couleur: true,
          },
        },
      },
      orderBy: [
        { etablissement: { nom: 'asc' } },
        { modele: { categorie: { nom: 'asc' } } },
        { nom: 'asc' },
      ],
    });

    return NextResponse.json(equipements);
  } catch (error) {
    console.error('Error fetching equipements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const equipement = await db.equipement.create({
      data: {
        assetTag: data.assetTag,
        serial: data.serial,
        modeleId: data.modeleId,
        etablissementId: data.etablissementId,
        localisationId: data.localisationId || null,
        statutId: data.statutId,
        nom: data.nom,
        ip: data.ip,
        mac: data.mac,
        reseau: data.reseau,
        hostname: data.hostname,
        os: data.os,
        versionOs: data.versionOs,
        dateAchat: data.dateAchat ? new Date(data.dateAchat) : null,
        dateGarantie: data.dateGarantie ? new Date(data.dateGarantie) : null,
        prix: data.prix ? parseFloat(data.prix) : null,
        fournisseur: data.fournisseur,
        facture: data.facture,
        notes: data.notes,
        commentaire: data.commentaire,
      },
      include: {
        modele: {
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
        },
        etablissement: {
          select: {
            id: true,
            nom: true,
          },
        },
        localisation: {
          select: {
            id: true,
            nom: true,
            batiment: true,
            etage: true,
            salle: true,
          },
        },
        statut: {
          select: {
            id: true,
            nom: true,
            type: true,
            couleur: true,
          },
        },
      },
    });

    // Créer l'historique
    await db.historiqueEquipement.create({
      data: {
        equipementId: equipement.id,
        typeAction: 'CREATE',
        nouvelleValeur: JSON.stringify(equipement),
        utilisateur: 'System',
        commentaire: 'Équipement créé',
      },
    });

    return NextResponse.json(equipement, { status: 201 });
  } catch (error) {
    console.error('Error creating equipement:', error);
    return NextResponse.json(
      { error: 'Failed to create equipement' },
      { status: 500 }
    );
  }
}