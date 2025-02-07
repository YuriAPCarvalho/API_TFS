import { post } from './httpClient.js';
import { TFS_URL, COLLECTION, PROJECT } from '../config.js';
import * as XLSX from 'xlsx';

export const createTask = async (file, additionalParams) => {
  console.log('passou2');
  // return new Promise((resolve, reject) => {
  //   const reader = new FileReader();

  //   reader.onload = async (e) => {
  //     try {
  //       const data = new Uint8Array(e.target.result);
  //       const workbook = XLSX.read(data, { type: 'array' });
  //       const sheetName = workbook.SheetNames[0];
  //       const worksheet = workbook.Sheets[sheetName];
  //       const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
  //       // Assumindo que a primeira linha do JSON contém os nomes das colunas
  //       const headers = jsonData[0];
  //       const tasks = jsonData.slice(1).map(row => {
  //         let task = { ...additionalParams };
  //         headers.forEach((header, index) => {
  //           task[header] = row[index];
  //         });
  //         return task;
  //       });

  //       for (const task of tasks) {
  //         await createWorkItem(task);
  //       }

  //       resolve('Tarefas criadas com sucesso!');
  //     } catch (error) {
  //       reject(error);
  //     }
  //   };

  //   reader.onerror = (error) => reject(error);
  //   reader.readAsArrayBuffer(file);
  // });
};

const createWorkItem = async (task) => {
  const url = `${TFS_URL}/${COLLECTION}/${PROJECT}/_apis/wit/workitems/$task?api-version=2.0`;

  const body = JSON.stringify([
    { op: 'add', path: '/relations/-', value: { rel: 'System.LinkTypes.Hierarchy-Reverse', url: `${TFS_URL}/${COLLECTION}/_apis/wit/workitems/${task.idPbi}` } },
    { op: 'add', path: '/fields/System.Title', value: task.title },
    { op: 'add', path: '/fields/System.Description', value: task.title },
    { op: 'add', path: '/fields/System.State', value: 'To Do' },
    { op: 'add', path: '/fields/System.AreaPath', value: task.areaPath },
    { op: 'add', path: '/fields/System.IterationPath', value: task.iterationPath },
    { op: 'add', path: '/fields/System.AssignedTo', value: task.assignedTo },
    { op: 'add', path: '/fields/Custom.SGI.Empresa', value: task.contract },
    { op: 'add', path: '/fields/Custom.SGI.LancamentoAtividadeID', value: task.activityId },
    { op: 'add', path: '/fields/Custom.SGI.AtividadeUST', value: task.activity },
    { op: 'add', path: '/fields/Custom.SGI.ComplexidadeUST', value: task.complexity },
  ]);

  try {
    await post({ url, body, headers: { 'Content-Type': 'application/json-patch+json' } });
    console.log(`Task criada com sucesso: ${task.title}`);
  } catch (err) {
    console.error(`Erro ao criar task ${task.title}:`, err);
  }
};
