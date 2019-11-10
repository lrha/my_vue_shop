<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon></el-alert>
      <div>请选择商品分类：</div>
      <!-- 选择商品分类的级联选择框 -->
      <el-cascader
        v-model="selectedKeys"
        :options="cateList"
        :props="{ expandTrigger: 'hover',label:'cat_name',value:'cat_id',children:'children' }"
        @change="handleChange"
      ></el-cascader>
      <!-- 标签栏 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态属性 -->
        <el-tab-pane label="动态属性" name="many">
          <el-button type="primary" :disabled="isDisabled" @click="showAddDialog">添加属性</el-button>
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" :disabled="isDisabled" @click="showAddDialog">添加属性</el-button>
          <el-table :data="onlyTabData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >修改</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="delParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性对话框 -->
    <el-dialog
      :title="'添加'+currentTitle"
      :visible.sync="addAttrDialogVisible"
      width="50%"
      @close="resetForm"
    >
      <el-form :model="attrForm" :rules="attrFormRules" ref="attrFormRef" label-width="100px">
        <el-form-item :label="currentTitle" prop="attr_name">
          <el-input v-model="attrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveAttrs">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog
      :title="'修改'+currentTitle"
      :visible.sync="editAttrDialogVisible"
      width="50%"
      @close="resetEditForm"
    >
      <el-form
        :model="editAttrForm"
        :rules="attrFormRules"
        ref="editAttrFormRules"
        label-width="100px"
      >
        <el-form-item :label="currentTitle" prop="attr_name">
          <el-input v-model="editAttrForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAttrDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveEditAttrs">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 确认删除对话框 -->
  </div>
</template>
<script>
import { async } from "q";
export default {
  data() {
    return {
      //商品分类列表
      cateList: [],
      selectedKeys: [],
      activeName: "many",
      onlyTabData: [],
      manyTableData: [],
      addAttrDialogVisible: false,
      attrForm: {
        attr_name: ""
      },
      attrFormRules: {
        attr_name: [
          { required: true, message: "属性名不能为空", trigger: "blur" },
          { min: 2, max: 15, message: "长度必须在2到15之间", trigger: "blur" }
        ]
      },
      editAttrDialogVisible: false,
      editAttrForm: {
        edit_name: ""
      }
      // //控制按钮与文本框的切换显示
      // inputVisible:false,
      // // 文本框中输入的内容
      // inputValue:''
    };
  },
  created() {
    //代码尽量不要写在狗子函数里
    this.getCatList();
  },
  methods: {
    //获取所有商品分类列表
    async getCatList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status != 200)
        return this.$message.error("获取分类列表失败");
      // console.log(res);
      this.cateList = res.data;
    },
    async handleChange() {
      this.getParamsData();
      //清空数据列表
      this.manyTableData = []
      this.onlyTabData = []
    },
    handleClick() {
      this.getParamsData();
    },
    //获取参数项列表里的数据
    async getParamsData() {
      //证明选中的不是三级分类
      if (this.selectedKeys.length <= 2) return (this.selectedKeys = []);
      console.log("选的是三级分类");
      //   console.log(this.selectedKeys);
      //如果用户选的是三级分类，我们就需要去请求当前选中的三级分类对应的参数列表数据 渲染出来
      //   var catid = this.selectedKeys[2]
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      );
      if (res.meta.status != 200) {
        this.$message.error("获取参数失败");
      }
      console.log(res.data);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(",") : [];
        //控制文本框的显示和隐藏
        item.inputVisible = false;
        //文本框中输入的值
        item.inputValue = "";
      });
      if (this.activeName == "only") {
        this.onlyTabData = res.data; //赋值静态属性
      } else {
        this.manyTableData = res.data; //动态属性
      }
    },
    showAddDialog() {
      console.log(123);
      this.addAttrDialogVisible = true;
    },
    resetForm() {
      this.$refs.attrFormRef.resetFields();
    },
    saveAttrs() {
      // 表单校验
      this.$refs.attrFormRef.validate(async valid => {
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          { attr_name: this.attrForm.attr_name, attr_sel: this.activeName }
        );
        if (res.meta.status != 201) return this.$message.error("添加属性失败");
        this.addAttrDialogVisible = false;
        this.getParamsData();
      });
    },
    async showEditDialog(attr_id) {
      this.editAttrDialogVisible = true;
      // 获取参数并把参数渲染到编辑框中
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        { params: { attr_sel: this.activeName } }
      );
      console.log(res);
      if (res.meta.status != 200) return this.$message.error("获取数据失败");
      this.editAttrForm = res.data;
    },

    //重置修改对话框
    resetEditForm() {
      this.$refs.editAttrFormRules.resetFields();
    },
    saveEditAttrs() {
      this.$refs.editAttrFormRules.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editAttrForm.attr_id}`,
          { attr_name: this.editAttrForm.attr_name, attr_sel: this.activeName }
        );
        console.log(res);

        if (res.meta.status !== 200) {
          return this.$message.error("修改参数失败");
        }
        this.getParamsData();
        this.$message.success("修改参数成功");
        this.editAttrDialogVisible = false;
      });
    },
    //根据Id删除对应的参数项
    async delParams(attr_id) {
      //用一个文本参数confirmRe来接收确认框的结果，当comfirmRe=comfirm的时候，表示用户点击了确认按钮，反之则是点了取消按钮
      const confirmRe = await this.$confirm(
        "此操作将永久删除该属性, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(async()=>{
        const { data: res } = await this.$http.delete(
         `categories/${this.cateId}/attributes/${attr_id}`)
          if (res.meta.status != 200) return this.$message.error("删除失败");
          this.getParamsData();
      }).catch(err => err);
      //用户取消了删除操作
      if (confirmRe != "confirm") {
        return this.$message.info("已取消删除操作");
      }
      //用户点击删除确认的业务逻辑
      // const { data: res } = await this.$http.delete(
      //   `categories/${this.cateId}/attributes/${attr_id}`
      // );
      // if (res.meta.status != 200) return this.$message.error("删除失败");
      // this.$message.success("删除成功");
      // this.getParamsData();
    },
    //文本框失去焦点或按下enter键都会触发
    async handleInputConfirm(row) {
      //判断用户是否输入了真实的内容
      if (row.inputValue.trim().length === 0) {
        row.inputValue = "";
        row.inputVisible = false;
        return;
      }
      //如果没有return,则证明输入了内容，需要做后续处理
      row.attr_vals.push(row.inputValue.trim());
      row.inputValue = "";
      row.inputVisible = false;
      //需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status !== 200) return this.$message.error("修改参数项失败");
      this.$message.success("修改参数项成功");
      this.getParamsData()

    },
    //点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      //让文本框自动获得焦点
      //$nextTick方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码,因为dom是异步更新的
      //数据出来了，页面没有渲染出来就可以考虑用 this.$nextTick
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    //删除对应的参数可选项
   async handleClose(i, row) {
      row.attr_vals.splice(i, 1);
        const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(",")
        }
      );
      if (res.meta.status !== 200) return this.$message.error("删除参数项失败");
      this.$message.success("删除参数项成功");
      this.getParamsData()
    },
  },

  computed: {
    isDisabled: function() {
      return this.selectedKeys.length != 3;
    },
    cateId: function() {
      if (this.selectedKeys.length == 3) {
        return this.selectedKeys[2];
      } else {
        return null;
      }
    },
    // 一个变量依赖另一个变量可以用computed
    currentTitle() {
      if (this.activeName == "only") {
        return "静态属性";
      } else {
        return "动态属性";
      }
    }
  }
};
</script>
<style scoped lang="less">
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>