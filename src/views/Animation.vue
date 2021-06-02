<template>
  <div class="home">
    <div id="e"></div>

    <br />
    <br />

    <table border="1">
      <tr>
        <th>星期一</th>
        <th>星期二</th>
        <th>星期三</th>
      </tr>
      <tr>
        <td colspan="3">星期天</td>
      </tr>
    </table>

    <button @click="getLocationPosition">获取经纬度</button>
    <br />
    <button @click="objectDeepClone">深拷贝</button>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  mounted() {
    this.animationRun();
  },
  methods: {
    animationRun() {
      var e = document.getElementById("e");
      var flag = true;
      var left = 0;
      var rafId = null;
      let nowTime = 0; // 当前时间
      let lastTime = Date.now(); // 记录每次动画执行结束的时间
      let diffTime = 30; // 自定义动画时间差
      function render() {
        if (flag == true) {
          if (left >= 100) {
            flag = false;
          }
          e.style.left = `${left++}px`;
        } else {
          if (left <= 0) {
            flag = true;
          }
          e.style.left = `${left--}px`;
        }
      }

      // (function animloop() {
      //   render();
      //   rafId = requestAnimationFrame(animloop);
      //   //如果left等于50 停止动画
      //   if (left == 70) {
      //   //   cancelAnimationFrame(rafId);
      //   }
      // })();

      (function animloop() {
        // 记录当前时间
        nowTime = Date.now();
        // 当前时间-上次执行时间如果大于 diffTime ，那么执行动画，并更新上次执行时间
        if (nowTime - lastTime > diffTime) {
          lastTime = nowTime;
          render();
        }
        rafId = requestAnimationFrame(animloop);
        //如果left等于50 停止动画
        if (left == 70) {
          //   cancelAnimationFrame(rafId);
        }
      })();
    },
    getLocationPosition() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            debugger;
            let getLongitude = position.coords.longitude;
            let getLatitude = position.coords.latitude;
            console.log(`经度：${getLongitude}, 纬度：${getLatitude}`);
          },
          (error) => {
            debugger;
            var errorType = [
              "您拒绝共享位置信息",
              "获取不到位置信息",
              "获取位置信息超时",
            ];
            alert(errorType[error.code - 1]);
          }
        );
      }
    },
    objectDeepClone() {
      let obj = {
        name: "Tom",
        age: 12,
        school: {
          name: "清华",
          address: "北京",
        },
        other: [
          [1, 2],
          [3, 4],
        ],
      };
      //   obj = ["0", 1, 2, 3, 4];
      let newObj = this.deepClone(obj);
      obj["name"] = "Jack";
      debugger;
    },
    deepClone(object) {
      let newObject = object instanceof Array ? [] : {};
      for (const item in object) {
        let temp =
          typeof object[item] == "object"
            ? this.deepClone(object[item])
            : object[item];
        newObject[item] = temp;
      }
      return newObject;
    },
  },
};
</script>

<style lang="scss" scoped>
#e {
  width: 100px;
  height: 100px;
  background: red;
  position: absolute;
  left: 0;
  top: 0;
  zoom: 1;
}
</style>