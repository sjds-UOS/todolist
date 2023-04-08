<template>
  <div id="app" :class="{ unfocused: ignoreMouse }">
    <div class="mask"></div>
    <div class="drag-nav">
      <b>{{ appName }}</b>
    </div>
    <div class="nav">
      <div class="link">
        <router-link draggable="false" to="/">Todo</router-link> |
        <router-link draggable="false" to="/done">Done</router-link>
      </div>
      <div class="tools">
        <transition-group name="fade" mode="out-in">
          <i class="iconfont icon-export" key="export" @click="exportData"></i>
          <!-- <i class="iconfont icon-eye-close" key="hide" @click="hideWindow"></i> -->

          <!-- <i
            :class="['iconfont', ignoreMouse ? 'icon-lock' : 'icon-unlock']"
            key="lock"
            @mouseenter="setIgnoreMouseEvents(false)"
            @mouseleave="setIgnoreMouseEvents(ignoreMouse)"
            @click="ignoreMouse = !ignoreMouse"
          ></i> -->

          <i :class="['iconfont', ignoreMouse ? 'icon-lock' : 'icon-unlock']" key="lock" @click="dosomething()"></i>
        </transition-group>
      </div>
    </div>
    <div class="main scrollbar scrollbar-y">
      <transition name="fade-transform" mode="out-in">
        <!-- <keep-alive> -->
        <router-view />
        <!-- </keep-alive> -->
      </transition>
    </div>
  </div>
</template>

<script>
import pkg from "../package.json";

import { ipcRenderer } from "electron";

export default {
  mounted(){
    ipcRenderer.on('send_txt', () => {
        // this.dosomething();
        this.dosomething();
      });
  },
  data() {
    return {
      appName: pkg.name,
      ignoreMouse: false, //无锁状态
      mouseX: 0,
      mouseY: 0,
    };
  },
  methods: {
    dosomething() {
      if (!this.ignoreMouse) {
        console.log("枷锁");
        ipcRenderer.invoke("setIgnoreMouseEvents", true).then(()=>{
          this.ignoreMouse = true;
          console.log(this.ignoreMouse);
        })
        
      } else {
        console.log("解锁");
        ipcRenderer.invoke("setIgnoreMouseEvents", false).then(()=>{
          this.ignoreMouse = false;
        })
        
      }


    },

  

    setIgnoreMouseEvents(ignore) {
      ipcRenderer.invoke("setIgnoreMouseEvents", ignore);//该事件通知主进程在当前窗口中是否忽略鼠标事件
    },
    exportData() {
      ipcRenderer.invoke("exportData");
    },
  },
};
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  flex-direction: column;
  // width: 100%;
  // height: 100%;
  width: 322px;
  height: 400px;
  background-color: #436d7f;
  // background:linear-gradient(to top, #86d3e4, #82cddd);
  // filter:alpha(opacity=60); /* IE8 及更早版本 */
  // background-color:rgba(0,152,50,0.1);
  // background-color: transparent;
  // opacity: 0.5;
  // backdrop-filter: blur(15px);
  border-radius: 0px;

  .mask {
    display: none;
    position: absolute;
    z-index: 999;
    width: 100%;
    height: 100%;
  }

  .drag-nav {
    -webkit-app-region: drag;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 20px;
    padding: 0 20px;
    box-sizing: border-box;
    

    b{
      width: 100%;
      color: #ffffff;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
    }
  }

  .nav {
    display: flex;
    justify-content: space-between;
    height: 26px;
    padding: 0 20px;
    color: #cccccc;
    user-select: none;

    .link {
      a {
        font-weight: bold;
        color: #cccccc;
        text-decoration: none;

        &.router-link-exact-active {
          font-size: 20px;
          color: #ffffff;
        }

        &:hover {
          color: rgba($color: #ffffff, $alpha: 0.6);
        }
      }
    }

    .tools {
      display: flex;

      i {
        font-size: 20px;
        line-height: 26px;
        padding: 0 5px;
        cursor: pointer;
      }
    }
  }

  .main {
    flex: 1;
    margin: 10px 0;
    overflow-y: auto;

    &:hover::-webkit-scrollbar-thumb {
      display: block;
    }
  }
}

#app.unfocused {
  opacity: 0.8;

  .mask {
    display: block;
  }

  .tools {
    z-index: 1000;
  }
}</style>
