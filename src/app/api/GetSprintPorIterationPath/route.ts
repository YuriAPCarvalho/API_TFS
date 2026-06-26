import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, groupId, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      usuario,
      senha,
      iterationPath,
      groupId: reqGroupId,
    } = body;

    if (!tfsURL || !collection) {
      throw new Error("Configurações TFS não encontradas");
    }

    if (!iterationPath) {
      return NextResponse.json(
        {
          success: false,
          message: "IterationPath é obrigatório",
        },
        { status: 400 }
      );
    }

    const groupIdToUse = reqGroupId || groupId;

    if (!groupIdToUse) {
      return NextResponse.json(
        {
          success: false,
          message: "GroupId é obrigatório",
        },
        { status: 400 }
      );
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };

    const escapedPath = String(iterationPath).replace(/'/g, "''");
    const params = new URLSearchParams({
      $filter: `IterationPath eq '${escapedPath}'`,
      $select:
        "IterationSK, IterationName, StartDate, EndDate, IsEnded, IterationPath",
    });

    const url = `${tfsURL}/${collection}/${groupIdToUse}/_odata/v4.0-preview/Iterations?${params.toString()}`;

    const client = NtlmClient(credentials);
    const response = await client.get(url, {
      headers: {
        accept: "*/*;api-version=v4.0-preview",
        prefer: "omit-values=nulls",
      },
    });

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao buscar sprint por IterationPath" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error: any) {
    console.error(
      "Erro ao buscar sprint por IterationPath:",
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
