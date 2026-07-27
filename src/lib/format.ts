const formateador = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

/** 15000 -> "$ 15.000" */
export function precio(valor: number): string {
  return formateador.format(valor);
}
