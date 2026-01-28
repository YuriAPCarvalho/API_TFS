import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, senha } = body;

    if (!tfsURL || !collection || !project) {
      throw new Error("Configurações TFS não encontradas");
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };

    // URL para buscar iterações (sprints) do time
    const teamName = encodeURIComponent(`${project} Team`);
    const url = `${tfsURL}/${collection}/${project}/${teamName}/_apis/work/teamsettings/iterations?api-version=7.0`;

    const client = NtlmClient(credentials);
    const response = await client.get(url);

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao buscar sprints" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error(
      "Erro ao buscar sprints:",
      error.response?.data || error.message
    );

    if (error.response?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Falha na autenticação. Verifique suas credenciais.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error.response?.data?.message || "Erro interno do servidor",
      },
      { status: error.response?.status || 500 }
    );
  }
}
