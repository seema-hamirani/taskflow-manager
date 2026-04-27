import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore"
import { db } from "../firebase/config"
import { setTasks, addTask, deleteTask, updateTask, moveTask } from "../features/tasks/tasksSlice"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import Navbar from "../components/Navbar"
import Loader from "../components/Loader"
import { FiPlus, FiTrash2, FiArrowLeft, FiFlag, FiCalendar, FiEdit2 } from "react-icons/fi"
import toast from "react-hot-toast"

const COLUMNS = [
  { id: "todo", title: "To Do", color: "bg-gray-100" },
  { id: "inprogress", title: "In Progress", color: "bg-blue-50" },
  { id: "done", title: "Done", color: "bg-green-50" },
]

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-green-600 bg-green-100" },
  { value: "medium", label: "Medium", color: "text-yellow-600 bg-yellow-100" },
  { value: "high", label: "High", color: "text-red-600 bg-red-100" },
]

function Board() {
  const { boardId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { tasks } = useSelector((state) => state.tasks)
  const { boards } = useSelector((state) => state.boards)
  const board = boards.find((b) => b.id === boardId)
  const boardTasks = tasks[boardId] || []

  const [loading, setLoading] = useState(true)

  // Add Task Modal
  const [showModal, setShowModal] = useState(false)
  const [modalColumn, setModalColumn] = useState("todo")
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDesc, setTaskDesc] = useState("")
  const [taskPriority, setTaskPriority] = useState("medium")
  const [taskDueDate, setTaskDueDate] = useState("")
  const [creating, setCreating] = useState(false)

  // Edit Task Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editPriority, setEditPriority] = useState("medium")
  const [editDueDate, setEditDueDate] = useState("")
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [boardId])

  const fetchTasks = async () => {
    try {
      const q = query(collection(db, "tasks"), where("boardId", "==", boardId))
      const snapshot = await getDocs(q)
      const tasksData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      dispatch(setTasks({ boardId, tasks: tasksData }))
    } catch (err) {
      toast.error("Failed to load tasks")
    }
    setLoading(false)
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!taskTitle.trim()) return
    setCreating(true)
    try {
      const newTask = {
        title: taskTitle.trim(),
        description: taskDesc.trim(),
        status: modalColumn,
        priority: taskPriority,
        dueDate: taskDueDate,
        boardId,
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, "tasks"), newTask)
      dispatch(addTask({ boardId, task: { id: docRef.id, ...newTask } }))
      toast.success("Task added!")
      setTaskTitle("")
      setTaskDesc("")
      setTaskPriority("medium")
      setTaskDueDate("")
      setShowModal(false)
    } catch (err) {
      toast.error("Failed to add task")
    }
    setCreating(false)
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId))
      dispatch(deleteTask({ boardId, taskId }))
      toast.success("Task deleted")
    } catch (err) {
      toast.error("Failed to delete task")
    }
  }

  // Open edit modal with task data
  const openEditModal = (task) => {
    setEditingTask(task)
    setEditTitle(task.title)
    setEditDesc(task.description || "")
    setEditPriority(task.priority || "medium")
    setEditDueDate(task.dueDate || "")
    setShowEditModal(true)
  }

  // Save edited task
  const handleEditTask = async (e) => {
    e.preventDefault()
    if (!editTitle.trim()) return
    setEditing(true)
    try {
      const updatedTask = {
        ...editingTask,
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        dueDate: editDueDate,
      }
      await updateDoc(doc(db, "tasks", editingTask.id), {
        title: editTitle.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        dueDate: editDueDate,
      })
      dispatch(updateTask({ boardId, task: updatedTask }))
      toast.success("Task updated!")
      setShowEditModal(false)
      setEditingTask(null)
    } catch (err) {
      toast.error("Failed to update task")
    }
    setEditing(false)
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    const newStatus = destination.droppableId
    dispatch(moveTask({ boardId, taskId: draggableId, newStatus }))
    try {
      await updateDoc(doc(db, "tasks", draggableId), { status: newStatus })
    } catch (err) {
      toast.error("Failed to move task")
    }
  }

  const openModal = (columnId) => {
    setModalColumn(columnId)
    setShowModal(true)
  }

  const getColumnTasks = (columnId) =>
    boardTasks.filter((task) => task.status === columnId)

  const getPriorityStyle = (priority) =>
    PRIORITIES.find((p) => p.value === priority)?.color || ""

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <FiArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{board?.title || "Board"}</h1>
            <p className="text-gray-500 text-sm">{boardTasks.length} tasks total</p>
          </div>
        </div>

        {loading ? <Loader /> : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {COLUMNS.map((column) => (
                <div key={column.id} className={`${column.color} rounded-2xl p-4`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                      <span className="bg-white text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {getColumnTasks(column.id).length}
                      </span>
                    </div>
                    <button onClick={() => openModal(column.id)}
                      className="p-1.5 hover:bg-white rounded-lg transition-colors">
                      <FiPlus size={16} className="text-gray-600" />
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={`space-y-3 min-h-20 rounded-xl transition-colors ${snapshot.isDraggingOver ? "bg-white/50" : ""}`}>
                        {getColumnTasks(column.id).map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className={`bg-white rounded-xl p-4 shadow-sm group ${snapshot.isDragging ? "shadow-lg rotate-1" : ""}`}>

                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-medium text-gray-800 flex-1">{task.title}</p>
                                  {/* Edit and Delete buttons */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditModal(task)}
                                      className="p-1 hover:bg-indigo-50 rounded-lg transition-colors">
                                      <FiEdit2 size={13} className="text-indigo-400 hover:text-indigo-600" />
                                    </button>
                                    <button onClick={() => handleDeleteTask(task.id)}
                                      className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                                      <FiTrash2 size={13} className="text-gray-400 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>

                                {task.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-3">
                                  {task.priority && (
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${getPriorityStyle(task.priority)}`}>
                                      <FiFlag size={10} />
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                      <FiCalendar size={10} />
                                      {task.dueDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <button onClick={() => openModal(column.id)}
                    className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-xl transition-colors flex items-center justify-center gap-1">
                    <FiPlus size={14} />
                    Add task
                  </button>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Task</h2>
            <form onSubmit={handleAddTask} className="space-y-4">
              <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title..." autoFocus required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Description (optional)" rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {creating ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Task</h2>
            <form onSubmit={handleEditTask} className="space-y-4">
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Task title..." autoFocus required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Description (optional)" rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select value={editPriority} onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                  <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={editing}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {editing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Board
