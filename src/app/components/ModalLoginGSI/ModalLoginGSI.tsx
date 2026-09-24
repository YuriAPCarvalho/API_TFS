import { Button, Col, Form, Row } from "antd";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import Style from "./style.module.scss";
import InputComponent from "../Input/Input";

interface ModalLoginGSIProps {
  visible: any;
  setVisibleFalse: Function;
  showMessage?: boolean;
  onFinish: Function;
}

export default function ModalLoginGSI(props: ModalLoginGSIProps) {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {}, [props.visible]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/GetSprints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuario: values.usuario,
          senha: values.senha,
        }),
      });

      if (response.status === 401) {
        const body = await response.json().catch(() => null);
        toast.error(
          body?.message ||
            "Falha na autenticação. Verifique suas credenciais.",
        );
        return;
      }

      props.onFinish(values);
    } catch {
      toast.error("Não foi possível validar o login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {props?.visible && (
        <div className={Style.modal}>
          <div className={Style.modalContent}>
            <div className={Style.warningContainer}>
              <b className={Style.warningText}>Fazer Login</b>
            </div>
            <Form
              form={form}
              className={Style.form}
              name="basic"
              wrapperCol={{ span: 24 }}
              labelCol={{ span: 24 }}
              autoComplete="off"
              onFinish={onFinish}
              onFinishFailed={() => {
                toast.error(
                  "Por favor, preencha todos os campos obrigatórios.",
                );
              }}
            >
              <div className={Style.CaixaTexto}>
                <div className={Style.content}>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={24}>
                      <Form.Item
                        className={Style.ItemCaixaTexto}
                        name="usuario"
                        rules={[
                          {
                            required: true,
                            message: "Insira o Nome de Usuário",
                          },
                        ]}
                      >
                        <InputComponent
                          name="Nome de Usuário"
                          placeholder="Insira o Nome de Usuário"
                          form={form}
                          nameForm={"usuario"}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
                    <Col className="gutter-row" span={24}>
                      <Form.Item
                        className={Style.ItemCaixaTexto}
                        name="senha"
                        rules={[
                          { required: true, message: "Insira sua Senha" },
                        ]}
                      >
                        <InputComponent
                          name="Senha"
                          placeholder="Insira sua Senha"
                          type="password"
                          form={form}
                          nameForm={"senha"}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
              <div className={Style.buttonContainer}>
                <Button
                  className={"buttonPrimaryOutline"}
                  onClick={() => props.setVisibleFalse(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  className={"buttonPrimary"}
                  htmlType="submit"
                  loading={loading}
                >
                  Logar
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </>
  );
}
