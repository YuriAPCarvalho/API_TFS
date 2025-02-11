"use client";
import React, { useState } from "react";
import { Form, Button, message } from "antd";
import Style from "./style.module.scss";
import SelectComponent from "../Select/Select";
import InputComponent from "../Input/Input";
import DateSelectorComponent from "../DateSelector/DateSelector";
import InputFileComponent from "../InputFile/InputFile";
import ModalLoginGSI from "../ModalLoginGSI/ModalLoginGSI";
import fetchClient from "@/app/utils/routesHelper/fetchClient";
import { server } from "@/app/config";

export default function CadastrarTask() {
  const [form] = Form.useForm();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]); // Estado para armazenar as datas selecionadas
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);

  // Observa mudanças no campo tipoTarefa
  const tipoTarefa = Form.useWatch("tipoTarefa", form);

  const tipoTarefas = [
    { value: "daily", label: "Daily" },
    { value: "monitoramento", label: "Monitoramento" },
    { value: "retroReview", label: "Retro/Review" },
    { value: "planning", label: "Planejamento" },
    { value: "personalizado", label: "Personalizado" },
  ];

  const times = [{ value: "g08", label: "G08" }];
  const integrantes = [{ value: "Fillipe Kenzo", label: "Fillipe Kenzo" }];

  const handleSubmit = async (values: any) => {
    console.log(values);
    setFormValues(values);
    setIsModalOpen(true);
  };

  const handleLoginSuccess = (values: any) => {
    setLoading(true);
    try {
      fetchClient(`/api/Task`, {
        method: "POST",
        body: JSON.stringify({
          tipoTarefa: formValues.tipoTarefa,
          time: formValues.time,
          integrante: formValues.integrante,
          datas: selectedDates,
          arquivo: formValues.arquivo,
          usuario: values.usuario,
          senha: values.senha,
        }),
      })
      .then((resp) => {
        if (resp.success) {
          message.success("Task cadastrada com sucesso!");
          form.resetFields();
          setSelectedDates([]);
        } else {
          message.error("Erro ao cadastrar a task.");
        }
      })
      .catch(() => {
        message.error("Erro ao cadastrar a task.");
      })
      .finally(() => {
        setLoading(false);
      });
    } catch (error) {
      console.error("Erro ao enviar:", error);
      message.error("Erro ao cadastrar.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
    // Aqui você pode adicionar a lógica para lidar com os valores do login
  };

  return (
    <div className={Style.container}>
      <div className={Style.titleDiv}>
        <h1 className={Style.title}>Cadastrar Task</h1>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="grid grid-cols-3 gap-4"
      >
        <Form.Item
          name="tipoTarefa"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Tipo de Tarefa" options={tipoTarefas} />
        </Form.Item>

        {tipoTarefa === "personalizado" && (
          <Form.Item
            name="arquivo"
            rules={[
              {
                required: true,
                message: "Arquivo é obrigatório para tarefas personalizadas",
              },
            ]}
          >
            <InputFileComponent
              name="Arquivo"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
          </Form.Item>
        )}

        <Form.Item
          name="time"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Time" options={times} />
        </Form.Item>

        <Form.Item
          name="integrante"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Integrante" options={integrantes} />
        </Form.Item>

        <Form.Item
          name="data"
          rules={[
            {
              required: true,
              validator: (_, value) =>
                selectedDates.length > 0
                  ? Promise.resolve()
                  : Promise.reject("Selecione pelo menos uma data."),
            },
          ]}
        >
          <DateSelectorComponent name="Data" onChange={setSelectedDates} />
        </Form.Item>

        <Form.Item className="col-span-3 flex justify-center">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-[200px]"
          >
            Criar Tarefa
          </Button>
        </Form.Item>
      </Form>

      <ModalLoginGSI
        visible={isModalOpen}
        setVisibleFalse={() => setIsModalOpen(false)}
        onFinish={handleLoginSuccess}
      />
    </div>
  );
}
