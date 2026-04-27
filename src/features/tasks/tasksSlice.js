import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  tasks: {},
  loading: false,
  error: null,
}

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    setTasks: (state, action) => {
      const { boardId, tasks } = action.payload
      state.tasks[boardId] = tasks
      state.loading = false
    },
    addTask: (state, action) => {
      const { boardId, task } = action.payload
      if (!state.tasks[boardId]) state.tasks[boardId] = []
      state.tasks[boardId].push(task)
    },
    deleteTask: (state, action) => {
      const { boardId, taskId } = action.payload
      state.tasks[boardId] = state.tasks[boardId].filter(
        (task) => task.id !== taskId
      )
    },
    updateTask: (state, action) => {
      const { boardId, task } = action.payload
      const index = state.tasks[boardId].findIndex(
        (t) => t.id === task.id
      )
      if (index !== -1) state.tasks[boardId][index] = task
    },
    moveTask: (state, action) => {
      const { boardId, taskId, newStatus } = action.payload
      const index = state.tasks[boardId].findIndex(
        (t) => t.id === taskId
      )
      if (index !== -1) state.tasks[boardId][index].status = newStatus
    },
    setTasksLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const {
  setTasks, addTask, deleteTask,
  updateTask, moveTask, setTasksLoading
} = tasksSlice.actions
export default tasksSlice.reducer