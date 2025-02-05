document.addEventListener('DOMContentLoaded', function () {
  const taskTypeSelect = document.getElementById('taskType')
  const csvInput = document.getElementById('csvInput')
  const teamSelect = document.getElementById('team')
  const membersSelect = document.getElementById('members')

  const teamMembers = {
    g08: ['Yuri Alexandre', 'Carlos Silva', 'Maria Oliveira'],
    g09: ['João Pereira', 'Ana Souza', 'Luiz Santos'],
  }

  taskTypeSelect.addEventListener('change', function () {
    if (this.value === 'personalizado') {
      csvInput.classList.remove('hidden')
    } else {
      csvInput.classList.add('hidden')
    }
  })

  teamSelect.addEventListener('change', function () {
    const team = this.value
    membersSelect.innerHTML = ''

    teamMembers[team].forEach((member) => {
      const option = document.createElement('option')
      option.value = member
      option.textContent = member
      membersSelect.appendChild(option)
    })
  })

  teamSelect.dispatchEvent(new Event('change'))
})
