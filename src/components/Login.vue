<template>
    <div class="login_container">
        <div ref="ceshi">测试</div>
        <input type="text" @input="fn($event)">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="" srcset="">
            </div>
            <!-- 登录表单区域 -->
            <el-form ref="loginFormRef" :rules="loginFormRules" label-width="0px" class="login-form" :model="loginForm">
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item> 
                 <el-form-item prop="password">
                    <el-input v-model="loginForm.password"  type="password" prefix-icon="iconfont icon-3702mima"></el-input>
                </el-form-item>
                 <el-form-item class="btns">
                    <el-button type="primary" @click="login" >登录</el-button>
                    <el-button type="info" @click="reset">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
import { log } from 'util'
import { async } from 'q';
export default {
    name:'login',
    data () {
        return {
          loginForm:{
            username:'admin',
            password:'123456'
          },
          //验证规则
          loginFormRules:{
             username:[
                 {required:true,message:'请输入用户名',trigger:'blur'},
                 {min:3,max:10,message:'长度在3到10个字符',
                 trigger:'blur'}
             ],
             password:[
                 {required:true,message:'请输入密码',trigger:'blur'},
                 {min:6,max:15,message:'长度在6到15个字符',trigger:'blur'}
             ]

          }
        }
    },
    methods:{
    fn(e){
        console.log(this.$refs.ceshi.innerHTML);
    },
    reset(){
        //所有的组件都是通过Vue构造函数new出来的
        this.$refs.loginFormRef.resetFields()
    },
    login(){
        //在做一次表单验证，如果验证失败，return结束，如果验证成功，收集表单数据，发送ajax
        this.$refs.loginFormRef.validate(async valid=>{
        if(!valid)return;
         const {data:res} = await this.$http.post('login',this.loginForm);
        if(res.meta.status!==200) return this.$message.error('用户名或密码错误');
        this.$message.success('登录成功');
        //1.将登录成功之后的token保存到客户端的sessionStorage中
        // 1.1项目中除了登录之外的其他api接口，必须在登录之后才能访问
        // 1.2Token只应在当前网站打开期间生效，所以将token保存在sessinStorage中
        window.sessionStorage.setItem("token",res.data.token)
        // 通过编程式导航跳转到后台主页，路由地址是/home
         this.$router.push('/home')
        })
    }
    }
}
</script>
<style scoped lang="less">
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    .login_box{
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top:50%;
        transform: translate(-50%,-50%);
        .avatar_box{
            width: 130px;
            height: 130px;
            background-color: #eee;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            top: 0;
            transform:translate(-50%,-50%);
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            img{
                width: 100%;
                border-radius: 50%;
            }
        }
    };
    .login-form{
        position: absolute;
        left: 0;
        bottom: 0;
        padding: 0 20px;
        width: 100%;
        box-sizing: border-box;
        .btns{
            display:flex;
            justify-content: flex-end;
        }
    }
    }
</style>