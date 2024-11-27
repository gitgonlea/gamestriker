import React, { useState, useEffect } from 'react';

import axios from 'axios'

import './css/addserver.css'

import SearchBar from './SearchBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCircleNotch, faSpinner
} from '@fortawesome/free-solid-svg-icons'

const SERVER_API = import.meta.env.VITE_SERVER_API_URL
const LANG = import.meta.env.VITE_LANGUAGE

export default function AddServer() {

  useEffect(() => {

  }, []);
  const [selectedValue, setSelectedValue] = useState('0');
  const [searchValue, setSearchValue] = useState('');
  const [responseStatus, setResponseStatus] = useState('');
  const [responseColor, setResponseColor] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState('');
  const [formData, setFormData] = useState({
    host: '',
    port: '',
  });
  const [countdown, setCountdown] = useState(-1);

  useEffect(() => {
    let timer;
    if (responseStatus && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      window.location.href = `/servidor/${savedAddress}`
    }
    return () => clearInterval(timer); // Cleanup function
  }, [responseStatus, countdown]);
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddServer = async () => {
    
    if(isLoading)
    return

    if (!formData.host || !/^[\w.-]+:\d+$/.test(formData.host.trim())) {
      setResponseStatus('¡Completa los campos de IP/Dominio y Puerto en el formato correcto! Ejemplo: 127.0.0.1:27015');
      setResponseColor(false);
      return;
    }

    setisLoading(true)
    try {
      const response = await axios.post(`${SERVER_API}/api/v1/servers/addServer`, formData);

      if(response.data === 'fail')
      {
        setResponseStatus(LANG === 'en' ? 'Invalid IP/Domain or port!' : '¡Dirección de IP/Dominio o Puerto invalido!')
        setResponseColor(false)
      } else if(response.data === 'duplicated')
      {
        setResponseStatus(LANG === 'en' ? 'This server is already in our database!' : '¡Este servidor ya está en nuestra base de datos!')
        setResponseColor(false)
      } else
      {
        setFormData({
          host: '',
          port: '',
        });
        setResponseStatus(LANG === 'en' ? 'Server added sucessfully!' : '¡Servidor agregado correctamente!')
        setResponseColor(true)
        setSavedAddress(`${response.data.host}:${response.data.port}`)
        setCountdown(10)
      }
      
      setisLoading(false)
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleChangeSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const redirect = () => {

    if(selectedValue === '2')
    window.location.href = `/servidor/${searchValue}`
    else if(selectedValue === '3')
    window.location.href = `/jugadores/${searchValue}`
    else 
    window.location.href = `/search/${selectedValue}/${searchValue}`
  }

  return(
    <main>
      <SearchBar 
      selectedValue={selectedValue} 
      handleChange={handleChange} 
      handleChangeSearch={handleChangeSearch} 
      searchValue={searchValue}
      handleClickSearch={redirect}
    />
    
    <div className="addserver-container">
      <div className="addserver-title">
        <div className="addserver-title-container">
        <div className="addserver-title-text">{LANG === 'en' ? 'Add server' : 'Agregar un servidor'}</div>
        <div className="redirect-countdown">{countdown > 0 && 
        <>
        <>
        { LANG === 'en' ?
        <>
        Redirecting to server in {countdown} second{countdown === 1 ? "" : "s"}
        </>
        :
        <>
        Redireccionando al servidor en {countdown} segundo{countdown === 1 ? "" : "s"}
        </>
        }
        &nbsp;
        <FontAwesomeIcon icon={faCircleNotch} spin />
        </>
        </>
        }
        </div>
        </div>
        </div>
      <div className="addserver-form">
        <div className="addserver-right-section">
          <div className="addserver-text">
            <span>{LANG === 'en' ? 'IP or Domain name:Port' : 'IP o nombre de dominio:Puerto'}</span>
          </div>
        </div>
        <div className="addserver-left-section">
          <div className="addserver-inputs">
          <input
          className="addserver-big-input"
          placeholder="127.0.0:27015"
          type="text"
          name="host"
          value={formData.host}
          onChange={handleInputChange}
          />
          </div>
          <div className="button-add" onClick={() => handleAddServer()}>
            {isLoading ? 
            (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) :
            (
              <>
              {LANG === 'en' ? 'Add Server' : 'Agregar servidor'}
              </>
            )
            }
            
          </div>
        </div>

      </div>
      { responseStatus &&
        <>
        <div className={`response-status ${responseColor ? 'green' : ''}`}>{responseStatus}</div>
        </>
      }
      
    </div>
    </main>
  )
}