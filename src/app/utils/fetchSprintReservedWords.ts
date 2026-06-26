import { format } from "date-fns";
import fetchClient from "@/app/utils/routesHelper/fetchClient";
import type { ReservedWordsContext } from "@/app/utils/replaceReservedWords";

function formatSprintDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return format(date, "dd/MM/yyyy");
}

export async function fetchSprintReservedWords(
  usuario: string,
  senha: string,
  iterationPath: string,
): Promise<
  Pick<ReservedWordsContext, "sprint" | "dataInicioSprint" | "dataFimSprint">
> {
  try {
    const response = await fetchClient(`/api/GetSprintPorIterationPath`, {
      method: "POST",
      body: JSON.stringify({ usuario, senha, iterationPath }),
    });

    if (!response?.success) return {};

    const iteration = response.data?.value?.[0];
    if (!iteration) return {};

    return {
      sprint: iteration.IterationName ?? "",
      dataInicioSprint: formatSprintDate(iteration.StartDate),
      dataFimSprint: formatSprintDate(iteration.EndDate),
    };
  } catch {
    return {};
  }
}
