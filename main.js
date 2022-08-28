const { Frontend } = require('./frontend/frontend.js');
const path = require('path');

const webInterface = new Frontend(path.resolve(__dirname));

webInterface.serve();