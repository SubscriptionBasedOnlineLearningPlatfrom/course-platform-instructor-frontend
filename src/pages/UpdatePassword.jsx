// import { useState, useEffect } from "react"
// import { useLocation } from "react-router-dom"

// import axios from "axios"

// export default function UpdatePassword() {
//   const location     = useLocation()
//   useEffect(() => {
//       console.log("location object:", location)
//       console.log("full URL:", window.location.href)
//    }, [location])

//   const searchParams = new URLSearchParams(location.search)
//  const hashParams   = new URLSearchParams(location.hash.slice(1))
//  const token =
//    searchParams.get("token") ||
//    searchParams.get("access_token") ||
//    hashParams.get("access_token") ||
//    hashParams.get("token")

//   const [newPassword, setNewPassword] = useState("")

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     if (!token) return alert("Missing reset token.")
//     try {
//       await axios.post("http://localhost:4000/auth/update-password", {
//         token, newPassword
//       })
//       alert("✅ Password updated successfully!")
//       window.location.href = "/dashboard"
//     } catch (err) {
//       alert(`❌ ${err.response?.data?.error || err.message}`)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded w-full max-w-md">
//         <h2 className="text-xl font-bold text-center">Set New Password</h2>
//         <input
//           type="password"
//           placeholder="New password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           className="w-full border rounded p-2"
//           required
//         />
//         <button type="submit" className="w-full bg-sky-700 text-white py-2 rounded">Update Password</button>
//       </form>
//     </div>
//   );
// }
import { useState, useEffect } from "react"
import { useLocation }           from "react-router-dom"
import axios                     from "axios"

export default function UpdatePassword() {
  const location = useLocation()

  useEffect(() => {
    console.log("location object:", location)
    console.log("full URL:", window.location.href)
  }, [location])

  // merge both ?search and #hash into one params object
  const combined = new URLSearchParams(
    location.search + location.hash.replace(/^#/, "&")
  )
  const token = combined.get("token") || combined.get("access_token")
  console.log("parsed token:", token)

  const [newPassword, setNewPassword] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token) return alert("Missing reset token.")
    try {
      await axios.post("http://localhost:4000/auth/update-password", {
        token, newPassword
      })
      alert("✅ Password updated successfully!")
      window.location.href = "/dashboard"
    } catch (err) {
      alert(`❌ ${err.response?.data?.error || err.message}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 border p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold text-center">Set New Password</h2>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border rounded p-2"
          required
        />
        <button type="submit" className="w-full bg-sky-700 text-white py-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  )
}