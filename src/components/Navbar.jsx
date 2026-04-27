import { Link, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/config"
import { clearUser } from "../features/auth/authSlice"
import { FiLogOut, FiUser, FiGrid } from "react-icons/fi"
import toast from "react-hot-toast"

function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      dispatch(clearUser())
      toast.success("Logged out successfully")
      navigate("/login")
    } catch (err) {
      toast.error("Logout failed")
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">TaskFlow</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
            <FiGrid size={16} />
            Boards
          </Link>

          <Link to="/profile"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors text-sm font-medium">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                <FiUser size={14} className="text-indigo-600" />
              </div>
            )}
            <span>{user?.displayName?.split(" ")[0]}</span>
          </Link>

          <button onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors text-sm font-medium">
            <FiLogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar