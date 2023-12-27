import Vuex from 'vuex'
import ToolModelStore from '@/modules/tool/store'

const store = new Vuex.Store({
  modules: {
    tool: ToolModelStore,
    toolCatalog: ToolModelStore,
    issueTool: ToolModelStore,
    storageCatalogTool: ToolModelStore,
  },
})

export default store
