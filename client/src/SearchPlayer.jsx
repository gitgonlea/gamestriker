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

  const order = ['player_name', 'servername', 'playtime', 'score', 'last_seen'];

  const [selectedValue, setSelectedValue] = useState('3');
  const [searchValue, setSearchValue] = useState('');

  const [orderBy, setOrderBy] = useState(2);
  const [orderDirection, setOrderDirection] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isVariable, setisVariable] = useState('admanager_version');
  const SERVER_API = import.meta.env.VITE_SERVER_API_URL
  const LANG = import.meta.env.VITE_LANGUAGE

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const handleVariableChange = (newValue) => {
    setisVariable(newValue);
  };

  const handleChangeSearch = (event) => {
    setSearchValue(event.target.value);
  };


  const [serverData, setServerData] = useState([]);

  const fetchData = async (oid) => {
    try {
      let url = `${SERVER_API}/api/v1/servers/getPlayer?name=${name}&orderBy=time&page=${currentPage}&pageSize=${PLAYERS_PER_PAGE}`;


      const response = await axios.get(url);
      setServerData(response.data.players);
      setTotalPages(response.data.totalPages);

    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  };

  useEffect(() => {
    

    fetchData(0, orderDirection);
  }, [currentPage]);

  const renderSortingIcon = (columnIndex) => {
    if (orderBy === columnIndex) {
      return !orderDirection ? <FontAwesomeIcon icon={faArrowCircleUp}/> : <FontAwesomeIcon icon={faArrowCircleDown}/>;
    }
    return null;
  };

  const searchPlayers = () => {
    if(selectedValue === '4')
    window.location.href = `/jugadores/${searchValue}/online`
    else
    window.location.href = `/jugadores/${searchValue}`
  }

  const handleCellClick = (index) => {

    setOrderBy(index);
    setOrderDirection(prevDirection => !prevDirection);

    const orderArray = orderServerData(index)

    setServerData(orderArray)
};

const handlePageChange = (page) => {
  setCurrentPage(page);
};

const orderServerData = (oid) => {
  return serverData.slice().sort((a, b) => {
    const valueA = a[order[oid]];
    const valueB = b[order[oid]];

    if (typeof valueA === 'string' && valueA.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)) {
      const dateA = new Date(valueA);
      const dateB = new Date(valueB);
      return orderDirection === false ? dateA - dateB : dateB - dateA;
    }

    if (typeof valueA === 'string') {
      return orderDirection === false ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    } else {
      return orderDirection === false ? valueA - valueB : valueB - valueA;
    }
  });
};
function formatDate(dateString) {
  const date = new Date(dateString);

  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const monthNamesEn = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  const formattedDate = `${day} de ${LANG === 'en' ? monthNamesEn[monthIndex] : monthNames[monthIndex]} de ${year}`;

  return formattedDate;
}

const handleClickSearch = () => {
  const selVal = parseInt(selectedValue)

  if(selVal === 5)
  window.location.href = `/search/variable/${variable}/${searchValue}`
  else if(selVal < 3)
  fetchData(1, 0)
  else 
  searchPlayers()

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
        <td className="server-list-cell name-width pointer" onClick={() => handleCellClick(0)}>{renderSortingIcon(0)}{LANG === 'en' ? 'Name' : 'Nombre'}</td>
        <td className="server-list-cell servername-width pointer" onClick={() => handleCellClick(1)}>{renderSortingIcon(1)}{LANG === 'en' ? 'Server' : 'Servidor'}</td>
        <td className="server-list-cell total-time-width pointer" onClick={() => handleCellClick(2)}>{renderSortingIcon(2)}{LANG === 'en' ? 'Total time' : 'Tiempo total'}</td>
        <td className="server-list-cell total-score-width pointer" onClick={() => handleCellClick(3)}>{renderSortingIcon(3)}{LANG === 'en' ? 'Total score' :'Puntuación total'}</td>
        <td className="server-list-cell map-width pointer" onClick={() => handleCellClick(4)}>{renderSortingIcon(4)}{LANG === 'en' ? 'Last seen' : 'Última vez visto'}</td>
      </tr>
    </thead>
  </table>

  <table className="server-list-table">
    <tbody>
    {serverData.map((server, index) => (
            <tr key={index} className={index % 2 === 0 ? "server-list-row first" : "server-list-row second"}>
              <td className="server-list-cell name-width"><Link to={`/jugador/${server.player_name}/${server.host}:${server.port}`}>{server.player_name}</Link></td>
              <td className="server-list-cell servername-width">
              <Link to={`/servidor/${server.host}:${server.port}`} target="_blank">
                {server.servername}
              </Link>
              </td>
              <td className="server-list-cell total-time-width">{server.playtime}</td>
              <td className="server-list-cell total-score-width">{server.score}</td>
              <td className="server-list-cell map-width">{formatDate(server.last_seen)}</td>
            </tr>
          ))}

    </tbody>
  </table>
    </main>
  )
}