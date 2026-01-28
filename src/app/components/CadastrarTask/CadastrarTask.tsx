"use client";
import React, { useState, useMemo, useEffect } from "react";
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
import { times } from "@/app/enums/times";
import { decryptPassword } from "@/app/utils/encryption";

export default function CadastrarTask() {
  const [form] = Form.useForm();
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<any>(null);
  const [taskExcel, setTaskExcel] = useState<any>(null);
  const [areaPathPBI, setAreaPathPBI] = useState<any>(null);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [groupMembers, setGroupMembers] = useState<any[]>([]);
  const [groupMembersOptions, setGroupMembersOptions] = useState<{ value: string; label: string }[]>([]);
  const [savedUser, setSavedUser] = useState<{ usuario: string; senha: string } | null>(null);
  const [sprints, setSprints] = useState<{ value: string; label: string }[]>([]);

  const tipoTarefa = Form.useWatch("tipoTarefa", form);

  const fetchSprints = async (usuario: string, senha: string) => {
    try {
      const response = await fetchClient(`/api/GetSprints`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });

      if (response.success && response.data?.value) {
        const sprintsData = response.data.value.map((iteration: any) => {
          const sprintName = iteration.path?.split('\\').pop() || iteration.name || 'Sprint';
          return {
            value: sprintName,
            label: sprintName,
          };
        });
        setSprints(sprintsData);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userStr = sessionStorage.getItem("tfs_user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const decryptedPassword = decryptPassword(user.senha);
          const decryptedUser = {
            usuario: user.usuario,
            senha: decryptedPassword,
          };
          setSavedUser(decryptedUser);
          fetchSprints(decryptedUser.usuario, decryptedUser.senha);
          fetchGroupMembers(decryptedUser.usuario, decryptedUser.senha);
        } catch (error) {
        }
      }
    }
  }, []);

  const handleSubmit = async (values: any) => {
    setFormValues(values);
    setLoading(true);
    
    try {
      if (savedUser) {
        await handleLoginSuccess(savedUser);
      } else {
        setIsModalOpen(true);
      }
      
      if (values.arquivo != null) {
        handleFileUpload(values.arquivo);
      }
    } catch (error) {
      message.error("Erro ao processar formulário.");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupMembers = async (usuario: string, senha: string) => {
    try {
      const response = await fetchClient(`/api/GetGroupMembers`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
          maxResults: 100,
        }),
      });
      
      if (response.success && response.data?.identities) {
        setGroupMembers(response.data.identities);
        
        const membersOptions = response.data.identities.map((identity: any) => {
          const friendlyName = identity.FriendlyDisplayName || identity.DisplayName || identity.name || 'Sem nome';
          return {
            value: friendlyName,
            label: friendlyName,
          };
        });
        
        setGroupMembersOptions(membersOptions);
      }
    } catch (error) {
    }
  };

  const fetchPullRequests = async (usuario: string, senha: string) => {
    try {
      const response = await fetchClient(`/api/GetPullRequests`, {
        method: "POST",
        body: JSON.stringify({
          usuario,
          senha,
        }),
      });
      console.log(response);
      
      if (response.success && response.data?.value) {
        let filteredPRs = response.data.value;
        
        if (selectedDates.length > 0) {
          const selectedDatesOnly = selectedDates.map((date: Date) => {
            const d = new Date(date);
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          });
          
          filteredPRs = response.data.value.filter((pr: any) => {
            if (!pr.creationDate) return false;
            
            const prDate = new Date(pr.creationDate);
            const prDateOnly = new Date(
              prDate.getFullYear(),
              prDate.getMonth(),
              prDate.getDate()
            ).getTime();
            
            return selectedDatesOnly.includes(prDateOnly);
          });

          console.log(filteredPRs);
        }
        
        setPullRequests(filteredPRs);
        message.success(`${filteredPRs.length} pull requests encontrados${selectedDates.length > 0 ? ' para as datas selecionadas' : ''}`);
        
        if (filteredPRs.length > 0 && formValues?.tipoTarefa === "analisepr" && selectedDates.length > 0) {
          await createTasksFromPullRequests(filteredPRs, usuario, senha);
        }
      } else {
        message.error("Erro ao buscar pull requests");
      }
    } catch (error) {
      message.error("Erro ao buscar pull requests");
    }
  };

  const createTasksFromPullRequests = async (prs: any[], usuario: string, senha: string) => {
    try {
      if (!formValues || !savedUser) {
        message.error("Dados do formulário não encontrados");
        return;
      }

      const promises = prs.map(async (pr: any) => {
        const prDate = new Date(pr.creationDate);
        const prDateISO = prDate.toISOString();
        
        const taskTemplateResult = taskTemplates["avaliacaopr"]({ pullRequest: pr });
        const tasks = Array.isArray(taskTemplateResult) ? taskTemplateResult : [taskTemplateResult];
        
        if (tasks.length === 0) {
          return { success: false };
        }

        const taskData = tasks[0];

        const bodyJson = JSON.stringify([
          {
            op: "add",
            path: "/fields/System.Credentials",
            value: {
              usuario,
              senha,
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
            value: prDateISO,
          },
          {
            op: "add",
            path: "/fields/Custom.SGI.DataExecucao",
            value: prDateISO,
          },
        ]);

        return fetchClient(`/api/Task`, {
          method: "POST",
          body: bodyJson,
        });
      });

      const results = await Promise.all(promises);
      const successCount = results.filter((resp) => resp?.success).length;
      
      if (successCount === prs.length) {
        message.success(`${successCount} tarefas criadas com sucesso!`);
      } else {
        message.warning(`${successCount} de ${prs.length} tarefas criadas com sucesso.`);
      }
    } catch (error) {
      message.error("Erro ao criar tarefas a partir dos pull requests");
    }
  };

  const handleLoginSuccess = async (values: any) => {
    setLoading(true);
    try {
      await fetchSprints(values.usuario, values.senha);
      
      if (formValues?.tipoTarefa === "analisepr") {
        await Promise.all([
          fetchGroupMembers(values.usuario, values.senha),
          fetchPullRequests(values.usuario, values.senha),
        ]);
      } else {
        formValues.data.map(async (d: any) => {
          const date = new Date(d);
          const formattedDate = format(date, "dd/MM");
          const fullDate = format(date, "dd/MM/yyyy");
          const previousDayDate = new Date(date);
          previousDayDate.setDate(previousDayDate.getDate() - 1);
          const previousDay = format(previousDayDate, "dd/MM");
          const dISO = date.toISOString();

          if (taskExcel != null) {
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
                  value: dISO,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.DataExecucao",
                  value: dISO,
                },
              ]);

              return fetchClient(`/api/Task`, {
                method: "POST",
                body: bodyJson,
              });
            });

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
                  value: dISO,
                },
                {
                  op: "add",
                  path: "/fields/Custom.SGI.DataExecucao",
                  value: dISO,
                },
              ]);

              console.log(bodyJson);
              
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
      }
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
          <SelectComponent name="Integrante" options={groupMembersOptions} />
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
