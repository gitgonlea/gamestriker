import { Link, useNavigate } from "react-router-dom";
import React, { useEffect } from 'react';

import './css/navbar.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faGamepad, faCloudDownloadAlt, faFolderPlus
} from '@fortawesome/free-solid-svg-icons'


import argFlag from './assets/argflag2.webp';

const LANG = import.meta.env.VITE_LANGUAGE

export default function Navbar() {

  const navigate = useNavigate();

  const handleReload = () => {
    if (location.pathname === '/') {
      navigate(0)
    } else {
      navigate('/')
    }
  };


  useEffect(() => {

  }, []);

  return(
    <div className="nav-container">
    <div className="flag-container">

   <div className="arg-title-container" onClick={handleReload}>
   <div className="arg-title">GameStriker</div>
   
   </div>

    
    {/*<div className="ad">
      Servidores 100% argentinos y seguros.<br/>
      Servidores sin virus, destroy, fuckoff.<br/>
      Servidores sin bots rusos, chinos, etc.<br/>
      </div>*/}
      <div className="arg-flag">
      <img src={argFlag}/>
      
    </div>
    </div>
    <nav>
      <div className="nav-left-items">

      <div className="nav-item" onClick={handleReload}>
        <Link to="/">
        <FontAwesomeIcon icon={faGamepad}/>
          <span className="nav-text">
          
          {LANG === 'en' ? 'Servers' : 'Servidores'}</span>
        </Link>
        </div>
       {/*<div className="nav-item">
          <Link to="/descargar">
          <FontAwesomeIcon icon={faCloudDownloadAlt}/>
            <span className="nav-text">
            
            Descargas</span>
            </Link>
          </div> */} <div className="nav-section"></div>
        
          
        
        <div className="nav-section"></div>
        <div className="nav-section"></div>
        
          <div className="nav-item">
          <Link to="/agregarservidor">
          <FontAwesomeIcon icon={faFolderPlus}/>
            <span className="nav-text">
            
            {LANG === 'en' ? 'Add server' : 'Agregar Servidor'}</span>
            </Link>
          </div>
        
        <div className="nav-section"></div>
      
      </div>
    </nav>
  </div>
  )
}