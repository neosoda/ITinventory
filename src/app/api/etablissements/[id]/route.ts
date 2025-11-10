import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number.parseInt(params.id, 10);

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Identifiant d'établissement invalide." }, { status: 400 });
  }

  try {
    const data = await request.json();
    const nom = typeof data.nom === 'string' ? data.nom.trim() : '';

    if (!nom) {
      return NextResponse.json({ error: "Le nom de l'établissement est requis." }, { status: 400 });
    }

    const etablissement = await db.etablissement.update({
      where: { id },
      data: {
        nom,
        uai: data.uai?.trim() || null,
        adresse: data.adresse?.trim() || null,
        telephone: data.telephone?.trim() || null,
        email: data.email?.trim() || null,
        commentaire: data.commentaire?.trim() || null,
      },
    });

    return NextResponse.json(etablissement);
  } catch (error: unknown) {
    console.error("Error updating etablissement:", error);

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json({ error: "Établissement introuvable." }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Échec de la mise à jour de l'établissement" },
      { status: 500 }
    );
  }
}
