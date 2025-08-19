<template>
  <div class="main" 
      @dragenter.prevent 
      @dragover.prevent 
      @drop.prevent="onDrop"
      :style="{ backgroundImage: `url('${backgroundImageUrl}')` }"
  >
    <progress v-if="uploadProgress !== null" :value="uploadProgress" max="100"></progress>
    <UploadPopup v-model="showUploadPopup" @upload="onUploadClicked" @createFolder="createFolder"></UploadPopup>



    <!-- 登录/用户模态框 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ isLoggedIn ? '用户管理' : '登录' }}</h3>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        <div class="modal-body">
          <!-- 已登录状态 -->
          <div v-if="isLoggedIn" class="user-info">
            <div class="current-user">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="#4CAF50">
                <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
              </svg>
              <div>
                <p class="user-status">{{ getUserStatusText() }}</p>
                <p class="user-desc">{{ getUserDescText() }}</p>
              </div>
            </div>
            <div class="user-actions">
              <button @click="switchUser" class="switch-user-button">切换用户</button>
              <button @click="logout" class="logout-button">退出登录</button>
            </div>
          </div>

          <!-- 未登录状态 -->
          <form v-else @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="username">用户名:</label>
              <input
                type="text"
                id="username"
                v-model="loginForm.username"
                required
                autocomplete="username"
              >
            </div>
            <div class="form-group">
              <label for="password">密码:</label>
              <input
                type="password"
                id="password"
                v-model="loginForm.password"
                required
                autocomplete="current-password"
              >
            </div>
            <div class="form-actions">
              <button type="button" @click="closeModal" class="cancel-button">取消</button>
              <button type="submit" class="login-submit-button" :disabled="loginLoading">
                {{ loginLoading ? '登录中...' : '登录' }}
              </button>
            </div>
          </form>
          <div v-if="loginError" class="error-message">{{ loginError }}</div>
        </div>
      </div>
    </div>

    <!-- 上传按钮 - 只有登录用户或有上传权限的游客才显示 -->
    <button v-if="canUpload" class="upload-button circle" @click="showUploadPopup = true">
      <svg t="1741764069699" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="24280" width="24" height="24">
        <path
          d="M576 557.7088V934.4H448V560.4416l-43.8912 43.8848L313.6 513.8176l199.1232-199.1168 0.64 0.64 0.64-0.64 199.1232 199.1168-90.5088 90.5088L576 557.7088zM704 678.4h32c88.3648 0 160-71.6352 160-160s-71.6352-160-160-160c-20.5184 0-40.128 3.8592-58.1568 10.8992C670.336 270.1248 587.4944 192 486.4 192c-106.0416 0-192 85.9584-192 192 0 15.9104 1.9328 31.3728 5.5872 46.1568A127.7504 127.7504 0 0 0 256 422.4c-70.6944 0-128 57.3056-128 128s57.3056 128 128 128h64v128H256c-141.3824 0-256-114.6176-256-256 0-113.3184 73.632-209.4464 175.6608-243.136C210.0352 167.584 336.1216 64 486.4 64c121.312 0 227.552 67.712 281.7728 168.1792C912.0896 248.1792 1024 370.2208 1024 518.4c0 159.0592-128.9408 288-288 288h-32v-128z"
          fill="#e6e6e6" p-id="24281"></path>
      </svg>
    </button>
    <div class="app-bar">
      <a class="app-title-container" style="display: flex; align-items: center;" href="/">
        <img src="/assets/homescreen.png" alt="FlareDrive" style="height: 24px" />
        <h1 class="app-title" style="font-size: 20px;margin: 0 25px 0 8px; user-select: none;">FlareDrive</h1>
      </a>

      <div class="search-container" :class="{ 'search-expanded': isSearchExpanded }">
        <input
          type="search"
          v-model="search"
          @input="onSearchInput"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          aria-label="Search"
          placeholder="🍿 输入以全局搜索文件"
          class="search-input"
          ref="searchInput"
        />
      </div>

      <!-- 右侧控件容器 -->
      <div class="app-bar-right">
        <!-- 登录/用户状态按钮 -->
        <div class="user-status-container">
          <button class="user-status-button" @click="showLoginModal" :title="isLoggedIn ? '切换用户' : '登录'">
            <svg v-if="!isLoggedIn" viewBox="0 0 24 24" width="18" height="18" fill="#666">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
            <!-- 已登录状态的图标 -->
            <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="#4CAF50">
              <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
            </svg>
            <span class="user-status-text">{{ getTopUserStatusText() }}</span>
          </button>
        </div>

        <div class="menu-button">
        <button class="circle" @click="showMenu = true" style="display: flex; align-items: center;background-color: rgb(245, 245, 245);">
          <p style="
              white-space: nowrap;
              margin: 0 10px 0 0;
              font-size: 16px;
              font-family: '寒蝉半圆体', -apple-system, BlinkMacSystemFont, 'Segoe UI Adjusted',
    'Segoe UI', 'Liberation Sans', sans-serif;"
              class="menu-button-text">
            菜单
          </p>
          <svg t="1741761597964" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="22027" width="24" height="24">
            <path
              d="M365 663.5v210.7c0 18.6-23.4 26.8-35 12.3L131.2 637.9c-13.3-16.6-1.5-41.1 19.8-41.1h80.7v-400c0-36.8 29.8-66.7 66.7-66.7 36.8 0 66.7 29.8 66.7 66.7v466.7h-0.1z m200-466.7h266.7c36.8 0 66.7 29.8 66.7 66.7s-29.8 66.7-66.7 66.7H565c-36.8 0-66.7-29.8-66.7-66.7 0-36.8 29.9-66.7 66.7-66.7z m0 266.7h200c36.8 0 66.7 29.8 66.7 66.6s-29.8 66.7-66.6 66.7H565c-36.8 0-66.7-29.8-66.7-66.7 0.1-36.8 29.9-66.6 66.7-66.6z m0 266.7h133.3c36.8 0 66.7 29.8 66.7 66.7 0 36.8-29.8 66.7-66.7 66.7H565c-36.8 0-66.7-29.8-66.7-66.7 0.1-36.9 29.9-66.7 66.7-66.7z"
              p-id="22028" fill="#2c2c2c"></path>
          </svg>
        </button>
        <Menu v-model="showMenu"
          :items="[
            { text: '按照名称排序A-Z' },
            { text: '按照大小递增排序' },
            { text: '按照大小递减排序' },
            { text: '粘贴文件到此目录', disabled: !clipboard || !canWrite }
          ]"
          @click="onMenuClick" />
        </div>
      </div>
    </div>
    <div class="file-list-container">
      <!-- 需要登录提示 -->
      <div v-if="needLogin" class="login-prompt">
        <div class="login-prompt-content">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="#666">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          <h3>当前目录需要登录才能查看</h3>
          <p>此目录需要特定权限才能访问，请点击顶部的登录按钮进行身份验证</p>
        </div>
      </div>

      <!-- 文件操作工具栏 -->
      <div v-if="!needLogin && !isMultiSelectMode && filteredFiles.length > 0" class="file-toolbar">
        <div class="toolbar-left">
          <button @click="toggleMultiSelectMode" class="toolbar-btn primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.09 0 2.13.2 3.1.56"/>
            </svg>
            多选模式
          </button>
        </div>
      </div>

      <!-- 多选工具栏 -->
      <div v-if="isMultiSelectMode" class="multi-select-toolbar">
        <div class="toolbar-left">
          <button @click="toggleMultiSelectMode" class="toolbar-btn">
            {{ isMultiSelectMode ? '退出多选' : '多选模式' }}
          </button>
          <span v-if="selectedFiles.length > 0" class="selected-count">
            已选择 {{ selectedFiles.length }} 个文件
          </span>
          <button v-if="selectedFiles.length > 0" @click="selectAllFiles" class="toolbar-btn">
            {{ selectedFiles.length === filteredFiles.length ? '取消全选' : '全选' }}
          </button>
        </div>
        <div v-if="selectedFiles.length > 0" class="toolbar-right">
          <button @click="batchDownload" class="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载
          </button>
          <button @click="batchCopy" class="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            复制
          </button>
          <button v-if="canWrite" @click="batchMove" class="toolbar-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>
            移动
          </button>
          <button v-if="canWrite" @click="batchDelete" class="toolbar-btn danger">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            删除
          </button>
        </div>
      </div>

      <!-- 文件列表 -->
      <ul v-if="!needLogin" class="file-list">
        <li v-if="cwd !== ''">
          <div tabindex="0" class="file-item" @click="cwd = cwd.replace(/[^\/]+\/$/, '')" @contextmenu.prevent>
            <div class="file-icon">
              <svg  viewBox="0 0 576 512"
                xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                <path d="M384 480l48 0c11.4 0 21.9-6 27.6-15.9l112-192c5.8-9.9 5.8-22.1 .1-32.1S555.5 224 544 224l-400 0c-11.4 0-21.9 6-27.6 15.9L48 357.1 48 96c0-8.8 7.2-16 16-16l117.5 0c4.2 0 8.3 1.7 11.3 4.7l26.5 26.5c21 21 49.5 32.8 79.2 32.8L416 144c8.8 0 16 7.2 16 16l0 32 48 0 0-32c0-35.3-28.7-64-64-64L298.5 96c-17 0-33.3-6.7-45.3-18.7L226.7 50.7c-12-12-28.3-18.7-45.3-18.7L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l23.7 0L384 480z"/>
              </svg>
            </div>
            <div class="file-info-container"><span class="file-name">返回上级目录</span></div>

          </div>
        </li>
        <li v-for="folder in filteredFolders" :key="folder">
          <div tabindex="0" class="file-item" @click="cwd = folder" @contextmenu.prevent="
            showContextMenu = true;
          focusedItem = folder;
          ">
            <div class="file-icon">
              <svg  viewBox="0 0 576 512"
                xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                <path d="M384 480l48 0c11.4 0 21.9-6 27.6-15.9l112-192c5.8-9.9 5.8-22.1 .1-32.1S555.5 224 544 224l-400 0c-11.4 0-21.9 6-27.6 15.9L48 357.1 48 96c0-8.8 7.2-16 16-16l117.5 0c4.2 0 8.3 1.7 11.3 4.7l26.5 26.5c21 21 49.5 32.8 79.2 32.8L416 144c8.8 0 16 7.2 16 16l0 32 48 0 0-32c0-35.3-28.7-64-64-64L298.5 96c-17 0-33.3-6.7-45.3-18.7L226.7 50.7c-12-12-28.3-18.7-45.3-18.7L64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l23.7 0L384 480z"/>
              </svg>
            </div>
            <div class="file-info-container"><span class="file-name" v-text="folder.match(/.*?([^/]*)\/?$/)[1]"></span>
            </div>
            <div style="margin-right: 10px;margin-left: auto;" @click.stop="
              showContextMenu = true;
            focusedItem = folder;
            ">
              <svg t="1741761103305" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="6484" width="30" height="30">
                <path
                  d="M341.333333 533.333333a128 128 0 0 1 128 128v149.333334a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128v-149.333334a128 128 0 0 1 128-128h149.333333z m469.333334 0a128 128 0 0 1 128 128v149.333334a128 128 0 0 1-128 128h-149.333334a128 128 0 0 1-128-128v-149.333334a128 128 0 0 1 128-128h149.333334z m-469.333334 64H192a64 64 0 0 0-63.893333 60.245334L128 661.333333v149.333334a64 64 0 0 0 60.245333 63.893333L192 874.666667h149.333333a64 64 0 0 0 63.893334-60.245334L405.333333 810.666667v-149.333334a64 64 0 0 0-60.245333-63.893333L341.333333 597.333333z m469.333334 0h-149.333334a64 64 0 0 0-63.893333 60.245334L597.333333 661.333333v149.333334a64 64 0 0 0 60.245334 63.893333L661.333333 874.666667h149.333334a64 64 0 0 0 63.893333-60.245334L874.666667 810.666667v-149.333334a64 64 0 0 0-60.245334-63.893333L810.666667 597.333333zM341.333333 64a128 128 0 0 1 128 128v149.333333a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h149.333333z m469.333334 0a128 128 0 0 1 128 128v149.333333a128 128 0 0 1-128 128h-149.333334a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h149.333334zM341.333333 128H192a64 64 0 0 0-63.893333 60.245333L128 192v149.333333a64 64 0 0 0 60.245333 63.893334L192 405.333333h149.333333a64 64 0 0 0 63.893334-60.245333L405.333333 341.333333V192a64 64 0 0 0-60.245333-63.893333L341.333333 128z m469.333334 0h-149.333334a64 64 0 0 0-63.893333 60.245333L597.333333 192v149.333333a64 64 0 0 0 60.245334 63.893334L661.333333 405.333333h149.333334a64 64 0 0 0 63.893333-60.245333L874.666667 341.333333V192a64 64 0 0 0-60.245334-63.893333L810.666667 128z"
                  fill="#2c2c2c" p-id="6485"></path>
              </svg>
            </div>
          </div>
        </li>
        <li v-for="file in filteredFiles" :key="file.key">
          <div
            @click="handleFileClick(file)"
            @contextmenu.prevent="showContextMenu = true; focusedItem = file;"
            class="file-item"
            style="position: relative;"
            :class="{ 'selected': isFileSelected(file.key) }"
          >
            <!-- 多选复选框 -->
            <div v-if="isMultiSelectMode" class="file-checkbox" @click.stop="toggleFileSelection(file.key)">
              <input type="checkbox" :checked="isFileSelected(file.key)" @click.stop @change.stop="toggleFileSelection(file.key)">
            </div>
            <MimeIcon :content-type="file.httpMetadata?.contentType || 'application/octet-stream'" :thumbnail="file.customMetadata?.thumbnail
              ? `/raw/_$flaredrive$/thumbnails/${file.customMetadata.thumbnail}.png`
              : null
              " />
            <div class="file-info-container">
              <div class="file-name" v-text="file.key.split('/').pop()"></div>
              <div class="file-attr">
                <!-- 搜索结果显示完整路径 -->
                <span v-if="search && searchResults.length > 0" class="file-path" v-text="file.displayPath || file.key"></span>
                <span v-if="file.uploaded" v-text="new Date(file.uploaded).toLocaleString()"></span>
                <span v-if="file.size" v-text="formatSize(file.size)"></span>
              </div>
            </div>
            <div style="margin-right: 10px;margin-left: auto;"
                 @click.stop="showContextMenu = true; focusedItem = file;"
                 @touchstart.stop
                 @touchend.stop>
              <svg t="1741761103305" class="icon" viewBox="0 0 1024 1024" version="1.1"
                xmlns="http://www.w3.org/2000/svg" p-id="6484" width="30" height="30">
                <path
                  d="M341.333333 533.333333a128 128 0 0 1 128 128v149.333334a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128v-149.333334a128 128 0 0 1 128-128h149.333333z m469.333334 0a128 128 0 0 1 128 128v149.333334a128 128 0 0 1-128 128h-149.333334a128 128 0 0 1-128-128v-149.333334a128 128 0 0 1 128-128h149.333334z m-469.333334 64H192a64 64 0 0 0-63.893333 60.245334L128 661.333333v149.333334a64 64 0 0 0 60.245333 63.893333L192 874.666667h149.333333a64 64 0 0 0 63.893334-60.245334L405.333333 810.666667v-149.333334a64 64 0 0 0-60.245333-63.893333L341.333333 597.333333z m469.333334 0h-149.333334a64 64 0 0 0-63.893333 60.245334L597.333333 661.333333v149.333334a64 64 0 0 0 60.245334 63.893333L661.333333 874.666667h149.333334a64 64 0 0 0 63.893333-60.245334L874.666667 810.666667v-149.333334a64 64 0 0 0-60.245334-63.893333L810.666667 597.333333zM341.333333 64a128 128 0 0 1 128 128v149.333333a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h149.333333z m469.333334 0a128 128 0 0 1 128 128v149.333333a128 128 0 0 1-128 128h-149.333334a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h149.333334zM341.333333 128H192a64 64 0 0 0-63.893333 60.245333L128 192v149.333333a64 64 0 0 0 60.245333 63.893334L192 405.333333h149.333333a64 64 0 0 0 63.893334-60.245333L405.333333 341.333333V192a64 64 0 0 0-60.245333-63.893333L341.333333 128z m469.333334 0h-149.333334a64 64 0 0 0-63.893333 60.245333L597.333333 192v149.333333a64 64 0 0 0 60.245334 63.893334L661.333333 405.333333h149.333334a64 64 0 0 0 63.893333-60.245333L874.666667 341.333333V192a64 64 0 0 0-60.245334-63.893333L810.666667 128z"
                  fill="#2c2c2c" p-id="6485"></path>
              </svg>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="loading && !needLogin" style="margin: 20px 0; text-align: center">
        <span style="font-size: 20px;">加载中...</span>
      </div>
      <div v-else-if="!needLogin && !filteredFiles.length && !filteredFolders.length" style="margin: 20px 0; text-align: center">
        <span style="font-size: 20px;">没有文件</span>
      </div>
    </div>
    <Dialog v-model="showContextMenu">
      <div
        style="height: 50px;display: flex; justify-content: center; align-items: center; padding:10px; background: #ddd; margin: 0 0 10px 0; border-radius: 8px;">
        <div v-text="focusedItem.key || focusedItem" class="contextmenu-filename" @click.stop.prevent
          style="height:20px;width: 100%; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"></div>
      </div>
      <ul v-if="typeof focusedItem === 'string'" class="contextmenu-list">
        <li>
          <button @click="copyLink(`/?p=${encodeURIComponent(focusedItem)}`)">
            <span>复制链接</span>
          </button>
        </li>
        <li v-if="canWrite">
          <button @click="moveFile(focusedItem + '_$folder$')">
            <span>移动</span>
          </button>
        </li>
        <li v-if="clipboard && canWrite">
          <button @click="pasteFile()">
            <span>粘贴</span>
          </button>
        </li>
        <li v-if="canWrite">
          <button style="color: red" @click="removeFile(focusedItem + '_$folder$')">
            <span>删除</span>
          </button>
        </li>
      </ul>
      <ul v-else class="contextmenu-list">
        <li v-if="canWrite">
          <button @click="renameFile(focusedItem.key)">
            <span>重命名</span>
          </button>
        </li>
        <li>
          <a :href="`/raw/${focusedItem.key}`" target="_blank" download>
            <span>下载</span>
          </a>
        </li>
        <li>
          <button @click="copyFile(focusedItem.key)">
            <span>复制</span>
          </button>
        </li>
        <li v-if="canWrite">
          <button @click="moveFile(focusedItem.key)">
            <span>移动</span>
          </button>
        </li>
        <li>
          <button @click="copyLink(`/raw/${focusedItem.key}`)">
            <span>复制链接</span>
          </button>
        </li>
        <li v-if="clipboard && canWrite">
          <button @click="pasteFile()">
            <span>粘贴</span>
          </button>
        </li>
        <li v-if="canWrite">
          <button style="color: red" @click="removeFile(focusedItem.key)">
            <span>删除</span>
          </button>
        </li>
      </ul>
    </Dialog>

    <!-- 媒体预览组件 -->
    <MediaPreview
      :show="showMediaPreview"
      :mediaList="previewMediaList"
      :initialIndex="previewInitialIndex"
      @close="closeMediaPreview"
      @show-toast="showCustomToast"
    />

    <!-- 自定义输入对话框 -->
    <Dialog v-model="showInputDialog">
      <div style="padding: 20px;">
        <h3 v-text="inputDialog.title" style="margin: 0 0 15px 0;"></h3>
        <input
          v-model="inputDialog.value"
          :placeholder="inputDialog.placeholder"
          style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;"
          @keyup.enter="confirmInput"
          ref="inputField"
        />
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button @click="cancelInput" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px;">取消</button>
          <button @click="confirmInput" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px;">确定</button>
        </div>
      </div>
    </Dialog>

    <!-- 目录选择对话框 -->
    <Dialog v-model="showFolderDialog">
      <div style="padding: 20px;">
        <h3 v-text="folderDialog.title" style="margin: 0 0 15px 0;"></h3>
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px;">
          <div
            v-for="(folder, index) in folderDialog.folders"
            :key="index"
            @click="selectFolder(folder)"
            :class="{ 'selected': folderDialog.selectedFolder === folder.value }"
            style="padding: 10px; cursor: pointer; border-bottom: 1px solid #eee;"
            :style="{
              backgroundColor: folderDialog.selectedFolder === folder.value ? '#e3f2fd' : 'transparent',
              fontWeight: folderDialog.selectedFolder === folder.value ? 'bold' : 'normal'
            }"
          >
            <span v-text="folder.display"></span>
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button @click="cancelFolderSelection" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px;">取消</button>
          <button @click="confirmFolderSelection" :disabled="!folderDialog.selectedFolder" style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; opacity: folderDialog.selectedFolder ? 1 : 0.5;">确定</button>
        </div>
      </div>
    </Dialog>

    <!-- 自定义确认对话框 -->
    <Dialog v-model="showConfirmDialog">
      <div style="padding: 20px;">
        <h3 v-text="confirmDialog.title" style="margin: 0 0 15px 0;"></h3>
        <p v-text="confirmDialog.message" style="margin: 0 0 20px 0; line-height: 1.5;"></p>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button @click="cancelConfirm" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px;">{{ confirmDialog.cancelText || '取消' }}</button>
          <button @click="confirmAction" :style="`padding: 8px 16px; background: ${confirmDialog.type === 'danger' ? '#dc3545' : '#007bff'}; color: white; border: none; border-radius: 4px;`">{{ confirmDialog.confirmText || '确定' }}</button>
        </div>
      </div>
    </Dialog>

    <!-- 桌面端浮动粘贴按钮 -->
    <div
      v-if="clipboard && !isMobile"
      class="floating-paste-button desktop"
      :class="{ 'auto-hide': !isNearPasteButton }"
      :style="{ left: pasteButtonPosition.x + 'px', top: pasteButtonPosition.y + 'px' }"
      @mousedown="startDragPasteButton"
      @click="handlePasteButtonClick"
      @mouseenter="isNearPasteButton = true"
      @mouseleave="isNearPasteButton = false"
    >
      <div class="paste-button-content">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        </svg>
        <span>粘贴</span>
        <kbd class="shortcut-hint">Ctrl+V</kbd>
      </div>
      <div class="paste-file-info">
        {{ Array.isArray(clipboard) ? `${clipboard.length} 个文件` : clipboard.split('/').pop() }}
      </div>
    </div>

    <!-- 移动端底部粘贴工具栏 -->
    <div
      v-if="clipboard && isMobile"
      class="mobile-paste-toolbar"
    >
      <div class="paste-toolbar-content" @click="handlePasteButtonClick">
        <div class="paste-info">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
          </svg>
          <span class="paste-text">
            粘贴 {{ Array.isArray(clipboard) ? `${clipboard.length} 个文件` : clipboard.split('/').pop() }}
          </span>
        </div>
        <button class="paste-close-btn" @click.stop="clipboard = null">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 自定义提示组件 -->
    <div v-if="showToast" class="custom-toast" :class="toastType">
      <div class="toast-content">
        <svg v-if="toastType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <svg v-else-if="toastType === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </div>

    <div style="flex:1"></div>

    <!-- 快捷键说明 -->
    <div v-if="!needLogin" class="keyboard-shortcuts">
      <div class="shortcuts-container">
        <h4 class="shortcuts-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          快捷键
        </h4>
        <div class="shortcuts-grid">
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>A</kbd>
            <span>切换多选模式</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>V</kbd>
            <span>粘贴文件</span>
          </div>
          <div class="shortcut-item">
            <kbd>ESC</kbd>
            <span>退出多选模式</span>
          </div>
          <div class="shortcut-item">
            <kbd>Delete</kbd>
            <span>删除选中文件</span>
          </div>
          <div class="shortcut-item mobile-only">
            <span class="touch-icon">📱</span>
            <span>点击"多选模式"按钮进入多选</span>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import {
  generateThumbnail,
  blobDigest,
  multipartUpload,
  SIZE_LIMIT,
} from "/assets/main.mjs";
import Dialog from "./Dialog.vue";
import Menu from "./Menu.vue";
import MimeIcon from "./MimeIcon.vue";
import UploadPopup from "./UploadPopup.vue";
import Footer from "./Footer.vue";
import MediaPreview from "./MediaPreview.vue";

