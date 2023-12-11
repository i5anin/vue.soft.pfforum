<template>
  <v-app class="custom-container">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>
        <div class="text-h6">
          <v-text-field
            v-if="isEditing"
            v-model="editableLabel"
            @blur="finishEditing"
            @keyup.enter="finishEditing"
            dense
            solo
            hide-details
            :flat="true"
            :autofocus="true"
          />
          <!-- Показываем название и иконку, если редактирование не активно -->
          <span v-else @click="startEditing">
            {{ currentItem ? currentItem.label : 'Выберите элемент' }}
            <v-btn icon small @click.stop="startEditing">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon small @click.stop="addItem">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </span>
        </div>
      </v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container :fluid="true">
        <v-row>
          <v-col cols="12">
            <!-- Интеграция хлебных крошек -->
            <div class="breadcrumbs">
              <span v-for="(item, index) in history" :key="index">
                <span :class="getBreadcrumbClass(index)" @click="goTo(index)">
                  {{ item.label }} ({{ item.elements }})
                </span>
                <span v-if="index < history.length - 1">
                  &nbsp;&nbsp;/&nbsp;&nbsp;
                </span>
              </span>
            </div>

            <!-- Отображение списка элементов -->
            <v-list-item-group
              v-if="currentItem && currentItem.nodes"
              v-model="selectedItem"
              active-class="deep-purple--text text--accent-4"
            >
              <v-list-item
                v-for="item in currentItem.nodes"
                :key="item.id"
                @click="selectItem(item)"
                class="d-flex align-center"
              >
                <v-list-item-content class="flex">
                  <v-icon color="info" icon="mdi-folder" class="icon" />
                  <v-list-item-title>
                    {{ item.label }}
                    <span v-if="item.elements !== 0">
                      ({{ item.elements }})
                    </span>
                  </v-list-item-title>
                  <!--[{{item.totalElements}}]-->
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
  <TabMainTable />
</template>

<script>
import { ref, onMounted } from 'vue'
import { addBranch, getToolsTree } from '@/api'
import TabMainTable from '@/modules/tool/components/tabs/MainTable.vue'
import { normSpaces } from '@/modules/tool/components/normSpaces'

export default {
  name: 'TabCatalog',
  components: { TabMainTable },

  setup() {
    const history = ref([])
    const currentItem = ref(null)
    const selectedItem = ref(null)
    const isEditing = ref(false)
    const editableLabel = ref('')

    const getBreadcrumbClass = (index) => {
      return {
        'breadcrumbs-item': index < history.value.length - 1,
        'breadcrumbs-item-final': index === history.value.length - 1,
      }
    }

    const addItem = async () => {
      console.log('Добавление элемента начато')
      if (!currentItem.value || !currentItem.value.nodes) {
        console.log('Текущий элемент или его узлы не определены')
        return alert('Выберите категорию для добавления нового элемента.')
      }

      let branchName = prompt('Введите название новой ветки:')
      if (branchName) {
        branchName = normSpaces(branchName)
        try {
          const newBranch = await addBranch(branchName, currentItem.value.id)
          console.log(`Новая ветка добавлена: ${JSON.stringify(newBranch)}`)
          await refreshTree()
        } catch (error) {
          console.error('Ошибка при добавлении новой ветки:', error)
          alert('Произошла ошибка при добавлении ветки.')
        }
      }
      console.log('addItem завершен, обновляем дерево')
      await refreshTree()
    }

    const refreshTree = async () => {
      console.log('Начало обновления дерева')
      try {
        const updatedTree = await getToolsTree()
        console.log('Получено обновленное дерево:', updatedTree)

        // Обновление истории
        history.value = history.value.map((item) => {
          const updatedItem = updatedTree.find((u) => u.id === item.id)
          return updatedItem ? { ...updatedItem } : { ...item }
        })

        // Обновление currentItem
        if (currentItem.value) {
          const updatedCurrentItem = updatedTree.find(
            (item) => item.id === currentItem.value.id
          )

          if (updatedCurrentItem) {
            console.log(
              'Обновленный currentItem.nodes:',
              updatedCurrentItem.nodes
            )

            // Обновление nodes внутри currentItem
            currentItem.value.nodes = updatedCurrentItem.nodes
          }
        }
        console.log(
          'refreshTree завершен, обновленный currentItem:',
          currentItem.value
        )
      } catch (error) {
        console.error('Ошибка при обновлении дерева:', error)
      }
    }

    const selectItem = async (item) => {
      console.log('Выбор элемента:', JSON.stringify(item))
      currentItem.value = item
      if (!history.value.includes(item)) {
        history.value.push(item)
      }

      try {
        // Здесь вызовите вашу функцию для получения данных
      } catch (error) {
        console.error('Ошибка при получении данных:', error)
      }
    }

    const startEditing = () => {
      isEditing.value = true
      editableLabel.value = currentItem.value ? currentItem.value.label : ''
    }

    const finishEditing = () => {
      isEditing.value = false
      if (currentItem.value) {
        // Обновляем название текущего элемента после редактирования
        currentItem.value.label = editableLabel.value
      }
    }

    // Логика для кнопки "назад"
    const goBack = () => {
      if (history.value.length > 1) {
        history.value.pop() // Удаляем последний элемент истории
        currentItem.value = history.value[history.value.length - 1] // Обновляем currentItem на предыдущий элемент
      }
    }

    const goTo = (index) => {
      console.log('Переход к элементу с индексом:', index)
      history.value = history.value.slice(0, index + 1)
      currentItem.value = history.value[index]
    }

    onMounted(async () => {
      const toolsTree = await getToolsTree()
      if (toolsTree && toolsTree.length > 0) {
        currentItem.value = toolsTree[0]
        history.value.push(currentItem.value)
      }
    })

    return {
      history,
      currentItem,
      selectedItem,
      isEditing,
      editableLabel,
      getBreadcrumbClass,
      addItem,
      refreshTree,
      selectItem,
      startEditing,
      finishEditing,
      goBack,
      goTo,
    }
  },
}
</script>

<style>
/* Стили для хлебных крошек */
.breadcrumbs-item {
  cursor: pointer;
}

.breadcrumbs {
  margin-bottom: 8px;
}

.breadcrumbs-item-final {
  color: gray;
}

.custom-container > div {
  min-height: 0 !important;
}

.flex {
  display: flex;
}

.icon {
  margin-right: 10px;
}
</style>
