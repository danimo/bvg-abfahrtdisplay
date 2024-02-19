setInterval(function() {
  console.log("reloading time table...")
  getTimeTable();
}, 1000 * 30);

let stop = {};

window.addEventListener('load', function() {
  getStop();
});

function formatDelay(delay) {
  if (Math.round(delay) === 0) {
    return "";
  }
  let delayStr = Math.round(delay / 60).toString();
  let delayType = "delayEarly";
  if (delay > 0) {
    delayStr = `+${delayStr}`;
    delayType = "delayLate";
  }

  return `(<span class="${delayType}">${delayStr}</span>)`;
}

function formatPlatform(platform) {
  if (platform === null)
    return "-";
  return platform;
}

function relativeDeparture(departureTime) {
  return Math.round(Math.abs(new Date(departureTime) - Date.now()) / (1000 * 60));
}

function departureIsNow(departureTime) {
	return relativeDeparture(departureTime) === 0;
}

function formatDeparture(departureTime, departureDelay) {
    
    if (departureIsNow(departureTime)) {
      return `<span class="nowTime">now</span>`;
    } else {
    	return `<span class="min">${relativeDeparture(departureTime)}</span> min ${formatDelay(departureDelay)}`;
    }
}

function createLineElement(line) {
  let lineInner = document.createElement('span');
  lineInner.innerHTML = line.name;
  lineInner.className = `product ${line.product}`;
  return lineInner;
}

async function getStop() {
  //const queryString = "wedekindstr";
  const queryString = "warschauer+str+gruenberger+str";
  //const queryString = "Hbf";
  const response = await fetch(`https://v6.bvg.transport.rest/locations?query=${queryString}&results=1&?linesOfStops=true`);
  const json = await response.json();
  stop = json[0];
  document.getElementById("stopName").innerHTML = stop.name;
  console.log(json);
  getTimeTable();
}

async function getTimeTable() {
  let departuresTable = document.createElement("table");
  //departuresTable.id = "departuresTable";

  let header = departuresTable.insertRow(-1);
  header.className = "tableHeader";
  for (const headLine of ["Departure", "Line", "Direction / Destination", "Platform"]) {
    let th = document.createElement('th');
    th.innerHTML = headLine;
    header.appendChild(th);
  }

  const response = await fetch(`https://v6.bvg.transport.rest/stops/${stop.id}/departures?results=10&duration=120`);
  const json = await response.json();
  for (let departure of json.departures) {
    //console.log(departure);
    let row = departuresTable.insertRow(-1);
    if (departureIsNow(departure.when)) {
	    row.className="now";
    }
    let date = row.insertCell(0);
    date.innerHTML = formatDeparture(departure.when, departure.delay);
    let line = row.insertCell(1);
    line.appendChild(createLineElement(departure.line))
    let direction = row.insertCell(2);
    direction.innerHTML = departure.direction;
    direction.className = "departure";
    let platform = row.insertCell(3);
    platform.innerHTML = formatPlatform(departure.platform);
  }

  let container = document.getElementById("departuresTableContainer");
  container.replaceChild(departuresTable, container.childNodes[0]);
}

