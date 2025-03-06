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
import { collection, contrato, project, server, tfsURL } from "@/app/config";
import { processExcelFile } from "@/app/utils/processExcelFile";
import { format } from "date-fns";

interface TaskTemplate {
  title: string;
  description: string;
  activity: string;
  complexity: string;
  activityId: string;
}

const taskTemplates: { [key: string]: (data?: any) => TaskTemplate } = {
  daily: () => ({
    title: "dd/MM - Reunião Diária",
    description:
      "Data: dd/MM/yyyy\n\nRelato das tarefas realizadas no dia anterior(dda/MMa)\nRelatos das tarefas planejadas para o dia (dda/MMa)\n\nSem Impedimentos.",
    activity: "Cerimônias/Reuniões - Reunião Diária",
    activityId: "4476",
    complexity: "Única",
  }),
  monitoramento: () => ({
    title: "Monitoramento de Sistemas",
    description: "Acompanhamento e monitoramento dos sistemas em produção",
    activity: "Monitoramento",
    activityId: "4474",
    complexity: "2",
  }),
  retro: () => ({
    title: "dd/MM - Retrospectiva Sprint {sprint}",
    description: "dd/MM - Retrospectiva {sprint}",
    activity: "Cerimônias/Reuniões - Reunião de Retrospectiva de Sprint",
    activityId: "4474",
    complexity: "Única",
  }),
  review: () => ({
    title: "dd/MM - Review Sprint {sprint}",
    description: "dd/MM - Review {sprint}",
    activity: "Cerimônias/Reuniões - Reunião de Revisão de Sprint",
    activityId: "4475",
    complexity: "Única",
  }),
  planning: () => ({
    title: "dd/MM - Planejamento da Sprint {sprint}",
    description: "dd/MM - Planejamento da {sprint}",
    activity: "Cerimônias/Reuniões - Reunião de Planejamento de Sprint",
    activityId: "4473",
    complexity: "Única",
  }),
};

