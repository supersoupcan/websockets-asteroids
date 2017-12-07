import uuid4 from 'uuid/v4';

//create unique client key
//TODO --> check local browser storage for client key

const uuid = uuid4();

const socket = new WebSocket('wss://' + window.location.hostname + '/wss/' + '?uuid=' + uuid);

socket.uuid = uuid;

export default socket;