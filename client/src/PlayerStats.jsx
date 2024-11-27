import { Link, useParams } from "react-router-dom";
import React, { useState, useEffect } from 'react';

import axios from 'axios'

import './css/playerstats.css'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faCircleNotch
} from '@fortawesome/free-solid-svg-icons'


export default function PlayerStats() {

  const { playerName } = useParams();
  const { address } = useParams();

  const [playerData, setPlayerData] = useState([]);
  const [playerScore, setPlayerScore] = useState([]);
  const [playerTime, setPlayerTime] = useState([]);
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingChart, setIsLoadingChart] = useState(true)
  const [days, setDays] = useState(0)
  const SERVER_API = import.meta.env.VITE_SERVER_API_URL
  const LANG = import.meta.env.VITE_LANGUAGE

  const fetchData = async () => {
    try {
        const [host, port] = address.split(':');

        let url = `${SERVER_API}/api/v1/servers/getPlayerDataServer?playerName=${playerName}&host=${host}&port=${port}&days=${days}`;
        const response = await axios.get(url);
        setPlayerData(response.data.player_data);

        if (LANG === 'en') {
          response.data.player_score.Score = response.data.player_data.Puntaje;
          delete response.data.player_data.Puntaje;
        }

        setPlayerScore(response.data.player_score);

        setPlayerTime(response.data.player_time);

        console.log(response.data.player_score)
    } catch (error) {
        console.error('Error fetching server data:', error);
    }
    setIsLoadingChart(false)
    setIsLoading(false)
};

const clickDays = (value) => {

  if(days === value) 
  return 

  setIsLoadingChart(true)
  setDays(value)
}

useEffect(() => {
    
  fetchData(days);
}, [days]);

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

  let hours = date.getHours();
  let minutes = date.getMinutes();

  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; 
  minutes = minutes < 10 ? '0' + minutes : minutes; 

  const formattedDate = `${day} de ${LANG === 'en' ? monthNamesEn[monthIndex] : monthNames[monthIndex]} de ${year} - ${hours}:${minutes} ${ampm}`;

  return formattedDate;
}

function scorePerMinute(score, playtime){
  const totalScore = parseInt(score);
  const totalPlaytimeInMinutes = parseInt(playtime) / 60;

  const scorePerMinute = totalScore / totalPlaytimeInMinutes;
  
  return scorePerMinute.toFixed(2)

}

const tickFormatter = (value, index, data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return value;
  }
  if (data.length <= 4) {
    return value;
  }
  if (index % 4 !== 0) {
    return '';
  }
  return value;
};

