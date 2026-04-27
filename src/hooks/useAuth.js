import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase/config"
import { setUser, clearUser } from "../features/auth/authSlice"

function useAuth() {
  const dispatch = useDispatch()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }))
      } else {
        dispatch(clearUser())
      }
    })
    return () => unsubscribe()
  }, [dispatch])
}

export default useAuth