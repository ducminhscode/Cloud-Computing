import axios from "axios"

const BASE_URL = 'http://localhost:8000/'


export const endpoints = {
    'login': 'login/',
    'nova': 'nova/',
    'neutron': 'neutron/',
    'glance': 'glance/',
    'instances': 'instances/',
    'register': 'register/',
    'networks': 'networks/',
}

export default axios.create({
    baseURL: BASE_URL
});