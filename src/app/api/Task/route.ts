import { NextRequest, NextResponse } from "next/server";
import axiosNtlm from "axios-ntlm";
import axios from "axios";
import { collection, DOMINIO, project, tfsURL } from "@/app/config";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(body);
    const { usuario, senha } = body[0].value; // Extrair credenciais do primeiro item

    // Remover credenciais do body antes de enviar
    const taskBody = body.filter(
      (item: any) =>
        !item.value.hasOwnProperty("usuario") &&
        !item.value.hasOwnProperty("senha")
    );

    // Criar token Basic Auth no formato correto: domain\\username:password
    const auth = Buffer.from(`${DOMINIO}\\${usuario}:${senha}`).toString("base64");

    console.log(`${DOMINIO}\\${usuario}`);
    console.log(auth);
    
    const response = await axios.post(
      `${tfsURL}/${collection}/${project}/_apis/wit/workitems/$task?api-version=2.0`,
      taskBody,
      {
        usuario,
        senha,
        DOMINIO,
        headers: {
          "Content-Type": "application/json-patch+json",
        }
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
