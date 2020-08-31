<template>
  <div>
      <img src="../assets/parkingLotLogo.png" height="10%" width="10%" >
    <el-form :inline="true" class="search">
      <el-form-item label="parking lot name">
        <el-input v-model="parkingLotName" placeholder="parking lot name"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSerch">Search</el-button>
      </el-form-item>
    </el-form>
    <div style="width: 66%; margin: auto; text-align:left">
      <el-button type="success" size="small" @click="addParkingLot()">Add</el-button>
    </div>
      <el-table
    :data="parkingLots"
    style="width: 66%; margin: auto">
    <el-table-column
      label="Name"
      min-width="31%">
      <template slot-scope="scope">
        <i class="el-icon-s-flag"></i>
        <span style="margin-left: 10px">{{ scope.row.name }}</span>
      </template>
    </el-table-column>
    <el-table-column
      label="Detail Address"
      min-width="35%">
      <template slot-scope="scope">
        <el-popover trigger="hover" placement="top">
          <p>Name: {{ scope.row.name }}</p>
          <p>Detail Address: {{ scope.row.address }}</p>
          <p>Space Remainder: {{ scope.row.parkingSpaceRemainder }}</p>
          <div slot="reference" class="name-wrapper">
            <i class="el-icon-map-location"></i>
            <el-tag size="medium">{{ scope.row.address }}</el-tag>
          </div>
        </el-popover>
      </template>
    </el-table-column>
        <el-table-column label="Remainder" min-width="12%">
      <template slot-scope="scope">
        <i class="el-icon-full-screen"></i>
        <span>{{ scope.row.parkingSpaceRemainder }}</span>
      </template>
    </el-table-column>
    <el-table-column label="operate" min-width="22%">
      <template slot-scope="scope">
        <el-button
          size="mini"
          @click="updateParkingLot(scope.$index, scope.row)">Update</el-button>
        <el-button
          size="mini"
          type="danger"
          @click="deleteParkingLot(scope.$index, scope.row)">Delete</el-button>
      </template>
    </el-table-column>
  </el-table>
  <div class="block" style="margin-top:20px;">
    <el-pagination
    background
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage"
    :page-sizes="[2, 4, 6, 8, 10]"
    :page-size="pageSize"
    layout="total, sizes,prev, pager, next, jumper"
    :total="total">
    </el-pagination>
</div>
  <el-dialog :title="dialogTitle" :visible.sync="parkingLotInfoVisible" width="45%" @close='cancelDialog()'>
    <el-form :model="parkingLotInfo" label-width="120px" :rules="parkingLotInfoRule" ref="parkingLotInfo">
      <el-form-item label="Name" prop="name">
        <el-input v-model="parkingLotInfo.name" placeholder="parking lot name" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="Detail Address" prop="address">
        <el-input v-model="parkingLotInfo.address" placeholder="parking lot detail address" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="Capacity" prop="parkingSpaceCapacity">
        <el-input v-model="parkingLotInfo.parkingSpaceCapacity" placeholder="parking lot capacity" autocomplete="off"></el-input>
      </el-form-item>
      <el-form-item label="Remainder" prop="parkingSpaceRemainder">
        <el-input v-model="parkingLotInfo.parkingSpaceRemainder" placeholder="parking lot remainder" autocomplete="off"></el-input>
      </el-form-item>
    </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button @click="cancelDialog()">Cancel</el-button>
            <el-button v-if="isAddParkingLot" type="primary" @click="confirmAdd('parkingLotInfo')">Confirm</el-button>
            <el-button v-if="isUpdateParkingLot" type="primary" @click="confirmUpdate('parkingLotInfo')">Confirm</el-button>
          </span>
  </el-dialog>
  </div>
</template>

