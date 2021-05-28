<template>
  <div class="home">
    <br />
    <span>数据库名称：</span>
    <input type="text" v-model="dbName" />
    <span>仓库名称：</span>
    <input type="text" v-model="storeName" />
    <span>版本：</span>
    <input type="number" v-model="version" />
    
    <!-- <button @click="openIndexedDB">Open a DB</button> -->
    <!-- <br /><br />
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
    <p>Book list:</p> -->
  </div>
</template>

<script>

import { MyIndexedDB } from "../assets/js/IndexedDB_class.js";

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
  },
  methods: {
  },
};
</script>
