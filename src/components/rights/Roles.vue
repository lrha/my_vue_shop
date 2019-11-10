<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-button type="primary">添加角色</el-button>

    <!-- 角色列表区域 -->
    <el-table :data="rolesList" border stripe>
      <!-- 展开项 -->
      <el-table-column type="expand">
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <el-row class="level_one" v-for="item1 in scope.row.children" :key="item1.id">
            <el-col :span="5">
              <el-tag>{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 栅格模式，一共24份 -->
            <el-col :span="19">
              <el-row v-for="item2 in item1.children" :key="item2.id">
                <el-col :span="5">
                  <el-tag type="success">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="19">
                  <el-tag
                    type="danger"
                    closable
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    @close="removeRightsById(scope.row.id,item3.id)"
                  >{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 修改按钮 -->
          <el-button size="mini" type="primary" icon="el-icon-edit"></el-button>
          <!-- 删除按钮 -->
          <el-button size="mini" type="danger" icon="el-icon-delete"></el-button>
          <!-- 设置按钮 -->
          <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetDialog(scope.row)"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="rightDialogVisible" width="40%"  >
      <el-tree ref="myTree" node-key="id" :default-checked-keys="defKeys" :data="rightsList" :props="defaultProps" show-checkbox default-expand-all></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allocateRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList();
  },
  data() {
    return {
      rolesList: [],
      rightDialogVisible:false,//默认设置权限对话框是隐藏的
      rightsList:[],
      defaultProps:{
        children:'children',
        label:'authName'
      },
      defKeys:[],
      roleId:''//角色id
    };
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status != 200)
        return this.$message.error("获取角色列表失败");
      this.rolesList = res.data;
      // console.log(this.rolesList);
    },
    //删除操作
    async removeRightsById(roleId, rightId) {
      //弹框提示是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(async () => {
          //确认要删除的逻辑
          const { data: res } = await this.$http.delete(
            `roles/${roleId}/rights/${rightId}`
          );
          if (res.meta.status != 200)
            return this.$message.error("删除权限失败");
          this.getRolesList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            $message: "已取消删除"
          });
        });
    },
   async showSetDialog(role){
    this.roleId = role.id
    var keys = []//用来收集三级权限的Id值（最后一级权限的Id值）
     //通过递归的形式，获取角色下所有三级权限的Id,并保存到defKeys数组中
    //三级权限
    // role.children.forEach(item1=>{
    //   //一级权限
    //   if(item1.children){
    //     item1.children.forEach(item2=>{
    //       //二级权限
    //       if(item2.children){
    //         item2.children.forEach(item3=>{
    //           //三级权限
    //           keys.push(item3.id)
    //         })
    //       }
    //     })
    //   }
    // },
    // this.defKeys=keys
    // )
    //我们只需要收集最后一级的id
    function getId(obj){
      obj.children.forEach(item=>{
        //递归:自己调用自己 递归一定要有结束的条件
        if(item.children){
          getId(item)
        }else{
          keys.push(item.id)
        }
      })
    }
    getId(role)
    this.defKeys = keys
    const {data:res}= await this.$http.get(`rights/tree`)
    console.log(res);
    if(res.meta.status!=200)return this.$message.error('请求权限数据失败')
    this.rightsList = res.data
    this.rightDialogVisible = true
    },

  async allocateRights(){
    //  console.log(this.$refs.myTree.getCheckedKeys());//获取全选的权限
    //  console.log(this.$refs.myTree.getHalfCheckedKeys());//获取不是全选但是选择了的权限
     //把所有获取的权限放在一个数组中
     var keys = [...this.$refs.myTree.getCheckedKeys(),...this.$refs.myTree.getHalfCheckedKeys()]
    //把所有获取的权限输出为字符串，并用,隔开
     var keysStr = keys.join(',')
     console.log(keysStr);
    const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:keysStr})
    if(res.meta.status!=200)return this.$message.error('分配权限失败')
    this.getRolesList()
    this.rightDialogVisible = false
    }
  }
};
</script>
<style scoped lang="less">
.el-tag {
  margin: 15px;
}
.level_one {
  border-bottom: 1px solid #ccc;
}
</style>