<template>
  <div class="home">
    <br />
    <span>数据库名称：</span>
    <input type="text" v-model="dbName" />
    <span>仓库名称：</span>
    <input type="text" v-model="storeName" />
    <span>版本：</span>
    <input type="number" v-model="version" />
    <button @click="openIndexedDB">Open a DB</button>
    <br />
    <button @click="addData">添加数据</button>
    <br />
    <button @click="updateData">更新数据</button>
    <br />
    <button @click="clearStore">清空仓库</button>
    <br />
    <button @click="deleteStore">Delete Store</button>
    <br />
    <button @click="deleteDataBase">删除数据库</button>
    <br />
    <span>主键：</span>
    <input type="text" v-model="mainKey" />
    <button @click="getDataWithKey">主键获取对象</button>
    <br />
    <button @click="findObject">查找数据</button>
    <!--
    <br />
    <button @click="deleteData">delete Data</button>
    <br /><br />
    <span>索引名称：</span>
    <input type="text" v-model="indexName" />
    <span>索引值：</span>
    <input type="text" v-model="indexValue" />
    <button @click="cursorDeleteData">cursor delete Data</button>
    <br /><br />
    <button @click="clearStore">Clear Store</button>
    <br /><br />
    <button @click="deleteStore">Delete Store</button>
    <br /><br />

    <input type="text" v-model="search" />
    <br /><br />
    <button @click="queryData">Search 查询</button>
    <br /><br />
    <button @click="closeDataBase">关闭数据库</button>
    <br />

    <span>数据库名称：</span>
    <input type="text" v-model="dbName" />
    <button @click="deleteDatabase">删除数据库</button>
    <p>Book list:</p> -->
  </div>
</template>

<script>
import { MyIndexedDB } from "../assets/js/IndexedDB_class.js";

export default {
  name: "Home",
  data() {
    return {
      db: undefined,
      dbName: "BooksDB", // 数据库名称
      storeName: "shopping cart", // 仓库名称
      version: 1, // 数据库版本
      indexName: "", // 索引名称
      indexValue: "", // 索引值
      mainKey: "", // 主键
      objectStores: {
        objectStoreName: "shopping cart",
        index: [
          // 索引
          // unique 是否可以重复
          // multiEntry 值是数组才时使用 默认false, 当 true 以数组成员作为索引键，
          { name: "groupId", option: { unique: false, multiEntry: true } },
          { name: "price", option: { unique: false } },
        ],
      },
    };
  },
  components: {},
  methods: {
    openIndexedDB() {
      this.db = new MyIndexedDB(this.dbName, this.objectStores, this.version);
      this.db.openDB();
    },
    addData() {
      let data = {
        id: 5,
        groupId: 5,
        title: "jjfjf",
        addTime: new Date(),
        introduction: "扣刷卡缴费",
        concent: "看看书，开口说，(^o^)/~o",
        viewCount: 35,
        agreeCount: 10,
        price: "50￥",
      };
      this.db.addObject(this.storeName, data);
    },
    updateData() {
      let data = {
        id: 1,
        price: "70￥",
      };
      this.db.updateObject(this.storeName, data);
    },
    clearStore() {
      this.db.clearStore(this.storeName);
    },
    deleteStore() {
      this.db.deleteStore(this.storeName);
    },
    deleteDataBase() {
      this.db.deleteDB(this.dbName);
    },
    getDataWithKey() {
      this.db.getObjectWithKey(this.storeName, this.mainKey).then((data) => {
        console.log(data);
      });
    },
    findObject() {
      let findInfo = {
        indexName: "groupId", // 索引名称
        indexValue: 5, // 索引值
        indexKind: "<=", // '>','>=','<','<=','between' 索引方式,
        betweenInfo: {
          lower: 2,
          upper: 4,
          lowerOpen: false,
          upperOpen: true,
        },
        where: (object) => {
          if (object.viewCount < 10) {
            return true;
          }
          return false;
        },
      };
      let page = {
        start: 0,
        count: 10,
        description: "next",
      };

      this.db.findObject(this.storeName, findInfo, page).then((data) => {
        console.log(data);
      });
    },
  },
};
</script>
