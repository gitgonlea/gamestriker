import { Link } from "react-router-dom";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons'

import './css/downloads.css'
import { useState } from "react";

export default function Descargas() {

  const [isVisible, setIsVisible] = useState(false)

  const toggleMoreInfo = () => {
    setIsVisible(!isVisible);
  };
  return (
   
      <div className="downloads-container">
        <div className="downloads-item">
            <Link to="https://dev-ms.ru/GSClient_Setup.exe" target="_blank" rel="noopener noreferrer">
              Counter Strike 1.6 STEAM GRATIS (GSClient)
            </Link>
            <FontAwesomeIcon icon={faPlusSquare} onClick={toggleMoreInfo}/>
        </div>    
        <div className={`gsclient-info ${isVisible ? "fade-in" : "hidenclass"}`}>
          <Link to="https://dev-ms.ru/GSClient_Setup.exe" target="_blank" rel="noopener noreferrer">
            <div className="downloads-item center-text">
              Descargar CS 1.6 STEAM GRATIS (GSClient)
            </div>
          </Link>
          <p className="bold">Mejoras:</p><br/>
          <p>- Actualizaciones automáticas</p>
          <p>- Mayor seguridad (anti virus, anti cheats, anti destroy, etc)</p>
          <p>- Sincronizado y vinculable con STEAM (ID incluída)</p>
          <p>- Teclado en español (con la ñ incluída)</p>
          <p>- Más FPS y estabilidad (configurable)</p>
          <p>- Mayor calidad y fluidez (configurable)</p>
          <p>- Descargas mucho más rápidas de archivos en los servidores (múltiples a la vez en vez de 1x1)</p>
          <p>- Mejoras en el audio y sonido (Códec de voz Opus PLC)</p>
          <p>- Lista de servidores de todos los paises (no importa donde entres, estarás protegido)</p>
          <p>- Skins personalizables (Default/HD)</p>
          <p>- Más configuraciones agregadas en "options"</p>
          <p>- Podés utilizar avatar personalizado</p>
          <p>- La consola muestra el chat en colores</p><br/>
        
          <p className="bold">Aclaraciones:</p><br/>
          <p>- El instalador viene por defecto en ruso, pero se puede cambiar al inglés (el instalador) en las opciones al abrirlo</p>
          <p>- El juego se instala como el CS normal pero en distinta carpeta. Lo más recomendable es instalarlo en la que viene por defecto (en el instalador)</p>
          <p>- Para probar las futuras versiones debes ir a "propiedades" en el acceso directo del juego y en "destino" agregar "-beta"</p>
          <p>- El sXe NO es compatible con el GSClient, se recomienda cerrarlo antes de abrir este CS</p>
          <p>- Si utilizas Steam y querés ser detectado como GSClient en nuestros servidores, debes cerrar sesión en Steam</p>
          <p>- Para activar las skins en HD debes entrar a la carpeta "cstrike_hd" y pegar todos los archivos en "cstrike"</p>
          
          <div className="downloads-item center-text">
              <Link to="https://dev-ms.ru/GSClient_Setup.exe" target="_blank" rel="noopener noreferrer">
                Descargar CS 1.6 STEAM GRATIS (GSClient)
              </Link>
              <FontAwesomeIcon icon={faMinusSquare} onClick={toggleMoreInfo}/>
          </div>            
        </div>      
        <Link to="https://patagonia-strike.com/descargas/juegos/cs16_no_steam.rar" target="_blank" rel="noopener noreferrer">
          <div className="downloads-item">Counter Strike 1.6 NO-STEAM</div>
        </Link>
        <Link to="https://patagonia-strike.com/descargas/sxe/Sxe-Injected.rar" target="_blank" rel="noopener noreferrer">
          <div className="downloads-item">Sxe-Injected 17.2 (Anti-Cheat + FIX STEAM)</div>
        </Link>
        <Link to="https://patagonia-strike.com/descargas/skins/skins.rar" target="_blank" rel="noopener noreferrer">
          <div className="downloads-item">SKINS de nuestros servidores PUBLICOS (armas)</div>
        </Link>
        <Link to="https://patagonia-strike.com/descargas/skins/Skins-HD-Default.rar" target="_blank" rel="noopener noreferrer">
          <div className="downloads-item">SKINS del CS 1.6 (HD-Default)</div>
        </Link>
        <Link to="https://patagonia-strike.com/descargas/sonidos/Sonidos-Español-Ingles.rar" target="_blank" rel="noopener noreferrer">
          <div className="downloads-item">Sonidos del CS 1.6 (Español/Inglés)</div>
        </Link>
      </div>

  )
}