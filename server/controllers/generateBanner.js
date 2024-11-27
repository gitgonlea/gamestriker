const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

function truncateText(ctx, text, maxWidth) {
  let truncatedText = text;
  if (ctx.measureText(text).width > maxWidth) {
    let i;
    for (i = text.length - 1; i >= 0; i--) {
      if (ctx.measureText(text.slice(0, i)).width <= maxWidth) {
        truncatedText = text.slice(0, i) + '...';
        break;
      }
    }
  }
  return truncatedText;
}

const generateBanner = async (data, playerStats) => {

  const canvas = createCanvas(560, 95); // Set canvas dimensions
  const ctx = canvas.getContext('2d');

  let image 


  try {
     image = await loadImage(path.join(process.cwd(), 'banner.png')); // Load image from file
  } catch (err2) {
    console.error('Error loading image:', err2);
    return; 
  }


  ctx.drawImage(image, 0, 0);

  let chartBuffer
  try {
    chartBuffer = await generateChartImage(playerStats);
  } catch (err) {
    console.error('Error generating chart image:', err);
  }

  if(chartBuffer)
  {
    const chartImage = await loadImage(chartBuffer);
    ctx.drawImage(chartImage, 420, 12);
  }

  const actualPlayers = data.numplayers + '/' + data.maxplayers
  const currentRank = (data.rank_id !== undefined) ? (data.rank_id + '°') : '?';

   const textPairs = [
    { title: 'Servidor:', description: data.servername },
    { title: 'Dirección IP:', description: String(data.host) },
    { title: 'Puerto:', description: String(data.port) },
    { title: 'Estado:', description: data.online ? 'Online' : 'Offline' },
    { title: 'Jugadores:', description: actualPlayers },
    { title: 'Rank:', description: currentRank },
    { title: 'Mapa actual:', description: data.map },
    { title: 'Argentina Strike', description: 'https://argentina-strike.com'}
  ];

  const titleFontSize = 11;
  const descriptionFontSize = 12;
  const marginLeft = 115;

  const secondRowSpacing = 52
  const thirdRowSpacing = 40

  const domainTitleSpacing = 77
  const domainDescSpacing = 71

  const domainTitleFontSize = 11;
  const domainDescFontSize = 11;

  const titleColor = 'rgb(17, 186, 243)'
  const descColor = 'white'

  const onlineColor = 'rgb(41, 217, 144)'
  const offlineColor = 'rgba(249, 73, 73)'

  const numOfPlayersTitle = '# de jugadores (24 horas)'
  const numOfPlayersFont = 11
  const numOfPlayersSpacing = 69

  const noDataTitle = 'No hay información disponible'
  const noDataFont = 10.5
  const noDataSpacing = 67
  
  const lineHeight = Math.max(titleFontSize, descriptionFontSize) + 2; // Line height for text

  let currentY = lineHeight; // Initial y position

  const fontWeight = 'bold'

  ctx.shadowColor = '#000'; // Shadow color
  ctx.shadowBlur = 6; // Blur radius
  ctx.shadowOffsetX = 2; // Horizontal offset
  ctx.shadowOffsetY = 2; // Vertical offset

  // Draw "Servidor" title
  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[0].title, marginLeft, currentY);

  // Draw "Name of the server" description
  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  
  const truncatedDescription = truncateText(ctx, textPairs[0].description, 260);
  ctx.fillText(truncatedDescription, marginLeft, currentY + lineHeight);

  // Draw "IP Address" title
  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[1].title, marginLeft, currentY + lineHeight * 2.1);

  // Draw "IP Address" description
  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  ctx.fillText(textPairs[1].description, marginLeft, currentY + lineHeight * 3.1);

  // Draw "Puerto" title
  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[2].title, marginLeft + 2 * secondRowSpacing, currentY + lineHeight * 2.1);

  // Draw "Puerto" description
  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  ctx.fillText(textPairs[2].description, marginLeft + 2 * secondRowSpacing, currentY + lineHeight * 3.2);

  // Draw "Estado" title
  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[3].title, marginLeft + 4 * thirdRowSpacing, currentY + lineHeight * 2.1);

  // Draw "Estado" description
  ctx.fillStyle = textPairs[3].description === 'Online' ? onlineColor : offlineColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  ctx.fillText(textPairs[3].description, marginLeft + 4 * thirdRowSpacing, currentY + lineHeight * 3.1);
  
  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[4].title, marginLeft, currentY + lineHeight * 4.2);

  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  ctx.fillText(textPairs[4].description, marginLeft, currentY + lineHeight * 5.2);

  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[5].title, marginLeft + 2 * secondRowSpacing, currentY + lineHeight * 4.2);
  
  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  ctx.fillText(textPairs[5].description, marginLeft + 2 * secondRowSpacing, currentY + lineHeight * 5.2);

  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${titleFontSize}px Arial`;
  ctx.fillText(textPairs[6].title, marginLeft + 4 * thirdRowSpacing, currentY + lineHeight * 4.2);

  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${descriptionFontSize}px Arial`;
  ctx.fillText(textPairs[6].description, marginLeft + 4 * thirdRowSpacing, currentY + lineHeight * 5.2);
  
  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${domainTitleFontSize}px Arial`;
  ctx.fillText(textPairs[7].title, marginLeft + 4.1 * domainTitleSpacing, currentY + lineHeight * 4.6);

  ctx.fillStyle = descColor;
  ctx.font = `${fontWeight} ${domainDescFontSize}px Arial`;
  ctx.fillText(textPairs[7].description, marginLeft + 4.1 * domainDescSpacing, currentY + lineHeight * 5.5);

  ctx.fillStyle = titleColor;
  ctx.font = `${fontWeight} ${numOfPlayersFont}px Arial`;
  ctx.fillText(numOfPlayersTitle, marginLeft + 4.2 * numOfPlayersSpacing, currentY + lineHeight - 16);

  if(!chartBuffer)
  {
    ctx.fillStyle = 'rgb(255, 184, 28)';
    ctx.font = `${fontWeight} ${noDataFont}px Arial`;
    ctx.fillText(noDataTitle, marginLeft + 4.2 * noDataSpacing, currentY + lineHeight + 20);
  }

  const buffer = canvas.toBuffer('image/png');

  const serverFolderName = String(data.host + ':' + data.port)
  const serverImageName = 'argstrike_v1' + '.png';

  //const folderPath = path.join(__dirname, '..', '..', 'client', 'public', 'banners');
  //const folderPath = path.join(process.cwd());

  //const folderPath = path.join(__dirname/*, '..', '..', 'public_html', 'server_info', serverFolderName*/);

  const folderPath = path.join(__dirname, '..', '..', 'public_html', 'server_info', serverFolderName);

if (!fs.existsSync(folderPath)) {
  fs.mkdirSync(folderPath, { recursive: true });
}

  fs.writeFile(path.join(folderPath, serverImageName), buffer, (err) => {
    if (err) {
        console.error('Error writing file:', err);
        return;
    }
  });
  };

async function generateChartImage(playerStats) {
  // Create a canvas instance
  const canvas = new ChartJSNodeCanvas({ width: 99, height: 59 });

  const maxYValue = Math.max(...playerStats.map(data => parseInt(data.Jugadores)));
  const maxXValue = Math.max(...playerStats.map(data => parseInt(data.hour)));
  const sum = playerStats.reduce((total, data) => total + parseInt(data.Jugadores), 0);

  let labels, dataValues, noData;
  
if (playerStats.length < 2 || sum === 0) {
  /*const playerStatsFake = [
    { day: 1, hour: '24', Jugadores: 32 },
    { day: 1, hour: '6', Jugadores: 0 }
    // Add more objects as needed
  ];*/
  noData = true
} 
  // Use the original data
  labels = playerStats.map(data => data.hour);
  dataValues = playerStats.map(data => parseInt(data.Jugadores));


  const data = {
    labels: labels,
    datasets: [
      {
        data: dataValues,
        fill: false,
        borderColor: 'rgb(255, 184, 28)',
        borderWidth: 1,
        pointRadius: 0, // Remove the points
        pointHoverRadius: 0, // Remove the hover points
        borderCapStyle: 'butt', // Make the line ends sharper
        tension: 0.4, // Increase the tension for sharper curves
        
        
      },
    ],
  };

  // Generate the chart as an image buffer
  const imageBuffer = await canvas.renderToBuffer({
    type: 'line',
    data: data,
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        
        x: {
          max: maxXValue,
           ticks: {
            font: {
              size: 8,
          },
         
            color: 'white'
          }
       },
       
       y: {
        max: maxYValue, // Set the maximum value for the y-axis scale
        ticks: {
          font: {
            size: 8,
        },
        
          
          color: 'white',
        }
      }
    }
    }
  });

  return noData === true ? 0 : imageBuffer;
}

module.exports = {
    generateBanner
}