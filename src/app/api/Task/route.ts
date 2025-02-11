import { NextRequest, NextResponse } from "next/server";
import { getAuthHeaders } from "@/app/utils/getAuthHeaders";
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    
    const customHeaders = await getAuthHeaders(true, true);
    const body = await request.json();
    console.log(body);

    const response = await axios.post(`${process.env.API_URL}/api/Task`, body, {
      headers: {
        "Content-Type": "application/json",
        ...customHeaders,
      },
    });

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