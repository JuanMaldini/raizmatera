import { listarRecords, SLUG_AJUSTES } from "@/lib/pb-admin";
import { AjustesForm } from "./AjustesForm";

export const dynamic = "force-dynamic";

const PLANTILLA_POR_DEFECTO =
  "¡Hola Raíz Matera! Me interesa el {producto} ({precio}). ¿Está disponible?";

export default async function AjustesPage() {
  const records = await listarRecords();
  const ajustes = records.find((r) => r.slug === SLUG_AJUSTES);

  return (
    <>
      <h1 className="mb-6 text-xl">Ajustes</h1>
      <AjustesForm
        whatsapp={ajustes?.title ?? ""}
        plantilla={ajustes?.description || PLANTILLA_POR_DEFECTO}
      />
    </>
  );
}
