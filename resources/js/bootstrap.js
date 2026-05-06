/**
 * This file bootstrap the application.
 * For now, we just import axios and set up global config.
 */
import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';