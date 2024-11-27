import { Route, Routes } from 'react-router-dom'

import './css/main.css'

import Navbar from './Navbar'
import Searchserver from './SearchServer'
import SearchPlayers from './SearchPlayers'
import SearchPlayer from './SearchPlayer'
import Server from './Server'
import AddServer from './AddServer'
import PlayerStats from './PlayerStats'
import ServerVariables from './ServerVariables'
import Downloads from './Downloads'
function App() {

  return (
    <>
    <Navbar />
    <div className='overlay'></div>
    {<Routes>
      <Route path="/" element={<Searchserver />}/>
      <Route path="/descargar" element={<Downloads />}/>
      <Route path="/agregarservidor" element={<AddServer />}/>
      <Route path="/servidor/:address" element={<Server />}/>
      <Route path="/servidor/:address/server_variables" element={<ServerVariables />}/>
      <Route path="/search/:queryId/:value" element={<Searchserver />}/>
      <Route path="/search/:queryId/:value/:varValue" element={<Searchserver />}/>
      <Route path="/jugadores" element={<SearchPlayers />}/>
      <Route path="/jugadores/:name" element={<SearchPlayers />}/>
      <Route path="/jugadores/online" element={<SearchPlayers />}/>
      <Route path="/jugadores/:name/online" element={<SearchPlayers />}/>
      <Route path="/jugador/:name" element={<SearchPlayer />}/>
      <Route path="/jugador/:playerName/:address" element={<PlayerStats />}/>
      
  </Routes>}
      
    </>
  )
}

export default App
