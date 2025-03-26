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
import { taskTemplates } from "@/app/enums/taskTemplates";
import { tipoTarefas } from "@/app/enums/tipoTarefas";
import { integrantes } from "@/app/enums/integrantes";
import { sprints } from "@/app/enums/sprints";
import { times } from "@/app/enums/times";

export default function CadastrarTask() {
  const [form] = Form.useForm();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [taskExcel, setTaskExcel] = useState<any>(null);
  const [areaPathPBI, setAreaPathPBI] = useState<any>(null);

  const tipoTarefa = Form.useWatch("tipoTarefa", form);

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
      formValues.data.map(async (d: any) => {
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
              .replace("{dd/MM/yyyy}", fullDate)
              .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
              .replace("{dd/MM}", formattedDate)
              .replace("{pbi}", t.pbi)
              .replace("{sprint}", formValues.sprint);

            let taskData = {
              ...t,
              title: `${part}`,
            };

            taskData.description = taskData.description
              .replace("{dd/MM/yyyy}", fullDate)
              .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
              .replace("{dd/MM}", formattedDate)
              .replace("{pbi}", taskData.pbi)
              .replace("{sprint}", formValues.sprint);

            fetchClient(`/api/GetTask?pbi=${taskData.pbi}`, {
              method: "POST",
              body: JSON.stringify([
                {
                  op: "add",
                  path: "/fields/System.Credentials",
                  value: {
                    usuario: values.usuario,
                    senha: values.senha,
                  },
                },
              ]),
            }).then(resp => {
              const result = resp.data;
              const areaPath = result.fields["System.AreaPath"];
              setAreaPathPBI(areaPath)
            });

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
                  url: `https://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${taskData.pbi}`,
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
                value: `${areaPathPBI}`,
              },
              {
                op: "add",
                path: "/fields/System.IterationPath",
                value: `${project}${areaPathPBI.includes('Área de Negócios') ? '\\Área de Negócios' : ''}\\${formValues.sprint}`,
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

          const success = results.every((resp) => resp?.success);

          if (success) {
            message.success("Todas as tasks foram cadastradas com sucesso!");
          } else {
            message.error("Erro ao cadastrar algumas tasks.");
          }
        } else {
          const taskTemplateResult = taskTemplates[formValues.tipoTarefa]();
          const tasks = Array.isArray(taskTemplateResult) ? taskTemplateResult : [taskTemplateResult];

          for (const t of tasks) {
            const taskData = {
              ...t,
              title: t.title
                .replace("{dd/MM/yyyy}", fullDate)
                .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
                .replace("{dd/MM}", formattedDate)
                .replace("{pbi}", formValues.pbi)
                .replace("{sprint}", formValues.sprint),
              description: t.description
                .replace("{dd/MM/yyyy}", fullDate)
                .replace(/\{dda\/MMa\}/g, `(${previousDay})`)
                .replace("{dd/MM}", formattedDate)
                .replace("{pbi}", formValues.pbi)
                .replace("{sprint}", formValues.sprint),
            };

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
                  url: `https://tfs.sgi.ms.gov.br/tfs/Global/_apis/wit/workitems/${formValues.pbi}`,
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
                value: `${project}\\${taskData.areaPath}`,
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
            ]);

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

        {tipoTarefa != "personalizado" && (
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
        )}

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