const SimpleBarChart = ({ data, dataKey, type }) => {

  return (
    <BarChart width={350} height={250} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={days === 0 ? "hour" : "day"} tickFormatter={(value, index) => tickFormatter(value, index, data)} />
      <YAxis />
      { !isLoadingChart &&
        <Tooltip />
      }
      
      <Legend />
      <Bar dataKey={dataKey} fill="rgb(255, 184, 28)" barSize={10}/>
    </BarChart>
  );
};


  return(
    <main> {playerData.length > 0 ? (
      <div className="stats-container">
      <div className="stats-left">
      <div className="player-stats-title">
        {playerData[0].player_name} {LANG === 'en' ? 'STATISTICS' : 'ESTADISTICAS'}
      </div>
      <div className="info-player-container">
        <div className="small-title"> {LANG === 'en' ? 'Summary' : 'Resumen'}</div>
        <div>{LANG === 'en' ? 'First seen' : 'Primera vez visto:'} <span>{formatDate(playerData[0].first_seen)}</span></div>
        <div>{LANG === 'en' ? 'Last seen' : 'Última vez visto:'} <span>{formatDate(playerData[0].last_seen)}</span></div>
        <div className="small-title">{LANG === 'en' ? 'All time statistics' : 'Estadísticas de todo el tiempo'}</div>
        <div>{LANG === 'en' ? 'Score' : 'Puntuación'}: <span>{playerData[0].score}</span></div>
        <div>{LANG === 'en' ? 'Time played' : 'Minutos jugados'}: <span>{parseInt(playerData[0].playtime / 60)}</span></div>
        <div>{LANG === 'en' ? 'Score per minute' : 'Puntuación por minuto'}: <span>{scorePerMinute(playerData[0].score, playerData[0].playtime)}</span></div>
        <div>{LANG === 'en' ? 'Rank in the server' : 'Rank en el servidor'}: <span>#{playerData[0].rank_id} de #{playerData[0].rank_total}</span></div>
      </div>
      <div className="player-stats-title gap-top">
      {LANG === 'en' ? 'SERVER INFO' : 'INFORMACIÓN DEL SERVIDOR'}
      </div>
      <div className="info-player-container">
        <div className="small-title">{LANG === 'en' ? 'Summary of the server' :'Resumen del servidor'}</div>
        <div>{LANG === 'en' ? 'Servername' : 'Nombre del servidor'}: <Link to={`/servidor/${address}`}><span className="info-servername">{playerData[0].servername}</span></Link></div>
        <div>{LANG === 'en' ? 'Status' : 'Estado'}: <span className="online">{playerData[0].status ? 'Online' : 'Offline'}</span></div>
        <div>{LANG === 'en' ? 'IP Address' : 'Dirección de IP'}: <span>{playerData[0].host}</span>   Puerto: <span>{playerData[0].port}</span></div>
        <div>{LANG === 'en' ? 'Owner: Not claimed (coming soon)' : 'Dueño del servidor: Sin reclamar (próximamente)'}</div>
      </div>
     </div>
     
     
     <div className="stats-right">
      <div className="player-stats-title">
          {LANG === 'en' ? 'HISTORICAL DATA' : 'DATOS HISTÓRICOS'}
      </div>
      <div className="info-player-container-right">
        <div className="data-player-panel">
          <div className="show-data-text">{LANG === 'en' ? 'Information for' : 'Información de hace'}: </div>
          <div className="show-data-btns-container">
          <div onClick={() => clickDays(0)} className={`show-data-btn ${days === 0 ? 'active' : ''}`}>{LANG === 'en' ? '24 hours' : '24 horas'}</div>
          <div onClick={() => clickDays(7)} className={`show-data-btn ${days === 7 ? 'active' : ''}`}>{LANG === 'en' ? '7 days' : '7 dias'}</div>
          <div onClick={() => clickDays(30)} className={`show-data-btn ${days === 30 ? 'active' : ''}`}>{LANG === 'en' ? '30 days' : '30 días'}</div>
        </div>
      </div>
      <div className="player-data-chart-container">
        
        <div>
          <div className="data-info">{LANG === 'en' ? 'Score' : 'Puntuación'}:</div>
          <div className="chart-container">
          {!isLoadingChart && playerScore.length <= 0 && <div className="loading-indicator no-data-loaded">{LANG === 'en' ? 'No info avalaible' : 'No hay información disponible'}</div>}
          {isLoadingChart && <div className="loading-indicator"><FontAwesomeIcon icon={faCircleNotch} spin /></div>}
            <SimpleBarChart data={isLoadingChart ? null : playerScore} dataKey="Puntaje" type={0}/>
          </div>
          
          
          
        </div>
        <div>
          <div className="data-info">{LANG === 'en' ? 'Time played' : 'Tiempo jugado'}:</div>
          <div className="chart-container">
          {!isLoadingChart && playerTime.length <= 0 && <div className="loading-indicator no-data-loaded">{LANG === 'en' ? 'No info avalaible' : 'No hay información disponible'}</div>}
          {isLoadingChart && <div className="loading-indicator"><FontAwesomeIcon icon={faCircleNotch} spin /></div>}
            <SimpleBarChart data={isLoadingChart ? null : playerTime} dataKey="Tiempo" type={0}/>
          </div>
        </div>
      </div>
     </div>
     </div>
     </div>
    ) :

    (
      <>
      { !isLoading &&
        <div>nothing</div>
      }
      </>
    )

    }
    </main>
  )
}