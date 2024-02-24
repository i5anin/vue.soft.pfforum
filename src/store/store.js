import Vuex from 'vuex'
import EditorToolStore from '@/modules/editor-tool/storeNew'
import StorageToolStore from '@/modules/storage-tool/store'
import IssueToolStore from '@/modules/issue-tool/store'
import AuthStore from './authStore'

const store = new Vuex.Store({
  modules: { StorageToolStore, IssueToolStore, EditorToolStore, AuthStore },
})

export default store
