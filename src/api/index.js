import axios from 'axios'
let headers = {
  'Content-Type': 'application/json'
}
export default {
  getParkingLots () {
    return axios.get('http://localhost:8888/parkingLots/', {headers: headers})
  },
  getParkingLotsByName (parkingLotName) {
    return axios.get(`http://localhost:8888/parkingLots/${parkingLotName}`, {headers: headers})
  },
  updateParkingLotsById (id, parkingLot) {
    return axios.put(`http://localhost:8888/parkingLots/${id}`, JSON.stringify(parkingLot), {headers: headers})
  },
  deleteParkingLotsById (id) {
    return axios.delete(`http://localhost:8888/parkingLots/${id}`, {headers: headers})
  },
  addParkingLot (parkingLot) {
    return axios.post(`http://localhost:8888/parkingLots/`, JSON.stringify(parkingLot), {headers: headers})
  }
}
