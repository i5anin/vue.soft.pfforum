// @/api/index.js
export async function fetchTools() {
  try {
    const response = await fetch('http://localhost:4000/tools');
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}
