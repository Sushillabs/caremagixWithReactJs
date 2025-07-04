import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import SignUp from "./pages/SignUp"
import SignIn from "./pages/SignIn"
import Footer from "./components/Footer"


function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<SignIn/>} />
          <Route path="/sign-up" element={<SignUp/>} />
        </Routes>
        <Footer/>
      </Router>

    </>
  )
}

export default App
