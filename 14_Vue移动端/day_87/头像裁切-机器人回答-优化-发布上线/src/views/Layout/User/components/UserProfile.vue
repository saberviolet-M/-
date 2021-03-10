<template>
  <div class="profile">
    <!-- 导航条 -->
    <van-nav-bar
      left-arrow
      @click-left="$router.back()"
      title="编辑资料"
    ></van-nav-bar>

    <!-- 编辑区 -->
    <van-cell-group>
      <!-- 更改头像 -->
      <div class="avatar">
        <van-image fit="cover" round :src="user.photo" />
        <van-uploader class="uploader" :after-read="afterRead" />
      </div>
      <div class="mask" v-if="isShowMask">
        <VueCropper
          :img="img"
          autoCrop
          autoCropwidth="120"
          autoCropHeight="120"
          fixed
          ref="cropper"
        ></VueCropper>
        <van-button type="primary" class="confirm" @click="savePhoto">
          确定
        </van-button>
        <van-button type="primary" class="cancel" @click="isShowMask = false">
          取消
        </van-button>
      </div>
      <!-- /更改头像 -->

      <!-- 名字 -->
      <van-cell
        is-link
        title="名称"
        :value="user.name"
        @click="clickShowName"
      />
      <!-- 修改名字 -->
      <van-dialog
        @confirm="saveName"
        v-model="showName"
        title="修改姓名"
        show-cancel-button
      >
        <van-field v-model.trim="newName" placeholder="请输入姓名"></van-field>
      </van-dialog>
      <!-- /修改名字 -->

      <!-- 性别 -->
      <van-cell
        is-link
        title="性别"
        :value="user.gender === 0 ? '男' : '女'"
        @click="showGender = true"
      />
      <!-- 修改性别 -->
      <van-popup v-model="showGender" position="bottom">
        <van-nav-bar
          title="修改性别"
          left-text="取消"
          @click-left="showGender = false"
        >
        </van-nav-bar>
        <van-cell title="男" @click="saveGender(0)" is-link></van-cell>
        <van-cell title="女" @click="saveGender(1)" is-link></van-cell>
      </van-popup>
      <!-- /修改性别 -->

      <!-- 生日 -->
      <van-cell
        is-link
        title="生日"
        :value="user.birthday"
        @click="clickShowBirthday"
      />
      <!-- 修改生日 -->
      <van-popup v-model="showBirthday" position="bottom">
        <van-datetime-picker
          @cancel="showBirthday = false"
          @confirm="saveBirthday"
          v-model="newDate"
          type="date"
          title="选择生日"
          :min-date="minDate"
          :max-date="maxDate"
        />
      </van-popup>
      <!-- /修改生日 -->
    </van-cell-group>
  </div>
</template>

<script>
import { reqGetProfile, reqUpdateUserInfo, reqUpdatePhoto } from '@/api/user'
import dayjs from 'dayjs'
import { VueCropper } from 'vue-cropper'
export default {
  name: 'userProfile',
  components: {
    VueCropper
  },
  data() {
    return {
      // 控制弹层
      showName: false,
      showGender: false,
      showBirthday: false,
      isShowMask: false,
      // 当前用户的信息
      user: {},
      newName: '',
      img: '',
      minDate: new Date(1900, 0, 1), // 最小时间
      maxDate: new Date(), // 最大时间
      newDate: new Date() // 修改后的新生日
    }
  },
  created() {
    this.loadProfile()
  },
  methods: {
    async loadProfile() {
      const res = await reqGetProfile()
      this.user = res.data.data
      console.log(this.user)
    },
    clickShowName() {
      this.showName = true
      this.newName = this.user.name
    },
    async saveName() {
      try {
        // 保存名字
        if (this.newName === '') return
        if (this.newName.length > 7) {
          this.$toast.fail('名字长度不能超过 7 个字符')
          return
        }
        // 发送请求, 修改姓名
        await reqUpdateUserInfo({
          name: this.newName
        })
        // 更新视图
        this.user.name = this.newName
        this.newName = ''
        this.$toast.success('修改成功')
      } catch (error) {
        this.$toast.fail(error.response.data.message)
      }
    },
    async saveGender(gender) {
      // console.log(gender)
      try {
        await reqUpdateUserInfo({
          gender
        })
        this.user.gender = gender
        this.$toast.success('修改成功')
        this.showGender = false
      } catch {
        this.$toast.success('修改失败')
      }
    },
    clickShowBirthday() {
      this.showBirthday = true
      this.newDate = new Date(this.user.birthday)
      console.log(this.user.birthday)
    },
    async saveBirthday() {
      try {
        const birthday = dayjs(this.newDate).format('YYYY-MM-DD')
        await reqUpdateUserInfo({
          birthday
        })
        // 更新视图
        this.user.birthday = birthday
        this.$toast.success('修改成功')
        this.showBirthday = false
      } catch {
        this.$toast.fail('修改失败')
        this.showBirthday = false
      }
    },
    afterRead(file) {
      this.isShowMask = true
      this.img = file.content
      // 此时可以自行将文件上传至服务器
      console.log(file)
    },
    savePhoto() {
      this.$refs.cropper.getCropBlob(async data => {
        try {
          this.$toast.loading({
            message: '文件上传中...',
            forbidClick: true,
            overlay: true
          })
          const formData = new FormData()
          formData.append('photo', data)
          const {
            data: {
              data: { photo }
            }
          } = await reqUpdatePhoto(formData)
          this.user.photo = photo
          this.$toast.success('更新成功')
        } catch {
          this.$toast.fail('更新失败')
        }
        this.isShowMask = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar {
  padding: 20px 0;
  text-align: center;
  position: relative;
  .van-image {
    width: 120px;
    height: 120px;
  }
  .uploader {
    opacity: 0;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 120px;
    ::v-deep {
      .van-uploader__input {
        width: 120px;
        height: 120px;
      }
    }
  }
}
.profile {
  ::v-deep {
    .van-nav-bar__text {
      color: #fff;
    }
    .van-dialog__content {
      padding: 10px;
      .van-field {
        border: 1px solid #ccc;
      }
    }
  }
}
.mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  .confirm,
  .cancel {
    position: absolute;
    bottom: 0;
  }
  .confirm {
    left: 0;
  }
  .cancel {
    right: 0;
  }
}
</style>
