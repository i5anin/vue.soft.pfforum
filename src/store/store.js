import Vuex from 'vuex'
import ToolModelStore from '@/modules/tool/store'
import StorageToolStore from '@/modules/storage-tool/store'
import IssueToolStore from '@/modules/issue-tool/store'

const store = new Vuex.Store({
  modules: {
    tool: ToolModelStore,
    toolCatalog: ToolModelStore,
    issueTool: IssueToolStore,
    storageCatalogTool: StorageToolStore,
  },
})

export default store
