//  indexedDB 学习使用
import { openDB, deleteDB, wrap, unwrap } from 'idb';
export function createIndexedDB() {

}

export function MyIndexedDB() {
    var instance;
    MyIndexedDB = function MyIndexedDB() {
        return instance;
    }
    MyIndexedDB.prototype = this; // 保留原有属性
    instance = new MyIndexedDB();
    instance.constructor = MyIndexedDB; // 重置构造函数指针

    instance.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    instance.transaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || { READ_WRITE: "readwrite" }
    instance.keyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    return instance;
}

export async function openedDB() {
    let instance = new MyIndexedDB();
    let indexedDB = instance.indexedDB;
    let openRequest = await indexedDB.open("BooksDB", 1);
    // let promise = new Promise()
    openRequest.onupgradeneeded = function(event) {
        // 如果客户端没有数据库或者版本过低 则触发
        console.log(`旧的数据库版本：${event.oldVersion}`);
        let db = event.target.result;
        if (!db.objectStoreNames.contains("books")) {
            // 如果没有books 数据
            //   db.createObjectStore("books", { keyPath: "id" }); // 创建books对象
            db.createObjectStore("books", { keyPath: "id" });
        }
    };
    openRequest.onsuccess = function(event) {
        console.log("数据库准备就绪！");
        let db = event.target.result;
        db.onversionchange = function() {
            db.close();
            alert("Database is outdated, please reload the page!");
        };
        db.onerror = function(event) {
            let request = event.target;
            debugger;
            console.log("Error:", request.error);
        };
        let transaction = db.transaction("books", "readwrite"); // 事务

        let books = transaction.objectStore("books"); // 获取对象库
        let book = {
            id: "html",
            price: 30,
            created: new Date(),
        };
        let request = books.add(book);
        request.onsuccess = function(event) {
            console.log("Book added to the store:", event.target.result);
        };
        request.onerror = function(event) {
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
        transaction.oncomplete = function(event) {
            // 监听事务执行结束
            console.log("Transaction is completed!");
        };
        transaction.onabort = function(event) {
            // 监听事务终止
            console.log("Error:", event.target.error);
        };
    };
    openRequest.onerror = function(event) {
        // console.error("Error", openRequest.error);
        console.log("数据库打开失败");
    };
    openRequest.onblocked = function() {
        // 处理旧链接未被关闭的情况
        // 如果正确的处理了onversionchange 事件，则该事件就不该触发
        // 这意味着还有另一个指向同一数据库的链接
        // 并且在 db.onversionchange 被触发后，该链接没有被关闭
    };
}