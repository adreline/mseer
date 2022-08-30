const { Frontend } = require('./frontend/frontend.js');
const path = require('path');
global.documentRoot = path.resolve(__dirname);

const webInterface = new Frontend();

webInterface.serve();