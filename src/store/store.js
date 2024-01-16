import Vuex from 'vuex'
import ToolModelStore from '@/modules/tool/store'
import EditorToolStore from '@/modules/editor-tool/store'
import StorageToolStore from '@/modules/storage-tool/store'
import IssueToolStore from '@/modules/issue-tool/store'

const store = new Vuex.Store({
  modules: {
    tool: EditorToolStore,
    toolCatalog: EditorToolStore,
    issueTool: IssueToolStore,
    storageCatalogTool: StorageToolStore,
  },
})

export default store
