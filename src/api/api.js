// @/api/api.js

const BASE_URL = 'http://localhost:4000';
export async function fetchTools() {
  try {
    const response = await fetch(`${BASE_URL}/tools`);
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

export async function addTool(toolName) {
  try {
    const response = await fetch(`${BASE_URL}/add-tool`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: toolName }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return null;
  }
}

export async function updateTool(id, toolData) {
  try {
    const response = await fetch(`${BASE_URL}/edit-tool/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: toolData.name,
        group_id: toolData.group_name,  // Предполагается, что group_name является числовым ID
        mat_id: toolData.mat_name,  // Предполагается, что mat_name является числовым ID
        type_id: toolData.type_name,  // Предполагается, что type_name является числовым ID
        kolvo_sklad: toolData.kolvo_sklad,
        norma: toolData.norma,
        zakaz: toolData.zakaz,
        rad: toolData.rad
      }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    return null;
  }
}


