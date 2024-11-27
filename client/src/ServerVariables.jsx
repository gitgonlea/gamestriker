import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';

import axios from 'axios'

import './css/server_variables.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faChevronCircleLeft, faTimesCircle
} from '@fortawesome/free-solid-svg-icons'


export default function ServerVariables() {

  const { address } = useParams();

  const [serverData, setServerData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const SERVER_API = import.meta.env.VITE_SERVER_API_URL//'https://taringa-cs.com/argstrike'
  const LANG = import.meta.env.VITE_LANGUAGE

  const fetchData = async () => {
    try {
        const [host, port] = address.split(':');

        let url = `${SERVER_API}/api/v1/servers/getServerVariables?host=${host}&port=${port}`;
        const response = await axios.get(url);

        const dataObj = JSON.parse(response.data[0].variables_data);

        if (Object.keys(dataObj).length === 0 && dataObj.constructor === Object) {
          setIsLoading(false)
          return 
        }

        setServerData(response.data);
        setIsLoading(false)

    } catch (error) {
        setIsLoading(false)
        console.error('Error fetching server data:', error);

    }
    
};

useEffect(() => {
 fetchData()
}, []);

  return(
    <main> {serverData.length > 0 ? (
      <div className="main-vars-container">
        <div className="server-vars-titles-container">
        <div className="server-vars-title servername">
          <Link to={`/servidor/${address}`}>
          <FontAwesomeIcon icon={faChevronCircleLeft} />
          {serverData[0].servername}
          </Link>
        
          </div>
          <div className="server-vars-update-ad">
          <Link to={`/servidor/${address}`}>
            {serverData[0].host}:{serverData[0].port}
          </Link>
          </div>
        </div>
        
      <div className="server-vars-titles-container">
      
      <div className="server-vars-title">
        { LANG === 'en' ? 
        'Server variables'
        :
        'Variables del servidor'

        }
      </div>
      <div className="server-vars-update-ad">
      { LANG === 'en' ? 
        'Updated every 24 hours' 
        :
        'Actualizado cada 24 horas'
      }
      </div>
      </div>
      <div className="server-vars-container">
   
    {Object.entries(JSON.parse(serverData[0].variables_data)).map(([key, value]) => (
        <div className="var-desc-container" key={key}>

          <div className="var-key">{key}</div>
          <div className="var-value">
            <Link to={`/search/variable/${key}/${value}`}>
            {value}
            </Link>
            
          </div>
          
        </div>
      ))}
      </div>
      </div>
    ) :

    (
      <>
      { !isLoading &&
        <div className="var-404-container">
          <div className="var-404-title">
          <FontAwesomeIcon icon={faTimesCircle} />
          { LANG === 'en' ?
          "There's no variables availables for this server"
          :
          'No hay variables disponibles para este servidor'
          }
          
          </div>
        </div>
      }
      </>
    )

    }
    </main>
  )
}