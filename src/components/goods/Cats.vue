<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addCat">添加分类</el-button>
      <tree-table
        :data="CatList"
        :columns="columns"
        :expand-type="false"
        border
        stripe
        show-index
        :selection-type="false"
        index-text="#"
      >
        <!-- //作用域插槽,当从后台请求来的数据和要渲染成的效果不同时，就要使用作用域插槽-->
        <template slot="isDeleted" slot-scope="scope">
          <!-- {{scope.row.cat_deleted}} -->
          <i class="el-icon-success" style="color:green" v-if="scope.row.cat_deleted==false"></i>
          <i class="el-icon-error" style="color:red" v-else></i>
        </template>

        <template slot="level" slot-scope="scope">
          <!-- {{scope.row.cat_level}} -->
          <el-tag type="success" size="mini" v-if="scope.row.cat_level==0">一级</el-tag>
          <el-tag type="info" size="mini" v-else-if="scope.row.cat_level==1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>

        <template slot="option" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 4]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="resetCateForm" >
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- v-model是被选中的内容，是一个数组 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',checkStrictly:true }"
            @change="cascaderChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { log } from "util";
export default {
  created() {
    this.getCatList();
  },
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 4
      },
      //商品分类的数据列表，默认为空
      CatList: [],
      //总数据条数
      total: 0,
      columns: [
        {
          prop: "cat_name",
          label: "分类名称"
        },
        {
          prop: "cat_deleted",
          label: "是否有效",
          type: "template", //表示当前列是自定义模板列
          template: "isDeleted" //具名slot插槽
        },
        {
          prop: "cat_level",
          label: "排序",
          type: "template", //表示当前这一列是自定义模板列
          template: "level" //具名slot
        },
        {
          label: "删除",
          type: "template", //表示当前这一列是自定义模板
          template: "option" //具名slot
        }
      ],
      //控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      //表单要传递到后台的参数
      addCateForm: {
        cat_name: "",
        cat_pid: 0, //父级id
        cat_level: 0
      },
      //验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: "分类名称不能为空", trigger: "blur" },
          { min: 3, max: 15, message: "长度在3到15之间", trigger: "blur" }
        ]
      },
      parentCateList: [],
      //接收用户选则好的级联值
      selectedKeys:[],
      //指定级联选择器的配置对象
      // cascaderProps:{
      //   value:'cat_id',
      //   label:'cat_name',
      //   children:'children'
      // }
    };
  },
  created() {
    this.getCatList();
  },
  methods: {
    //获取商品分类数据
    async getCatList() {
      //get,delete参数需要params,put,post不用---axios语法
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      console.log(res);

      if (res.meta.status != 200) {
        return this.$message.error("获取商品分类失败");
      }
      console.log(res.data);
      //把数据列表赋值给catlist
      this.CatList = res.data.result;
      //为总数据条数赋值
      this.total = res.data.total;
    },
    //改变一个页面中内容的条数
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getCatList();
    },
    //页面跳转
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getCatList();
    },
    addCat() {
      //点击按钮，展示添加分类的对话框
      this.addCateDialogVisible = true;
      this.getParentsCateList();
    },
    //请求父级分类参数
    async getParentsCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 }
      });
      if (res.meta.status != 200) return this.$message.error("获取失败");
      this.parentCateList = res.data;
      console.log(this.parentCateList);
    },
    cascaderChange(){
      // 3种情况
      if(this.selectedKeys.length==0){
        //当前是一级分类
        this.addCateForm.cat_pid = 0
      }else{
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
      }
      this.addCateForm.cat_level = this.selectedKeys.length
    },
    resetCateForm(){
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
   async saveCate(){
    const {data:res} = await this.$http.post('categories',this.addCateForm)
    //响应拦截器
    if(res.meta.status!=201)return this.$message.error('添加失败')
    this.getCatList()
    this.addCateDialogVisible=false
    }
  }
};
</script>
<style scoped lang="less">
.el-cascader{
  width: 100%;
}
</style>
<style lang="less">
.el-cascader-menu{
  height: 240px;
}
</style>