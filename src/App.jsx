import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Header from "./components/Header"
import SignUp from "./components/SignUp"


function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<SignUp/>} />
        </Routes>
      </Router>

    </>
  )
}

export default App
