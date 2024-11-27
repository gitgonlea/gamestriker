import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import './css/server.css'
import './css/table.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faGlobe, faQuestionCircle, faTimesCircle, faCogs, faArrowCircleDown, faArrowCircleUp,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'

import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

import 'react-tippy/dist/tippy.css';

import { Tooltip as TippyTooltip } from 'react-tippy';

export default function Server() {
  const order = ['rank', 'player_name', 'score', 'playtime'];
  

  const [imageMap, setImageMap] = useState('');

  const { address } = useParams();

  const [playerListOrderBy, setPlayerListOrderBy] = useState(2);
  const [topListOrderBy, setTopListOrderBy] = useState(2);

  const [serverData, setServerData] = useState([]);
  const [playerList, setPlayerList] = useState([]);
  const [topListOrderDirection, setTopListOrderDirection] = useState(false);
  const [playerListOrderDirection, setPlayerListOrderDirection] = useState(false);
  const [topList, setTopList] = useState([]);
  const [hoursSelected, setHoursSelected] = useState(0);
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerExample, setBannerExample] = useState('');

  const [playerStats, setPlayerStats] = useState([]);
  const [rankStats, setRankStats] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bannerValue, setBannerValue] = useState(false);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [timestampBanner, setTimestampBanner] = useState(0);

  const SERVER_API = import.meta.env.VITE_SERVER_API_URL
  const LANG = import.meta.env.VITE_LANGUAGE

  useEffect(() => {
    if (serverData.length > 0 && typeof serverData[0].last_update === 'string') {
      const lastUpdateDateTime = new Date(serverData[0].last_update);

      const lastUpdateDate = lastUpdateDateTime.getTime();
      if (lastUpdateDate) {
        const interval = setInterval(() => {
          const now = new Date()
          const differenceInMilliseconds = Math.abs(lastUpdateDate - now);
          const difference = differenceInMilliseconds / 1000;

          setElapsedTime(difference);

        }, 1000);

        return () => clearInterval(interval);
      }
    }
  }, [serverData]);
  
  const checkLastUpdate = async () => {
    try {
      const newServerData = await fetchData();

      setElapsedTime(0);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData = async () => {
    try {
        const [host, port] = address.split(':');

        if (!isValidIpAddress(host) || !isValidPort(port)) {
          setInvalidAddress(true)
          setIsLoading(false)
          return
        }

        let url = `${SERVER_API}/api/v1/servers/getServerInfo?host=${host}&port=${port}`;
        const response = await axios.get(url);

        const pageTitle = response.data[0].servername
        document.title = pageTitle
    
        const newMeta = 
        LANG === 'en' ?
          `Servidor de Counter Strike 1.6 [${address}], Server CS 1.6 [${address}] ', Servidor Argentino CS 1.6, Argentina.`
          :
          `Counter Strike 1.6 [${address}] Server, Server CS 1.6 [${address}] '`
        
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
    
        metaDescription.setAttribute('content', newMeta);
    
        updateOgMetaTag('og:title', pageTitle);
        updateOgMetaTag('og:description', newMeta);
        
        setServerData(response.data);
        const timestamp = Date.now();
        setTimestampBanner(timestamp)
        fetchPlayers(response.data[0].id);
        fetchTop(response.data[0].id);
        fetchRankStats(response.data[0].id);
        setIsLoading(false)

        setImageMap(`https://argentina-strike.com/maps/${response.data[0].map}.jfif`)

        return response.data[0].last_update
        
    } catch (error) {
        // Log the entire error object for debugging
        setIsLoading(false)
        console.error('Error fetching server data:', error);

    }
};

function updateOgMetaTag(property, content) {
  let metaTag = document.querySelector(`meta[property="${property}"]`);

  // Check if the meta tag exists
  if (!metaTag) {
      // If it doesn't exist, create a new meta tag
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
  }

  // Set the content of the meta tag
  metaTag.setAttribute('content', content);
}

  useEffect(() => {
  
    fetchPlayerStats(hoursSelected)

}, [serverData, playerList]);

const tickFormatter = (value, index, data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return value;
  }
  if (data.length <= 2) {
    return value;
  }
  if (index % 2 !== 0) {
    return '';
  }
  return value;
};


const fetchPlayerStats = async (value) => {
  if (!Array.isArray(serverData) || serverData.length <= 0) {
    return;
  }

  try {
    let url = `${SERVER_API}/api/v1/servers/getPlayerStats?type=${value}&server_id=${serverData[0].id}`;
    const response = await axios.get(url);

    if (response.data.length < 1) return;

    let processedData = response.data.filter((data) => data.Jugadores !== -1);

    if (LANG === 'en') {
      processedData = processedData.map((data) => ({
        ...data,
        Players: data.Jugadores,
      }));
    }

    if (!value) {
      const todayData = {
        day: '1',
        hour: 'ahora',
        [LANG === 'en' ? 'Players' : 'Jugadores']: playerList.length,
      };
      processedData.push(todayData);
    }
    setPlayerStats(processedData);
  } catch (error) {
    console.error('Error fetching server data:', error);
  }
};



  const fetchRankStats = async (value) => {
    try {
      let url = `${SERVER_API}/api/v1/servers/getRankStats?server_id=${value}`;

      const response = await axios.get(url);    

      const modifiedData = response.data.map((item, index, array) => ({
        ...item,
        date: index === array.length - 1 ? 'H' : array.length - index,
    }));

      setRankStats(modifiedData)
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  };

  const fetchPlayers = async (server) => {
    try {

      let url = `${SERVER_API}/api/v1/servers/getServerPlayers?id=${server}&type=1`;

      const response = await axios.get(url);
      assignRanks(response.data, 0)
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
  };

  const assignRanks = (data, type) => {
    if (data.length === 0) {
        return;
    }

    const scoreProperty = type === 1 ? 'score' : 'current_score';

    const sortedData = [...data].sort((a, b) => b[scoreProperty] - a[scoreProperty]);

    let currentRank = 1;
    let currentScore = sortedData[0][scoreProperty];
    sortedData.forEach((item, index) => {
        if (item[scoreProperty] < currentScore) {
            currentRank = index + 1;
            currentScore = item[scoreProperty];
        }
        item.rank = currentRank;
    });

    if(type === 1)
    setTopList(sortedData);
    else 
    setPlayerList(sortedData);
};

const fetchTop = async (server) => {
  try {

    let url = `${SERVER_API}/api/v1/servers/getServerPlayers?id=${server}&type=0`;

    const response = await axios.get(url);
    assignRanks(response.data, 1)
  } catch (error) {
    console.error('Error fetching server data:', error);
  }
};

  useEffect(() => {
    
    fetchData();
  }, []);

  const formatTime = (seconds, type, checker) => {

    if(!type && !checker)
    {
      seconds += elapsedTime
    }

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);

    const paddedMinutes = String(minutes).padStart(2, '0');

    if (type === 0) {
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m`;
        } else {
            return '';
        }
    } else {
        const remainingSeconds = Math.round(seconds) % 60;
        const paddedSeconds = String(remainingSeconds).padStart(2, '0');

        if (hours > 0) {
            return `${hours}:${paddedMinutes}`;
        } else if (paddedMinutes > 0) {
            if(checker)
            return `${minutes} ${LANG === 'en' ? 'minute' : 'minuto'}${minutes === 1 ? '' : 's'} ${LANG === 'en' ? 'and' : 'y' } ${remainingSeconds} ${LANG === 'en' ? 'second' : 'segundo'}${remainingSeconds === 1 ? '' : 's'}`;
            else
            return `${paddedMinutes}:${paddedSeconds}`;
        } else {
            if(checker)
            return `${remainingSeconds} ${LANG === 'en' ? 'second' : 'segundo'}${remainingSeconds === 1 ? '' : 's'}`;
            else 
            return `${paddedSeconds}s`;
        }
    }
};

const handleHours = (value) => {

  if(hoursSelected === value)
  return

  setHoursSelected(value)
  fetchPlayerStats(value)
}

function isValidIpAddress(ipAddress) {

  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  return ipv4Regex.test(ipAddress);
}

function isValidPort(port) {
  const portNumber = parseInt(port, 10);

  return !isNaN(portNumber) && portNumber >= 1 && portNumber <= 65535;
}

const getBannerCode = (value) => {
  if(!value)
  {
    setBannerExample(`<a href="https://argentina-strike.com/servidor/${address}/" target="_blank"><img src="https://argentina-strike.com/server_info/${address}/argstrike_v1.png" border="0" width="350" height="20" alt=""/></a>`)
  } else 
  {
    setBannerExample(`[url=https://argentina-strike.com/servidor/${address}/][img]https://argentina-strike.com/server_info/${address}/argstrike_v1.png[/img][/url]`)
  }
  setBannerValue(value)
  setCopied(false)
}

const handleClipboard = async () => {
  await navigator.clipboard.writeText(bannerExample);
  setCopied(true)
}

const toggleModal = () => {
  getBannerCode(0)
  setIsModalOpen(!isModalOpen)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: 'black', padding: '5px' }}>
        <p>{label}</p>
        {payload.map((entry, index) => (
          <p key={`data-${index}`} style={{ color: entry.color }}>
            {LANG === 'en' ?
            <>
            ({`${entry.name}: ${entry.payload.count} time${entry.payload.count > 1 ? 's' : ''} played`})
            </>
            :
            <>
            ({`${entry.name}: ${entry.payload.count} ve${entry.payload.count > 1 ? 'ces' : 'z'} jugado`})
            </>
            }
            
          </p>
        ))}
      </div>
    );
  }

  return null;
};