export default {
  data: () => ({
    cwd: new URL(window.location).searchParams.get("p") || "",
    files: [],
    folders: [],
    clipboard: null,
    focusedItem: null,
    loading: false,
    order: null,
    search: "",
    searchResults: [], // 全局搜索结果
    isSearching: false, // 搜索状态
    searchTimeout: null, // 搜索防抖定时器
    isSearchExpanded: false, // 搜索框是否展开
    showContextMenu: false,
    showMenu: false,
    showUploadPopup: false,
    uploadProgress: null,
    uploadQueue: [],
    backgroundImageUrl: "/assets/bg-cat.webp",
    needLogin: false,
    isGuest: true, // 默认为游客状态
    isLoggedIn: false,
    currentUser: null, // 当前用户信息
    // 模态框相关
    showModal: false,
    loginForm: {
      username: '',
      password: ''
    },
    loginLoading: false,
    loginError: '',
    // 媒体预览相关
    showMediaPreview: false,
    previewMediaList: [],
    previewInitialIndex: 0,
    // 自定义对话框相关
    showInputDialog: false,
    inputDialog: {
      title: '',
      placeholder: '',
      value: '',
      resolve: null,
      reject: null
    },
    showFolderDialog: false,
    folderDialog: {
      title: '',
      folders: [],
      selectedFolder: null,
      resolve: null,
      reject: null
    },
    showConfirmDialog: false,
    confirmDialog: {
      title: '',
      message: '',
      type: 'default', // 'default', 'danger'
      confirmText: '',
      cancelText: '',
      resolve: null,
      reject: null
    },
    // 浮动粘贴按钮相关
    pasteButtonPosition: { x: 0, y: 0 },
    isDraggingPasteButton: false,
    dragOffset: { x: 0, y: 0 },
    dragStartTime: 0,
    hasMoved: false,
    // 自定义提示相关
    showToast: false,
    toastMessage: '',
    toastType: 'success', // 'success', 'error', 'warning'
    // 多选功能相关
    selectedFiles: [], // 选中的文件列表
    isMultiSelectMode: false, // 是否处于多选模式
    showBatchActions: false, // 是否显示批量操作栏
    // 粘贴按钮相关
    isNearPasteButton: false
  }),

  computed: {
    filteredFiles() {
      // 如果有搜索词且有搜索结果，显示搜索结果
      if (this.search && this.searchResults.length > 0) {
        return this.searchResults.filter(item => !item.isFolder);
      }

      // 否则显示当前目录的文件
      let files = this.files;
      if (this.search && !this.isSearching) {
        // 本地搜索作为备选
        files = files.filter((file) =>
          file.key.split("/").pop().toLowerCase().includes(this.search.toLowerCase())
        );
      }
      return files;
    },

    filteredFolders() {
      // 如果有搜索词且有搜索结果，显示搜索结果中的文件夹
      if (this.search && this.searchResults.length > 0) {
        return this.searchResults.filter(item => item.isFolder).map(item => item.key);
      }

      // 否则显示当前目录的文件夹
      let folders = this.folders;
      if (this.search && !this.isSearching) {
        // 本地搜索作为备选
        folders = folders.filter((folder) =>
          folder.toLowerCase().includes(this.search.toLowerCase())
        );
      }
      return folders;
    },

    // 检查是否可以上传（登录用户或有上传权限的游客）
    canUpload() {
      // 游客不允许上传
      if (this.isGuest) {
        return false;
      }
      // 只读用户不允许上传
      if (this.isReadOnlyUser) {
        return false;
      }
      // 已登录用户可以上传
      return this.isLoggedIn;
    },



    // 检查是否是只读用户
    isReadOnlyUser() {
      return this.currentUser && this.currentUser.isReadOnly;
    },

    // 检测是否为移动端
    isMobile() {
      return window.innerWidth <= 768;
    },

    // 检查是否可以进行写操作（移动、复制、粘贴、删除）
    canWrite() {
      // 游客不允许写操作
      if (this.isGuest) {
        return false;
      }
      // 只读用户不允许写操作
      if (this.isReadOnlyUser) {
        return false;
      }
      // 已登录用户可以写操作
      return this.isLoggedIn;
    },
  },

  mounted() {
    // 检查是否有保存的认证信息
    const savedCredentials = localStorage.getItem('authCredentials');
    if (savedCredentials) {
      this.setAuthHeader(savedCredentials);
      // 恢复用户信息
      this.restoreUserInfo();
    }
    this.fetchFiles();
    this.initPasteButtonPosition();

    // 添加键盘快捷键监听
    document.addEventListener('keydown', this.handleKeyDown);
  },

  beforeUnmount() {
    // 清理事件监听器
    document.removeEventListener('mousemove', this.dragPasteButton);
    document.removeEventListener('mouseup', this.stopDragPasteButton);
    document.removeEventListener('touchmove', this.dragPasteButton);
    document.removeEventListener('touchend', this.stopDragPasteButton);
    document.removeEventListener('keydown', this.handleKeyDown);
  },

  methods: {
    // 搜索输入处理
    onSearchInput() {
      // 清除之前的定时器
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // 如果搜索框为空，清空结果并收回搜索框
      if (!this.search.trim()) {
        this.searchResults = [];
        this.isSearching = false;
        this.isSearchExpanded = false;
        // 恢复页面滚动
        document.body.style.overflow = '';
        document.body.style.overflowX = '';
        document.documentElement.style.overflowX = '';
        return;
      }

      // 设置新的定时器，防抖处理
      this.searchTimeout = setTimeout(() => {
        this.performSearch();
      }, 300);
    },

    // 搜索框获得焦点
    onSearchFocus() {
      this.isSearchExpanded = true;
      // 防止页面滚动（仅在移动端）
      if (window.innerWidth <= 768) {
        document.body.style.overflow = 'hidden';
        document.body.style.overflowX = 'hidden'; // 强制防止水平滚动
        document.documentElement.style.overflowX = 'hidden'; // 也设置html元素
      }
    },

    // 搜索框失去焦点
    onSearchBlur() {
      // 延迟收回，避免点击搜索结果时立即收回
      setTimeout(() => {
        if (!this.search.trim()) {
          this.isSearchExpanded = false;
          // 恢复页面滚动
          document.body.style.overflow = '';
          document.body.style.overflowX = '';
          document.documentElement.style.overflowX = '';
        }
      }, 200);
    },

    // 执行搜索
    async performSearch() {
      if (!this.search.trim()) return;

      this.isSearching = true;
      try {
        // 这里可以实现实际的搜索逻辑
        // 暂时使用本地过滤作为示例
        this.searchResults = this.files.filter(file =>
          file.key.toLowerCase().includes(this.search.toLowerCase())
        );
      } catch (error) {
        console.error('搜索失败:', error);
      } finally {
        this.isSearching = false;
      }
    },

    copyLink(link) {
      const url = new URL(link, window.location.origin);
      navigator.clipboard.writeText(url.toString());
    },

    // 复制单个文件到剪贴板
    copyFile(fileKey) {
      this.clipboard = fileKey;
      this.showCustomToast('文件已复制到剪贴板', 'success');
      // 关闭右键菜单
      this.showContextMenu = false;
    },

    async copyPaste(source, target) {
      const uploadUrl = `/api/write/items/${target}`;

      // 准备请求头
      const headers = {
        "x-amz-copy-source": encodeURIComponent(source),
        "Content-Type": "application/octet-stream"
      };
      const savedCredentials = localStorage.getItem('authCredentials');
      if (savedCredentials) {
        headers['Authorization'] = `Basic ${savedCredentials}`;
      }

      console.log('🔄 copyPaste 开始:', { source, target, uploadUrl });

      try {
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          headers: headers,
          body: ""
        });

        console.log('🔄 copyPaste 响应:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        // 检查响应状态
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // 抛出特殊的权限错误，让调用方处理
            const authError = new Error(`权限不足：无法写入到目标路径 ${target}`);
            authError.isAuthError = true;
            authError.status = response.status;
            console.log('🔒 copyPaste 权限错误:', authError);
            throw authError;
          }
          // 其他HTTP错误
          const httpError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          console.log('❌ copyPaste HTTP错误:', httpError);
          throw httpError;
        }

        console.log('✅ copyPaste 成功完成');
      } catch (error) {
        console.log('❌ copyPaste 捕获错误:', error);

        // 如果已经是我们的权限错误，直接抛出
        if (error.isAuthError) {
          throw error;
        }

        // 检查是否是网络错误导致的权限问题
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
          const authError = new Error(`权限不足：无法写入到目标路径 ${target}`);
          authError.isAuthError = true;
          authError.originalError = error;
          throw authError;
        }

        // 网络错误或其他错误
        const generalError = new Error(`复制粘贴失败: ${error.message}`);
        generalError.originalError = error;
        throw generalError;
      }
    },

    // 删除文件的统一方法
    async deleteFile(key) {
      const deleteUrl = `/api/write/items/${key}`;

      // 准备请求头
      const headers = {};
      const savedCredentials = localStorage.getItem('authCredentials');
      if (savedCredentials) {
        headers['Authorization'] = `Basic ${savedCredentials}`;
      }

      try {
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: headers
        });

        // 检查响应状态
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            // 抛出特殊的权限错误，让调用方处理
            const authError = new Error('需要登录或权限不足');
            authError.isAuthError = true;
            authError.status = response.status;
            throw authError;
          }
          // 其他HTTP错误
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        // 如果已经是我们的权限错误，直接抛出
        if (error.isAuthError) {
          throw error;
        }
        // 网络错误或其他错误
        throw new Error(`删除文件失败: ${error.message}`);
      }
    },

    async createFolder() {
      try {
        const folderName = await this.showInputPrompt("创建文件夹", "请输入文件夹名称");
        if (!folderName) return;
        this.showUploadPopup = false;
        const uploadUrl = `/api/write/items/${this.cwd}${folderName}/_$folder$`;
        await axios.put(uploadUrl, "");
        this.fetchFiles();
      } catch (error) {
        if (error === null) return; // 用户取消
        fetch("/api/write/")
          .then((value) => {
            if (value.redirected) window.location.href = value.url;
          })
          .catch(() => { });
        console.log(`Create folder failed`);
      }
    },

    fetchFiles() {
      this.files = [];
      this.folders = [];
      this.loading = true;
      this.needLogin = false;

      // 准备请求头
      const headers = {};
      const savedCredentials = localStorage.getItem('authCredentials');
      if (savedCredentials) {
        headers['Authorization'] = `Basic ${savedCredentials}`;
      }

      fetch(`/api/children/${this.cwd}`, { headers })
        .then((res) => res.json())
        .then((data) => {
          if (data.needLogin) {
            // 需要登录 - 静默处理，不弹出登录框
            this.needLogin = true;
            this.isLoggedIn = false;
            this.isGuest = true;
            this.loading = false;
            return;
          }

          this.needLogin = false;
          this.files = data.value || [];
          this.folders = data.folders || [];
          this.isGuest = data.isGuest || false;
          this.isLoggedIn = !this.isGuest;

          if (this.order) {
            this.files.sort((a, b) => {
              if (this.order === "size") {
                return b.size - a.size;
              }
            });
          }
          this.loading = false;
        })
        .catch((error) => {
          console.error('获取文件列表失败:', error);
          this.loading = false;
        });
    },

    formatSize(size) {
      const units = ["B", "KB", "MB", "GB", "TB"];
      let i = 0;
      while (size >= 1024) {
        size /= 1024;
        i++;
      }
      return `${size.toFixed(1)} ${units[i]}`;
    },

    onDrop(ev) {
      // 检查是否有上传权限
      if (!this.canUpload) {
        if (this.needLogin) {
          this.triggerLogin();
        }
        return;
      }

      let files;
      if (ev.dataTransfer.items) {
        files = [...ev.dataTransfer.items]
          .filter((item) => item.kind === "file")
          .map((item) => item.getAsFile());
      } else files = ev.dataTransfer.files;
      this.uploadFiles(files);
    },

    // 显示登录模态框
    showLoginModal() {
      this.showModal = true;
      this.loginError = '';
      this.loginForm.username = '';
      this.loginForm.password = '';
    },

    // 关闭登录模态框
    closeModal() {
      this.showModal = false;
      this.loginError = '';
      this.loginLoading = false;
    },

    // 处理登录
    async handleLogin() {
      this.loginLoading = true;
      this.loginError = '';

      try {
        // 创建Basic Auth头
        const credentials = btoa(`${this.loginForm.username}:${this.loginForm.password}`);

        // 使用专门的登录端点验证
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        const data = await response.json();

        if (data.success) {
          // 登录成功，设置认证头到全局并保存用户信息
          this.setAuthHeader(credentials, data.user);
          this.currentUser = data.user; // 保存用户信息
          this.isLoggedIn = true;
          this.isGuest = false;
          this.closeModal();

          // 登录成功后刷新当前目录，显示用户有权限的内容
          // 不自动跳转，让用户在根目录看到他们可以访问的目录
          setTimeout(() => {
            this.fetchFiles();
          }, 100);
        } else {
          // 处理登录失败，包括限制相关的错误
          this.loginError = data.message || '登录失败';

          // 如果用户被封禁，显示特殊样式
          if (data.banned) {
            this.loginError = `🔒 ${this.loginError}`;
          } else if (data.remainingAttempts !== undefined && data.remainingAttempts < 5) {
            // 如果剩余尝试次数较少，给出警告
            this.loginError += ` ⚠️`;
          }
        }
      } catch (error) {
        this.loginError = '登录失败，请重试';
        console.error('登录错误:', error);
      } finally {
        this.loginLoading = false;
      }
    },

    // 设置认证头
    setAuthHeader(credentials, userInfo = null) {
      // 将认证信息存储到localStorage，以便后续请求使用
      localStorage.setItem('authCredentials', credentials);

      // 如果提供了用户信息，也保存到localStorage
      if (userInfo) {
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
      }

      // 设置默认的axios请求头
      if (window.axios) {
        window.axios.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
      }
    },

    // 恢复用户信息
    restoreUserInfo() {
      try {
        const savedUserInfo = localStorage.getItem('currentUser');
        if (savedUserInfo) {
          this.currentUser = JSON.parse(savedUserInfo);
          this.isLoggedIn = true;
          this.isGuest = false;
        }
      } catch (error) {
        console.error('恢复用户信息失败:', error);
        // 出错时清除认证信息
        this.clearAuthHeader();
      }
    },

    // 获取用户状态文本
    getUserStatusText() {
      if (this.isGuest) {
        return '游客模式';
      } else if (this.currentUser) {
        const username = this.currentUser.username;
        const readOnlyText = this.currentUser.isReadOnly ? ' (只读)' : '';
        return `${username} 已登录${readOnlyText}`;
      } else {
        return '已登录';
      }
    },

    // 获取顶部用户状态文本（简化版）
    getTopUserStatusText() {
      if (!this.isLoggedIn) {
        return '登录';
      } else if (this.currentUser) {
        const username = this.currentUser.username;
        const readOnlyText = this.currentUser.isReadOnly ? ' (只读)' : '';
        return `${username}${readOnlyText}`;
      } else {
        return '已登录';
      }
    },

    // 获取用户描述文本
    getUserDescText() {
      if (this.isGuest) {
        return '只能查看文件';
      } else if (this.isReadOnlyUser) {
        return '只能查看文件，无法上传或修改';
      } else {
        return '可以上传和管理文件';
      }
    },

    // 清除认证头
    clearAuthHeader() {
      localStorage.removeItem('authCredentials');
      localStorage.removeItem('currentUser');
      if (window.axios) {
        delete window.axios.defaults.headers.common['Authorization'];
      }
    },

    // 切换用户
    switchUser() {
      this.isLoggedIn = false;
      this.isGuest = true;
      this.needLogin = false;
      this.loginForm.username = '';
      this.loginForm.password = '';
      this.loginError = '';
      // 不关闭模态框，直接切换到登录表单
    },

    // 退出登录
    logout() {
      this.clearAuthHeader(); // 清除认证信息
      this.currentUser = null; // 清除用户信息
      this.isLoggedIn = false;
      this.isGuest = true;
      this.needLogin = false;
      this.closeModal();
      this.fetchFiles(); // 刷新文件列表，显示游客视图
    },

    // 触发登录（保留原方法用于拖拽上传时的登录）
    triggerLogin() {
      this.showLoginModal();
    },

    // 自定义输入对话框
    showInputPrompt(title, placeholder = '', defaultValue = '') {
      return new Promise((resolve, reject) => {
        this.inputDialog = {
          title,
          placeholder,
          value: defaultValue,
          resolve,
          reject
        };
        this.showInputDialog = true;
        // 等待DOM更新后聚焦输入框
        this.$nextTick(() => {
          if (this.$refs.inputField) {
            this.$refs.inputField.focus();
          }
        });
      });
    },

    confirmInput() {
      if (this.inputDialog.resolve) {
        this.inputDialog.resolve(this.inputDialog.value);
      }
      this.showInputDialog = false;
    },

    cancelInput() {
      if (this.inputDialog.reject) {
        this.inputDialog.reject(null);
      }
      this.showInputDialog = false;
    },

    // 自定义确认对话框
    showConfirmPrompt(title, message, options = {}) {
      return new Promise((resolve, reject) => {
        this.confirmDialog = {
          title,
          message,
          type: options.type || 'default',
          confirmText: options.confirmText || '确定',
          cancelText: options.cancelText || '取消',
          resolve,
          reject
        };
        this.showConfirmDialog = true;
      });
    },

    confirmAction() {
      if (this.confirmDialog.resolve) {
        this.confirmDialog.resolve(true);
      }
      this.showConfirmDialog = false;
    },

    cancelConfirm() {
      if (this.confirmDialog.reject) {
        this.confirmDialog.reject(false);
      }
      this.showConfirmDialog = false;
    },

    // 多选功能相关方法
    toggleMultiSelectMode() {
      this.isMultiSelectMode = !this.isMultiSelectMode;
      if (!this.isMultiSelectMode) {
        this.selectedFiles = [];
      }
    },



    isFileSelected(fileKey) {
      return this.selectedFiles.includes(fileKey);
    },

    toggleFileSelection(fileKey) {
      const index = this.selectedFiles.indexOf(fileKey);
      if (index > -1) {
        // 文件已选中，取消选择
        this.selectedFiles.splice(index, 1);
      } else {
        // 文件未选中，添加到选择列表
        this.selectedFiles.push(fileKey);
      }
    },

    selectAllFiles() {
      if (this.selectedFiles.length === this.filteredFiles.length) {
        // 取消全选
        this.selectedFiles = [];
      } else {
        // 全选
        this.selectedFiles = this.filteredFiles.map(file => file.key);
      }
    },

    // 批量操作方法
    async batchDownload() {
      if (this.selectedFiles.length === 0) return;

      try {
        for (const fileKey of this.selectedFiles) {
          const link = document.createElement('a');
          link.href = `/raw/${fileKey}`;
          link.download = fileKey.split('/').pop();
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          // 添加小延迟避免浏览器阻止多个下载
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        this.showCustomToast(`开始下载 ${this.selectedFiles.length} 个文件`, 'success');
      } catch (error) {
        this.showCustomToast('批量下载失败: ' + error.message, 'error');
      }
    },

    batchCopy() {
      if (this.selectedFiles.length === 0) return;

      // 复制操作不需要写权限，只是复制到剪贴板
      this.clipboard = this.selectedFiles.length === 1 ? this.selectedFiles[0] : this.selectedFiles;
      this.showCustomToast(`已复制 ${this.selectedFiles.length} 个文件到剪贴板`, 'success');
    },

    async batchMove() {
      if (this.selectedFiles.length === 0) return;

      // 检查写权限
      if (!this.canWrite) {
        this.showPermissionDialog('移动文件');
        return;
      }

      try {
        console.log('🚀 开始批量移动文件:', this.selectedFiles);

        // 获取可访问的目录列表
        const accessibleFolders = await this.getAccessibleFolders();

        if (accessibleFolders.length === 0) {
          this.showCustomToast('没有可用的目标目录，您可能没有足够的权限', 'error');
          return;
        }

        // 显示目录选择对话框
        const targetPath = await this.showFolderSelector(
          `移动 ${this.selectedFiles.length} 个文件`,
          accessibleFolders.map(folder => ({
            value: folder.path,
            display: folder.displayName
          }))
        );

        if (targetPath === null) return; // 用户取消

        // 批量移动文件
        let successCount = 0;
        let failCount = 0;

        for (const sourceFile of this.selectedFiles) {
          try {
            const fileName = sourceFile.split('/').pop();
            const targetFile = targetPath === '' ? fileName : `${targetPath}${fileName}`;

            await this.copyPaste(sourceFile, targetFile);
            await this.deleteFile(sourceFile);
            successCount++;
          } catch (error) {
            console.error(`移动文件 ${sourceFile} 失败:`, error);
            failCount++;
          }
        }

        // 清空选择并刷新文件列表
        this.selectedFiles = [];
        this.fetchFiles();

        if (failCount === 0) {
          this.showCustomToast(`成功移动 ${successCount} 个文件`, 'success');
        } else {
          this.showCustomToast(`移动完成：成功 ${successCount} 个，失败 ${failCount} 个`, 'warning');
        }

      } catch (error) {
        console.error('批量移动失败:', error);
        if (error.isAuthError) {
          this.showPermissionDialog('移动文件');
        } else {
          this.showCustomToast('批量移动失败: ' + (error.message || '未知错误'), 'error');
        }
      }
    },

    async batchDelete() {
      if (this.selectedFiles.length === 0) return;

      // 检查写权限
      if (!this.canWrite) {
        this.showPermissionDialog('删除文件');
        return;
      }

      try {
        const fileNames = this.selectedFiles.map(key => key.split('/').pop()).join('、');
        const confirmed = await this.showConfirmPrompt(
          '批量删除文件',
          `确定要删除以下 ${this.selectedFiles.length} 个文件吗？\n\n${fileNames}\n\n此操作无法撤销。`,
          { type: 'danger', confirmText: '删除', cancelText: '取消' }
        );

        if (!confirmed) return;

        let successCount = 0;
        let failCount = 0;

        for (const fileKey of this.selectedFiles) {
          try {
            await this.deleteFile(fileKey);
            successCount++;
          } catch (error) {
            console.error(`删除文件 ${fileKey} 失败:`, error);
            failCount++;
          }
        }

        // 清空选择并刷新文件列表
        this.selectedFiles = [];
        this.fetchFiles();

        if (failCount === 0) {
          this.showCustomToast(`成功删除 ${successCount} 个文件`, 'success');
        } else {
          this.showCustomToast(`删除完成：成功 ${successCount} 个，失败 ${failCount} 个`, 'warning');
        }

      } catch (error) {
        if (error === false) return; // 用户取消

        console.error('批量删除失败:', error);
        if (error.isAuthError) {
          this.showPermissionDialog('删除文件');
        } else {
          this.showCustomToast('批量删除失败: ' + (error.message || '未知错误'), 'error');
        }
      }
    },

    // 键盘快捷键处理
    handleKeyDown(event) {
      // Ctrl+A 或 Cmd+A：切换多选模式
      if ((event.ctrlKey || event.metaKey) && event.key === 'a' && !event.target.matches('input, textarea')) {
        event.preventDefault();
        this.toggleMultiSelectMode();
        return;
      }

      // Ctrl+V 或 Cmd+V：粘贴文件
      if ((event.ctrlKey || event.metaKey) && event.key === 'v' && !event.target.matches('input, textarea') && this.clipboard) {
        event.preventDefault();
        this.pasteFile();
        return;
      }

      // Escape：退出多选模式
      if (event.key === 'Escape' && this.isMultiSelectMode) {
        this.isMultiSelectMode = false;
        this.selectedFiles = [];
        return;
      }

      // Delete：删除选中的文件
      if (event.key === 'Delete' && this.selectedFiles.length > 0) {
        event.preventDefault();
        this.batchDelete();
        return;
      }
    },

    // 自定义文件夹选择对话框
    showFolderSelector(title, folders) {
      console.log('📂 showFolderSelector 被调用:', { title, folders });
      return new Promise((resolve, reject) => {
        console.log('📂 创建 Promise，设置对话框状态');
        this.folderDialog = {
          title,
          folders,
          selectedFolder: null,
          resolve: (value) => {
            console.log('📂 对话框 resolve 被调用:', value);
            resolve(value);
          },
          reject: (error) => {
            console.log('📂 对话框 reject 被调用:', error);
            reject(error);
          }
        };
        this.showFolderDialog = true;
        console.log('📂 对话框显示状态设置为 true');
      });
    },

    selectFolder(folder) {
      console.log('📂 selectFolder 被调用:', folder);
      this.folderDialog.selectedFolder = folder.value;
      console.log('📂 选中的文件夹:', this.folderDialog.selectedFolder);
    },

    confirmFolderSelection() {
      console.log('📂 confirmFolderSelection 被调用');
      console.log('📂 当前选中的文件夹:', this.folderDialog.selectedFolder);
      console.log('📂 resolve 函数存在:', !!this.folderDialog.resolve);

      if (this.folderDialog.resolve && this.folderDialog.selectedFolder !== null) {
        console.log('📂 调用 resolve，返回值:', this.folderDialog.selectedFolder);
        this.folderDialog.resolve(this.folderDialog.selectedFolder);
      } else {
        console.log('📂 无法调用 resolve - 条件不满足');
      }
      this.showFolderDialog = false;
      console.log('📂 对话框已关闭');
    },

    cancelFolderSelection() {
      console.log('📂 cancelFolderSelection 被调用');
      if (this.folderDialog.reject) {
        console.log('📂 调用 reject');
        this.folderDialog.reject(null);
      }
      this.showFolderDialog = false;
      console.log('📂 对话框已取消并关闭');
    },

    // 初始化粘贴按钮位置
    initPasteButtonPosition() {
      // 桌面端智能定位：右侧边缘，避开文件列表
      this.pasteButtonPosition = {
        x: window.innerWidth - 240,
        y: 120
      };
    },

    // 浮动粘贴按钮相关方法
    startDragPasteButton(event) {
      this.dragStartTime = Date.now();
      this.hasMoved = false;

      // 支持触摸事件
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      this.dragOffset.x = clientX - this.pasteButtonPosition.x;
      this.dragOffset.y = clientY - this.pasteButtonPosition.y;

      // 添加鼠标和触摸事件监听
      document.addEventListener('mousemove', this.dragPasteButton);
      document.addEventListener('mouseup', this.stopDragPasteButton);
      document.addEventListener('touchmove', this.dragPasteButton);
      document.addEventListener('touchend', this.stopDragPasteButton);

      // 阻止默认行为，但不阻止点击事件
      if (event.type === 'touchstart') {
        event.preventDefault();
      }
    },

    dragPasteButton(event) {
      // 标记已移动
      this.hasMoved = true;
      this.isDraggingPasteButton = true;

      // 支持触摸事件
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;

      this.pasteButtonPosition.x = clientX - this.dragOffset.x;
      this.pasteButtonPosition.y = clientY - this.dragOffset.y;

      // 限制在视窗范围内
      const buttonWidth = this.isMobile ? 50 : 120;
      const buttonHeight = this.isMobile ? 50 : 60;
      this.pasteButtonPosition.x = Math.max(0, Math.min(window.innerWidth - buttonWidth, this.pasteButtonPosition.x));
      this.pasteButtonPosition.y = Math.max(0, Math.min(window.innerHeight - buttonHeight, this.pasteButtonPosition.y));

      event.preventDefault();
    },

    stopDragPasteButton() {
      // 移除所有事件监听器
      document.removeEventListener('mousemove', this.dragPasteButton);
      document.removeEventListener('mouseup', this.stopDragPasteButton);
      document.removeEventListener('touchmove', this.dragPasteButton);
      document.removeEventListener('touchend', this.stopDragPasteButton);

      // 桌面端智能吸附到边缘
      if (!this.isMobile && this.hasMoved) {
        this.snapToEdge();
      }

      // 延迟重置状态
      setTimeout(() => {
        this.isDraggingPasteButton = false;
        this.hasMoved = false;
      }, 100);
    },

    // 拖拽结束后的智能吸附
    snapToEdge() {
      const windowWidth = window.innerWidth;
      const buttonWidth = 220;
      const margin = 20;

      // 吸附到最近的边缘
      if (this.pasteButtonPosition.x < windowWidth / 2) {
        // 吸附到左边
        this.pasteButtonPosition.x = margin;
      } else {
        // 吸附到右边
        this.pasteButtonPosition.x = windowWidth - buttonWidth - margin;
      }

      // 确保不超出屏幕边界
      this.pasteButtonPosition.y = Math.max(80, Math.min(this.pasteButtonPosition.y, window.innerHeight - 100));
    },

    handleTouchEnd(event) {
      // 如果没有移动且时间很短，认为是点击
      const touchDuration = Date.now() - this.dragStartTime;
      if (!this.hasMoved && touchDuration < 300) {
        this.handlePasteButtonClick();
      }
      event.preventDefault();
    },

    async handlePasteButtonClick() {
      // 如果正在拖拽或刚刚移动过，不执行粘贴
      if (this.isDraggingPasteButton || this.hasMoved) {
        return;
      }

      try {
        await this.pasteFile();
      } catch (error) {
        console.error('粘贴文件失败:', error);
        this.showCustomToast('粘贴文件失败: ' + (error.message || error), 'error');
      }
    },

    onMenuClick(text) {
      switch (text) {
        case "按照名称排序A-Z":
          this.order = null;
          break;
        case "按照大小递增排序":
          this.order = "大小↑";
          break;
        case "按照大小递减排序":
          this.order = "大小↓";
          break;
        case "粘贴文件到此目录":
          this.pasteFile();
          return; // 粘贴操作不需要排序
      }
      this.files.sort((a, b) => {
        if (this.order === "大小↑") {
          return a.size - b.size;
        } else if (this.order === "大小↓") {
          return b.size - a.size;
        } else {
          return a.key.localeCompare(b.key);
        }
      });
    },

    onUploadClicked(fileElement) {
      if (!fileElement.value) return;
      this.uploadFiles(fileElement.files);
      this.showUploadPopup = false;
      fileElement.value = null;
    },

    preview(filePath) {
      window.open(filePath);
    },

    // 处理文件点击（区分搜索结果和普通文件）
    handleFileClick(file) {
      // 如果处于多选模式，点击文件切换选择状态
      if (this.isMultiSelectMode) {
        this.toggleFileSelection(file.key);
        return;
      }

      // 检查是否是媒体文件
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
      const videoTypes = ['mp4', 'webm', 'ogv', 'avi', 'mov', 'wmv'];
      const ext = file.key?.split('.').pop()?.toLowerCase();
      const isImageFile = imageTypes.includes(ext);
      const isVideoFile = videoTypes.includes(ext);
      const isMediaFile = isImageFile || isVideoFile;

      if (isMediaFile) {
        // 媒体文件：打开预览
        this.openMediaPreview(file);
      } else if (this.search && this.searchResults.length > 0) {
        // 搜索结果中的非媒体文件：跳转到文件所在目录
        const filePath = file.displayPath || file.key;
        const directory = filePath.substring(0, filePath.lastIndexOf('/') + 1);
        this.search = ''; // 清除搜索
        this.searchResults = [];
        this.cwd = directory;
      } else {
        // 普通非媒体文件：直接预览/下载
        this.preview(`/raw/${file.key}`);
      }
    },

    // 打开媒体预览
    openMediaPreview(clickedFile) {
      // 确定点击文件的类型
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
      const videoTypes = ['mp4', 'webm', 'ogv', 'avi', 'mov', 'wmv'];
      const clickedExt = clickedFile.key?.split('.').pop()?.toLowerCase();
      const isClickedImage = imageTypes.includes(clickedExt);
      const isClickedVideo = videoTypes.includes(clickedExt);

      // 确定媒体文件列表和初始索引
      let mediaList = [];
      let initialIndex = 0;

      if (this.search && this.searchResults.length > 0) {
        // 搜索结果中的同类型媒体文件
        mediaList = this.searchResults.filter(file => {
          if (file.isFolder) return false;
          const ext = file.key?.split('.').pop()?.toLowerCase();
          if (isClickedImage) {
            return imageTypes.includes(ext);
          } else if (isClickedVideo) {
            return videoTypes.includes(ext);
          }
          return false;
        });
      } else {
        // 当前目录中的同类型媒体文件
        mediaList = this.filteredFiles.filter(file => {
          const ext = file.key?.split('.').pop()?.toLowerCase();
          if (isClickedImage) {
            return imageTypes.includes(ext);
          } else if (isClickedVideo) {
            return videoTypes.includes(ext);
          }
          return false;
        });
      }

      // 为每个媒体文件添加预览URL
      mediaList = mediaList.map(file => ({
        ...file,
        url: `/raw/${file.key}`,
        name: file.key.split('/').pop()
      }));

      // 找到点击文件的索引
      initialIndex = mediaList.findIndex(file => file.key === clickedFile.key);
      if (initialIndex === -1) initialIndex = 0;

      // 设置预览数据
      this.previewMediaList = mediaList;
      this.previewInitialIndex = initialIndex;
      this.showMediaPreview = true;
    },

    // 关闭媒体预览
    closeMediaPreview() {
      this.showMediaPreview = false;
      this.previewMediaList = [];
      this.previewInitialIndex = 0;
    },

    async pasteFile() {
      if (!this.clipboard) return;

      // 检查写权限
      if (!this.canWrite) {
        this.showPermissionDialog('粘贴文件');
        return;
      }

      try {
        // 检查是否是多文件粘贴
        if (Array.isArray(this.clipboard)) {
          // 多文件粘贴
          const confirmed = await this.showConfirmPrompt(
            '批量粘贴文件',
            `确定要粘贴 ${this.clipboard.length} 个文件到当前目录吗？`,
            { confirmText: '粘贴', cancelText: '取消' }
          );

          if (!confirmed) return;

          let successCount = 0;
          let failCount = 0;

          for (const sourceFile of this.clipboard) {
            try {
              const fileName = sourceFile.split('/').pop();
              const targetFile = `${this.cwd}${fileName}`;
              await this.copyPaste(sourceFile, targetFile);
              successCount++;
            } catch (error) {
              console.error(`粘贴文件 ${sourceFile} 失败:`, error);
              failCount++;
            }
          }

          this.fetchFiles();

          if (failCount === 0) {
            this.showCustomToast(`成功粘贴 ${successCount} 个文件`, 'success');
          } else {
            this.showCustomToast(`粘贴完成：成功 ${successCount} 个，失败 ${failCount} 个`, 'warning');
          }
        } else {
          // 单文件粘贴
          const defaultName = this.clipboard.split("/").pop();
          let newName = await this.showInputPrompt("粘贴文件", "重命名为:", defaultName);
          if (newName === null || newName === undefined) return;
          if (newName === "") newName = defaultName;
          await this.copyPaste(this.clipboard, `${this.cwd}${newName}`);
          this.fetchFiles();
          this.showCustomToast('文件粘贴成功', 'success');
        }
      } catch (error) {
        if (error === null || error === false) return; // 用户取消

        // 检查是否是权限错误
        if (error.isAuthError) {
          // 显示友好的权限提示，并提供登录选项
          this.showPermissionDialog();
          return;
        }

        console.error('粘贴文件失败:', error);
        this.showCustomToast('粘贴文件失败: ' + (error.message || '未知错误'), 'error');
      }
    },

    // 显示自定义提示
    showCustomToast(message, type = 'success', duration = 3000) {
      this.toastMessage = message;
      this.toastType = type;
      this.showToast = true;

      setTimeout(() => {
        this.showToast = false;
      }, duration);
    },

    // 显示权限对话框
    showPermissionDialog(operation = '粘贴文件') {
      const message = this.isLoggedIn
        ? `您没有权限在此目录${operation}。可能需要更高级别的权限或者此目录为只读。`
        : `您需要登录才能在此目录${operation}。`;

      const action = this.isLoggedIn ? '确定' : '立即登录';

      this.showConfirmPrompt(
        '权限提示',
        `${message}\n\n点击"${action}"${this.isLoggedIn ? '' : '进行身份验证'}`,
        { confirmText: action, cancelText: '取消' }
      ).then((confirmed) => {
        if (confirmed && !this.isLoggedIn) {
          this.showLoginModal();
        }
      }).catch(() => {
        // 用户取消，不做任何操作
      });
    },

    async processUploadQueue() {
      if (!this.uploadQueue.length) {
        this.fetchFiles();
        this.uploadProgress = null;
        return;
      }

      /** @type File **/
      const { basedir, file } = this.uploadQueue.pop(0);
      let thumbnailDigest = null;

      if (file.type.startsWith("image/") || file.type === "video/mp4") {
        try {
          const thumbnailBlob = await generateThumbnail(file);
          const digestHex = await blobDigest(thumbnailBlob);

          const thumbnailUploadUrl = `/api/write/items/_$flaredrive$/thumbnails/${digestHex}.png`;
          try {
            await axios.put(thumbnailUploadUrl, thumbnailBlob);
            thumbnailDigest = digestHex;
          } catch (error) {
            fetch("/api/write/")
              .then((value) => {
                if (value.redirected) window.location.href = value.url;
              })
              .catch(() => { });
            console.log(`Upload ${digestHex}.png failed`);
          }
        } catch (error) {
          console.log(`Generate thumbnail failed`);
        }
      }

      try {
        const uploadUrl = `/api/write/items/${basedir}${file.name}`;
        const headers = {};
        const onUploadProgress = (progressEvent) => {
          var percentCompleted =
            (progressEvent.loaded * 100) / progressEvent.total;
          this.uploadProgress = percentCompleted;
        };
        if (thumbnailDigest) headers["fd-thumbnail"] = thumbnailDigest;
        if (file.size >= SIZE_LIMIT) {
          await multipartUpload(`${basedir}${file.name}`, file, {
            headers,
            onUploadProgress,
          });
        } else {
          await axios.put(uploadUrl, file, { headers, onUploadProgress });
        }
      } catch (error) {
        fetch("/api/write/")
          .then((value) => {
            if (value.redirected) window.location.href = value.url;
          })
          .catch(() => { });
        console.log(`Upload ${file.name} failed`, error);
      }
      setTimeout(this.processUploadQueue);
    },

    async removeFile(key) {
      // 检查写权限
      if (!this.canWrite) {
        this.showPermissionDialog('删除文件');
        return;
      }

      try {
        const fileName = key.split('/').pop();
        const confirmed = await this.showConfirmPrompt(
          '删除文件',
          `确定要删除文件 "${fileName}" 吗？此操作无法撤销。`,
          { type: 'danger', confirmText: '删除', cancelText: '取消' }
        );
        if (!confirmed) return;

        await this.deleteFile(key);
        this.fetchFiles();
        this.showCustomToast(`文件 "${fileName}" 已删除`, 'success');
      } catch (error) {
        if (error === false) return; // 用户取消

        // 检查是否是权限错误
        if (error.isAuthError) {
          this.showPermissionDialog('删除文件');
          return;
        }
        console.error('删除失败:', error);
        this.showCustomToast('删除失败: ' + (error.message || '未知错误'), 'error');
      }
    },

    async renameFile(key) {
      // 检查写权限
      if (!this.canWrite) {
        this.showPermissionDialog('重命名文件');
        return;
      }

      try {
        const currentName = key.split('/').pop();
        const newName = await this.showInputPrompt("重命名文件", "新名称:", currentName);
        if (!newName) return;
        await this.copyPaste(key, `${this.cwd}${newName}`);
        await this.deleteFile(key);
        this.fetchFiles();
      } catch (error) {
        if (error === null) return; // 用户取消

        // 检查是否是权限错误
        if (error.isAuthError) {
          this.showPermissionDialog('重命名文件');
          return;
        }

        console.error('重命名失败:', error);
        this.showCustomToast('重命名失败: ' + (error.message || '未知错误'), 'error');
      }
    },

    async moveFile(key) {
      // 检查写权限
      if (!this.canWrite) {
        this.showPermissionDialog('移动文件');
        return;
      }

      let targetPath = null; // 声明在外层作用域，以便错误处理时使用

      console.log('🚀 开始移动文件:', key);

      try {
        // 获取用户有权限的目录列表
        console.log('📋 获取可访问目录列表...');
        const accessibleFolders = await this.getAccessibleFolders();
        console.log('📋 可访问目录:', accessibleFolders);

        if (accessibleFolders.length === 0) {
          console.log('❌ 没有可访问的目录');
          this.showCustomToast('没有可用的目标目录，您可能没有足够的权限', 'error');
          return;
        }

        // 构建选择列表
        const folderOptions = accessibleFolders.map(folder => {
          const displayName = folder.path === '' ? '根目录' :
            folder.path === this.cwd ? '当前目录' :
              folder.displayName;
          return {
            display: displayName,
            value: folder.path
          };
        });
        console.log('📋 目录选择列表:', folderOptions);

        // 使用自定义文件夹选择器
        console.log('📂 显示目录选择对话框...');
        targetPath = await this.showFolderSelector('选择目标目录', folderOptions);
        console.log('📂 用户选择的目标路径:', targetPath);
        if (targetPath === null || targetPath === undefined) {
          console.log('❌ 用户取消了操作');
          return; // 用户取消
        }

        // 获取文件名
        const fileName = key.split('/').pop();
        // 如果是文件夹,需要移除_$folder$后缀
        const finalFileName = fileName.endsWith('_$folder$') ? fileName.slice(0, -9) : fileName;
        console.log('📄 文件信息:', { fileName, finalFileName, isFolder: key.endsWith('_$folder$') });

        // 修复：正确处理目标路径，避免双斜杠
        const normalizedPath = targetPath === '' ? '' : (targetPath.endsWith('/') ? targetPath : targetPath + '/');
        console.log('📁 路径信息:', { targetPath, normalizedPath });

        // 如果是目录（以_$folder$结尾），则需要移动整个目录内容
        if (key.endsWith('_$folder$')) {
          console.log('📁 检测到目录移动，开始处理目录内容...');
          // 获取源目录的基础路径（移除_$folder$后缀）
          const sourceBasePath = key.slice(0, -9);
          // 获取目标目录的基础路径，修复根目录的情况
          const targetBasePath = normalizedPath + finalFileName + '/';

          // 递归获取所有子文件和子目录
          const allItems = await this.getAllItems(sourceBasePath);

          // 显示进度提示
          const totalItems = allItems.length;
          let processedItems = 0;

          // 移动所有项目
          for (const item of allItems) {
            const relativePath = item.key.substring(sourceBasePath.length);
            const newPath = targetBasePath + relativePath;

            try {
              // 复制到新位置
              await this.copyPaste(item.key, newPath);
              // 删除原位置
              await this.deleteFile(item.key);

              // 更新进度
              processedItems++;
              this.uploadProgress = (processedItems / totalItems) * 100;
            } catch (itemError) {
              console.error(`移动 ${item.key} 失败:`, itemError);
              // 如果是权限错误，停止整个操作并抛出错误
              if (itemError.isAuthError) {
                throw itemError;
              }
              // 其他错误记录但继续处理其他文件
            }
          }

          // 移动目录标记
          const targetFolderPath = targetBasePath.slice(0, -1) + '_$folder$';
          try {
            await this.copyPaste(key, targetFolderPath);
            await this.deleteFile(key);
          } catch (folderError) {
            // 如果是权限错误，重新抛出
            if (folderError.isAuthError) {
              throw folderError;
            }
            // 其他错误也抛出
            const error = new Error(`移动目录标记失败: ${folderError.message || folderError}`);
            error.originalError = folderError;
            throw error;
          }

          // 清除进度
          this.uploadProgress = null;
        } else {
          // 单文件移动逻辑，修复根目录的情况
          const targetFilePath = normalizedPath + finalFileName;

          console.log('🔍 移动文件调试信息:');
          console.log('- 源文件:', key);
          console.log('- 目标路径:', targetPath);
          console.log('- 目标文件路径:', targetFilePath);
          console.log('- 标准化路径:', normalizedPath);

          try {
            console.log('📤 开始复制文件...');
            await this.copyPaste(key, targetFilePath);
            console.log('✅ 复制成功，开始删除原文件...');
            await this.deleteFile(key);
            console.log('✅ 删除成功，移动完成');
          } catch (moveError) {
            console.error('❌ 移动过程中出错:', moveError);
            console.log('- 错误类型:', typeof moveError);
            console.log('- 是否权限错误:', moveError.isAuthError);
            console.log('- 错误消息:', moveError.message);
            console.log('- 完整错误对象:', moveError);

            // 如果是权限错误，重新抛出以便外层catch处理
            if (moveError.isAuthError) {
              throw moveError;
            }
            // 其他错误也抛出，但添加更多上下文
            const error = new Error(`移动文件失败: ${moveError.message || moveError}`);
            error.originalError = moveError;
            throw error;
          }
        }

        // 刷新文件列表
        this.fetchFiles();

        // 显示成功提示
        const targetDisplayName = targetPath === '' ? '根目录' :
          targetPath.replace(/.*\/(?!$)|\//g, '') + '/';
        const displayFileName = finalFileName; // 使用之前已经处理过的文件名
        this.showCustomToast(`文件 "${displayFileName}" 已成功移动到 ${targetDisplayName}`, 'success');
      } catch (error) {
        console.log('❌ 移动文件过程中捕获到错误:', error);
        console.log('- 错误类型:', typeof error);
        console.log('- 错误值:', error);
        console.log('- 是否为null:', error === null);
        console.log('- 是否权限错误:', error && error.isAuthError);
        console.log('- 目标路径:', targetPath);

        if (error === null) {
          console.log('✅ 用户取消操作');
          return; // 用户取消
        }

        // 检查是否是权限错误
        if (error.isAuthError) {
          console.log('🔒 检测到权限错误，显示权限对话框');
          this.showPermissionDialog('移动文件');
          return;
        }

        console.error('❌ 移动失败:', error);

        // 根据目标路径给出更具体的错误提示
        const targetDisplayName = targetPath === '' ? '根目录' :
          targetPath.replace(/.*\/(?!$)|\//g, '') + '/';
        console.log('📢 显示错误提示:', targetDisplayName);
        this.showCustomToast(`移动文件到 ${targetDisplayName} 失败：您可能没有该目录的写入权限，或者目标路径不正确。`, 'error', 5000);
      }
    },

    // 获取用户有权限访问的目录列表
    async getAccessibleFolders() {
      const accessibleFolders = [];

      // 如果是只读用户，直接返回空列表
      if (this.isReadOnlyUser) {
        return accessibleFolders;
      }

      // 检查写入权限：使用专门的权限检查API
      const checkWritePermission = async (path) => {
        try {
          // 准备请求头
          const headers = {
            'Content-Type': 'application/json'
          };
          const savedCredentials = localStorage.getItem('authCredentials');
          if (savedCredentials) {
            headers['Authorization'] = `Basic ${savedCredentials}`;
          }

          const response = await fetch('/api/auth/check-write-permission', {
            method: 'POST',
            headers,
            body: JSON.stringify({ path })
          });

          const result = await response.json();

          console.log(`🔍 权限检查 - 路径: ${path}, 结果:`, result);

          if (result.hasPermission) {
            console.log(`✅ 权限检查通过 - 路径: ${path}`);
            return true;
          } else {
            console.log(`❌ 权限检查失败 - 路径: ${path}`);
            return false;
          }
        } catch (error) {
          console.log(`❌ 权限检查异常 - 路径: ${path}, 错误:`, error);
          return false;
        }
      };

      // 收集所有可能的目录
      const allPossibleFolders = new Set();

      // 1. 添加根目录
      allPossibleFolders.add('');

      // 2. 添加上级目录
      if (this.cwd !== '') {
        const parentPath = this.cwd.replace(/[^\/]+\/$/, '');
        allPossibleFolders.add(parentPath);
      }

      // 4. 添加当前目录下的子目录
      if (this.folders && this.folders.length > 0) {
        for (const folder of this.folders) {
          allPossibleFolders.add(folder);
        }
      }

      // 5. 尝试发现根目录下的其他顶级目录
      try {
        const headers = {};
        const savedCredentials = localStorage.getItem('authCredentials');
        if (savedCredentials) {
          headers['Authorization'] = `Basic ${savedCredentials}`;
        }

        const response = await fetch(`/api/children/`, { headers });
        const data = await response.json();

        if (!data.needLogin && data.folders) {
          // 添加根目录下的所有目录
          for (const folder of data.folders) {
            allPossibleFolders.add(folder);
          }
        }
      } catch (error) {
        console.error('获取根目录失败:', error);
      }

      // 6. 检查每个目录的写入权限并构建结果
      for (const path of allPossibleFolders) {
        // 跳过当前目录，因为移动到当前目录没有意义
        if (path === this.cwd) {
          continue;
        }

        if (await checkWritePermission(path)) {
          let displayName;

          if (path === '') {
            displayName = '根目录';
          } else if (this.cwd !== '' && path === this.cwd.replace(/[^\/]+\/$/, '')) {
            const parentDisplayName = path === '' ? '根目录' :
              path.replace(/.*\/(?!$)|\//g, '') + '/';
            displayName = `上级目录 (${parentDisplayName})`;
          } else {
            displayName = path.replace(/.*\/(?!$)|\//g, '') + '/';
          }

          accessibleFolders.push({
            path: path,
            displayName: displayName
          });
        }
      }

      // 去重
      const uniqueFolders = accessibleFolders.filter((folder, index, self) =>
        index === self.findIndex(f => f.path === folder.path)
      );

      // 排序：根目录 -> 上级目录 -> 其他目录
      uniqueFolders.sort((a, b) => {
        if (a.path === '') return -1;
        if (b.path === '') return 1;
        if (a.displayName.includes('上级目录')) return -1;
        if (b.displayName.includes('上级目录')) return 1;
        return a.displayName.localeCompare(b.displayName);
      });

      return uniqueFolders;
    },

    // 新增：递归获取目录下所有文件和子目录
    async getAllItems(prefix) {
      const items = [];
      let marker = null;

      do {
        const url = new URL(`/api/children/${prefix}`, window.location.origin);
        if (marker) {
          url.searchParams.set('marker', marker);
        }

        // 准备请求头
        const headers = {};
        const savedCredentials = localStorage.getItem('authCredentials');
        if (savedCredentials) {
          headers['Authorization'] = `Basic ${savedCredentials}`;
        }

        const response = await fetch(url, { headers });
        const data = await response.json();

        // 添加文件
        items.push(...data.value);

        // 处理子目录
        for (const folder of data.folders) {
          // 添加目录标记
          items.push({
            key: folder + '_$folder$',
            size: 0,
            uploaded: new Date().toISOString(),
          });

          // 递归获取子目录内容
          const subItems = await this.getAllItems(folder);
          items.push(...subItems);
        }

        marker = data.marker;
      } while (marker);

      return items;
    },

    uploadFiles(files) {
      if (this.cwd && !this.cwd.endsWith("/")) this.cwd += "/";

      const uploadTasks = Array.from(files).map((file) => ({
        basedir: this.cwd,
        file,
      }));
      this.uploadQueue.push(...uploadTasks);
      setTimeout(() => this.processUploadQueue());
    },

    // 全局搜索功能
    async performGlobalSearch(searchTerm) {
      if (!searchTerm || searchTerm.length < 2) {
        this.searchResults = [];
        return;
      }

      this.isSearching = true;
      this.searchResults = [];

      try {
        // 递归搜索所有目录
        const results = await this.searchInDirectory('', searchTerm);
        this.searchResults = results;
      } catch (error) {
        console.error('全局搜索失败:', error);
      } finally {
        this.isSearching = false;
      }
    },

    // 在指定目录中搜索
    async searchInDirectory(directory, searchTerm) {
      const results = [];

      try {
        // 准备请求头
        const headers = {};
        const savedCredentials = localStorage.getItem('authCredentials');
        if (savedCredentials) {
          headers['Authorization'] = `Basic ${savedCredentials}`;
        }

        const response = await fetch(`/api/children/${directory}`, { headers });
        const data = await response.json();

        if (data.needLogin) {
          return results;
        }

        // 搜索文件
        if (data.value) {
          for (const file of data.value) {
            const fileName = file.key.split('/').pop();
            if (fileName.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push({
                ...file,
                isFolder: false,
                displayPath: file.key
              });
            }
          }
        }

        // 搜索文件夹并递归
        if (data.folders) {
          for (const folder of data.folders) {
            const folderName = folder.split('/').filter(Boolean).pop();

            // 如果文件夹名匹配搜索词，添加到结果
            if (folderName && folderName.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push({
                key: folder,
                isFolder: true,
                displayPath: folder
              });
            }

            // 递归搜索子目录（限制深度避免无限递归）
            if (folder.split('/').length < 5) { // 最多搜索5层深度
              const subResults = await this.searchInDirectory(folder, searchTerm);
              results.push(...subResults);
            }
          }
        }
      } catch (error) {
        console.error(`搜索目录 ${directory} 失败:`, error);
      }

      return results;
    },
  },

  watch: {
    cwd: {
      handler() {
        // 切换目录时清除搜索结果
        this.searchResults = [];
        this.fetchFiles();
        const url = new URL(window.location);
        if ((url.searchParams.get("p") || "") !== this.cwd) {
          this.cwd
            ? url.searchParams.set("p", this.cwd)
            : url.searchParams.delete("p");
          window.history.pushState(null, "", url.toString());
        }
        document.title = this.cwd.replace(/.*\/(?!$)|\//g, "") === "/"
            ? "FlareDrive-R2 - 优雅的 Cloudflare R2 网盘文件库"
            :`${this.cwd.replace(/.*\/(?!$)|\//g, "") || "/" } - 优雅的 Cloudflare R2 网盘文件库`;
      },
      immediate: true,
    },

    search: {
      handler(newVal) {
        // 防抖搜索
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          if (newVal && newVal.length >= 2) {
            this.performGlobalSearch(newVal);
          } else {
            this.searchResults = [];
          }
        }, 500); // 500ms 防抖
      }
    }
  },

  created() {
    window.addEventListener("popstate", (ev) => {
      const searchParams = new URL(window.location).searchParams;
      if (searchParams.get("p") !== this.cwd)
        this.cwd = searchParams.get("p") || "";
    });
  },

  components: {
    Dialog,
    Menu,
    MimeIcon,
    UploadPopup,
    Footer,
    MediaPreview,
  },
};
</script>

<style>
.main {
  display: flex;
  height: 100%;
  /* background-image: url(/assets/bg-light.webp); */
  background-size: cover;
  background-position: center;
  overflow-y: auto;
  flex-direction: column;
}

.app-bar {
  z-index: 2;
  position: sticky;
  top: 0;
  padding: 8px;
  background-color: white;
  display: flex;
}

@media (max-width: 400px) {
  .menu-button {
    margin: 0;
    padding: 0;
  }

  button.circle {
    padding: 0 8px;
  }
  .menu-button-text {
    display: none !important;
  }
}

@media (max-width: 340px) {
  .app-title-container {
    display: none !important;
  }
}

.menu-button {
  display: flex;
  position: relative;
  margin-left: 10px;
  padding: 0 10px;
}

.file-list-container {
  margin: 20px auto;
  padding: 10px;
  width: 60%;
  max-width: 95%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: width 0.3s ease;
}

@media (max-width: 1280px) {
  .file-list-container {
    width: 768px;
    padding: 10px;
  }
}

.menu-button>button {
  transition: background-color 0.2s ease;
}

.menu-button>button:hover {
  background-color: rgb(212, 212, 212);
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
}

/* 桌面端浮动粘贴按钮样式 */
.floating-paste-button.desktop {
  position: fixed;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
  cursor: move;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
  user-select: none;
  min-width: 200px;
  max-width: 220px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.floating-paste-button.desktop:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.floating-paste-button.desktop:active {
  transform: translateY(-1px);
}

/* 半透明效果 */
.floating-paste-button.desktop.auto-hide {
  opacity: 0.6;
  transform: scale(0.95);
}

.floating-paste-button.desktop.auto-hide:hover {
  opacity: 1;
  transform: scale(1) translateY(-3px);
}

/* 桌面端粘贴按钮内容 */
.floating-paste-button.desktop .paste-button-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.floating-paste-button.desktop .paste-file-info {
  font-size: 11px;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.shortcut-hint {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: normal;
  margin-left: auto;
}

/* 移动端底部粘贴工具栏 */
.mobile-paste-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 -4px 20px rgba(102, 126, 234, 0.3);
  animation: slideUpFromBottom 0.3s ease-out;
}

@keyframes slideUpFromBottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* 当显示移动端粘贴工具栏时，给body添加底部padding */
body:has(.mobile-paste-toolbar) {
  padding-bottom: 70px;
}

/* 兼容不支持:has()的浏览器 */
@supports not (selector(:has(.mobile-paste-toolbar))) {
  .mobile-paste-toolbar ~ * {
    margin-bottom: 70px;
  }
}

.paste-toolbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: white;
  cursor: pointer;
}

.paste-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.paste-text {
  font-size: 14px;
  font-weight: 500;
}

.paste-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.paste-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* 快捷键说明样式 */
.keyboard-shortcuts {
  margin: 20px auto 10px;
  padding: 10px;
  width: 60%;
  max-width: 95%;
  transition: width 0.3s ease;
}

.shortcuts-container {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.shortcuts-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px 16px;
  font-size: 13px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  color: #6b7280;
}

.shortcut-item kbd {
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  font-weight: 600;
  color: #374151;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  min-width: 24px;
  text-align: center;
}

.touch-icon {
  font-size: 16px;
  min-width: 24px;
  text-align: center;
}

/* 桌面端中等屏幕优化 */
@media (max-width: 1280px) {
  .keyboard-shortcuts {
    width: 768px;
    padding: 10px;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .keyboard-shortcuts {
    margin: 15px 10px 5px;
    padding: 0;
    width: auto;
    max-width: none;
  }

  .shortcuts-container {
    padding: 12px 16px;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }

  .shortcut-item {
    font-size: 12px;
  }

  .shortcuts-title {
    font-size: 13px;
  }

  /* 在移动端隐藏桌面端快捷键，显示触摸提示 */
  .shortcut-item:not(.mobile-only) {
    display: none;
  }

  .mobile-only {
    display: flex !important;
  }
}

/* 桌面端隐藏移动端专用提示 */
@media (min-width: 769px) {
  .mobile-only {
    display: none;
  }
}



/* 自定义提示样式 */
.custom-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 500px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease-out;
}

.custom-toast.success {
  background: #f0f9ff;
  border-left: 4px solid #10b981;
  color: #065f46;
}

.custom-toast.error {
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
}

.custom-toast.warning {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  color: #92400e;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.toast-content svg {
  flex-shrink: 0;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 移动端提示样式 */
@media (max-width: 768px) {
  .custom-toast {
    left: 20px;
    right: 20px;
    min-width: auto;
    max-width: none;
  }
}

/* 文件操作工具栏样式 */
.file-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.file-toolbar .toolbar-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.file-toolbar .toolbar-btn.primary:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
  transform: translateY(-1px);
}

/* 多选功能样式 */
.multi-select-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.toolbar-btn.danger {
  background: rgba(239, 68, 68, 0.8);
  border-color: rgba(239, 68, 68, 0.9);
}

.toolbar-btn.danger:hover {
  background: rgba(239, 68, 68, 0.9);
}

.selected-count {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

/* 文件选择样式 */
.file-checkbox {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.file-checkbox:hover {
  background-color: rgba(102, 126, 234, 0.1);
}

.file-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #667eea;
  margin: 0;
}

.file-item.selected {
  background: rgba(102, 126, 234, 0.1);
  border-left: 4px solid #667eea;
}

.file-item {
  position: relative;
  transition: all 0.2s ease;
}

/* 多选模式下文件项的左边距调整 */
.file-item {
  padding-left: 8px;
  transition: padding-left 0.2s ease;
}

/* 当存在复选框时增加左边距 */
.file-item:has(.file-checkbox) {
  padding-left: 40px;
}

/* 兼容不支持:has()的浏览器 */
@supports not (selector(:has(.file-checkbox))) {
  .file-item .file-checkbox ~ * {
    margin-left: 32px;
  }
}

/* 移动端多选工具栏优化 */
@media (max-width: 768px) {
  .multi-select-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    justify-content: center;
    flex-wrap: wrap;
  }

  .toolbar-btn {
    flex: 1;
    justify-content: center;
    min-width: 80px;
  }

  .selected-count {
    text-align: center;
    width: 100%;
  }
}
</style>
