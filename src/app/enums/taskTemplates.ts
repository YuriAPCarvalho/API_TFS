import { monitoredServices, servicesWithoutMetrics } from "./services";

interface TaskTemplate {
  title: string;
  description: string;
  activity: string;
  complexity: string;
  activityId: string;
  areaPath?: string;
  pbi?: number;
}

export const taskTemplates: { [key: string]: (data?: any) => TaskTemplate[] } =
  {
    daily: () => [
      {
        title: "{dd/MM} - Reunião Diária",
        description:
          "Data: {dd/MM/yyyy} <br> <br>Relato das tarefas realizadas no dia anterior(dda/MMa) <br>Relatos das tarefas planejadas para o dia (dda/MMa) <br> <br>Sem Impedimentos.",
        activity: "Cerimônias/Reuniões - Reunião Diária",
        activityId: "4476",
        areaPath: "Área de Negócios",
        complexity: "Única",
      },
    ],
    monitoramento: () => [
      {
        title: "Monitoramento de Sistemas",
        description: "Acompanhamento e monitoramento dos sistemas em produção",
        activity: "Monitoramento",
        activityId: "4474",
        areaPath: "Área de Negócios",
        complexity: "2",
      },
    ],
    retro: () => [
      {
        title: "{dd/MM} - Retrospectiva Sprint {sprint}",
        description: "{dd/MM} - Retrospectiva {sprint}",
        activity: "Cerimônias/Reuniões - Reunião de Retrospectiva de Sprint",
        activityId: "4474",
        areaPath: "Área de Negócios",
        complexity: "Única",
      },
    ],
    review: () => [
      {
        title: "{dd/MM} - Review Sprint {sprint}",
        description: "{dd/MM} - Review {sprint}",
        activity: "Cerimônias/Reuniões - Reunião de Revisão de Sprint",
        activityId: "4475",
        areaPath: "Área de Negócios",
        complexity: "Única",
      },
    ],
    planning: () => [
      {
        title: "{dd/MM} - Planejamento da Sprint {sprint}",
        description: "dd/MM - Planejamento da {sprint}",
        activity: "Cerimônias/Reuniões - Reunião de Planejamento de Sprint",
        activityId: "4473",
        areaPath: "Área de Negócios",
        complexity: "Única",
      },
    ],
    "monitoramento-k8s": () => {
      const tasks: TaskTemplate[] = [];

      monitoredServices.forEach(([name, cpuLimit, memLimit, unit]: any) => {
        const memoryUnit = unit || "MB";
        const cpuUsage = (Math.random() * (cpuLimit * 0.9)).toFixed(2);
        const memUsage = (Math.random() * (memLimit * 0.99)).toFixed(2);

        tasks.push({
          title: `{dd/MM} - MONITORAMENTO K8S - ${name}`,
          description:
            `{dd/MM} - MONITORAMENTO DE SERVIÇO - ${name} <br> ` +
            `CPU(Pod): ${cpuUsage}/${cpuLimit}  <br> ` +
            `Memória(${memoryUnit}): ${memUsage}/${memLimit}  <br> ` +
            `Reinicialização 24hrs: 0  <br> ` +
            `Alertas de erro: 0 <br> ` +
            `Status: Satisfatório.`,
          activity: "Monitoramento diário por aplicações ou serviços",
          activityId: "4388",
          areaPath: "Área de Negócios",
          complexity: "Única",
        });
      });

      servicesWithoutMetrics.forEach((name) => {
        tasks.push({
          title: `{dd/MM} - MONITORAMENTO K8S - ${name}`,
          description:
            `{dd/MM} - MONITORAMENTO DE SERVIÇO - ${name} <br> ` +
            `S/ Métrica devido o não possuirmos indicadores em IIS <br> ` +
            `STATUS: Em atividade`,
          activity: "Monitoramento diário por aplicações ou serviços",
          activityId: "4388",
          areaPath: "Área de Negócios",
          complexity: "Única",
        });
      });

      return tasks;
    },
  };
