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
    'image':'image/',
    'flavors':'flavors/',
    'snapshots':'snapshots/',
    'volumes':'volumes/',
    'snapshot-instance': 'snapshot-instance/',
    'snapshot-volume': 'snapshot-volume/',
    'snapshots-restore-instance':'snapshots-restore-instance/',
    'snapshots-restore-volume':'snapshots-restore-volume/',
    'routers':'routers/',
    'security-groups':'security-groups/',
    
}

export default axios.create({
    baseURL: BASE_URL
});