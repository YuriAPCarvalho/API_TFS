import { NextRequest, NextResponse } from "next/server";
import { NtlmClient, NtlmCredentials } from "axios-ntlm";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario, senha } = body[0].value;

    // Remove o objeto de credenciais do body
    const taskBody = body.filter((item: any) => 
      item.path !== "/fields/System.Credentials"
    );

    if (!tfsURL || !collection || !project) {
      throw new Error('Configurações TFS não encontradas');
    }

    const credentials: NtlmCredentials = {
      username: usuario,
      password: senha,
      domain: DOMINIO,
    };
    
    const client = NtlmClient(credentials);

    console.log('Request Body:', JSON.stringify(taskBody, null, 2));
    console.log('URL:', `${tfsURL}/${collection}/${project}/_apis/wit/workitems/$task?api-version=2.0`);
    console.log(`${tfsURL}/${collection}/_apis/wit/workitems/1087414?api-version=2.0`);
    
    // const res = await client.get(
    //   `http://${tfsURL}/${collection}/_apis/wit/workitems/1087414?api-version=2.0`
    // )

    const response = await client.post(
      `${tfsURL}/${collection}/${project}/_apis/wit/workitems/$task?api-version=2.0`,
      taskBody,
      {
        headers: {
          "Content-Type": "application/json-patch+json",
        },
      }
    );

    console.log('Response:', response.status, response.data);

    if (response.status !== 200) {
      return NextResponse.json(
        { success: false, message: "Erro ao cadastrar task" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Erro ao processar requisição:", error.response?.data || error.message);
    return NextResponse.json(
      { success: false, message: error.response?.data?.message || "Erro interno do servidor" },
      { status: error.response?.status || 500 }
    );
  }
}
