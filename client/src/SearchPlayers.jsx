import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';

import axios from 'axios'

import './css/searchbar.css'
import './css/table.css'

import Paginator from './Paginator';
import SearchBar from './SearchBar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faArrowCircleUp, faArrowCircleDown
} from '@fortawesome/free-solid-svg-icons'

const PLAYERS_PER_PAGE = 15;

export default function Searchbar() {

  const { name } = useParams();

  const isOnline = window.location.pathname.includes('/online');

  const [selectedValue, setSelectedValue] = useState(isOnline ? '4' : '3');
  const [searchValue, setSearchValue] = useState(name || '');
  const [online, setOnline] = useState(isOnline || false);

  const [isLoading, setIsLoading] = useState(true);

  const [orderDirection, setOrderDirection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isVariable, setisVariable] = useState('admanager_version');

  const SERVER_API = import.meta.env.VITE_SERVER_API_URL//'https://taringa-cs.com/argstrike'
  const LANG = import.meta.env.VITE_LANGUAGE

  const handleCellClick = () => {

    setOrderDirection(prevDirection => !prevDirection);

   const orderArray = orderData(!orderDirection)
   
   setServerData(orderArray)
};
const handleVariableChange = (newValue) => {
  setisVariable(newValue);
};


  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleChangeSearch = (event) => {
    setSearchValue(event.target.value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const [serverData, setServerData] = useState([]);

  const fetchData = async (dir) => {
    try {
      let url = `${SERVER_API}/api/v1/servers/getPlayer?name=${searchValue}&online=${online}&orderBy=name&orderDirection=${dir}&page=${currentPage}&pageSize=${PLAYERS_PER_PAGE}`;

      const response = await axios.get(url);

      setServerData(response.data.players);
      setTotalPages(response.data.totalPages);

      setIsLoading(false)
      
    } catch (error) {
      setIsLoading(false)
      console.error('Error fetching server data:', error);
    }
  };

  useEffect(() => {
    

    fetchData();
  }, [currentPage]);

  const handleClickSearch = (variable) => {

    const query = ['name', 'map', 'ip'];
    const selValue = parseInt(selectedValue)
    if(selValue === 5)
    {
      window.location.href = `/search/variable/${variable}/${searchValue}`
    }
    else if(selValue === 4)
    {
      setOnline(true)
      fetchData()
    } else if(selValue === 3)
    fetchData()
    else
    window.location.href = `/search/${query[selValue]}/${searchValue}`
    
  }

  const orderData = (oid) => {

    return serverData.slice().sort((a, b) => {
        const valueA = a['player_name'].toLowerCase()
        const valueB = b['player_name'].toLowerCase()
  
        return orderDirection === true ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
  };

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
        <td className="server-list-cell width10 pointer" onClick={() => handleCellClick()}>{!orderDirection ? <FontAwesomeIcon icon={faArrowCircleUp}/> : <FontAwesomeIcon icon={faArrowCircleDown}/>}
        {LANG === 'en' ? 'Name' : 'Nombre'}
        </td>
      </tr>
    </thead>
  </table>

  <table className="server-list-table">
    <tbody>
      { serverData.length > 0 ?
      (
        <>
        {serverData.map((server, index) => (
            <tr key={index} className={index % 2 === 0 ? "server-list-row first" : "server-list-row second"}>
              <td className="server-list-cell width10">
                <Link to={`/jugador/${server.player_name}`} target="_blank">
                  {server.player_name}
                </Link>
              </td>
            </tr>
          ))}
        </>
      ) :
      (
        <>
        { !isLoading &&
        <tr className="server-list-row first">
        <td className="server-list-cell no-data-avalaible">{LANG === 'en' ? 'No players match that description.' : 'No se encontraron jugadores con esa descripción.'}</td>
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