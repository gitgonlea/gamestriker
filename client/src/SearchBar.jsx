import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

const LANG = import.meta.env.VITE_LANGUAGE

const variablesArray = [
  "admanager_version",
  "_tutor_bomb_viewable_check_interval",
  "_tutor_debug_level",
  "_tutor_examine_time",
  "_tutor_hint_interval_time",
  "_tutor_look_angle",
  "_tutor_look_distance",
  "_tutor_message_character_display_time_coefficient",
  "_tutor_message_minimum_display_time",
  "_tutor_message_repeats",
  "_tutor_view_distance",
  "allow_spectators",
  "amx_client_languages",
  "amx_language",
  "amx_nextmap",
  "amx_timeleft",
  "amxbans_version",
  "amxmodx_version",
  "coop",
  "deathmatch",
  "decalfrequency",
  "dedicated",
  "dp_version",
  "edgefriction",
  "game_description",
  "game_directory",
  "hostage_debug",
  "hostage_stop",
  "humans_join_team",
  "jtp10181",
  "max_queries_sec",
  "max_queries_sec_global",
  "max_queries_window",
  "metamod_version",
  "mod_has_client_dll",
  "mod_is_server_only",
  "mod_size",
  "mod_version",
  "mp_allowmonsters",
  "mp_autokick",
  "mp_autoteambalance",
  "mp_buytime",
  "mp_c4timer",
  "mp_chattime",
  "mp_consistency",
  "mp_fadetoblack",
  "mp_flashlight",
  "mp_footsteps",
  "mp_forcecamera",
  "mp_forcechasecam",
  "mp_fragsleft",
  "mp_freezetime",
  "mp_friendlyfire",
  "mp_ghostfrequency",
  "mp_hostagepenalty",
  "mp_kickpercent",
  "mp_limitteams",
  "mp_logdetail",
  "mp_logfile",
  "mp_logmessages",
  "mp_mapvoteratio",
  "mp_maxrounds",
  "mp_mirrordamage",
  "mp_playerid",
  "mp_roundtime",
  "mp_startmoney",
  "mp_timeleft",
  "mp_timelimit",
  "mp_tkpunish",
  "mp_windifference",
  "mp_winlimit",
  "pausable",
  "protocol_version",
  "reply_format",
  "suggested_players",
  "sv_accelerate",
  "sv_aim",
  "sv_airaccelerate",
  "sv_airmove",
  "sv_allowupload",
  "sv_alltalk",
  "sv_bounce",
  "sv_cheats",
  "sv_clienttrace",
  "sv_clipmode",
  "sv_contact",
  "sv_gravity",
  "sv_logblocks",
  "sv_maxrate",
  "sv_maxspeed",
  "sv_minrate",
  "sv_password",
  "sv_proxies",
  "sv_region",
  "sv_restartround",
  "sv_stepsize",
  "sv_stopspeed",
  "sv_uploadmax",
  "sv_voiceenable",
  "sv_wateraccelerate",
  "version"
];

const SearchBar = ({ selectedValue, handleChange, handleChangeSearch, searchValue, handleClickSearch, isVariable, onVariableChange}) => {

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleClickSearch(selectedVar);
    }
  };

  if (isVariable && !variablesArray.includes(isVariable)) {

    if (isVariable.includes('=')) {

      return
    }

    variablesArray.push(isVariable);
  }

  const [selectedVar, setSelectedVar] = useState('admanager_version');

  const handleChangeVar = (event) => {
    const newValue = event.target.value;
    setSelectedVar(newValue);

    onVariableChange(newValue);
    
  };

  useEffect(() => {
    if (isVariable) {
    setSelectedVar(isVariable ? isVariable : 'coop');
    }
  }, [isVariable]);

  return (
    <div className="search-bar-container">
        
  <div className="search-bar">
    <div className="search-bar-item">
      <div>{LANG === 'en' ? 'Search by...' : 'Buscar por...'}</div>
      <select value={selectedValue} onChange={handleChange}>
    <option value="0">{LANG === 'en' ? 'Servername' : 'Nombre del servidor'}</option>
    <option value="1">{LANG === 'en' ? 'Mapname' : 'Mapa del servidor'}</option>
    <option value="2">{LANG === 'en' ? 'IP address' : 'IP del servidor'}</option>
    <option value="3">{LANG === 'en' ? 'Player' : 'Jugador'}</option>
    <option value="4">{LANG === 'en' ? 'Online Players' : 'Jugadores activos'}</option>
    <option value="5">{LANG === 'en' ? 'Server variables' : 'Variables del servidor'}</option>
  </select>
  </div>
  { parseInt(selectedValue) === 5 &&
  <div className="search-bar-item variables">
  <div>Variable...</div>
  <select value={selectedVar} onChange={handleChangeVar}>
    {variablesArray.map((value, index) => (
            <option key={index} value={value}>{value}</option>
    ))}
  </select>
  </div>
  }
    <div className="search-bar-item">
      <input
      type="text"
      name="search"
      placeholder={LANG === 'en' ? "Search..." : "Buscar..."}
      value={searchValue}
      onChange={handleChangeSearch}
      onKeyDown={handleKeyDown}
      />
    </div>
    <div className="search-bar-item btn" onClick={() => handleClickSearch(selectedVar)}>
    <FontAwesomeIcon icon={faSearch}/>
    </div>
  </div>
  </div>
  )
  
};

export default SearchBar;
