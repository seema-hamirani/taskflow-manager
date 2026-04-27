import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore"
import { db } from "../firebase/config"
import { setBoards, addBoard, deleteBoard } from "../features/boards/boardsSlice"
import Navbar from "../components/Navbar"
import Loader from "../components/Loader"
import { FiPlus, FiTrash2, FiLayout } from "react-icons/fi"
import toast from "react-hot-toast"

const COLORS = [
  "from-indigo-500 to-purple-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-teal-500",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-yellow-500 to-orange-500",
]

function Dashboard() {
  const [showModal, setShowModal] = useState(false)
  const [boardTitle, setBoardTitle] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const { boards } = useSelector((state) => state.boards)
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const q = query(collection(db, "boards"), where("userId", "==", user.uid))
      const snapshot = await getDocs(q)
      const boardsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      dispatch(setBoards(boardsData))
    } catch (err) {
      toast.error("Failed to load boards")
    }
    setLoading(false)
  }

  const handleCreateBoard = async (e) => {
    e.preventDefault()
    if (!boardTitle.trim()) return
    setCreating(true)
    try {
      const colorIndex = Math.floor(Math.random() * COLORS.length)
      const newBoard = {
        title: boardTitle.trim(),
        userId: user.uid,
        color: COLORS[colorIndex],
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(collection(db, "boards"), newBoard)
      dispatch(addBoard({ id: docRef.id, ...newBoard }))
      toast.success("Board created!")
      setBoardTitle("")
      setShowModal(false)
    } catch (err) {
      toast.error("Failed to create board")
    }
    setCreating(false)
  }

  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation()
    try {
      await deleteDoc(doc(db, "boards", boardId))
      dispatch(deleteBoard(boardId))
      toast.success("Board deleted")
    } catch (err) {
      toast.error("Failed to delete board")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Boards</h1>
            <p className="text-gray-500 mt-1">Manage your projects and tasks</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors">
            <FiPlus size={18} />
            New Board
          </button>
        </div>

        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {boards.map((board) => (
              <div key={board.id} onClick={() => navigate(`/board/${board.id}`)}
                className="relative cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                <div className={`bg-gradient-to-br ${board.color} p-6 h-36 flex flex-col justify-between`}>
                  <div className="flex items-start justify-between">
                    <FiLayout size={24} className="text-white opacity-80" />
                    <button onClick={(e) => handleDeleteBoard(e, board.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/20 hover:bg-white/30 p-1.5 rounded-lg">
                      <FiTrash2 size={14} className="text-white" />
                    </button>
                  </div>
                  <h3 className="text-white font-semibold text-lg leading-tight">{board.title}</h3>
                </div>
              </div>
            ))}

            <button onClick={() => setShowModal(true)}
              className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 h-36 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-500 transition-colors">
              <FiPlus size={24} />
              <span className="text-sm font-medium">New Board</span>
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <input type="text" value={boardTitle} onChange={(e) => setBoardTitle(e.target.value)}
                placeholder="Board title..." autoFocus required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm mb-4" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {creating ? "Creating..." : "Create Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard