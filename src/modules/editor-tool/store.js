import { toolEditorApi } from '@/modules/editor-tool/api/editor' // Импортируем API редактора инструментов
import { toolApi } from '@/api' // Импортируем API инструментов

export default {
  namespaced: true, // Включаем пространство имен для модуля
  state: () => ({
    idParent: { id: 1, label: null }, // Состояние для хранения ID и метки родительского элемента
    isLoading: false, // Состояние для отслеживания загрузки данных
    paramsList: [], // Список параметров для фильтрации
    nameOptions: [], // Опции для выбора имени
    additionalFilters: {}, // Дополнительные фильтры
    tool: null, // Выбранный инструмент
    tools: [], // Список инструментов
    toolsTotalCount: 0, // Общее количество инструментов
    filters: {
      // Фильтры для поиска инструментов
      currentPage: 1, // Текущая страница
      itemsPerPage: 15, // Количество элементов на странице
      search: '', // Поисковый запрос
      selectedParams: [], // Выбранные параметры для фильтрации
      includeNull: false, // Включать ли элементы с нулевыми значениями
    },
  }),
  mutations: {
    // Мутации для обновления состояния
    updateIdParent(state, idParentData) {
      state.idParent = { ...idParentData } // Обновляет ID и метку родительского элемента
    },
    setParamsList(state, params) {
      state.paramsList = params // Устанавливает список параметров
    },
    setIsLoading(state, isLoading) {
      state.isLoading = isLoading // Устанавливает состояние загрузки
    },
    setCurrentPage(state, page) {
      state.filters.currentPage = page // Устанавливает текущую страницу
    },
    setFilters(state, filters) {
      state.filters = { ...filters } // Устанавливает фильтры
    },
    setTool(state, tool) {
      state.tool = tool // Устанавливает выбранный инструмент
    },
    setItemsPerPage(state, itemsPerPage) {
      state.filters.itemsPerPage = itemsPerPage // Устанавливает количество элементов на странице
    },
    setToolsTotalCount(state, toolTotalCount) {
      state.toolsTotalCount = toolTotalCount // Устанавливает общее количество инструментов
    },
    setTools(state, tools) {
      state.tools = tools // Устанавливает список инструментов
    },
    setAdditionalFilters(state, additionalFilters) {
      state.additionalFilters = additionalFilters // Устанавливает дополнительные фильтры
    },
  },
  actions: {
    // Действия для асинхронной работы с API и обновления состояния
    async fetchToolById({ commit }, id) {
      try {
        const tool = await toolApi.getToolById(id) // Получает инструмент по ID
        commit('setTool', tool) // Коммитит выбранный инструмент в состояние
      } catch (error) {
        console.error('Ошибка при загрузке инструмента:', error) // Логирует ошибку
      }
    },
    async fetchAdditionalFilters({ commit }, parentId) {
      const filterParams = await toolEditorApi.filterParamsByParentId(parentId) // Получает параметры фильтрации по ID родителя
      commit('setParamsList', filterParams) // Коммитит параметры фильтрации в состояние
    },
    // async fetchAdditionalFilters(/* { commit, state } */) {
    // const { id: parentId } = state.idParent
    // const paramsList = await toolApi.getAdditionalFilters(parentId)
    // const additionalFilters = paramsList.reduce(
    //   (acc, curr) =>
    //     curr.selectedValue
    //       ? {
    //           ...acc,
    //           [`param_${curr.key}`]: {
    //             value: null,
    //             label: curr.label,
    //             options: curr.values,
    //           },
    //         }
    //       : acc,
    //   {}
    // )
    // { param_1: { value: null, options: ['Сверло ', 'Резец', 'Пластина', 'Метчик '] } }
    // commit('setAdditionalFilters', additionalFilters)
    // },
    async fetchToolsByFilter({ commit, state }) {
      commit('setIsLoading', true) // Устанавливает состояние загрузки в true
      const { currentPage, itemsPerPage, search, includeNull, selectedParams } =
        state.filters // Деструктурирует фильтры из состояния
      const { id: parentId } = state.idParent // Получает ID родителя
      try {
        const { tools, totalCount, paramsList } = await toolApi.getTools(
          search,
          currentPage,
          itemsPerPage,
          includeNull,
          parentId,
          selectedParams,
          Object.entries(state.additionalFilters).reduce(
            (acc, [key, { value }]) => (value ? { ...acc, [key]: value } : acc),
            {}
          )
        ) // Получает инструменты по фильтрам
        commit('setParamsList', paramsList) // Коммитит список параметров
        commit('setTools', tools) // Коммитит список инструментов
        commit('setToolsTotalCount', totalCount) // Коммитит общее количество инструментов
      } catch (error) {
        console.error('getTools. Ошибка при получении данных:', error) // Логирует ошибку
      } finally {
        commit('setIsLoading', false) // Устанавливает состояние загрузки в false
      }
    },
    async onSaveToolModel({ dispatch }, toolModel) {
      try {
        // Отправляет данные на сервер для сохранения модели инструмента
        const result = await toolEditorApi.addTool({
          name: toolModel.name,
          property: Object.fromEntries(
            Object.entries(toolModel.property).filter(
              ([, value]) => value != null
            ) // Фильтрует свойства инструмента, удаляя null значения
          ),
        })
        if (result) dispatch('fetchToolsByFilter') // Перезагружает список инструментов после сохранения
      } catch (error) {
        console.error('Ошибка при сохранении инструмента:', error) // Логирует ошибку
      }
    },
  },
  getters: {
    // Геттеры для доступа к состоянию
    idParent: (state) => state.idParent, // Возвращает ID и метку родительского элемента
    filters: (state) => ({ ...state.filters }), // Возвращает копию фильтров
    tool: (state) => {
      if (state.tool) {
        return {
          ...state.tool,
          property: state.tool.property,
          parent_id: state.tool.parent_id,
          folder_name: state.tool.folder_name,
        } // Возвращает выбранный инструмент с дополнительными свойствами
      }
      return null
    },
    tools: (state) => [...state.tools], // Возвращает копию списка инструментов
    formattedTools: (state) =>
      state.tools.map((tool) => ({
        ...tool,
        ...Object.entries(tool.property).reduce(
          (acc, [key, { value }]) => ({
            ...acc,
            [key]: value,
          }),
          {}
        ),
      })), // Форматирует список инструментов для отображения
    isLoading: (state) => state.isLoading, // Возвращает состояние загрузки

    // Далее идут геттеры для различных параметров и опций, которые не были подробно расписаны в комментариях
    paramsOptions: (state) => state.paramsOptions,
    paramsList: (state) => state.paramsList,
    filterParamsList: (state) => state.filterParamsList,
    nameOptions: (state) => state.nameOptions,
    toolsTotalCount: (state) => state.toolsTotalCount,
  },
}
