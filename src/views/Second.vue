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
    <br>
    <button @click="deleteStore">Delete Store</button>

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
    },
    addData() {
      let data = {
        id: 1,
        groupId: 1,
        title: "这是一个博客",
        addTime: "2020-10-15",
        introduction: "这是博客简介",
        concent: "这是博客的详细内容<br>第二行",
        viewCount: 1,
        agreeCount: 1,
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
    deleteStore(){
        this.db.deleteStore(this.storeName);
    }
  },
};
</script>
