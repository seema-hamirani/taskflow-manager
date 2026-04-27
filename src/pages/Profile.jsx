import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/config"
import { clearUser } from "../features/auth/authSlice"
import { FiUser, FiMail, FiLogOut } from "react-icons/fi"
import Navbar from "../components/Navbar"
import toast from "react-hot-toast"

function Profile() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    dispatch(clearUser())
    toast.success("Logged out!")
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-20 h-20 rounded-full mx-auto mb-4" />
            ) : (
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser size={32} className="text-indigo-600" />
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || "User"}</h2>
          </div>
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FiUser className="text-indigo-500" size={18} />
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-800">{user?.displayName || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <FiMail className="text-indigo-500" size={18} />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800">{user?.email}</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors">
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile