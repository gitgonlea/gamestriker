import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios'

import './css/searchbar.css'
import './css/table.css'

import Paginator from './Paginator';
import SearchBar from './SearchBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faArrowCircleUp, faArrowCircleDown,
  faCrown,
  faSkullCrossbones
} from '@fortawesome/free-solid-svg-icons'

const SERVERS_PER_PAGE = 100;

const SERVER_API = import.meta.env.VITE_SERVER_API_URL
const LANG = import.meta.env.VITE_LANGUAGE

export default function Searchbar() {

  const { queryId, value, varValue } = useParams();

  const queryName = ['servername', 'map', 'IP', '', '', 'variable'];
  let querySelected = queryName.indexOf(queryId);

  if (querySelected === -1) {
    querySelected = 0
  }

  const [selectedValue, setSelectedValue] = useState(querySelected || '0');
  const [searchValue, setSearchValue] = useState(querySelected === 5 ? varValue : value || '');

  const query = ['name', 'map', 'ip', '', '', 'variable'];

  const order = ['rank_id', 'servername', 'numplayers', 'host', 'map'];

  const [orderBy, setOrderBy] = useState(2);
  const [orderDirection, setOrderDirection] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isVariable, setisVariable] = useState(querySelected !== 5 ? 'admanager_version' : value || '');

  const handleCellClick = (index) => {

    setOrderBy(index);
    setOrderDirection(prevDirection => !prevDirection);

    const orderArray = orderServerData(index)

    setServerData(orderArray)
};

const orderServerData = (oid) => {
  return serverData.slice().sort((a, b) => {
    const valueA = typeof a[order[oid]] === 'string' ? a[order[oid]].toLowerCase() : a[order[oid]];
    const valueB = typeof b[order[oid]] === 'string' ? b[order[oid]].toLowerCase() : b[order[oid]];

    const statusA = a.status || 0;
    const statusB = b.status || 0;

    if (statusA === 0 && statusB !== 0) {
      return 1; 
    } else if (statusA !== 0 && statusB === 0) {
      return -1;
    } else {
      if (typeof valueA === 'string') {
        const comparison = orderDirection === false ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        if (comparison === 0) {
          return b.numplayers - a.numplayers;
        }
        return comparison;
      } else {
        return orderDirection === false ? valueA - valueB : valueB - valueA;
      }
    }
  });
};

  const handleChange = (event) => {

    setSelectedValue(event.target.value);

    if(event.target.value !== '5')
    {
      setisVariable('admanager_version')
    }
  };


  const handleChangeSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const handleVariableChange = (newValue) => {
    setisVariable(newValue);
  };


  const [serverData, setServerData] = useState([]);

  const fetchData = async (type, oid, clicked) => {
    try {
      const index = parseInt(selectedValue)

      let url = `${SERVER_API}/api/v1/servers/getServers?`;

      if(query[index] === 'variable' || index === 5)
      {
         console.log(varValue)

         if(!clicked)
         {
          if(varValue)
          url += `varKey=${value}&varValue=${varValue}&`;
          else 
          url += `varKey=${value}&`;
         } else 
         {
          if(searchValue)
          url += `varKey=${isVariable}&varValue=${searchValue}&`;
          else 
          url += `varKey=${isVariable}&`;
         }
      }
      else if (type === 1) {
          url += `${query[index]}=${searchValue}&`;
      } else if(type === 2)
      {
        url += `orderBy=${order[oid]}&orderDirection=${orderDirection}&`;
      }

      url += `page=${currentPage}&pageSize=${SERVERS_PER_PAGE}`

      const response = await axios.get(url);
      setServerData(response.data.servers);

      setTotalPages(response.data.totalPages);
      setisLoading(false)
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  };

  useEffect(() => {
    document.title = LANG === 'en' ? 'GameStriker' : 'Argentina Strike - CS 1.6'

    if(queryId && value)
    fetchData(1, 0, 0);
    else
    fetchData(0, 0, 0);
  }, [currentPage]);

  const renderSortingIcon = (columnIndex) => {
    return (
        <span className="sorting-icon">
            {orderBy === columnIndex && (
                <FontAwesomeIcon icon={orderDirection ? faArrowCircleDown : faArrowCircleUp} />
            )}
        </span>
    );
};

  const searchPlayers = () => {
    
    if(selectedValue === '4')
    window.location.href = `/jugadores/${searchValue}/online`
    else
    window.location.href = `/jugadores/${searchValue}`
  }

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClickSearch = (variable) => {
    const selVal = parseInt(selectedValue)
    if(selVal === 5)
    {
      if (window.location.pathname.includes('/search/variable'))
        fetchData(1, 0, 1)
      else
      window.location.href = `/search/variable/${variable}/${searchValue}`
    }
    else if(selVal < 3)
    {
      fetchData(1, 0, 1)
    }
    else 
    searchPlayers()

  }

  const RankIcon = ({ rank }) => {
    let rankClass = '';
  
    switch(rank) {
      case 1:
        rankClass = 'gold';
        break;
      case 2:
        rankClass = 'silver';
        break;
      case 3:
        rankClass = 'bronze';
        break;
      default:
        return null;
    }

    return (
      <FontAwesomeIcon className={`server-icon ${rankClass}`} icon={faCrown} />
    );
  }

  return(
    <main>
     
     <SearchBar 
      selectedValue={selectedValue} 
      handleChange={handleChange} 
      handleChangeSearch={handleChangeSearch} 
      searchValue={searchValue}
      handleClickSearch={handleClickSearch}
      isVariable={isVariable}
      onVariableChange={handleVariableChange}
    />
    <Paginator totalPages={totalPages} currentPage={currentPage} handlePageChange={handlePageChange} />
    
    <table className="server-list-table">
    <thead>
      <tr className="server-list-header">
        
        <td className="server-list-cell players-width pointer" onClick={() => handleCellClick(2)}>{renderSortingIcon(2)}{LANG === 'en' ? 'Players' : 'Jugadores'}</td>
        <td className="server-list-cell server-width pointer" onClick={() => handleCellClick(1)}>{renderSortingIcon(1)}{LANG === 'en' ? 'Server' : 'Servidor'}</td>
        <td className="server-list-cell rank-width pointer" onClick={() => handleCellClick(0)}>{renderSortingIcon(0)}Rank</td>
        <td className="server-list-cell ip-width pointer" onClick={() => handleCellClick(3)}>{renderSortingIcon(3)}IP</td>
        <td className="server-list-cell map-width pointer" onClick={() => handleCellClick(4)}>{renderSortingIcon(4)}{LANG === 'en' ? 'Map' : 'Mapa'}</td>
      </tr>
    </thead>
  </table>

  <table className="server-list-table">
    <tbody>
      {serverData.length > 0 ? 
      (
        <>
         {serverData.map((server, index) => (
            <tr key={index} 
            className={`${index % 2 === 0 ? "server-list-row first" : "server-list-row second"} ${server.status === 0 ? "dead" : ""}`}>
              
              <td className="server-list-cell players-width">
              {index+1 > 3 & server.status === 0 ?
              <FontAwesomeIcon className={`server-icon`} icon={faSkullCrossbones} />
              :
              <>
                {(orderDirection === true && orderBy === 0) || (orderDirection === false && orderBy === 2) ? <RankIcon rank={index+1} /> : null}
              </>
              }
                
                {server.numplayers}/{server.maxplayers}
              </td>
              <td className="server-list-cell servername-width">
  <Link to={`/servidor/${server.host}:${server.port}`}>
    {server.servername}
  </Link>
</td>
<td className={`server-list-cell rank-width center-rank`}>
              
              {server.rank_id}
              </td>
             
              <td className="server-list-cell ip-width">{server.host}:{server.port}</td>
              <td className="server-list-cell map-width ">{server.map}</td>
            </tr>
          ))}
        </>
      ) :
      (
        <>
        { !isLoading &&
        <tr className="server-list-row first">
        <td className="server-list-cell no-data-avalaible">{LANG === 'es' ? 'No servers matched that description.' : 'No se encontraron servidores con esa descripción.'}</td>
      </tr>
    
        }
        </>  

      )

      }
   

    </tbody>
  </table>
    </main>
  )
}