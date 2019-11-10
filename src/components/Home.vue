<template>
  <el-container class="home_container">
    <el-header>
      <div class="left">
        <img src="../assets/heima.png" alt />
        <h3>电商管理后台</h3>
      </div>
      <div class="right">
        <el-button type="primary" @click="logout">退出</el-button>
      </div>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse?'64px':'200px'">
        <a href="javascript:;" class="toggle-button" @click="toggleCollapse">|||</a>
        <el-menu background-color="#373d41" text-color="#fff"  :unique-opened="true" :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
         <!-- 一级菜单 -->
         <!-- 这里的Index值接收字符串，不接受数值，所以要转换成字符串 -->
          <el-submenu :index="item.id+''" v-for="item in list" :key="item.id">
            <template slot="title">
              <i class="iconfont" :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
           <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="toggleActivePath('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  name: "home",
  created(){
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  data() {
    return {
        //左侧菜单数据,数据一定要初始化，否则就不是响应式了
        list:[],
        iconsObj:{
            125:'icon-users',
            103:'icon-tijikongjian',
            101:'icon-3702mima',
            102:'icon-danju',
            145:'icon-baobiao'
        },
        isCollapse:false,
        //被激活的链接地址
        activePath:''
    };
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取所有的菜单
    async getMenuList(){
      const {data:res}= await this.$http.get('menus');
      if(res.meta.status!=200)return this.$message.error('获取列表失败');
      this.list = res.data
    },
    toggleCollapse(){
      this.isCollapse=!this.isCollapse
    },
    toggleActivePath(activePath){
      //光这样修改是不够的，因为页面一刷新就没了
      this.activePath = activePath
      //持久存储
      window.sessionStorage.setItem('activePath',activePath)
    }
  }
};
</script>
<style scoped lang="less">
.home_container {
  height: 100%;
}
.el-aside {
  background: #373d41;
}
.el-header {
  background: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
  .left {
    display: flex;
    align-items: center;
    color: #fff;
    font-size: 16px;
    img {
      margin-right: 12px;
    }
    h3 {
      font-weight: normal;
    }
  }
}
.el-main {
  background: aqua;
}
.el-menu{
  border-right:none;
}
.iconfont{
  margin-right: 10px
}
.toggle-button{
  display: block;
  height: 24px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  font-size: 14px;
  text-decoration: none;
  letter-spacing: 2px;
}
</style>