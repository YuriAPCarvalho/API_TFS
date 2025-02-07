document.addEventListener('DOMContentLoaded', function () {
  const taskTypeSelect = document.getElementById('taskType');
  const excelInput = document.getElementById('excelInput');
  const teamSelect = document.getElementById('team');
  const membersSelect = document.getElementById('members');
  const fileInput = document.getElementById('excelFile');
  const form = document.getElementById('taskForm');

  const teamMembers = {
    g08: ['Yuri Alexandre', 'Carlos Silva', 'Maria Oliveira'],
    g09: ['João Pereira', 'Ana Souza', 'Luiz Santos'],
  };

  taskTypeSelect.addEventListener('change', function () {
    if (this.value === 'personalizado') {
      excelInput.classList.remove('hidden');
    } else {
      excelInput.classList.add('hidden');
    }
  });

  teamSelect.addEventListener('change', function () {
    const team = this.value;
    membersSelect.innerHTML = '';

    teamMembers[team].forEach((member) => {
      const option = document.createElement('option');
      option.value = member;
      option.textContent = member;
      membersSelect.appendChild(option);
    });
  });

  teamSelect.dispatchEvent(new Event('change'));

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const taskType = taskTypeSelect.value;
    const team = teamSelect.value;
    const member = membersSelect.value;
    const file = fileInput.files[0];

    const additionalParams = { taskType, team, member };

    if (taskType === 'personalizado' && file) {
      try {
        const result = await createTask(file, additionalParams);
        alert(result);
      } catch (error) {
        console.error('Erro ao criar tarefas:', error);
        alert('Erro ao processar o arquivo Excel.');
      }
    } else {
      alert('Por favor, preencha todos os campos corretamente.');
    }
  });
});