export default function CadastrarTask() {
  const [form] = Form.useForm();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]); // Estado para armazenar as datas selecionadas
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [taskExcel, setTaskExcel] = useState<any>(null);

  // Observa mudanças no campo tipoTarefa
  const tipoTarefa = Form.useWatch("tipoTarefa", form);

  const tipoTarefas = [
    { value: "daily", label: "Daily" },
    { value: "retro", label: "Retro" },
    { value: "review", label: "Review" },
    { value: "planning", label: "Planejamento" },
    { value: "personalizado", label: "Personalizado" },
  ];

  const times = [{ value: "g08", label: "G08" }];
  const sprints = [
    { value: "Sprint 216", label: "Sprint 216" },
    { value: "Sprint 217", label: "Sprint 217" },
    { value: "Sprint 218", label: "Sprint 218" },
    { value: "Sprint 219", label: "Sprint 219" },
  ];
  const integrantes = [
    { value: "Alan Arguelho da Silva", label: "Alan Arguelho da Silva" },
    { value: "Bruno Xavier Rodrigues", label: "Bruno Xavier Rodrigues" },
    { value: "Eduardo Silva Arcanjo", label: "Eduardo Silva Arcanjo" },
    {
      value: "Fabricio Almeida de Oliveira",
      label: "Fabricio Almeida de Oliveira",
    },
    {
      value: "Fillipe Kenzo Yamasaki Sawamura",
      label: "Fillipe Kenzo Yamasaki Sawamura",
    },
    {
      value: "Gabriel Medeiros Gomes da Silva",
      label: "Gabriel Medeiros Gomes da Silva",
    },
    {
      value: "Higor Henrique Campos de Assis",
      label: "Higor Henrique Campos de Assis",
    },
    { value: "Marcel Ferreira Yassumoto", label: "Marcel Ferreira Yassumotoy" },
    {
      value: "Yuri Alexandre Pires de Carvalho",
      label: "Yuri Alexandre Pires de Carvalho",
    },
  ];

  const handleSubmit = async (values: any) => {
    setFormValues(values);
    setIsModalOpen(true);
    if (values.arquivo != null) {
      handleFileUpload(values.arquivo);
    }
  };

  const handleLoginSuccess = async (values: any) => {
    setLoading(true);
    try {
      console.log(formValues.data);
      // Processa cada data selecionada
      formValues.data.map(async (d: any) => {
        console.log(d);

        const date = new Date(d);
        const formattedDate = format(date, "dd/MM");
        const fullDate = format(date, "dd/MM/yyyy");
        const previousDay = format(
          new Date(date.setDate(date.getDate() - 1)),
          "dd/MM"
        );

        if (taskExcel != null) {
          // Processa tasks do Excel
          const promises = taskExcel.map((t: any) => {
            const part = t.title
              .replace("dd/MM/yyyy", fullDate)
              .replace(/\(dda\/MMa\)/g, `(${previousDay})`)
              .replace("dd/MM", formattedDate)
              .replace("{sprint}", formValues.sprint);
            let taskData = {
              ...t,
              title: `${part}`,
            };

            taskData.description = taskData.description
              .replace("dd/MM/yyyy", fullDate)
              .replace(/\(dda\/MMa\)/g, `(${previousDay})`)
              .replace("dd/MM", formattedDate)
              .replace("{sprint}", formValues.sprint);

            const bodyJson = JSON.stringify([
              {
                op: "add",
                path: "/fields/System.Credentials",
                value: {
                  usuario: values.usuario,
                  senha: values.senha,
                },
              },
              {
                op: "add",
                path: "/relations/-",
                value: {
                  rel: "System.LinkTypes.Hierarchy-Reverse",
                  url: `http://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${formValues.pbi}`,
                },
              },
              {
                op: "add",
                path: "/fields/System.Title",
                value: taskData.title,
              },
              {
                op: "add",
                path: "/fields/System.Description",
                value: taskData.description,
              },
              {
                op: "add",
                path: "/fields/System.State",
                value: "To Do",
              },
              {
                op: "add",
                path: "/fields/System.AreaPath",
                value: `${project}\\Área de Negócios`,
              },
              {
                op: "add",
                path: "/fields/System.IterationPath",
                value: `${project}\\Área de Negócios\\${formValues.sprint}`,
              },
              {
                op: "add",
                path: "/fields/System.AssignedTo",
                value: formValues.integrante,
              },
              {
                op: "add",
                path: "/fields/Custom.SGI.Empresa",
                value: contrato,
              },
              {
                op: "add",
                path: "/fields/Custom.SGI.LancamentoAtividadeID",
                value: taskData.activityId,
              },
              {
                op: "add",
                path: "/fields/Custom.SGI.AtividadeUST",
                value: taskData.activity,
              },
              {
                op: "add",
                path: "/fields/Custom.SGI.ComplexidadeUST",
                value: taskData.complexity,
              },
              {
                op: "add",
                path: "/fields/System.CreatedDate",
                value: d,
              },
              {
                op: "add",
                path: "/fields/Custom.SGI.DataExecucao",
                value: d,
              },
              // {
              //   op: "add",
              //   path: "/fields/Microsoft.VSTS.Common.ClosedDate",
              //   value: d,
              // },
            ]);
            return fetchClient(`/api/Task`, {
              method: "POST",
              body: bodyJson,
            });
          });

          // Aguarda todas as requisições do Excel
          const results = await Promise.all(promises);

          const success = results.every((resp) => resp.success);

          if (success) {
            message.success("Todas as tasks foram cadastradas com sucesso!");
          } else {
            message.error("Erro ao cadastrar algumas tasks.");
          }
        } else {
          // Processa task normal
          let taskData = {
            ...taskTemplates[formValues.tipoTarefa](),
            title: `${taskTemplates[formValues.tipoTarefa]()
              .title.replace("dd/MM/yyyy", fullDate)
              .replace(/\(dda\/MMa\)/g, `(${previousDay})`)
              .replace("dd/MM", formattedDate)
              .replace("{sprint}", formValues.sprint)}`,
          };

          taskData.description = taskData.description
            .replace("dd/MM/yyyy", fullDate)
            .replace(/\(dda\/MMa\)/g, `(${previousDay})`)
            .replace("dd/MM", formattedDate)
            .replace("{sprint}", formValues.sprint);

          const bodyJson = JSON.stringify([
            {
              op: "add",
              path: "/fields/System.Credentials",
              value: {
                usuario: values.usuario,
                senha: values.senha,
              },
            },
            {
              op: "add",
              path: "/relations/-",
              value: {
                rel: "System.LinkTypes.Hierarchy-Reverse",
                url: `http://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${formValues.pbi}`,
              },
            },
            {
              op: "add",
              path: "/fields/System.Title",
              value: taskData.title,
            },
            {
              op: "add",
              path: "/fields/System.Description",
              value: taskData.description,
            },
            {
              op: "add",
              path: "/fields/System.State",
              value: "To Do",
            },
            {
              op: "add",
              path: "/fields/System.AreaPath",
              value: `${project}\\Área de Negócios`,
            },
            {
              op: "add",
              path: "/fields/System.IterationPath",
              value: `${project}\\Área de Negócios\\${formValues.sprint}`,
            },
            {
              op: "add",
              path: "/fields/System.AssignedTo",
              value: formValues.integrante,
            },
            {
              op: "add",
              path: "/fields/Custom.SGI.Empresa",
              value: contrato,
            },
            {
              op: "add",
              path: "/fields/Custom.SGI.LancamentoAtividadeID",
              value: taskData.activityId,
            },
            {
              op: "add",
              path: "/fields/Custom.SGI.AtividadeUST",
              value: taskData.activity,
            },
            {
              op: "add",
              path: "/fields/Custom.SGI.ComplexidadeUST",
              value: taskData.complexity,
            },
            {
              op: "add",
              path: "/fields/System.CreatedDate",
              value: d,
            },
            {
              op: "add",
              path: "/fields/Custom.SGI.DataExecucao",
              value: d,
            },
            // {
            //   op: "add",
            //   path: "/fields/Microsoft.VSTS.Common.ClosedDate",
            //   value: d,
            // },
          ]);

          // Envia task normal
          const response = await fetchClient(`/api/Task`, {
            method: "POST",
            body: bodyJson,
          });

          if (response.success) {
            message.success("Task cadastrada com sucesso!");
          } else {
            message.error("Erro ao cadastrar a task.");
          }
        }
      });
    } catch (error) {
      message.error("Erro ao cadastrar.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    const additionalParams = {};
    try {
      const message = await processExcelFile(file, additionalParams);
      setTaskExcel(message);
    } catch (error) {
      console.error("Erro ao processar o arquivo Excel:", error);
    }
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

        <Form.Item
          name="sprint"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <SelectComponent name="Sprint" options={sprints} />
        </Form.Item>

        <Form.Item
          name="pbi"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <InputComponent
            name="PBI"
            type="number"
            nameForm={"pbi"}
            form={form}
            placeholder="Informe a PBI"
          />
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
            className="w-[200px] bg-verde hover:!bg-verde-500"
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
