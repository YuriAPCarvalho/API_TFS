import { createTask } from './src/services/taskService.js'
import express from 'express'
import cors from 'cors'

const app = express();
app.use(cors());
app.use(express.json());
app.listen(3000,()=>{console.log('passou')})
app.post('/createTask')

// createTask({
//   idPbi: 1082041,
//   title: 'Teste',
//   areaPath: 'CSIS-G08\\Área de Negócios',
//   iterationPath: 'CSIS-G08\\Área de Negócios\\Sprint 216',
//   assignedTo: 'Yuri Alexandre Pires de Carvalho',
//   contract: '056/2021 - 16811 - SEFAZ - MIL TEC',
//   activityId: 4388,
//   activity: 'Monitoramento diário por aplicações ou serviços',
//   complexity: 'Única',
// })
