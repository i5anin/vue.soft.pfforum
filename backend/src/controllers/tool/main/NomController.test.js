const axios = require('axios');
const baseUrl = 'http://192.168.0.200:4001/api/tools'; // Предполагаем, что endpoint - /records

describe("Тесты API для записей", () => {
  let createdRecordId;

  it("Создание новой записи", async () => {
    const newRecordData = { name: "Тестовая запись", description: "Описание" };
    const response = await axios.post(baseUrl, newRecordData);

    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name', newRecordData.name);

    createdRecordId = response.data.id;
  });

  it("Получение созданной записи", async () => {
    // Дополнительный тест: проверяем, что запись действительно создана
    const response = await axios.get(`${baseUrl}/${createdRecordId}`);
    expect(response.status).toBe(200);
    expect(response.data.id).toBe(createdRecordId);
  });

  it("Изменение существующей записи", async () => {
    const updatedRecordData = { name: "Обновленная запись" };
    const response = await axios.put(`${baseUrl}/${createdRecordId}`, updatedRecordData);

    expect(response.status).toBe(200); // Или 204 (No Content),
    expect(response.data.id).toBe(createdRecordId); // Если возвращается обновленный объект
    expect(response.data.name).toBe(updatedRecordData.name);
  });

  it("Удаление записи", async () => {
    const response = await axios.delete(`${baseUrl}/${createdRecordId}`);
    expect(response.status).toBe(204); // Или 200, если API возвращает данные
  });

  it("Проверка удаления: получение несуществующей записи", async () => {
    // Дополнительный тест: проверяем, что запись действительно удалена
    try {
      await axios.get(`${baseUrl}/${createdRecordId}`);
    } catch (error) {
      expect(error.response.status).toBe(404); // Ожидаем 404 Not Found
    }
  });
});
