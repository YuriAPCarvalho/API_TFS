import { GetServerSidePropsContext, PreviewData } from "next";
import { ParsedUrlQuery } from "querystring";
import { getAuthHeaders } from "../getAuthHeaders";
import { toast } from "react-toastify";

function getErrorMessage(body: any, fallback: string) {
  if (typeof body?.message === "string" && body.message.trim()) {
    return body.message;
  }
  if (Array.isArray(body?.error) && body.error.length > 0) {
    return body.error[0];
  }
  if (typeof body?.error === "string" && body.error.trim()) {
    return body.error;
  }
  return fallback;
}

export default async function fetchClient(
  input: RequestInfo | URL,
  init?: RequestInit,
  rotaProtegida = true,
  serverSide: boolean = false,
  contextServerSide?: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    const headers = {
      ...init?.headers,
      ...(await getAuthHeaders(serverSide, rotaProtegida, contextServerSide)),
      "Cache-Control": "no-cache",
    };
    const customInit: RequestInit = { ...init, headers };

    const res = await fetch(input, customInit);

    if (res.ok) {
      resolve(await res.json());
      return;
    }

    let body: any = null;
    try {
      body = await res.json();
    } catch {
      body = { success: false, message: "Erro inesperado na requisição." };
    }

    if (res.status === 401 || res.status === 403) {
      toast.error(getErrorMessage(body, "Falha na Autenticação"), {
        autoClose: 8000,
      });

      if (typeof window !== "undefined") {
        const { clearClientAuth } = await import("@/app/utils/authCookie");
        clearClientAuth();
        window.location.href = "/?auth=expired";
      }

      reject(body);
      return;
    }

    if (res.status === 400) {
      toast.error(getErrorMessage(body, "Erro inesperado"), {
        autoClose: 8000,
      });
      reject(body);
      return;
    }

    reject({
      ...body,
      success: false,
      message: getErrorMessage(body, "Erro interno do servidor"),
      status: res.status,
    });
  });
}
