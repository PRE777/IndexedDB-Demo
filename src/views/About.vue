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
    <br /><br />
    <button @click="addData">Add Data</button>
    <br /><br />
    <button @click="updateData">update Data</button>
    <br /><br />
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
    <p>Book list:</p>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import "../assets/js/Test1";
// import { MyIndexedDB } from "../assets/js/IndexedDB_c.js";

import {
  openDB,
  addData,
  updateObject,
  deleteDataWithKey,
  cursorDeleteData,
  clearStore,
  deleteStore,
  closeDB,
  deleteDB,
  getDataByKey,
  getDataByIndex,
  cursorGetData,
} from "../assets/js/IndexedDB.js";
export default {
  name: "Home",
  data() {
    return {
      dbName: "BooksDB", // 数据库名称
      storeName: "books", // 仓库名称
      version: 1, // 数据库版本
      indexName: "", // 索引名称
      indexValue: "", // 索引值
      search: "",
      books: undefined,
      db: undefined,
    };
  },
  components: {
    HelloWorld,
  },
  methods: {
    openIndexedDB() {
      openDB(this.dbName, this.storeName, this.version).then((db) => {
        this.db = db;
      });
    },
    // 添加数据
    addData() {
      let data = {
        id: "css",
        name: "css 简书",
        price: "25",
        create: new Date(),
      };
      addData(this.db, this.storeName, data);
    },
    // 更新数据
    updateData() {
      let data = {
        id: "tss",
        name: "ts 简书",
        price: 85,
        create: new Date(),
      };
      updateObject(this.db, this.storeName, data);
    },
    // 删除数据
    deleteData() {
      let key = this.search;
      deleteDataWithKey(this.db, this.storeName, key); // 通过主键删除
    },
    // 游标索引删除数据
    cursorDeleteData() {
      cursorDeleteData(
        this.db,
        this.storeName,
        this.indexName,
        this.indexValue
      );
    },
    // 查询数据
    queryData() {
      // 根据条件搜索
      let query = null;
      if (this.search) {
        let keyRange =
          window.IDBKeyRange ||
          window.webkitIDBKeyRange ||
          window.msIDBKeyRange;
        query = keyRange.upperBound(this.search);
      }

      // getDataByKey(this.db, this.storeName, this.search).then((data) => {
      //   console.log(data);
      // });

      getDataByIndex(
        this.db,
        this.storeName,
        this.indexName,
        this.indexValue
      ).then((data) => {
        debugger;
        console.log(data);
      });

      // cursorGetData(this.db, this.storeName, query).then((data) => {
      //   console.log(data);
      // });
    },
    // 清空指定数据库
    clearStore() {
      if (this.search) {
        clearStore(this.db, this.search);
      }
    },
    // 删除仓库
    deleteStore() {
      deleteStore(this.db, this.storeName);
    },
    //关闭数据库
    closeDataBase() {
      closeDB(this.db);
    },
    // 删除数据库
    deleteDatabase() {
      deleteDB(this.dbName);
    },
  },
};
</script>
