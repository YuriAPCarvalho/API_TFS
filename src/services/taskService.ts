import { post } from './httpClient'
import { TFS_URL, COLLECTION, PROJECT } from '../config'

interface TaskParams {
  idPbi: number
  title: string
  areaPath: string
  iterationPath: string
  assignedTo: string
  contract: string
  activityId: number
  activity: string
  complexity: string
}

export const criarTask = async ({
  idPbi,
  title,
  areaPath,
  iterationPath,
  assignedTo,
  contract,
  activityId,
  activity,
  complexity,
}: TaskParams) => {
  const url = `${TFS_URL}/${COLLECTION}/${PROJECT}/_apis/wit/workitems/$task?api-version=2.0`

  const body = JSON.stringify([
    {
      op: 'add',
      path: '/relations/-',
      value: {
        rel: 'System.LinkTypes.Hierarchy-Reverse',
        url: `${TFS_URL}/${COLLECTION}/_apis/wit/workitems/${idPbi}`,
      },
    },
    { op: 'add', path: '/fields/System.Title', value: title },
    { op: 'add', path: '/fields/System.Description', value: title },
    { op: 'add', path: '/fields/System.State', value: 'To Do' },
    { op: 'add', path: '/fields/System.AreaPath', value: areaPath },
    { op: 'add', path: '/fields/System.IterationPath', value: iterationPath },
    { op: 'add', path: '/fields/System.AssignedTo', value: assignedTo },
    { op: 'add', path: '/fields/Custom.SGI.Empresa', value: contract },
    { op: 'add', path: '/fields/Custom.SGI.LancamentoAtividadeID', value: activityId },
    { op: 'add', path: '/fields/Custom.SGI.AtividadeUST', value: activity },
    { op: 'add', path: '/fields/Custom.SGI.ComplexidadeUST', value: complexity },
  ])

  post(
    {
      url,
      body,
      headers: { 'Content-Type': 'application/json-patch+json' },
    },
    (err, res) => {
      if (err) {
        console.error('Erro ao criar task:', err)
        return
      }
      console.log('Task criada com sucesso:', res.body)
    }
  )
}