const COLORS = ['rgb(32, 179, 228)', 'rgb(35, 165, 209)', 'rgb(255, 184, 28)', 'rgb(230, 173, 51)', 'rgb(247, 247, 236)', 'rgba(247, 247, 236, 0.897)'];

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN) + 10;
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const color = COLORS[index % COLORS.length];// Get the color of the segment

  const fontSize = 14;

  return (
    <text x={x} y={y} fill={color} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={fontSize}>
      {`${serverData[0].WeeklyMapData[0].map_data[index].name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

const handleCellClick = (index, type) => {

  if(type)
  {
    setPlayerListOrderDirection(prevDirection => !prevDirection);
    setPlayerListOrderBy(index);
  } else 
  {
    setTopListOrderBy(index);
    setTopListOrderDirection(prevDirection => !prevDirection);
  }
  
  const orderArray = orderPlayerData(index, type)

  type ? setPlayerList(orderArray) : setTopList(orderArray)
};


const orderPlayerData = (oid, type) => {

  const dataList = type ? playerList : topList;
  const orderDirection = type ? playerListOrderDirection: topListOrderDirection 

  return dataList.slice().sort((a, b) => {
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

        return comparison;
      } else {
        return orderDirection === false ? valueA - valueB : valueB - valueA;
      }
    }
  });
};

const renderSortingIcon = (columnIndex, type) => {
  const orderDirection = type ? playerListOrderDirection : topListOrderDirection
  const orderBy = type ? playerListOrderBy : topListOrderBy
  return (
      <span className="sorting-icon">
          {orderBy === columnIndex && (
              <FontAwesomeIcon icon={orderDirection ? faArrowCircleDown : faArrowCircleUp} />
          )}
      </span>
  );
};

const handleImgError = () => {
  setImageMap('notfound')
}


  return(
    <main>
      <div className={`modal-get-banner ${isModalOpen ? '' : 'hide'}`}>
      <div className="modal-get-banner-btn-container">
        <div className="left-modal-get-banner">
          <div className={`get-banner-item ${bannerValue ? '' : 'active'}`} onClick={() => getBannerCode(0)}>WebSite/Blog</div>
          <div className={`get-banner-item ${bannerValue ? 'active' : ''}`} onClick={() => getBannerCode(1)}>Foro</div>
        </div>
        <div className="close-modal-get-banner" onClick={() => toggleModal()}><FontAwesomeIcon icon={faTimesCircle} /></div>
        
      </div>
      <div className="modal-get-banner-code">
      <textarea id="myTextarea" rows="8" cols="60" value={bannerExample} readOnly />
     
      </div>
      <div className="clipboard">
        
        <div onClick={() => handleClipboard()} className="get-banner-item clip">
        COPIAR
        </div>
      </div>
      { copied &&
        <div className="copy online">{LANG === 'en' ? 'Copied sucessfully!' : '¡Copiado correctamente!'}</div>
      }
      
  </div>
      {Array.isArray(serverData) && serverData.length ? (
      <div className="info-container">
      <div className="left-info">
      <div className="server-details">
        <div className="server-details-title">{LANG === 'en' ? 'Server details' : 'Detalles del servidor'}</div>
        { !isLoading && elapsedTime != 0 &&
          <div className="last-update-time-elapsed">
            {LANG === 'en' ? 
            <>
            Last scanned {formatTime(elapsedTime, 1, 1)} ago
            </> 
            :
            <>
            Último escaneo hace {formatTime(elapsedTime, 1, 1)}
            </> 
            }
            
          </div>
        }
        
      </div>
      <div className="tables-container">
      
      <div className="server-complete-details">
        <div className="server-info">
          
        {serverData.map((server, index) => (
              <div className="server-info-section" key={index}>
                <div>
                  <span className="server-info-title">{LANG === 'en' ? 'Name' : 'Nombre'}: </span>
                  <span className="server-info-desc">
                    {server.servername}
                  </span>
                </div>
                <div>IP:
                  <span className="server-info-desc"> {server.host}</span>
                  &nbsp;&nbsp;&nbsp;{LANG === 'en' ? 'Port' : 'Puerto'} : <span className="server-info-desc">{server.port}</span>
                </div>
                <div>{LANG === 'en' ? 'Status' : 'Estado'}: <span className={`status ${server.status ? 'online' : 'offline'}`}>{server.status ? 'Online' : 'Offline'} <FontAwesomeIcon icon={faGlobe} /></span></div>
              </div>
            ))}
            {serverData.length > 0 && (
              <>
              <div className="top-title server-vars">
                <Link to={`/servidor/${address}/server_variables`}>
              <FontAwesomeIcon icon={faCogs} /> {LANG === 'en' ? 'Server variables' : 'Variables del servidor'}
                </Link>
             </div>
            <div className="top-title ranking">RANKING</div>
            <div>{LANG === 'en' ? 'Server rank' : 'Rank del servidor'}:&nbsp;
               <span className="server-info-desc">{serverData[0].rank_id}º ({serverData[0].percentile}º {LANG === 'en' ? 'percentile' : 'percentil'})</span>
              </div>  
              <div className="progress-bar">
        <div className="progress" style={{ width: `${serverData[0].percentile}%` }}>
          <span>{serverData[0].percentile}º</span></div>
      </div>
      
        <div className="ranking-details">
      <div>{LANG === 'en' ? 'Higher past month' : 'Mas alto (mes pasado)'}:
      <span className="server-info-desc">&nbsp;
      { serverData[0].ServerRanks[0].lowest_rank > 0 ?
        <>
        {serverData[0].ServerRanks[0].lowest_rank}º
        </> :
        <>
        
      <span className="no-topdata">
      <TippyTooltip
                title={LANG === 'en' ? "No info avalaible" : "No hay información disponible"}
                arrow={true}
                position="top"
                trigger="mouseenter"
              >
        <FontAwesomeIcon icon={faQuestionCircle} />
        </TippyTooltip>
      </span>
      </>
        
      }</span>
      </div>
      <div><span className="rank_highlow">{LANG === 'en' ? 'Lower past month' : 'Mas bajo (mes pasado)'}:</span>
      <span className="server-info-desc">&nbsp;
      { serverData[0].ServerRanks[0].highest_rank > 0 ?
        <>
        {serverData[0].ServerRanks[0].highest_rank}º
        </> :
        <span className="no-topdata">
          <TippyTooltip
                title={LANG === 'en' ? "No info avalaible" : "No hay información disponible"}
                arrow={true}
                position="top"
                trigger="mouseenter"
              >
        <FontAwesomeIcon icon={faQuestionCircle} />
        </TippyTooltip>
        </span>
      }</span>
      </div>
      </div>
      
            </>
          )}
        </div>
        <div className="server-map-wrapper">
          <div className="current-map">{LANG === 'en' ? 'Current map' : 'Map actual'}:</div>
          {serverData.length > 0 && (
        <div className="server-map-info">
          { serverData[0].status === 0 ?
            (
              <div className="unknown-map">
              {LANG === 'en' ? 'Unknown' : 'Desconocido'}
              <FontAwesomeIcon icon={faTimesCircle} />
              </div>
            ) :
            (
              <>
              <div className="server-mapname">{serverData[0].map}</div>
              
              {imageMap && 
              <>
                {
                  imageMap === 'notfound' ?
                  <div className="server-mapimage-404">
                    <FontAwesomeIcon icon={faEyeSlash} />
                  </div>
                  :
                  <img 
                  className="server-mapimage"
                  src={imageMap}
                  onError={ () => handleImgError()}
                  />
                }
                </>
              }
            
              </>

            )
            
          }
          
        </div>
        )}
        <div className="current-players">{LANG === 'en' ? 'Players' : 'Jugadores'}:&nbsp;
          <span className="current-players-count">
          {serverData[0].numplayers}/{serverData[0].maxplayers}
          </span>
        </div>
        {serverData.length > 0 && (
          <>
          
            <div className="current-players">{LANG === 'en' ? 'Average last month' : 'Promedio (mes pasado)'}:&nbsp;
            { serverData[0].monthly_avg > 0 ?
            (
              <span className="current-players-count">
            
              {serverData[0].monthly_avg}
              
              </span>
            ) :
            (
              <span className="no-avgdata">
                <TippyTooltip
                title={LANG === 'en' ?  "No info avalaible" : "No hay información disponible"}
                arrow={true}
                position="top"
                trigger="mouseenter"
              >
              <FontAwesomeIcon icon={faQuestionCircle} />
              </TippyTooltip>
              </span>
              
            )    
             }
          </div>
         
          </>
       
        )}
        </div>
        </div>
        <div className="banner-container">
          <div className="top-title">
          {LANG === 'en' ?  "SERVERS' BANNER" : 'BANNER DEL SERVIDOR'}
          </div>
          <div onClick={() => toggleModal()} className="banner">
          <img src={`/server_info/${address}/argstrike_v1.png?=timestamp=${timestampBanner}`}/>
          </div>
          <div className="get-banner">
            CS 1.6 Banners: <span className="yellow" onClick={() => toggleModal()}>
            {LANG === 'en' ?  
            'Imagen & HTML Server Banner - Get code'
            :
            'Imagen y HTML Server Banner - Obtener código'}
          </span>
          </div>
        </div>
       
      <div className="top-title">{LANG === 'en' ?  'PLAYERS ONLINE' : 'JUGADORES ONLINE'}</div>  
    <table className="server-list-table small-table">
    <thead>
    <tr className="server-list-header">
        <td className="server-list-cell playerrank-width pointer" onClick={() => handleCellClick(0, 1)}>{renderSortingIcon(0, 1)}Rank</td>
        <td className="server-list-cell playername-width pointer" onClick={() => handleCellClick(1, 1)}>{renderSortingIcon(1, 1)}{LANG === 'en' ?  'Name' : 'Nombre'}</td>
        <td className="server-list-cell score-width pointer" onClick={() => handleCellClick(2, 1)}>{renderSortingIcon(2, 1)}{LANG === 'en' ? 'Score' : 'Puntuación'}</td>
        <td className="server-list-cell playtime-width pointer" onClick={() => handleCellClick(3, 1)}>{renderSortingIcon(3, 1)}{LANG === 'en' ? 'Time played' : 'Tiempo jugado'}</td>
      </tr>
    </thead>
  </table>

  <table className="server-list-table small-table">
    <tbody>
      {playerList.length > 0 ? 
      <>
    {playerList.map((player, index) => (
            <tr key={index} className={index % 2 === 0 ? "server-list-row first" : "server-list-row second"}>
              <td className="server-list-cell playerrank-width">{player.rank}</td>
              <td className="server-list-cell playername-width">
                <Link to={`/jugador/${player.player_name}/${address}`}>
                {player.player_name} {player.BOT === 1 && <span className="is-bot">(BOT)</span>}
                </Link>
              </td>
              <td className="server-list-cell score-width">{player.current_score}</td>
              <td className="server-list-cell playtime-width">{formatTime(player.current_playtime, 1, 0)}</td>
            </tr>
          ))}
          </>
          :
          (
            <>
            <tr className="server-list-row first">
            <td className="server-list-cell no-data-avalaible">{LANG === 'en' ? 'No players online.' : 'No hay jugadores online.'}</td>
            </tr>
            </>
          )
      }

    </tbody>
  </table>
  <div className="top-title">{LANG === 'en' ? 'TOP 10 PLAYERS' : 'TOP 10 JUGADORES'} (online & offline)</div>  
  <table className="server-list-table small-table">
    <thead>
      <tr className="server-list-header">
        <td className="server-list-cell playerrank-width pointer" onClick={() => handleCellClick(0, 0)}>{renderSortingIcon(0, 0)}Rank</td>
        <td className="server-list-cell playername-width pointer" onClick={() => handleCellClick(1, 0)}>{renderSortingIcon(1, 0)}{LANG === 'en' ? 'Name' : 'Nombre'}</td>
        <td className="server-list-cell score-width pointer" onClick={() => handleCellClick(2, 0)}>{renderSortingIcon(2, 0)}{LANG === 'en' ? 'Score' : 'Puntuación'}</td>
        <td className="server-list-cell playtime-width pointer" onClick={() => handleCellClick(3, 0)}>{renderSortingIcon(3, 0)}{LANG === 'en' ? 'Time played' : 'Tiempo jugado'}</td>
      </tr>
    </thead>
    
  </table>
        
  <table className="server-list-table small-table">
    <tbody>
      {topList.length > 0 ? 
      (
        <>
        {topList.map((player, index) => (
            <tr key={index} className={index % 2 === 0 ? "server-list-row first" : "server-list-row second"}>
              <td className="server-list-cell playerrank-width">{player.rank}</td>
              <td className="server-list-cell playername-width"><Link to={`/jugador/${player.player_name}/${address}`}>{player.player_name}</Link></td>
              <td className="server-list-cell score-width">{player.score}</td>
              <td className="server-list-cell playtime-width">{formatTime(player.current_playtime, 0, 0)}</td>
            </tr>
          ))}
          </>

      ) : 
      (
        <>
        <tr className="server-list-row first">
          <td className="server-list-cell no-data-avalaible">{LANG === 'en' ? 'No info avalaible.' : 'No hay información disponible.'}</td>
        </tr>
        </>
      )

      }
    

    </tbody>
  </table>
  </div>
  </div>
  <div className="right-info">
  <div className="historical-data">{LANG === 'en' ? 'Historical data' : 'Datos históricos'}</div>
    <div className="right-info-box">
  
  <div className="data-title-details">
    <div className="data-label-type">{LANG === 'en' ? 'Favorites maps' : 'Mapas favoritos'}</div>
    <div className="data-label-time">{LANG === 'en' ? 'Last week' : 'Semana pasada'}</div>
  </div>
  {serverData.length > 0 && (
    <>
      {serverData.length > 0 && serverData[0].WeeklyMapData[0].map_data && serverData[0].WeeklyMapData[0].map_data.length > 0 ? (

<div className="chart-background">
    <div className="chart pie">
<PieChart width={400} height={300}>
    <Pie
      data={serverData[0].WeeklyMapData[0].map_data}
      cx={200}
      cy={200}
      labelLine={false}
      label={<CustomLabel />}
      outerRadius={60}
      fill="#8884d8"
      dataKey="value"
    >
      {serverData[0].WeeklyMapData[0].map_data.length > 0 && 
      <>
      {serverData[0].WeeklyMapData[0].map_data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
      </>
      }
      
    </Pie>
    <Tooltip content={<CustomTooltip />} />
  </PieChart>
  </div></div>) 
  : 
  (
    <>
    
    <div className="no-map-data">{LANG === 'en' ? 'No info avalaible' : 'No hay información disponible'}</div>
    </>
  )
   }
      
      </>)}
  
  </div>
  <div className="right-info-box chart-players-box">
  
  <div className="data-title-details">
    <div className="data-label-type">{LANG === 'en' ? 'Players' : 'Jugadores'}</div>
    <div className="data-label-time-players">{LANG === 'en' ? 'PAST' : 'PASADO'}:&nbsp;
      <span className={`${hoursSelected === 0 ? 'selected' : ''}`} onClick={() => handleHours(0)}>24 {LANG === 'en' ? 'HOURS' : 'HORAS'}</span>&nbsp;|&nbsp; 
      <span className={`${hoursSelected === 1 ? 'selected' : ''}`} onClick={() => handleHours(1)}>7 {LANG === 'en' ? 'DAYS' : 'DÍAS'}</span>
  
    </div>
  </div>
  {serverData.length > 0 && (
    <div className="chart-background chart-players">
    <div className="chart">
      { playerStats.length > 0 ?
          <LineChart width={350} height={300} data={playerStats} className="chart-margin">
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
          <XAxis dataKey={hoursSelected === 0 ? "hour" : "day"} tickFormatter={(value, index) => tickFormatter(value, index, playerStats)}/>
        
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={LANG === 'en' ? "Players" : "Jugadores"} stroke="rgba(41, 217, 145, 0.8)" activeDot={{ r: 8 }} />
        </LineChart> :
        <div className="no-map-data">{LANG === 'en' ? 'No info avalaible' : 'No hay información disponible'}</div>
      }

  </div></div>)}
  
  </div>
  <div className="right-info-box chart-players-box">
  
  <div className="data-title-details">
    <div className="data-label-type">{LANG === 'en' ? 'Server rank' : 'Rank del servidor'}</div>
    <div className="data-label-time">30 {LANG === 'en' ? 'DAYS' : 'DíAS'}&nbsp;
     </div>
  </div>
  {serverData.length > 0 && (
    <div className="chart-background chart-players">
    <div className="chart">
    <LineChart width={350} height={300} data={rankStats} className="chart-margin">
  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" vertical={false} />
  <XAxis dataKey="date" interval={0} tick={{ fontSize: 12, angle: -45 }} />

  <YAxis type="number"  domain={[200, 1]} allowDataOverflow={true}/>
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="Rank" stroke="rgba(41, 217, 145, 0.8)" activeDot={{ r: 8 }} />
</LineChart>
  </div></div>)}
  
  </div>
  </div>
  </div>
  ) : (

      
    <div className="server-404-container">
    {!isLoading &&
    <>
      <div className="server-404-title">
        <FontAwesomeIcon icon={faTimesCircle} />
        
        {invalidAddress ? 
        LANG === 'en' ? 'We couldn´t found the solicited server.' : 'No pudimos encontrar el servidor solicitado.' 
        :
        LANG === 'en' ? 'The server wasn´t found in our databases.' : 'El servidor que has solicitado no se encuentra en nuestra base de datos.'
        }
        
      </div>
      <div className="server-404">
      
        <div className="server-404-reasons">
        {invalidAddress ? 
        LANG === 'en' ? 
        (`IP:Port "${address}" is invalid.`)
        :
          (`La IP:Port solicitada "${address}" es invalida.`)
        :
        LANG === 'en' ? 
        ('We couldn`t find the solicited server. Reasons for this error:')
        :
        ('No pudimos encontrar el servidor que has solicitado. Algunas posibles razones para este error:')
          
        }</div>
        
        {!invalidAddress && 
        <ul className="server-404-lor">
          { LANG == 'en' ?
          <>
          <li>The URL of this server was bad written or incorrect.</li>
          <li>IP, or DNS and or the port of this server has changed.</li>
          <li>This server was deleted or has never been added to GameStriker.</li>
          </>
          :
          <>
          <li>La URL de este servidor estaba mal escrita o incorrecta.</li>
          <li>La dirección IP, el nombre DNS y/o el puerto de este servidor ha cambiado.</li>
          <li>Este servidor fue eliminado o aún no ha sido agregado a Argentina Strike.</li>
          </>

          }
          
        </ul>
        }
      </div>
      </>}
    </div>
    
  )}
    </main>
    
  )
}