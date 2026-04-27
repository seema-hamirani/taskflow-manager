import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  boards: [],
  loading: false,
  error: null,
}

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    setBoards: (state, action) => {
      state.boards = action.payload
      state.loading = false
    },
    addBoard: (state, action) => {
      state.boards.push(action.payload)
    },
    deleteBoard: (state, action) => {
      state.boards = state.boards.filter(
        (board) => board.id !== action.payload
      )
    },
    updateBoard: (state, action) => {
      const index = state.boards.findIndex(
        (board) => board.id === action.payload.id
      )
      if (index !== -1) state.boards[index] = action.payload
    },
    setBoardsLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const {
  setBoards, addBoard, deleteBoard,
  updateBoard, setBoardsLoading
} = boardsSlice.actions
export default boardsSlice.reducer