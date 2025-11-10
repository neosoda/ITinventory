import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get counts
    const [
      totalFabricants,
      totalCategories,
      totalModeles,
      totalStatuts,
      totalEtablissements,
      totalLocalisations,
      totalEquipements,
      totalSupervisions,
    ] = await Promise.all([
      db.fabricant.count(),
      db.categorie.count(),
      db.modele.count(),
      db.statut.count(),
      db.etablissement.count(),
      db.localisation.count(),
      db.equipement.count(),
      db.supervision.count(),
    ]);

    // Get equipment by category
    const equipementsByCategory = await db.equipement.groupBy({
      by: ['modeleId'],
      _count: {
        modeleId: true,
      },
    });

    // Get category details with counts
    const categoriesWithCounts = await db.categorie.findMany({
      include: {
        _count: {
          select: {
            modeles: true,
          },
        },
      },
    });

    // Get equipment by status
    const equipementsByStatut = await db.equipement.groupBy({
      by: ['statutId'],
      _count: {
        statutId: true,
      },
    });

    // Get supervision totals
    const supervisionTotals = await db.supervision.aggregate({
      _sum: {
        switchFederateur: true,
        switchExtremite: true,
        bornesWifi: true,
        gtcGtb: true,
        serveursPhysiques: true,
        nbVm: true,
        nbPostes: true,
      },
    });

    // Get recent equipment
    const recentEquipements = await db.equipement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
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
        statut: {
          select: {
            id: true,
            nom: true,
            couleur: true,
          },
        },
      },
    });

    // Get equipment value statistics
    const valueStats = await db.equipement.aggregate({
      _sum: {
        prix: true,
      },
      _avg: {
        prix: true,
      },
    });

    return NextResponse.json({
      counts: {
        fabricants: totalFabricants,
        categories: totalCategories,
        modeles: totalModeles,
        statuts: totalStatuts,
        etablissements: totalEtablissements,
        localisations: totalLocalisations,
        equipements: totalEquipements,
        supervisions: totalSupervisions,
      },
      categoriesWithCounts,
      equipementsByStatut,
      supervisionTotals,
      recentEquipements,
      valueStats,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}