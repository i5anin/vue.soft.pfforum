const axios = require('axios');
const baseUrl = 'http://localhost:4001/api/tools';

describe("Тесты API для инструментов", () => {
  let createdRecordId;

  it("Создание нового инструмента", async () => {
    const newRecordData = { name: "Тестовый инструмент", description: "Описание" };
    const response = await axios.post(baseUrl, newRecordData);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name', newRecordData.name);

    createdRecordId = response.data.id;
  });

  it("Получение созданного инструмента", async () => {
    const response = await axios.get(`${baseUrl}/${createdRecordId}`);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(createdRecordId);
  });

  it("Изменение существующего инструмента", async () => {
    const updatedRecordData = { name: "Обновленный инструмент" };
    const response = await axios.put(`${baseUrl}/${createdRecordId}`, updatedRecordData);

    expect(response.status).toBe(200);
    expect(response.data.id).toBe(createdRecordId);
    expect(response.data.name).toBe(updatedRecordData.name);
  });

  it("Удаление инструмента", async () => {
    const response = await axios.delete(`${baseUrl}/${createdRecordId}`);
    expect(response.status).toBe(204);
  });

  it("Проверка удаления: получение несуществующего инструмента", async () => {
    try {
      await axios.get(`${baseUrl}/${createdRecordId}`);
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });
});
