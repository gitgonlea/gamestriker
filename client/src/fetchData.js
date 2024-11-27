import axios from 'axios'

const query = ['name', 'map', 'ip'];

const order = ['rank_id', 'servername', 'numplayers', 'host', 'map'];
 
export const fetchData = async (type, oid, index, orderDirection, searchValue) => {
    try {
      let url = 'http://localhost:5000/api/v1/servers/getServers';

      if (type === 1) {
          url += `?${query[index]}=${searchValue}`;
      } else if(type === 2)
      {
        url += `?orderBy=${order[oid]}&orderDirection=${orderDirection}`;
      }
      console.log(url)

      const response = await axios.get(url);
      console.log(response.data)
      return response.data;
    } catch (error) {
      console.error('Error fetching server data:', error);
    }
};