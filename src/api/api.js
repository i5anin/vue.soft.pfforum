const BASE_URL = 'http://localhost:4000'

// Получить все инструменты и связанные данные
export async function fetchTools() {
  try {
    const response = await fetch(`${BASE_URL}/tools`)
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
  }
}

// Добавить новый инструмент
export async function addTool(toolData) {
  try {
    console.log("toolData")
    console.log(toolData)
    const response = await fetch(`${BASE_URL}/add-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData),
    })
    if (!response.ok) {
      const text = await response.text()
      throw new Error('Network response was not ok: ' + response.statusText + ', body: ' + text)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}


// Обновить существующий инструмент
export async function updateTool(id, toolData) {
  try {
    const response = await fetch(`${BASE_URL}/edit-tool/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData),
    })
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error)
    return null
  }
}

export async function addMaterial(name) {
  const response = await fetch('/add-material', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  })
  return response.json()
}

export async function addType(name) {
  const response = await fetch('/add-type', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  return response.json()
}

export async function addGroup(name) {
  const response = await fetch('/add-group', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  return response.json()
}
