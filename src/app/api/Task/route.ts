import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, senha } = body[0].value;

    if (!tfsURL || !collection || !project) {
      throw new Error('Configurações TFS não encontradas');
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };
    
    const client = NtlmClient(credentials);

    console.log(credentials);
    console.log(client);
    console.log(body);
    console.log(`${tfsURL}/${collection}/${project}/_apis/wit/workitems/$task?api-version=2.0`);
    
    const response = await client.post(
      `${tfsURL}/${collection}/${project}/_apis/wit/workitems/$task?api-version=2.0`,
      body,
      {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      }
    );
    console.log(response);

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao cadastrar task" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { success: false, message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