<script>
import api from '../api/index'
export default {
  name: 'Search',
  data () {
    var checkName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Parking lot name should be not null'))
      } else {
        callback()
      }
    }
    var checkAddress = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Parking lot name should be not null'))
      } else {
        callback()
      }
    }
    var checkParkingSpaceCapacity = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Parking lot name should be not null'))
      } else {
        callback()
      }
    }
    var checkParkingSpaceRemainder = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('Parking lot name should be not null'))
      } else {
        callback()
      }
    }
    return {
      websock: null,
      parkingLotInfoRule: {
        name: [{validator: checkName, trigger: 'blur'}],
        address: [{validator: checkAddress, trigger: 'blur'}],
        parkingSpaceCapacity: [{validator: checkParkingSpaceCapacity, trigger: 'blur'}],
        parkingSpaceRemainder: [{validator: checkParkingSpaceRemainder, trigger: 'blur'}]
      },
      parkingLots: [],
      indexOfParkingLots: '',
      pageSize: 2,
      currentPage: 1,
      total: 0,
      parkingLotName: '',
      parkingLotInfo: {
        id: '',
        name: '',
        address: '',
        parkingSpaceCapacity: '',
        parkingSpaceRemainder: ''
      },
      dialogTitle: '',
      parkingLotInfoVisible: false,
      isAddParkingLot: false,
      isUpdateParkingLot: false
    }
  },
  mounted () {
    this.getParkingLots()
  },
  created () {
    this.initWebSocket()
  },
  destroyed () {
    this.websock.close() // 离开路由之后断开websocket连接
  },
  methods: {
    handleSizeChange (val) {
      this.pageSize = val
      this.getParkingLots()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.getParkingLots()
    },
    addParkingLot () {
      this.parkingLotInfoVisible = true
      this.dialogTitle = 'add parking lot'
      this.isAddParkingLot = true
    },
    updateParkingLot (index, row) {
      this.indexOfParkingLots = index
      this.dialogTitle = 'update parking lot'
      this.parkingLotInfo = Object.assign({}, row)
      this.parkingLotInfoVisible = true
      this.isUpdateParkingLot = true
      console.log(row)
    },
    confirmAdd (parkingLotInfo) {
      this.$refs[parkingLotInfo].validate(valid => {
        if (valid) {
          api.addParkingLot(this.parkingLotInfo).then(res => {
            if (res.status === 201) {
              this.$message.success('Add success')
              this.getParkingLots()
              this.cancelDialog()
            }
          }).catch(e => {
            console.log(e)
          })
        } else {
          console.log('error submit!!')
        }
      })
    },
    confirmUpdate (parkingLotInfo) {
      this.$refs[parkingLotInfo].validate(valid => {
        if (valid) {
          api.updateParkingLotsById(this.parkingLotInfo.id, this.parkingLotInfo).then(res => {
            if (res.status === 200) {
              this.$message.success('Update success')
              this.parkingLots[this.indexOfParkingLots].name = this.parkingLotInfo.name
              this.parkingLots[this.indexOfParkingLots].address = this.parkingLotInfo.address
              this.parkingLots[this.indexOfParkingLots].parkingSpaceRemainder = this.parkingLotInfo.parkingSpaceRemainder
              this.cancelDialog()
            }
          }).catch(e => {
            console.log(e)
          })
        } else {
          console.log('error submit!!')
        }
      })
    },
    deleteParkingLot (index, row) {
      this.$confirm('Are you sure to delete it?', 'prompt', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning'
      }).then(() => {
        console.log(row)
        api.deleteParkingLotsById(row.id).then(res => {
          if (res.status === 200) {
            this.$message.success('Delete success')
            this.parkingLots.splice(index, 1)
          } else {
            this.$message.console.error('Delete failed')
          }
        })
      }).catch(() => {
      })
      console.log('handleDelete!')
    },
    cancelDialog () {
      this.parkingLotInfoVisible = false
      this.isAddParkingLot = false
      this.isUpdateParkingLot = false
      this.parkingLotInfo = {}
    },
    onSerch () {
      this.currentPage = 1
      this.getParkingLots()
    },
    getParkingLots () {
      api.getParkingLots(this.pageSize, this.currentPage, this.parkingLotName).then(res => {
        if (res.status === 200) {
          this.parkingLots = res.data.content
          this.total = res.data.totalElements
        }
      }).catch(e => {
        console.log(e)
      })
    },
    initWebSocket () { // 初始化weosocket
      const wsuri = 'ws://127.0.0.1:8888/websocket'; this.websock = new WebSocket(wsuri); this.websock.onmessage = this.websocketonmessage; this.websock.onopen = this.websocketonopen; this.websock.onerror = this.websocketonerror; this.websock.onclose = this.websocketclose
    },
    websocketonopen () { // 连接建立之后执行send方法发送数据
      let actions = {'test': '12345'}; this.websocketsend(JSON.stringify(actions))
    },
    websocketonerror () { // 连接建立失败重连
      this.initWebSocket()
    },
    websocketonmessage (e) { // 数据接收
      const redata = JSON.parse(e.data)
      console.log(redata)
    },
    websocketsend (Data) { // 数据发送
      this.websock.send(Data)
    },
    websocketclose (e) { // 关闭
      console.log('断开连接', e)
    }
  }
}
</script>
<style scoped>
 .search {
     cursor: pointer;
     margin-top: 20px;
 }
</style>
