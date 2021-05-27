<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <!-- <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <br />
    <span>数据库名称：</span>
    <input type="text" v-model="dbName" />
    <span>仓库名称：</span>
    <input type="text" v-model="storeName" />
    <button @click="openIndexedDB">Open a DB</button>
    <br /><br />
    <button @click="addData">Add Data</button>
    <br /><br />
    <button @click="updateData">update Data</button>
    <br /><br />
    <button @click="deleteData">delete Data</button>
    <br /><br />
    <button @click="clearStore">Clear Store</button>
    <br /><br />
    <button @click="removeIndexedDB">Remove IndexedDB</button>
    <br /><br />
    <input type="text" v-model="search" />
    <br /><br />
    <button @click="queryData">Search 查询</button>

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
  updateData,
  deleteData,
  clearStore,
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
      openDB(this.dbName, this.storeName, 2).then((db) => {
        this.db = db;
      });
    },
    // 添加数据
    addData() {
      let data = {
        id: "js",
        name: "js 简书",
        price: 40,
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
      updateData(this.db, "books", data);
    },
    // 删除数据
    deleteData() {
      let key = this.search;
      deleteData(this.db, "books", key);
    },


    // 查询数据
    queryData() {
      // 根据条件搜索
      if (this.search) {
        // getDataByKey(this.db, this.storeName, this.search).then((data) => {
        //   debugger;
        //   console.log(data);
        // });
        // getDataByIndex(this.db, this.storeName, "price", this.search).then((data) => {
        //   debugger;
        //   console.log(data);
        // });
        let keyRange =
          window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
        let query = keyRange.upperBound(this.search);
        cursorGetData(this.db, this.storeName, query).then((data) => {
          console.log(data);
        });
      }
    },
    // 清空指定数据库
    clearStore(){
        if (this.search) {
            clearStore(this.db,this.search);
        }
    },

    // 创建
    addBook() {
      return;
      //   let indexDB = new MyIndexedDB();
      let instance = new MyIndexedDB();
      let indexedDB = instance.indexedDB;
      let openRequest = indexedDB.open("BooksDB", 1);
      openRequest.onupgradeneeded = function (event) {
        // 如果客户端没有数据库或者版本过低 则触发
        console.log(`旧的数据库版本：${event.oldVersion}`);

        // switch (
        //   event.oldVersion // 现有的 db 版本
        // ) {
        //   case 0:
        //   // 版本 0 表示客户端没有数据库
        //   // 执行初始化
        //   case 1:
        //   // 客户端版本为 1
        //   // 更新
        // }

        let db = event.target.result;
        if (!db.objectStoreNames.contains("books")) {
          // 如果没有books 数据
          //   db.createObjectStore("books", { keyPath: "id" }); // 创建books对象
          db.createObjectStore("books", { keyPath: "id" });
        }

        debugger;
      };
      openRequest.onsuccess = function (event) {
        console.log("数据库准备就绪！");
        let db = event.target.result;
        db.onversionchange = function () {
          db.close();
          alert("Database is outdated, please reload the page!");
        };
        db.onerror = function (event) {
          let request = event.target;
          debugger;
          console.log("Error:", request.error);
        };
        let transaction = db.transaction("books", "readwrite");
        let books = transaction.objectStore("books"); // 获取对象库
        let book = {
          id: "html",
          price: 30,
          created: new Date(),
        };
        this.books = books;
        let request = books.add(book);
        request.onsuccess = function (event) {
          console.log("Book added to the store:", event.target.result);
        };
        request.onerror = function (event) {
          // add 在相同id存在的情况下，发生ConstraintError
          if (event.target.error.name == "ConstraintError") {
            console.log("Error:", event.target.error);
            event.preventDefault(); // 防止事务终止
            event.stopPropagation(); // 停止错误冒泡，阻止其冒泡传播
          } else {
            // 意外错误
            // 事务终止执行
          }
        };
        transaction.oncomplete = function (event) {
          // 监听事务执行结束
          console.log("Transaction is completed!");
        };
        transaction.onabort = function (event) {
          // 监听事务终止
          console.log("Error:", event.target.error);
        };

        debugger;
      };
      openRequest.onerror = function (event) {
        // console.error("Error", openRequest.error);
        console.log("数据库打开失败");
        debugger;
      };
      openRequest.onblocked = function () {
        // 处理旧链接未被关闭的情况
        // 如果正确的处理了onversionchange 事件，则该事件就不该触发
        // 这意味着还有另一个指向同一数据库的链接
        // 并且在 db.onversionchange 被触发后，该链接没有被关闭
      };
    },

    removeIndexedDB() {
      // 删除当前数据库
      let instance = new MyIndexedDB();
      let indexedDB = instance.indexedDB;
      let deleteRequest = indexedDB.deleteDatabase("BooksDB");
      deleteRequest.onsuccess = function () {
        console.log("数据库删除成功！");
      };
      deleteRequest.onerror = function () {
        console.log("数据库删除失败！");
      };
    },
  },
};
</script>
